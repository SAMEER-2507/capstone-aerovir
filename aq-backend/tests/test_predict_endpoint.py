from fastapi.testclient import TestClient
from app.main import app
from app.models.loader import REGISTRY_LOADED, LoadedModel
from app.config import FEATURE_ORDER
import numpy as np

class FakeLinearModel:
    def predict(self, X):
        return np.array([42.0])

class FakeSeqModel:
    def predict(self, X, verbose=0):
        return np.array([[42.0]])

def _mock_all_models():
    for pollutant in list(REGISTRY_LOADED.keys()) or [
        "benzene","co","nh3","no","no2","o3","pm10","pm25","so2"
    ]:
        pass
    from app.models.registry import get_pollutant_list, get_model_type
    for pollutant in get_pollutant_list():
        mtype = get_model_type(pollutant)
        model = FakeSeqModel() if mtype in ("gru", "lstm") else FakeLinearModel()
        REGISTRY_LOADED[pollutant] = LoadedModel(pollutant, mtype, model=model)

def test_predict_endpoint_full_flow():
    _mock_all_models()
    client = TestClient(app)
    payload = {
        "features": {f: 1.0 for f in FEATURE_ORDER},
        "history": [{f: 1.0 for f in FEATURE_ORDER} for _ in range(24)],
    }
    resp = client.post("/api/v1/predict", json=payload)
    assert resp.status_code == 200
    body = resp.json()
    assert "predictions" in body
    assert "aqi" in body
    assert "aqi_category" in body
    assert body["models_used"]["pm10"] == "LSTM"
    assert body["models_used"]["co"] == "Linear Regression"

def test_health_endpoint():
    _mock_all_models()
    client = TestClient(app)
    resp = client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"
