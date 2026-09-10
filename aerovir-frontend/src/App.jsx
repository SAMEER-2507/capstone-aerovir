import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import LocationSearch from './components/LocationSearch'
import AQIGauge from './components/AQIGauge'
import ForecastChart from './components/ForecastChart'
import HazardPanel from './components/HazardPanel'
import HealthHeatmap from './components/HealthHeatmap'
import SafeWindow from './components/SafeWindow'
import SHAPExplain from './components/SHAPExplain'
import AuthPage from './components/AuthPage'
import { useAuth } from './context/AuthContext'
import {
  getVirtualAQI,
  getForecast,
  getHazardOutlook,
  getSHAPExplanation,
  PRESET_LOCATIONS,
} from './data/mockData'

export default function App() {
  const { user, loading: authLoading, logout } = useAuth()
  const [active, setActive] = useState('sensing')
  const [loading, setLoading] = useState(false)
  const [coords, setCoords] = useState({ lat: PRESET_LOCATIONS[0].lat, lon: PRESET_LOCATIONS[0].lon })
  const [locationName, setLocationName] = useState(PRESET_LOCATIONS[0].name)
  const [aqi, setAqi] = useState(null)
  const [forecast, setForecast] = useState(null)
  const [hazard, setHazard] = useState(null)
  const [shap, setShap] = useState(null)

  const runInference = useCallback((lat, lon) => {
    setLoading(true)
    setCoords({ lat, lon })
    const preset = PRESET_LOCATIONS.find((p) => p.lat === lat && p.lon === lon)
    setLocationName(preset ? preset.name : `${lat.toFixed(4)}, ${lon.toFixed(4)}`)

    // Simulated inference latency — mirrors the API fetch + model
    // inference round trip described in the use-case doc (UC-1.1).
    setTimeout(() => {
      const aqiResult = getVirtualAQI(lat, lon)
      setAqi(aqiResult)
      setForecast(getForecast(lat, lon, aqiResult.aqi))
      setHazard(getHazardOutlook(lat, lon))
      setShap(getSHAPExplanation(lat, lon))
      setLoading(false)
    }, 600)
  }, [])

  // Initial fetch is now triggered by LocationSearch itself (auto geolocation,
  // falling back to this default coordinate) — no duplicate call needed here.

  if (authLoading) {
    return (
      <div className="min-h-screen bg-void flex items-center justify-center text-fog">
        Loading...
      </div>
    )
  }

  if (!user) {
    return <AuthPage />
  }

  return (
    <div className="min-h-screen bg-void text-fog font-body flex">
      <Sidebar active={active} setActive={setActive} />

      <div className="flex-1 flex flex-col min-w-0">
        <Header active={active} setActive={setActive} user={user} onLogout={logout} />

        <main className="flex-1 px-4 sm:px-6 lg:px-8 py-6 max-w-6xl mx-auto w-full">
          <LocationSearch onLocate={runInference} loading={loading} />

          <div className="h-6" />

          {active === 'sensing' && (
            <div className="space-y-6">
              <AQIGauge data={aqi} locationName={locationName} />
              <ForecastChart data={forecast} />
            </div>
          )}

          {active === 'hazard' && (
            <div className="space-y-6">
              <HazardPanel hazard={hazard} />
            </div>
          )}

          {active === 'health' && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <HealthHeatmap lat={coords.lat} lon={coords.lon} aqi={aqi?.aqi} />
                <SHAPExplain features={shap} />
              </div>
              <SafeWindow forecast={forecast} />
            </div>
          )}

          <footer className="mt-10 pb-6 text-center text-[11px] text-mist">
            AeroVir · Virtual Air Quality Monitoring & Multi-Hazard Intelligence System · Thapar
            Institute of Engineering & Technology · Capstone 2026
          </footer>
        </main>
      </div>
    </div>
  )
}
