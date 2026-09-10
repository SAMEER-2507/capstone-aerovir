import { useState, useEffect, useCallback } from 'react'
import { MapPin, Search, Loader2, LocateFixed, Navigation } from 'lucide-react'
import { PRESET_LOCATIONS } from '../data/mockData'

function validateCoordinates(latNum, lonNum) {
  return !(
    Number.isNaN(latNum) ||
    Number.isNaN(lonNum) ||
    latNum < -90 ||
    latNum > 90 ||
    lonNum < -180 ||
    lonNum > 180
  )
}

export default function LocationSearch({ onLocate, loading }) {
  const [lat, setLat] = useState(String(PRESET_LOCATIONS[0].lat))
  const [lon, setLon] = useState(String(PRESET_LOCATIONS[0].lon))
  const [error, setError] = useState('')

  // Geolocation state
  const [geoStatus, setGeoStatus] = useState('detecting') // detecting | granted | denied | unsupported
  const [geoCoords, setGeoCoords] = useState(null)
  const [showManual, setShowManual] = useState(false)

  const detectLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setGeoStatus('unsupported')
      setShowManual(true)
      // Fall back to existing default pipeline so the app still loads with data.
      onLocate(PRESET_LOCATIONS[0].lat, PRESET_LOCATIONS[0].lon)
      return
    }

    setGeoStatus('detecting')
    setError('')

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const detectedLat = position.coords.latitude
        const detectedLon = position.coords.longitude
        setGeoCoords({ lat: detectedLat, lon: detectedLon })
        setLat(String(detectedLat))
        setLon(String(detectedLon))
        setGeoStatus('granted')
        setShowManual(false)
        // Reuse the existing location/AQI pipeline — single source of truth.
        onLocate(detectedLat, detectedLon)
      },
      (geoError) => {
        console.error('Unable to get location:', geoError)
        setGeoStatus('denied')
        setShowManual(true)
        // Fall back to existing default pipeline so the app still loads with data.
        onLocate(PRESET_LOCATIONS[0].lat, PRESET_LOCATIONS[0].lon)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    )
  }, [onLocate])

  useEffect(() => {
    detectLocation()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function submit(e) {
    e.preventDefault()
    const latNum = parseFloat(lat)
    const lonNum = parseFloat(lon)
    if (!validateCoordinates(latNum, lonNum)) {
      setError('Please enter valid latitude and longitude coordinates.')
      return
    }
    setError('')
    setShowManual(false)
    onLocate(latNum, lonNum)
  }

  return (
    <div className="bg-panel border border-line rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <MapPin size={16} className="text-signal" />
        <h2 className="font-display text-sm font-medium text-fog">Sense any coordinate</h2>
      </div>

      {/* Auto-detecting state */}
      {geoStatus === 'detecting' && (
        <div className="flex items-center gap-2 text-sm text-mist mb-4">
          <Loader2 size={15} className="animate-spin text-signal" />
          📍 Detecting your location…
        </div>
      )}

      {/* Detected current-location card */}
      {geoStatus === 'granted' && geoCoords && !showManual && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div className="flex items-start gap-2">
            <LocateFixed size={16} className="text-signal mt-0.5" />
            <div>
              <p className="text-sm text-fog font-medium">📍 Current Location</p>
              <p className="text-xs text-mist font-mono">
                Latitude: {geoCoords.lat.toFixed(6)} · Longitude: {geoCoords.lon.toFixed(6)}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowManual(true)}
            className="text-xs px-3 py-1.5 rounded-full border border-line text-mist hover:text-signal hover:border-signal/50 transition-colors self-start sm:self-auto"
          >
            Search Another Location
          </button>
        </div>
      )}

      {/* Denied / unsupported message */}
      {(geoStatus === 'denied' || geoStatus === 'unsupported') && (
        <p className="text-xs text-mist mb-4">
          We couldn't access your location. You can enter a location manually instead.
        </p>
      )}

      {/* Manual search form — existing UI, now also reachable via "Search Another Location" */}
      {(showManual || geoStatus === 'denied' || geoStatus === 'unsupported') && (
        <>
          <form onSubmit={submit} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 grid grid-cols-2 gap-3">
              <input
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="Latitude"
                className="bg-void border border-line rounded-lg px-3 py-2 text-sm text-fog placeholder:text-mist focus:outline-none focus:ring-1 focus:ring-signal focus:border-signal font-mono"
              />
              <input
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                placeholder="Longitude"
                className="bg-void border border-line rounded-lg px-3 py-2 text-sm text-fog placeholder:text-mist focus:outline-none focus:ring-1 focus:ring-signal focus:border-signal font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 bg-signal text-void font-medium text-sm px-5 py-2 rounded-lg hover:bg-signal2 transition-colors disabled:opacity-60"
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
              {loading ? 'Sensing…' : 'Estimate AQI'}
            </button>
          </form>

          <button
            onClick={detectLocation}
            className="flex items-center gap-1.5 text-xs text-mist hover:text-signal transition-colors mt-3"
          >
            <Navigation size={13} />
            Use My Current Location
          </button>

          {error && <p className="text-severe text-xs mt-2">{error}</p>}

          <div className="flex flex-wrap gap-2 mt-4">
            {PRESET_LOCATIONS.map((p) => (
              <button
                key={p.name}
                onClick={() => {
                  setLat(String(p.lat))
                  setLon(String(p.lon))
                  setShowManual(false)
                  onLocate(p.lat, p.lon)
                }}
                className="text-xs px-3 py-1.5 rounded-full border border-line text-mist hover:text-signal hover:border-signal/50 transition-colors"
              >
                {p.name}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
