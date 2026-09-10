import { Radar, Wind, Activity, LogOut } from 'lucide-react'

const NAV = [
  { id: 'sensing', label: 'Sensing', icon: Radar },
  { id: 'hazard', label: 'Hazard', icon: Wind },
  { id: 'health', label: 'Health', icon: Activity },
]

export default function Header({ active, setActive, user, onLogout }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-line">
      <div className="flex items-center gap-2 lg:hidden">
        <Radar size={16} className="text-signal" />
        <span className="font-display font-semibold text-fog text-sm">AeroVir</span>
      </div>
      <div className="flex gap-1 lg:hidden">
        {NAV.map(({ id, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActive(id)}
            className={`p-2 rounded-lg ${active === id ? 'bg-signal/10 text-signal' : 'text-mist'}`}
          >
            <Icon size={16} />
          </button>
        ))}
      </div>

      <div className="hidden lg:block" />

      {user && (
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs text-mist">{user.name}</span>
          <button
            onClick={onLogout}
            className="flex items-center gap-1 text-xs text-mist hover:text-fog px-2 py-1 rounded-lg hover:bg-black/5"
          >
            <LogOut size={13} />
            Logout
          </button>
        </div>
      )}
    </header>
  )
}
