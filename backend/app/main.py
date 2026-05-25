from fastapi import FastAPI
from app.routers.rehearse_wound_dressing import router as wound_router

app = FastAPI()

app.include_router(wound_router)
