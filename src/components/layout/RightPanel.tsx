import StatsGrid from '../stats/StatsGrid'
import ProgressRing from '../charts/ProgressRing'
import CurrentChart from '../charts/CurrentChart'
import PowerChart from '../charts/PowerChart'
import NaOClChart from '../charts/NaOClChart'
import { useAppStore } from '../../store/appStore'
import { useLanguage } from '../../App'
import { gramsProduced, litersTreatable } from '../../utils/faraday'

export default function RightPanel() {
  const { liveData, config, connected } = useAppStore()
  const t = useLanguage()

  const grams     = gramsProduced(liveData.charge, config.efficiency)
  const treatable = litersTreatable(grams)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Scrollable content with visible scrollbar */}
      <div
        className="dashboard-scroll"
        style={{ flex: 1, minHeight: 0, overflowY: 'scroll', padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        <StatsGrid />

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '14px', alignItems: 'start' }}>
          <ProgressRing />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <CurrentChart />
            <PowerChart />
          </div>
        </div>

        {/* NaOCl chart — always visible when scrolled */}
        <NaOClChart />

        {/* Treatable water summary */}
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-lg)', padding: '14px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
              {t.treatable} at 2 ppm dose
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--green)', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
              {connected ? Math.round(treatable).toLocaleString() : '—'} L
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right', maxWidth: '200px' }}>
            {connected && liveData.charge > 0
              ? `${grams.toFixed(3)}g NaOCl × 500 = ${Math.round(treatable).toLocaleString()} liters`
              : 'Start a session to see treatment capacity'}
          </div>
        </div>

      </div>
    </div>
  )
}
