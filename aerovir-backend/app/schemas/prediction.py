from pydantic import BaseModel, Field, field_validator
from typing import Optional
import math

class PredictRequest(BaseModel):
    features: dict[str, float] = Field(
        ..., description="Current-timestep feature values, keyed by feature name (see FEATURE_ORDER in config.py)."
    )
    history: Optional[list[dict[str, float]]] = Field(
        default=None,
        description="Ordered list (oldest first) of past timesteps, required for GRU/LSTM pollutants (NO, PM2.5, PM10). Each entry needs all feature keys."
    )

    @field_validator("features")
    @classmethod
    def validate_features(cls, v):
        for k, val in v.items():
            if val is None or math.isnan(val) or math.isinf(val):
                raise ValueError(f"feature '{k}' has invalid value: {val}")
        return v


class PredictResponse(BaseModel):
    predictions: dict[str, Optional[float]]
    models_used: dict[str, str]
    aqi: int
    aqi_category: str
    warnings: Optional[dict[str, str]] = None


class HealthResponse(BaseModel):
    status: str
    models: dict[str, str]


class ModelsInfoResponse(BaseModel):
    models: dict[str, dict[str, str]]
