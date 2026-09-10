import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { bandFor } from '../data/mockData'

export default function ForecastChart({ data }) {
  if (!data) return null

  return (
    <div className="bg-panel border border-line rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-1">
        <TrendingUp size={16} className="text-signal" />
        <h2 className="font-display text-sm font-medium text-fog">24–48hr AQI Forecast</h2>
      </div>
      <p className="text-xs text-mist mb-4">XGBoost spatio-temporal forecasting engine</p>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="aqiFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1FBFA8" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#1FBFA8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="#DFE3EE" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fill: '#6B7394', fontSize: 11 }}
              axisLine={{ stroke: '#DFE3EE' }}
              tickLine={false}
              interval={2}
            />
            <YAxis
              tick={{ fill: '#6B7394', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <Tooltip
              contentStyle={{ background: '#FFFFFF', border: '1px solid #DFE3EE', borderRadius: 8, fontSize: 12, color: '#2D3250' }}
              labelStyle={{ color: '#2D3250' }}
              formatter={(v) => [`${v} AQI · ${bandFor(v).label}`, '']}
            />
            <Area type="monotone" dataKey="aqi" stroke="#1FBFA8" strokeWidth={2} fill="url(#aqiFill)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
