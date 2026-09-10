import numpy as np
from app.config import FEATURE_ORDER

class PreprocessError(Exception):
    pass

def build_feature_vector(payload: dict) -> np.ndarray:
    """Turns the request payload into a 1D array in the EXACT feature order
    used during training. Edit FEATURE_ORDER in app/config.py to match your
    notebooks if the columns differ."""
    values = []
    missing = []
    for feat in FEATURE_ORDER:
        if feat not in payload or payload[feat] is None:
            missing.append(feat)
            continue
        values.append(payload[feat])

    if missing:
        raise PreprocessError(f"missing required features: {missing}")

    arr = np.array(values, dtype=np.float64)

    if np.isnan(arr).any():
        raise PreprocessError("input contains NaN values")
    if np.isinf(arr).any():
        raise PreprocessError("input contains infinite values")

    return arr.reshape(1, -1)  # shape (1, n_features)


def apply_feature_scaler(vector: np.ndarray, scaler):
    if scaler is None:
        return vector
    return scaler.transform(vector)


def inverse_target(value: np.ndarray, scaler):
    if scaler is None:
        return float(np.asarray(value).ravel()[0])
    inv = scaler.inverse_transform(np.asarray(value).reshape(-1, 1))
    return float(inv.ravel()[0])
