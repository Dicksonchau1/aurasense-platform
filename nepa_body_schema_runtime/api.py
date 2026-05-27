from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import numpy as np

app = FastAPI()

class TelemetryFrame(BaseModel):
    joint_position_rad: List[float]
    joint_velocity_rad_s: List[float]
    joint_current_a: List[float]
    joint_temp_c: List[float]
    joint_torque_nm: List[float]
    # ... add other fields as needed

@app.post('/ingest')
def ingest_telemetry(frame: TelemetryFrame):
    # TODO: Step Norse/snnTorch model with telemetry
    return {"status": "ok"}

@app.get('/embedding')
def get_embedding():
    # TODO: Return current embedding vector
    return {"embedding": np.zeros(256).tolist()}
