from fastapi import APIRouter, HTTPException
from app.schemas.prediction import PredictRequest, PredictResponse
from app.services.prediction_service import predict_all
from app.utils.logging import get_logger

router = APIRouter()
logger = get_logger(__name__)

@router.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    try:
        result = predict_all(req.features, req.history)
        return result
    except Exception as e:
        logger.error(f"prediction pipeline error: {e}")
        raise HTTPException(status_code=500, detail="internal prediction error")
