import { ShieldCheck } from 'lucide-react'
import { getSafeWindows } from '../data/mockData'

const RISK_COLOR = {
  Safe: 'bg-good/20 text-good border-good/40',
  Caution: 'bg-moderate/20 text-moderate border-moderate/40',
  Avoid: 'bg-severe/20 text-severe border-severe/40',
}

export default function SafeWindow({ forecast }) {
  if (!forecast) return null
  const windows = getSafeWindows(forecast)

  return (
    <div className="bg-panel border border-line rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <ShieldCheck size={16} className="text-signal" />
        <h2 className="font-display text-sm font-medium text-fog">Safe Exposure Windows</h2>
      </div>
      <p className="text-xs text-mist mb-4">Health-Risk Assessment engine · plan outdoor activity</p>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {windows.map((w) => (
          <div
            key={w.hour}
            className={`shrink-0 w-20 rounded-lg border px-2 py-2.5 text-center ${RISK_COLOR[w.risk]}`}
          >
            <p className="text-[10px] opacity-80">{w.label}</p>
            <p className="font-display text-sm font-semibold my-0.5">{w.aqi}</p>
            <p className="text-[10px] font-medium">{w.risk}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
