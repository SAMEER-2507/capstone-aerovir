from app.models.loader import load_all_models, REGISTRY_LOADED

def test_load_all_models_runs_without_raising():
    load_all_models()
    assert len(REGISTRY_LOADED) == 9

def test_missing_model_reports_error_not_crash():
    load_all_models()
    for pollutant, loaded in REGISTRY_LOADED.items():
        if not loaded.available:
            assert loaded.error is not None
