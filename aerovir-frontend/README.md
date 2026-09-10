# AeroVir — Frontend

Dashboard for the AeroVir Virtual Air Quality & Multi-Hazard Intelligence System
(CPG 323, Thapar Institute of Engineering & Technology, Capstone 2026).

Built with React + Vite + Tailwind CSS + Recharts. Currently wired to a
deterministic **mock inference layer** (`src/data/mockData.js`) that stands in
for the ConvLSTM / XGBoost / Random Forest / SHAP backend described in the
project docs — swap that file's functions for real API calls once the
backend is live (see "Connecting the real backend" below).

## Features

- **Virtual Sensing** — enter any lat/lon, get an estimated AQI + pollutant
  breakdown, no physical sensor required (UC-1.1).
- **24–48hr Forecast** — XGBoost-style trend chart (UC-1.2).
- **Multi-Hazard Intelligence** — rainfall/cyclone probability, pressure,
  wind speed, and hazard spread radius (UC-2.1, UC-2.2).
- **Health-Risk Heatmap** — spatial exposure grid around the query point.
- **SHAP Explainability** — feature importance behind each prediction
  (UC-3.2).
- **Safe Exposure Windows** — timeline of safe/caution/avoid periods
  (UC-3.1).

## Prerequisites

- [Node.js](https://nodejs.org) v18 or newer
- npm (bundled with Node)

## Run it

```bash
cd aerovir-frontend
npm install
npm run dev
```

Then open the URL Vite prints (usually **http://localhost:5173**).

## Build for production

```bash
npm run build      # outputs to dist/
npm run preview    # serve the production build locally
```

## Project structure

```
src/
  App.jsx                 # top-level state + tab routing
  components/
    Sidebar.jsx            # desktop nav + model status
    Header.jsx              # mobile nav
    LocationSearch.jsx      # lat/lon input + preset cities
    AQIGauge.jsx             # hero virtual-AQI display
    ForecastChart.jsx        # 24-48hr forecast (recharts)
    HazardPanel.jsx          # rain/cyclone probability + spread radius
    HealthHeatmap.jsx        # spatial risk grid
    SHAPExplain.jsx           # feature-importance bars
    SafeWindow.jsx            # safe exposure timeline
  data/
    mockData.js             # deterministic mock inference layer
```

## Connecting the real backend

Replace the functions in `src/data/mockData.js` with calls to your actual
API (e.g. `fetch('/api/virtual-aqi?lat=...&lon=...')` hitting the
ConvLSTM/XGBoost/Random Forest inference endpoints). Each function's return
shape is documented by its usage in the matching component, so the UI needs
no other changes as long as the shape is preserved:

- `getVirtualAQI(lat, lon)` → `{ aqi, band, pm25, pm10, no2, so2, co, o3, confidence, updatedAt }`
- `getForecast(lat, lon, currentAqi)` → `[{ hour, label, aqi }, ...]`
- `getHazardOutlook(lat, lon)` → `{ rainProb, cycloneProb, windSpeed, pressure, rainAlert, cycloneAlert, spreadRadiusKm }`
- `getSHAPExplanation(lat, lon)` → `[{ name, value }, ...]`
