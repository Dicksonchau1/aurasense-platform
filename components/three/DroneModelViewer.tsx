// DroneModelViewer.tsx
// Three.js-based 3D drone model viewer for ATLAS OS dashboard
// Step 1: 3D Model Integration Scaffold

import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export interface DroneModelViewerProps {
  modelUrl: string; // URL to the drone 3D model (GLTF/OBJ)
  backgroundColor?: string;
}

export const DroneModelViewer: React.FC<DroneModelViewerProps> = ({ modelUrl, backgroundColor = '#080a0c' }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();

  useEffect(() => {
    if (!mountRef.current) return;
    // Init scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(60, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 2, 6);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(5, 10, 7.5);
    scene.add(light);
    scene.add(new THREE.AmbientLight(0x404040));

    // TODO: Load drone model (GLTF/OBJ loader)
    // Placeholder: add a simple box
    const geometry = new THREE.BoxGeometry(1, 0.3, 2);
    const material = new THREE.MeshStandardMaterial({ color: 0x00bfff });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Animation loop
    const animate = () => {
      mesh.rotation.y += 0.01;
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, [modelUrl, backgroundColor]);

  return <div ref={mountRef} style={{ width: '100%', height: '400px' }} />;
};
