import { useAppStore } from '../../store/appStore'
import { gramsProduced, ppmFromGrams, coulombsNeeded, progressFraction } from '../../utils/faraday'
import { useLanguage } from '../../App'

const SIZE   = 160
const STROKE = 12
const R      = (SIZE - STROKE) / 2
const CIRC   = 2 * Math.PI * R

export default function ProgressRing() {
  const { liveData, config, connected, running } = useAppStore()
  const t = useLanguage()

  const volumeL  = config.customVolume ?? config.volumeLiters
  const totalC   = coulombsNeeded(config.targetPpm, volumeL, config.efficiency)
  const fraction = connected ? progressFraction(liveData.charge, totalC) : 0
  const grams    = gramsProduced(liveData.charge, config.efficiency)
  const ppm      = volumeL && connected ? ppmFromGrams(grams, volumeL) : 0

  const offset = CIRC * (1 - fraction)
  const pct    = Math.round(fraction * 100)

  const statusColor = !connected
    ? 'var(--text-muted)'
    : fraction >= 1
    ? 'var(--green)'
    : running
    ? 'var(--purple-500)'
    : 'var(--text-secondary)'

  return (
    <div style={{
      background:    'var(--bg-secondary)', border: '1px solid var(--bg-border)',
      borderRadius:  'var(--radius-lg)', padding: '20px',
      display:       'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
    }}>
      <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {t.progress}
      </span>

      <div style={{ position: 'relative', width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="var(--bg-tertiary)" strokeWidth={STROKE} />
          <circle
            cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none"
            stroke={fraction >= 1 ? 'var(--green)' : 'var(--purple-600)'}
            strokeWidth={STROKE} strokeLinecap="round"
            strokeDasharray={CIRC} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.3s ease' }}
          />
        </svg>

        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px',
        }}>
          <span style={{ fontSize: '30px', fontWeight: 700, color: statusColor, fontVariantNumeric: 'tabular-nums' }}>
            {pct}%
          </span>
          {connected && (
            <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>
              {Math.round(ppm)} ppm
            </span>
          )}
        </div>
      </div>

      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' }}>
          {!connected ? 'Not connected' : fraction >= 1 ? t.targetReached : running ? t.running : t.idle}
        </span>
      </div>
    </div>
  )
}
