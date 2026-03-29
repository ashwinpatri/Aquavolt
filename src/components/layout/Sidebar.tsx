import { RotateCcw } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { useLanguage } from '../../App'
import { PPM_DEFAULT, DUTY_DEFAULT, DEFAULT_EFFICIENCY, DOSE_PPM } from '../../utils/constants'
import { gramsProduced, litersTreatable, coulombsNeeded } from '../../utils/faraday'
import ConcentrationSlider from '../controls/ConcentrationSlider'
import PowerSlider from '../controls/PowerSlider'
import VolumeSelect from '../controls/VolumeSelect'
import StartStopButton from '../controls/StartStopButton'

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      padding: '0 0 8px 0', borderBottom: '1px solid var(--bg-border)', marginBottom: '12px',
    }}>{children}</div>
  )
}

function Divider() { return <div style={{ borderTop: '1px solid var(--bg-border)', margin: '16px 0' }} /> }

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>{value}</span>
    </div>
  )
}

function formatUptime(seconds: number): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60), s = seconds % 60
  return `${m}m ${s}s`
}

export default function Sidebar() {
  const { connected, connectionType, deviceModel, liveData, config, updateConfig, lifetimeSeconds } = useAppStore()
  const t = useLanguage()

  const resetDashboard = () => updateConfig({
    targetPpm: PPM_DEFAULT,
    volumeLiters: 1.0,
    customVolume: null,
    dutyCycle: DUTY_DEFAULT,
    efficiency: DEFAULT_EFFICIENCY,
  })

  return (
    <div style={{
      width: 'var(--sidebar-width)', flexShrink: 0,
      background: 'var(--bg-secondary)', borderRight: '1px solid var(--bg-border)',
      display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative',
    }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>

        <SectionLabel>{t.device}</SectionLabel>
        <div style={{ opacity: connected ? 1 : 0.4 }}>
          <InfoRow label={t.piModel}        value={connected ? (deviceModel ?? 'Unknown') : '—'} />
          <InfoRow label={t.connectionType} value={connected ? (connectionType === 'usb' ? 'USB' : 'Bluetooth') : '—'} />
          <InfoRow label="Total Runtime"     value={formatUptime(lifetimeSeconds)} />
        </div>

        <Divider />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', paddingBottom: '8px', borderBottom: '1px solid var(--bg-border)' }}>
          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{t.target}</span>
          <button onClick={resetDashboard} title="Reset to defaults" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', cursor: 'pointer', padding: '2px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--bg-border)', background: 'transparent' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--purple-600)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--bg-border)' }}
          >
            <RotateCcw size={11} /> Reset
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <ConcentrationSlider disabled={!connected} />
          <VolumeSelect        disabled={!connected} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: connected ? 1 : 0.4 }}>
            <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>{t.efficiency}</span>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--amber)', background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.25)', borderRadius: '4px', padding: '2px 8px' }}>
              {Math.round(config.efficiency * 100)}%
            </span>
          </div>
        </div>

        <Divider />

        <SectionLabel>Dosing</SectionLabel>
        <InfoRow
          label="Per 1 L of water"
          value={`${((DOSE_PPM * 1000) / config.targetPpm).toFixed(1)} mL`}
        />
        <InfoRow
          label="Total purifiable"
          value={(() => {
            const volumeL = config.customVolume ?? config.volumeLiters
            if (!volumeL) return '—'
            const totalC = coulombsNeeded(config.targetPpm, volumeL, config.efficiency)
            const liters = litersTreatable(gramsProduced(totalC, config.efficiency))
            return liters > 0 ? `${Math.round(liters).toLocaleString()} L` : '—'
          })()}
        />

        <Divider />

        <SectionLabel>{t.power}</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <PowerSlider   disabled={!connected} />
          <StartStopButton disabled={!connected} />
        </div>

      </div>

      {!connected && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 16px',
          background: 'rgba(239,68,68,0.08)', borderTop: '1px solid rgba(239,68,68,0.2)',
          textAlign: 'center', fontSize: '12px', fontWeight: 500, color: 'var(--red)',
        }}>
          Connect device to enable controls
        </div>
      )}
    </div>
  )
}
