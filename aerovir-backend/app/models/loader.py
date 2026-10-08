import os
import glob
import joblib
from app.config import settings
from app.models.registry import get_pollutant_list, get_model_type, get_model_dir
from app.utils.logging import get_logger

logger = get_logger(__name__)

# Lazy import TF only if needed (keeps startup fast if only linear models used)
_tf_model_loader = None
def _load_keras(path):
    global _tf_model_loader
    if _tf_model_loader is None:
        from tensorflow.keras.models import load_model
        _tf_model_loader = load_model
    return _tf_model_loader(path, compile=False)


class LoadedModel:
    def __init__(self, pollutant, model_type, model=None, feature_scaler=None,
                 target_scaler=None, error=None):
        self.pollutant = pollutant
        self.model_type = model_type
        self.model = model
        self.feature_scaler = feature_scaler
        self.target_scaler = target_scaler
        self.error = error

    @property
    def available(self):
        return self.model is not None and self.error is None


REGISTRY_LOADED: dict[str, LoadedModel] = {}


def _find_file(directory: str, patterns: list[str]):
    for pattern in patterns:
        matches = glob.glob(os.path.join(directory, pattern))
        if matches:
            return matches[0]
    return None


def load_all_models():
    """Loads every model + its scalers once. Missing files are recorded as
    errors on that pollutant's entry, not raised — the API stays up and
    reports which pollutants are unavailable via /health and /api/v1/models."""
    for pollutant in get_pollutant_list():
        model_type = get_model_type(pollutant)
        model_dir = os.path.join(settings.MODELS_DIR, get_model_dir(pollutant))

        if not os.path.isdir(model_dir):
            logger.warning(f"[{pollutant}] model directory not found: {model_dir}")
            REGISTRY_LOADED[pollutant] = LoadedModel(
                pollutant, model_type, error=f"model directory not found: {model_dir}"
            )
            continue

        feature_scaler_path = _find_file(model_dir, ["feature_scaler.pkl", "*feature*scaler*.pkl"])
        target_scaler_path = _find_file(model_dir, ["target_scaler.pkl", "*target*scaler*.pkl"])

        feature_scaler = joblib.load(feature_scaler_path) if feature_scaler_path else None
        target_scaler = joblib.load(target_scaler_path) if target_scaler_path else None

        try:
            if model_type == "linear":
                model_path = _find_file(model_dir, [
                    f"{pollutant}_linreg.pkl", f"{pollutant}_linear.pkl", "*.pkl"
                ])
                # exclude scaler files from the generic *.pkl fallback
                if model_path and "scaler" in os.path.basename(model_path).lower():
                    candidates = [p for p in glob.glob(os.path.join(model_dir, "*.pkl"))
                                  if "scaler" not in os.path.basename(p).lower()]
                    model_path = candidates[0] if candidates else None
                if not model_path:
                    raise FileNotFoundError(f"no linear model .pkl found in {model_dir}")
                model = joblib.load(model_path)

            elif model_type in ("gru", "lstm"):
                model_path = _find_file(model_dir, [f"{pollutant}_{model_type}.keras", "*.keras", "*.h5"])
                if not model_path:
                    raise FileNotFoundError(f"no {model_type} .keras/.h5 model found in {model_dir}")
                model = _load_keras(model_path)

            else:
                raise ValueError(f"unknown model type: {model_type}")

            REGISTRY_LOADED[pollutant] = LoadedModel(
                pollutant, model_type, model=model,
                feature_scaler=feature_scaler, target_scaler=target_scaler,
            )
            logger.info(f"[{pollutant}] loaded ({model_type}) from {model_dir}")

        except Exception as e:
            logger.error(f"[{pollutant}] failed to load: {e}")
            REGISTRY_LOADED[pollutant] = LoadedModel(
                pollutant, model_type,
                feature_scaler=feature_scaler, target_scaler=target_scaler,
                error=str(e),
            )

    return REGISTRY_LOADED


def get_loaded(pollutant: str) -> LoadedModel:
    if pollutant not in REGISTRY_LOADED:
        raise KeyError(f"Unknown pollutant: {pollutant}")
    return REGISTRY_LOADED[pollutant]
