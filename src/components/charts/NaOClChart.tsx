import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAppStore } from '../../store/appStore'
import { gramsProduced } from '../../utils/faraday'
import { CHART_WINDOW } from '../../utils/constants'

interface TooltipPayloadItem { value: number }
interface CustomTooltipProps { active?: boolean; payload?: TooltipPayloadItem[] }

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-tertiary)', border: '1px solid var(--bg-border)',
      borderRadius: 'var(--radius-sm)', padding: '6px 10px',
      fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)',
    }}>
      {payload[0].value.toFixed(4)} g
    </div>
  )
}

export default function NaOClChart() {
  const { chartHistory, config } = useAppStore()

  const now = Date.now()
  const windowStart = now - CHART_WINDOW * 1000
  const data = chartHistory
    .filter(d => (d.timestamp ?? 0) >= windowStart)
    .map(d => ({ t: d.timestamp, v: gramsProduced(d.charge, config.efficiency) }))

  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--bg-border)',
      borderRadius: 'var(--radius-lg)', padding: '16px 18px',
    }}>
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        NaOCl Accumulated (g)
      </span>
      <div style={{ height: 120, marginTop: '10px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="naoclGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="var(--bg-tertiary)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" hide />
            <YAxis domain={[0, 'auto']} tick={{ fontSize: 11, fontWeight: 500, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} fill="url(#naoclGrad)" dot={false} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
