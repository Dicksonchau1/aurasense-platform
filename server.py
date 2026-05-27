from __future__ import annotations
import math
import os
from typing import List
import numpy as np
import trimesh
from fastapi import FastAPI, HTTPException
from fastapi.responses import Response
from supabase import create_client, Client
from dotenv import load_dotenv

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"))
SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_ROLE_KEY = os.environ["SUPABASE_SERVICE_ROLE_KEY"]
sb: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
app = FastAPI(title="AuraSense MBIS Procedural Tile Server")

def tile_to_bbox(z, x, y):
    n = 2 ** z
    west = x / n * 360.0 - 180.0
    east = (x + 1) / n * 360.0 - 180.0
    north = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * y / n))))
    south = math.degrees(math.atan(math.sinh(math.pi * (1 - 2 * (y + 1) / n))))
    return west, south, east, north

def wgs84_to_enu(lat, lng, origin_lat, origin_lng):
    EARTH_R = 6378137.0
    d_lat = math.radians(lat - origin_lat)
    d_lng = math.radians(lng - origin_lng)
    mean_lat = math.radians((lat + origin_lat) / 2.0)
    east = d_lng * EARTH_R * math.cos(mean_lat)
    north = d_lat * EARTH_R
    return east, north

def risk_color(risk):
    if risk is None:
        return [0.29, 0.56, 0.89, 1.0]
    if risk > 75:
        return [0.94, 0.27, 0.27, 1.0]
    if risk > 60:
        return [0.96, 0.62, 0.04, 1.0]
    if risk > 40:
        return [0.13, 0.83, 0.93, 1.0]
    return [0.29, 0.56, 0.89, 1.0]

def build_building_mesh(b, origin_lat, origin_lng, footprint_half_m=18.0):
    lat = float(b["lat"])
    lng = float(b["lng"])
    height_m = float(b.get("height_m") or 40.0)
    floor_count = int(b.get("floor_count") or max(1, height_m / 3.5))
    floor_h = height_m / max(1, floor_count)
    east, north = wgs84_to_enu(lat, lng, origin_lat, origin_lng)
    rc = risk_color(b.get("risk_score"))
    band_thickness = floor_h * 0.92
    band_offset = (floor_h - band_thickness) * 0.5
    half = footprint_half_m
    meshes = []
    for i in range(floor_count):
        z_base = i * floor_h + band_offset
        box = trimesh.creation.box(extents=[half * 2, half * 2, band_thickness])
        cz = z_base + band_thickness / 2.0
        box.apply_translation([east, north, cz])
        floor_tint = max(0.55, 1.0 - (i / max(1, floor_count)) * 0.35)
        face_color = np.array([rc[0] * floor_tint, rc[1] * floor_tint, rc[2] * floor_tint, rc[3]])
        box.visual.face_colors = (face_color * 255).astype(np.uint8)
        meshes.append(box)
    if not meshes:
        return None
    return trimesh.util.concatenate(meshes)

@app.get("/health")
def health():
    return {"ok": True, "service": "mbis-procedural", "version": "0.1.0"}

@app.get("/api/mbis/tiles/{z}/{x}/{y}.glb")
def serve_tile(z: int, x: int, y: int):
    if z < 10 or z > 20:
        raise HTTPException(status_code=400, detail="Unsupported zoom")
    west, south, east, north = tile_to_bbox(z, x, y)
    res = sb.table("buildings").select(
        "id,name,lat,lng,height_m,floor_count,risk_score,mbis_id"
    ).gte("lat", south).lte("lat", north).gte("lng", west).lte("lng", east).limit(500).execute()
    rows = res.data or []
    origin_lat = (south + north) / 2.0
    origin_lng = (west + east) / 2.0
    all_meshes = []
    for b in rows:
        if b.get("lat") is None or b.get("lng") is None:
            continue
        m = build_building_mesh(b, origin_lat, origin_lng)
        if m is not None:
            all_meshes.append(m)
    if not all_meshes:
        scene = trimesh.Scene()
    else:
        scene = trimesh.Scene(geometry=all_meshes)
    glb_bytes = scene.export(file_type="glb")
    return Response(
        content=glb_bytes,
        media_type="model/gltf-binary",
        headers={
            "Cache-Control": "public, max-age=300",
            "X-MBIS-Tile": "{}/{}/{}".format(z, x, y),
            "X-MBIS-Buildings": str(len(rows)),
            "X-MBIS-Origin-Lat": "{:.6f}".format(origin_lat),
            "X-MBIS-Origin-Lng": "{:.6f}".format(origin_lng),
        },
    )