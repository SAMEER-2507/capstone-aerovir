# AeroVir AQ Prediction Backend

FastAPI backend serving a **multi-model hybrid** air quality prediction pipeline:
Linear Regression for 6 pollutants, GRU for 2, LSTM for 1 — per your model
selection results. No single model replaces the others.

## Model routing

| Pollutant | Model             | Test R² |
|-----------|-------------------|---------|
| benzene   | Linear Regression | 0.8726  |
| co        | Linear Regression | 0.8020  |
| nh3       | Linear Regression | 0.8798  |
| no        | GRU               | 0.6632  |
| no2       | Linear Regression | 0.8763  |
| o3        | Linear Regression | 0.8952  |
| pm10      | LSTM              | 0.8470  |
| pm25      | GRU               | 0.8604  |
| so2       | Linear Regression | 0.8717  |

Routing lives in `app/config.py` under `MODEL_REGISTRY` — change the `type`
of any pollutant there if you retrain it with a different model family.

## 1. Install

```bash
cd aq-backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

## 2. Place your trained model files

Each pollutant has its own folder under `models/`. Put your `.pkl` (linear)
or `.keras`/`.h5` (GRU/LSTM) model plus its scaler(s) there:

```
models/
  benzene/  benzene_linear.pkl   feature_scaler.pkl
  co/       co_linear.pkl        feature_scaler.pkl
  nh3/      nh3_linear.pkl       feature_scaler.pkl
  no/       no_gru.keras         feature_scaler.pkl   target_scaler.pkl
  no2/      no2_linear.pkl       feature_scaler.pkl
  o3/       o3_linear.pkl        feature_scaler.pkl
  pm10/     pm10_lstm.keras      feature_scaler.pkl   target_scaler.pkl
  pm25/     pm25_gru.keras       feature_scaler.pkl   target_scaler.pkl
  so2/      so2_linear.pkl       feature_scaler.pkl
```

File names are matched flexibly (`feature_scaler.pkl` or any
`*feature*scaler*.pkl`), so files exported straight from your notebooks
(exactly like the folder you showed, e.g. `pm10_lstm.keras`,
`feature_scaler.pkl`, `target_scaler.pkl`) will be picked up as-is —
just copy the whole `models/<pollutant>/` folder in.

**Missing a file?** The backend still starts. `/health` and
`/api/v1/models` will report that pollutant as `unavailable` instead of
crashing, and `/predict` returns `null` for it with a warning — it never
fakes a prediction.

## 3. IMPORTANT — match your training feature order

Open `app/config.py` and edit `FEATURE_ORDER` to be the **exact** list and
order of columns your models were trained on. This is the single most
important edit — if it doesn't match your notebooks, predictions will be
wrong even though the API "works."

`SEQ_LEN_GRU` / `SEQ_LEN_LSTM` in `.env` must also match the sequence
length used when you built training windows for GRU/LSTM.

## 4. Start the API

```bash
uvicorn app.main:app --reload --port 8000
```

Or with Docker:
```bash
docker compose up --build
```

## Endpoints

- `GET /health` — model load status per pollutant
- `GET /api/v1/models` — which model type serves each pollutant
- `POST /api/v1/predict` — run all 9 models + AQI

### Example request

Linear-only pollutants just need `features`. GRU/LSTM pollutants (no,
pm25, pm10) additionally need `history`: an ordered list of past
timesteps (oldest first), each with the same feature keys, length
matching `SEQ_LEN_GRU`/`SEQ_LEN_LSTM`.

```bash
curl -X POST http://localhost:8000/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{
    "features": {
      "temperature": 28.5, "humidity": 60, "wind_speed": 3.2, "pressure": 1008,
      "pm25_lag1": 80, "pm10_lag1": 140, "no_lag1": 20, "no2_lag1": 35,
      "so2_lag1": 10, "co_lag1": 0.7, "o3_lag1": 60, "nh3_lag1": 14, "benzene_lag1": 3
    },
    "history": [ { "...same 13 keys as above...": 0 } ]
  }'
```
(`history` needs 24 such timestep objects by default — see `SEQ_LEN_GRU`/`SEQ_LEN_LSTM`.)

### Example response

```json
{
  "predictions": {
    "pm25": 82.4, "pm10": 146.2, "no": 21.5, "no2": 38.5,
    "so2": 12.3, "co": 0.72, "o3": 64.1, "nh3": 15.4, "benzene": 3.2
  },
  "models_used": {
    "pm25": "GRU", "pm10": "LSTM", "no": "GRU", "no2": "Linear Regression",
    "so2": "Linear Regression", "co": "Linear Regression",
    "o3": "Linear Regression", "nh3": "Linear Regression",
    "benzene": "Linear Regression"
  },
  "aqi": 156,
  "aqi_category": "Moderate"
}
```

## AQI formula

`app/services/aqi_service.py` currently implements the CPCB (India)
breakpoint sub-index method — the standard used in most Indian AQI
projects. It's isolated in its own module specifically so you can swap in
your project's official formula without touching prediction code.

## Tests

```bash
pytest
```

Tests for registry, loader (graceful missing-file handling), input
validation, linear/GRU/LSTM prediction (via mock models, since your real
`.pkl`/`.keras` files aren't part of this repo), and the full `/predict`
endpoint.
