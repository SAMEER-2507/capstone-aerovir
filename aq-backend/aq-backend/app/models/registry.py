from app.config import MODEL_REGISTRY, MODEL_TYPE_LABEL

def get_pollutant_list():
    return list(MODEL_REGISTRY.keys())

def get_model_type(pollutant: str) -> str:
    entry = MODEL_REGISTRY.get(pollutant)
    if not entry:
        raise KeyError(f"Unknown pollutant: {pollutant}")
    return entry["type"]

def get_model_dir(pollutant: str) -> str:
    entry = MODEL_REGISTRY.get(pollutant)
    if not entry:
        raise KeyError(f"Unknown pollutant: {pollutant}")
    return entry["dir"]

def label(model_type: str) -> str:
    return MODEL_TYPE_LABEL.get(model_type, model_type)
