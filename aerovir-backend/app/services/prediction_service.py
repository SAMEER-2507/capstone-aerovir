from app.models.loader import get_loaded
from app.models.registry import get_pollutant_list, label
from app.models.predictor import run_prediction, PredictionError
from app.services.aqi_service import calculate_aqi
from app.utils.logging import get_logger

logger = get_logger(__name__)

def predict_all(payload: dict, history: list[dict] | None) -> dict:
    predictions = {}
    models_used = {}
    errors = {}

    for pollutant in get_pollutant_list():
        loaded = get_loaded(pollutant)
        try:
            value = run_prediction(loaded, payload, history)
            predictions[pollutant] = round(value, 3)
            models_used[pollutant] = label(loaded.model_type)
        except PredictionError as e:
            logger.warning(f"[{pollutant}] prediction failed: {e}")
            predictions[pollutant] = None
            models_used[pollutant] = label(loaded.model_type)
            errors[pollutant] = str(e)

    aqi, category = calculate_aqi(predictions)

    result = {
        "predictions": predictions,
        "models_used": models_used,
        "aqi": aqi,
        "aqi_category": category,
    }
    if errors:
        result["warnings"] = errors
    return result
