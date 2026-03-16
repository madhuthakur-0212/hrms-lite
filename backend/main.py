import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from app.config.database import connect, disconnect
from app.routers import employees, attendance

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    connect()
    yield
    disconnect()

app = FastAPI(title="HRMS Lite API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employees.router, prefix="/api")
app.include_router(attendance.router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}
