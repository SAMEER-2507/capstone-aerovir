import numpy as np
import pytest
from app.preprocessing.preprocess import build_feature_vector, PreprocessError
from app.preprocessing.sequence import build_sequence
from app.config import FEATURE_ORDER

def _full_payload():
    return {f: 1.0 for f in FEATURE_ORDER}

def test_build_feature_vector_ok():
    vec = build_feature_vector(_full_payload())
    assert vec.shape == (1, len(FEATURE_ORDER))

def test_missing_feature_raises():
    payload = _full_payload()
    del payload[FEATURE_ORDER[0]]
    with pytest.raises(PreprocessError):
        build_feature_vector(payload)

def test_nan_raises():
    payload = _full_payload()
    payload[FEATURE_ORDER[0]] = float("nan")
    with pytest.raises(PreprocessError):
        build_feature_vector(payload)

def test_inf_raises():
    payload = _full_payload()
    payload[FEATURE_ORDER[0]] = float("inf")
    with pytest.raises(PreprocessError):
        build_feature_vector(payload)

def test_sequence_wrong_length_raises():
    history = [_full_payload() for _ in range(5)]
    with pytest.raises(PreprocessError):
        build_sequence(history, FEATURE_ORDER, seq_len=24)

def test_sequence_correct_shape():
    history = [_full_payload() for _ in range(24)]
    seq = build_sequence(history, FEATURE_ORDER, seq_len=24)
    assert seq.shape == (1, 24, len(FEATURE_ORDER))
