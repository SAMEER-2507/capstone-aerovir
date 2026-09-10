import { BrainCircuit } from 'lucide-react'

export default function SHAPExplain({ features }) {
  if (!features) return null
  const maxAbs = Math.max(...features.map((f) => Math.abs(f.value)))

  return (
    <div className="bg-panel border border-line rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <BrainCircuit size={16} className="text-signal" />
        <h2 className="font-display text-sm font-medium text-fog">Why this prediction? (SHAP)</h2>
      </div>
      <p className="text-xs text-mist mb-4">Feature importance driving the current AQI estimate</p>

      <div className="space-y-3">
        {features.map((f) => {
          const positive = f.value >= 0
          const widthPct = (Math.abs(f.value) / maxAbs) * 100
          return (
            <div key={f.name}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-fog">{f.name}</span>
                <span className={positive ? 'text-ember' : 'text-signal'}>
                  {positive ? '+' : ''}{f.value}
                </span>
              </div>
              <div className="w-full h-1.5 bg-void rounded-full overflow-hidden flex">
                <div
                  className={`h-full rounded-full ${positive ? 'bg-ember' : 'bg-signal'}`}
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[11px] text-mist mt-4 leading-relaxed">
        Coral bars push the AQI estimate <span className="text-ember">higher</span>; teal bars pull it{' '}
        <span className="text-signal">lower</span>. Magnitude reflects each feature's contribution
        to this prediction.
      </p>
    </div>
  )
}
