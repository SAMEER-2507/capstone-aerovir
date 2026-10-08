import numpy as np
from app.models.loader import LoadedModel
from app.models.predictor import predict_linear, predict_sequence_model, run_prediction
from app.config import FEATURE_ORDER

class FakeLinearModel:
    def predict(self, X):
        return np.array([sum(X[0])])

class FakeSeqModel:
    def predict(self, X, verbose=0):
        return np.array([[float(X.sum())]])

def _full_payload():
    return {f: 1.0 for f in FEATURE_ORDER}

def test_predict_linear_no_scalers():
    loaded = LoadedModel("co", "linear", model=FakeLinearModel())
    val = predict_linear(loaded, _full_payload())
    assert isinstance(val, float)

def test_predict_sequence_gru():
    loaded = LoadedModel("pm25", "gru", model=FakeSeqModel())
    history = [_full_payload() for _ in range(24)]
    val = predict_sequence_model(loaded, history, seq_len=24)
    assert isinstance(val, float)

def test_predict_sequence_lstm():
    loaded = LoadedModel("pm10", "lstm", model=FakeSeqModel())
    history = [_full_payload() for _ in range(24)]
    val = predict_sequence_model(loaded, history, seq_len=24)
    assert isinstance(val, float)

def test_run_prediction_unavailable_model_raises():
    loaded = LoadedModel("co", "linear", model=None, error="file missing")
    try:
        run_prediction(loaded, _full_payload(), None)
        assert False, "expected PredictionError"
    except Exception as e:
        assert "unavailable" in str(e)
