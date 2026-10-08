from fastapi import APIRouter
from app.models.loader import REGISTRY_LOADED
from app.schemas.prediction import HealthResponse

router = APIRouter()

@router.get("/health", response_model=HealthResponse)
def health():
    status = {}
    for pollutant, loaded in REGISTRY_LOADED.items():
        status[pollutant] = "ok" if loaded.available else f"unavailable: {loaded.error}"
    overall = "ok" if all(l.available for l in REGISTRY_LOADED.values()) else "degraded"
    return {"status": overall, "models": status}
