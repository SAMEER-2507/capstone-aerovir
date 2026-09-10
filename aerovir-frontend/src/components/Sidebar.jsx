import { Radar, Wind, Activity, Cpu, Github } from 'lucide-react'

const NAV = [
  { id: 'sensing', label: 'Virtual Sensing', icon: Radar },
  { id: 'hazard', label: 'Multi-Hazard', icon: Wind },
  { id: 'health', label: 'Health & SHAP', icon: Activity },
]

export default function Sidebar({ active, setActive }) {
  return (
    <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-line px-5 py-6">
      <div className="flex items-center gap-2.5 mb-10">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <span className="absolute inset-0 rounded-full border border-signal/50 animate-pulse-ring" />
          <Radar size={18} className="text-signal relative" />
        </div>
        <div>
          <p className="font-display font-semibold text-fog leading-none">AeroVir</p>
          <p className="text-[10px] text-mist tracking-wide mt-0.5">CPG 323 · Capstone</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors text-left ${
              active === id
                ? 'bg-signal/10 text-signal border border-signal/30'
                : 'text-mist hover:text-fog hover:bg-panel2 border border-transparent'
            }`}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-line">
        <div className="flex items-center gap-2 text-xs text-mist mb-2">
          <Cpu size={13} />
          <span>Model status</span>
        </div>
        <div className="space-y-1.5 text-xs">
          <ModelRow name="ConvLSTM" ok />
          <ModelRow name="XGBoost" ok />
          <ModelRow name="Random Forest" ok />
        </div>
        <a
          href="https://github.com"
          className="flex items-center gap-2 text-xs text-mist hover:text-signal mt-6"
        >
          <Github size={13} /> View repository
        </a>
      </div>
    </aside>
  )
}

function ModelRow({ name, ok }) {
  return (
    <div className="flex items-center justify-between text-mist">
      <span>{name}</span>
      <span className={`flex items-center gap-1 ${ok ? 'text-good' : 'text-severe'}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-good' : 'bg-severe'}`} />
        {ok ? 'active' : 'down'}
      </span>
    </div>
  )
}
