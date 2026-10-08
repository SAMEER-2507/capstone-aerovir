from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from app.config import settings
from app.models.loader import load_all_models
from app.api.routes import prediction, health, models
from app.utils.logging import get_logger

logger = get_logger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Loading all pollutant models...")
    load_all_models()
    logger.info("Model loading complete.")
    yield

app = FastAPI(
    title="AeroVir Air Quality Prediction API",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url.path}: {exc}")
    return JSONResponse(status_code=500, content={"detail": "internal server error"})

app.include_router(health.router, prefix="", tags=["health"])
app.include_router(prediction.router, prefix="/api/v1", tags=["prediction"])
app.include_router(models.router, prefix="/api/v1", tags=["models"])
