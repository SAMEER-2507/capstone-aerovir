import { Satellite, Clock } from 'lucide-react'

export default function AQIGauge({ data, locationName }) {
  if (!data) return null
  const { aqi, band, confidence, updatedAt } = data
  const pct = Math.min(100, (aqi / 500) * 100)

  return (
    <div className="bg-panel border border-line rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-center gap-8">
        {/* Signature: radiating sensor rings around the estimated AQI —
            visualizes "virtual sensing" of a point with no physical sensor */}
        <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
          <span
            className="absolute inset-0 rounded-full animate-pulse-ring"
            style={{ border: `1px solid ${band.color}66` }}
          />
          <span
            className="absolute inset-0 rounded-full animate-pulse-ring-delay"
            style={{ border: `1px solid ${band.color}66` }}
          />
          <span
            className="absolute inset-0 rounded-full animate-pulse-ring-delay2"
            style={{ border: `1px solid ${band.color}66` }}
          />
          <div
            className="relative w-32 h-32 rounded-full flex flex-col items-center justify-center border-2"
            style={{ borderColor: band.color, boxShadow: `0 0 50px -8px ${band.color}88` }}
          >
            <span className="font-display text-4xl font-bold" style={{ color: band.color }}>
              {aqi}
            </span>
            <span className="text-[10px] text-mist tracking-widest mt-0.5">AQI</span>
          </div>
        </div>

        <div className="flex-1 w-full">
          <div className="flex items-center gap-2 text-xs text-mist mb-1">
            <Satellite size={13} className="text-signal" />
            <span>Virtual sensor · no physical station required</span>
          </div>
          <h1 className="font-display text-2xl font-semibold text-fog mb-1">{locationName}</h1>
          <div className="flex items-center gap-3 mb-4">
            <span
              className="text-sm font-medium px-2.5 py-0.5 rounded-full"
              style={{ color: band.color, backgroundColor: `${band.color}1A` }}
            >
              {band.label}
            </span>
            <span className="text-xs text-mist flex items-center gap-1">
              <Clock size={12} /> updated {updatedAt.toLocaleTimeString()}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-void overflow-hidden mb-6">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${pct}%`, backgroundColor: band.color }}
            />
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            <Metric label="PM2.5" value={data.pm25} unit="µg/m³" />
            <Metric label="PM10" value={data.pm10} unit="µg/m³" />
            <Metric label="NO₂" value={data.no2} unit="ppb" />
            <Metric label="SO₂" value={data.so2} unit="ppb" />
            <Metric label="CO" value={data.co} unit="ppm" />
            <Metric label="O₃" value={data.o3} unit="ppb" />
          </div>

          <p className="text-xs text-mist mt-4">
            ConvLSTM model confidence:{' '}
            <span className="text-signal font-medium">{confidence}%</span>
          </p>
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, unit }) {
  return (
    <div className="bg-void/60 border border-line rounded-lg px-2.5 py-2">
      <p className="text-[10px] text-mist">{label}</p>
      <p className="text-sm font-mono text-fog">{value}</p>
      <p className="text-[9px] text-mist">{unit}</p>
    </div>
  )
}
