import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    MODELS_DIR = os.getenv("MODELS_DIR", "models")
    SEQ_LEN_GRU = int(os.getenv("SEQ_LEN_GRU", 24))
    SEQ_LEN_LSTM = int(os.getenv("SEQ_LEN_LSTM", 24))
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
    LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO")

settings = Settings()

# Feature order MUST match your training notebooks exactly.
# Edit this list to match the exact columns used when you trained each model.
FEATURE_ORDER = [
    "temperature", "humidity", "wind_speed", "pressure",
    "pm25_lag1", "pm10_lag1", "no_lag1", "no2_lag1",
    "so2_lag1", "co_lag1", "o3_lag1", "nh3_lag1", "benzene_lag1",
]

MODEL_REGISTRY = {
    "benzene": {"type": "linear", "dir": "benzene"},
    "co": {"type": "gru", "dir": "co"},
    "nh3": {"type": "linear", "dir": "nh3"},
    "no": {"type": "gru", "dir": "no"},
    "no2": {"type": "gru", "dir": "no2"},
    "o3": {"type": "gru", "dir": "o3"},
    "pm10": {"type": "gru", "dir": "pm10"},
    "pm25": {"type": "gru", "dir": "pm25"},
    "so2": {"type": "gru", "dir": "so2"},
}

MODEL_TYPE_LABEL = {"linear": "Linear Regression", "gru": "GRU", "lstm": "LSTM"}
