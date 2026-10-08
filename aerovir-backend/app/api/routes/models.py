from fastapi import APIRouter
from app.models.loader import REGISTRY_LOADED
from app.models.registry import label
from app.schemas.prediction import ModelsInfoResponse

router = APIRouter()

@router.get("/models", response_model=ModelsInfoResponse)
def list_models():
    out = {}
    for pollutant, loaded in REGISTRY_LOADED.items():
        out[pollutant] = {
            "model_type": label(loaded.model_type),
            "status": "loaded" if loaded.available else "unavailable",
        }
    return {"models": out}
