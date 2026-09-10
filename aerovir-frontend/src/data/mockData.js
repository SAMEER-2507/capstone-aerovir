// Deterministic pseudo-random generator seeded by lat/lon so the same
// coordinate always "senses" the same values — stands in for the real
// ConvLSTM / XGBoost / Random Forest inference calls described in the
// AeroVir architecture doc, until a live backend is wired up.

function seededRandom(seed) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return function () {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function seedFromCoords(lat, lon) {
  return Math.floor(Math.abs(lat * 10000 + lon * 100000)) + 1
}

export const AQI_BANDS = [
  { max: 50, label: 'Good', color: '#4ADE80' },
  { max: 100, label: 'Satisfactory', color: '#A3E635' },
  { max: 200, label: 'Moderate', color: '#FACC15' },
  { max: 300, label: 'Poor', color: '#FB923C' },
  { max: 400, label: 'Very Poor', color: '#F87171' },
  { max: 500, label: 'Severe', color: '#A855F7' },
]

export function bandFor(aqi) {
  return AQI_BANDS.find((b) => aqi <= b.max) || AQI_BANDS[AQI_BANDS.length - 1]
}

export const PRESET_LOCATIONS = [
  { name: 'Patiala, Punjab', lat: 30.3398, lon: 76.3869 },
  { name: 'Delhi NCR', lat: 28.6139, lon: 77.209 },
  { name: 'Mumbai, Maharashtra', lat: 19.076, lon: 72.8777 },
  { name: 'Chennai, Tamil Nadu', lat: 13.0827, lon: 80.2707 },
  { name: 'Guwahati, Assam', lat: 26.1445, lon: 91.7362 },
]

// Simulates the ConvLSTM virtual-sensing model
export function getVirtualAQI(lat, lon) {
  const rand = seededRandom(seedFromCoords(lat, lon))
  const base = 60 + rand() * 260
  const aqi = Math.round(base)
  return {
    aqi,
    band: bandFor(aqi),
    pm25: Math.round(aqi * 0.55 + rand() * 10),
    pm10: Math.round(aqi * 0.8 + rand() * 15),
    no2: Math.round(10 + rand() * 40),
    so2: Math.round(4 + rand() * 15),
    co: +(0.4 + rand() * 1.8).toFixed(2),
    o3: Math.round(15 + rand() * 45),
    confidence: Math.round(82 + rand() * 14),
    updatedAt: new Date(),
  }
}

// Simulates the XGBoost 24-48hr forecast model
export function getForecast(lat, lon, currentAqi) {
  const rand = seededRandom(seedFromCoords(lat, lon) + 7)
  const points = []
  let val = currentAqi
  for (let h = 0; h <= 48; h += 3) {
    val = Math.max(15, Math.min(480, val + (rand() - 0.5) * 40))
    points.push({
      hour: h,
      label: h === 0 ? 'Now' : `+${h}h`,
      aqi: Math.round(val),
    })
  }
  return points
}

// Simulates the Random Forest hazard-detection model
export function getHazardOutlook(lat, lon) {
  const rand = seededRandom(seedFromCoords(lat, lon) + 21)
  const rainProb = Math.round(rand() * 100)
  const cycloneProb = Math.round(rand() * 45)
  const windSpeed = Math.round(8 + rand() * 55)
  const pressure = Math.round(985 + rand() * 30)
  return {
    rainProb,
    cycloneProb,
    windSpeed,
    pressure,
    rainAlert: rainProb > 60,
    cycloneAlert: cycloneProb > 30,
    spreadRadiusKm: cycloneProb > 30 ? Math.round(40 + rand() * 120) : 0,
  }
}

// Simulates SHAP feature-importance output
export function getSHAPExplanation(lat, lon) {
  const rand = seededRandom(seedFromCoords(lat, lon) + 33)
  const features = [
    { name: 'PM2.5 concentration', base: 0.38 },
    { name: 'Wind speed', base: -0.22 },
    { name: 'Humidity', base: 0.17 },
    { name: 'Traffic density (proxy)', base: 0.14 },
    { name: 'Temperature inversion', base: 0.11 },
    { name: 'Distance to nearest CPCB station', base: -0.08 },
  ]
  return features
    .map((f) => ({ ...f, value: +(f.base + (rand() - 0.5) * 0.08).toFixed(2) }))
    .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
}

// Simulates the Health-Risk Assessment engine's safe-exposure windows
export function getSafeWindows(forecast) {
  return forecast
    .filter((_, i) => i % 2 === 0)
    .map((p) => ({
      ...p,
      safe: p.aqi <= 100,
      risk: p.aqi <= 100 ? 'Safe' : p.aqi <= 200 ? 'Caution' : 'Avoid',
    }))
}
