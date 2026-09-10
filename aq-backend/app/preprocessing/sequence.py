import numpy as np
from app.preprocessing.preprocess import PreprocessError

def build_sequence(history: list[dict], feature_order: list[str], seq_len: int) -> np.ndarray:
    """history: list of past timesteps, oldest first, each a dict of feature->value.
    Must contain exactly seq_len entries, each with all features present.
    Returns shape (1, seq_len, n_features)."""
    if len(history) != seq_len:
        raise PreprocessError(
            f"expected {seq_len} historical timesteps, got {len(history)}"
        )

    rows = []
    for i, step in enumerate(history):
        row = []
        missing = [f for f in feature_order if f not in step or step[f] is None]
        if missing:
            raise PreprocessError(f"timestep {i} missing features: {missing}")
        for f in feature_order:
            row.append(step[f])
        rows.append(row)

    arr = np.array(rows, dtype=np.float64)

    if np.isnan(arr).any():
        raise PreprocessError("sequence contains NaN values")
    if np.isinf(arr).any():
        raise PreprocessError("sequence contains infinite values")

    return arr.reshape(1, seq_len, len(feature_order))


def scale_sequence(seq: np.ndarray, scaler):
    if scaler is None:
        return seq
    n, t, f = seq.shape
    flat = seq.reshape(n * t, f)
    scaled = scaler.transform(flat)
    return scaled.reshape(n, t, f)
