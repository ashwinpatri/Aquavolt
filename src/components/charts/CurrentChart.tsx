import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAppStore } from '../../store/appStore'
import { useLanguage } from '../../App'
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
      {payload[0].value.toFixed(3)} A
    </div>
  )
}

export default function CurrentChart({ flex }: { flex?: boolean }) {
  const { chartHistory } = useAppStore()
  const t = useLanguage()

  const now = Date.now()
  const windowStart = now - CHART_WINDOW * 1000
  const data = chartHistory
    .filter(d => (d.timestamp ?? 0) >= windowStart)
    .map(d => ({ t: d.timestamp, v: d.current }))

  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--bg-border)',
      borderRadius: 'var(--radius-lg)', padding: '16px 18px',
      ...(flex ? { flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 } : {}),
    }}>
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {t.current} (A)
      </span>
      <div style={flex ? { flex: 1, minHeight: 0, marginTop: '10px' } : { height: 120, marginTop: '10px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid stroke="var(--bg-tertiary)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="t" hide />
            <YAxis domain={['auto', 'auto']} tick={{ fontSize: 11, fontWeight: 500, fill: 'var(--text-muted)' }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Line type="monotone" dataKey="v" stroke="var(--purple-600)" strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
