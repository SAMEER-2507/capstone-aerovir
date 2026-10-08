import numpy as np
from app.config import settings, FEATURE_ORDER
from app.models.loader import LoadedModel
from app.preprocessing.preprocess import build_feature_vector, apply_feature_scaler, inverse_target, PreprocessError
from app.preprocessing.sequence import build_sequence, scale_sequence

class PredictionError(Exception):
    pass

def predict_linear(loaded: LoadedModel, payload: dict) -> float:
    vector = build_feature_vector(payload)
    vector = apply_feature_scaler(vector, loaded.feature_scaler)
    raw = loaded.model.predict(vector)
    return inverse_target(raw, loaded.target_scaler)

def predict_sequence_model(loaded: LoadedModel, history: list[dict], seq_len: int) -> float:
    seq = build_sequence(history, FEATURE_ORDER, seq_len)
    seq = scale_sequence(seq, loaded.feature_scaler)
    raw = loaded.model.predict(seq, verbose=0)
    return inverse_target(raw, loaded.target_scaler)

def run_prediction(loaded: LoadedModel, payload: dict, history: list[dict] | None) -> float:
    if not loaded.available:
        raise PredictionError(f"model for '{loaded.pollutant}' unavailable: {loaded.error}")

    try:
        if loaded.model_type == "linear":
            return predict_linear(loaded, payload)
        elif loaded.model_type == "gru":
            if not history:
                raise PreprocessError("gru model requires 'history' timesteps in request")
            return predict_sequence_model(loaded, history, settings.SEQ_LEN_GRU)
        elif loaded.model_type == "lstm":
            if not history:
                raise PreprocessError("lstm model requires 'history' timesteps in request")
            return predict_sequence_model(loaded, history, settings.SEQ_LEN_LSTM)
        else:
            raise PredictionError(f"unknown model type: {loaded.model_type}")
    except PreprocessError as e:
        raise PredictionError(str(e))
