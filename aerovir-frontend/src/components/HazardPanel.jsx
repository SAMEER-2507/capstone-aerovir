import { CloudRain, Wind as WindIcon, AlertTriangle, Gauge } from 'lucide-react'

export default function HazardPanel({ hazard }) {
  if (!hazard) return null
  const anyAlert = hazard.rainAlert || hazard.cycloneAlert

  return (
    <div
      className={`bg-panel border rounded-2xl p-5 ${
        anyAlert ? 'border-ember/50 shadow-emberglow' : 'border-line'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <WindIcon size={16} className="text-ember" />
          <h2 className="font-display text-sm font-medium text-fog">Multi-Hazard Intelligence</h2>
        </div>
        {anyAlert && (
          <span className="flex items-center gap-1 text-xs text-ember font-medium">
            <AlertTriangle size={13} /> Early warning active
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <HazardGauge
          icon={CloudRain}
          label="Rainfall probability"
          value={hazard.rainProb}
          alert={hazard.rainAlert}
        />
        <HazardGauge
          icon={WindIcon}
          label="Cyclone probability"
          value={hazard.cycloneProb}
          alert={hazard.cycloneAlert}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs text-mist mb-4">
        <div className="flex items-center gap-2 bg-void/60 border border-line rounded-lg px-3 py-2">
          <Gauge size={13} className="text-signal" />
          Pressure: <span className="text-fog font-mono">{hazard.pressure} hPa</span>
        </div>
        <div className="flex items-center gap-2 bg-void/60 border border-line rounded-lg px-3 py-2">
          <WindIcon size={13} className="text-signal" />
          Wind: <span className="text-fog font-mono">{hazard.windSpeed} km/h</span>
        </div>
      </div>

      {hazard.cycloneAlert ? (
        <div className="bg-ember/10 border border-ember/30 rounded-lg px-3 py-2.5 text-xs text-fog">
          <p className="font-medium text-ember mb-1">Hazard spread radius</p>
          Projected impact zone extends ~{hazard.spreadRadiusKm} km from center. Advisory pushed
          to Disaster Management Authorities.
        </div>
      ) : (
        <p className="text-xs text-mist">No severe atmospheric anomalies detected in this region right now.</p>
      )}
    </div>
  )
}

function HazardGauge({ icon: Icon, label, value, alert }) {
  return (
    <div className="bg-void/60 border border-line rounded-lg p-3">
      <div className="flex items-center gap-1.5 text-mist text-[11px] mb-2">
        <Icon size={12} />
        {label}
      </div>
      <div className="flex items-end justify-between mb-1.5">
        <span className={`font-display text-xl font-semibold ${alert ? 'text-ember' : 'text-fog'}`}>
          {value}%
        </span>
      </div>
      <div className="w-full h-1.5 rounded-full bg-panel2 overflow-hidden">
        <div
          className={`h-full rounded-full ${alert ? 'bg-ember' : 'bg-signal'}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}
