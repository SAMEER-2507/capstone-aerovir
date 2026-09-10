import { Flame } from 'lucide-react'
import { bandFor } from '../data/mockData'

// Renders a coarse spatial grid around the query point so the health-risk
// heatmap concept from the architecture doc is visible without needing a
// live map tile provider.
export default function HealthHeatmap({ lat, lon, aqi }) {
  if (aqi == null) return null

  const cells = []
  const size = 7
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - (size - 1) / 2
      const dy = y - (size - 1) / 2
      const dist = Math.sqrt(dx * dx + dy * dy)
      const seed = Math.sin((lat + x) * 12.9898 + (lon + y) * 78.233) * 43758.5453
      const noise = seed - Math.floor(seed)
      const value = Math.max(10, Math.min(480, Math.round(aqi + (noise - 0.5) * 160 - dist * 6)))
      cells.push(value)
    }
  }

  return (
    <div className="bg-panel border border-line rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <Flame size={16} className="text-ember" />
        <h2 className="font-display text-sm font-medium text-fog">Health-Risk Heatmap</h2>
      </div>
      <p className="text-xs text-mist mb-4">Interpolated exposure intensity around query point</p>

      <div className="grid grid-cols-7 gap-1.5 mb-4">
        {cells.map((v, i) => {
          const band = bandFor(v)
          const isCenter = i === Math.floor(cells.length / 2)
          return (
            <div
              key={i}
              title={`AQI ${v}`}
              className="aspect-square rounded-md relative flex items-center justify-center"
              style={{ backgroundColor: `${band.color}${isCenter ? 'CC' : '55'}` }}
            >
              {isCenter && <span className="w-1.5 h-1.5 rounded-full bg-white border border-mist" />}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3 text-[10px] text-mist">
        {['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe'].map((label) => {
          const band = { Good: '#4ADE80', Satisfactory: '#A3E635', Moderate: '#FACC15', Poor: '#FB923C', 'Very Poor': '#F87171', Severe: '#A855F7' }[label]
          return (
            <span key={label} className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-sm" style={{ backgroundColor: band }} />
              {label}
            </span>
          )
        })}
      </div>
    </div>
  )
}
