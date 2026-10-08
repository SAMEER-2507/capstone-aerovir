from app.models.registry import get_pollutant_list, get_model_type

def test_all_pollutants_present():
    pollutants = get_pollutant_list()
    assert set(pollutants) == {
        "benzene", "co", "nh3", "no", "no2", "o3", "pm10", "pm25", "so2"
    }

def test_model_routing():
    assert get_model_type("pm25") == "gru"
    assert get_model_type("no") == "gru"
    assert get_model_type("pm10") == "lstm"
    assert get_model_type("co") == "linear"
    assert get_model_type("benzene") == "linear"
