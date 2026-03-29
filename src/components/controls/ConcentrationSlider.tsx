import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useAppStore } from '../../store/appStore'
import { useLanguage } from '../../App'
import { PPM_MIN, PPM_MAX, PPM_HIGH_CONFIRM_THRESHOLD } from '../../utils/constants'

export default function ConcentrationSlider({ disabled }: { disabled: boolean }) {
  const { config, updateConfig } = useAppStore()
  const t = useLanguage()
  const [pendingPpm, setPendingPpm] = useState<number | null>(null)
  const [highPpmOpen, setHighPpmOpen] = useState(false)
  const [highPpmAck, setHighPpmAck] = useState(false)

  const pct = ((config.targetPpm - PPM_MIN) / (PPM_MAX - PPM_MIN)) * 100

  const applyTarget = (next: number) => {
    const prev = config.targetPpm
    if (next <= PPM_HIGH_CONFIRM_THRESHOLD) {
      updateConfig({ targetPpm: next })
      return
    }
    if (prev > PPM_HIGH_CONFIRM_THRESHOLD) {
      updateConfig({ targetPpm: next })
      return
    }
    setPendingPpm(next)
    setHighPpmAck(false)
    setHighPpmOpen(true)
  }

  const confirmHighPpm = () => {
    if (pendingPpm == null || !highPpmAck) return
    updateConfig({ targetPpm: pendingPpm })
    setPendingPpm(null)
    setHighPpmOpen(false)
    setHighPpmAck(false)
  }

  const cancelHighPpm = () => {
    setPendingPpm(null)
    setHighPpmOpen(false)
    setHighPpmAck(false)
  }

  const modal = highPpmOpen && typeof document !== 'undefined'
    ? createPortal(
        <>
          <div
            role="presentation"
            onClick={cancelHighPpm}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)', zIndex: 200,
            }}
          />
          <div
            className="fade-in"
            style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'var(--bg-secondary)', border: '1px solid var(--bg-border)',
              borderRadius: 'var(--radius-xl)', padding: '24px', width: 'min(420px, calc(100vw - 32px))',
              zIndex: 201, boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
            }}
          >
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '10px' }}>
              {t.highPpmTitle}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
              {t.highPpmBody}
            </p>
            <label
              style={{
                display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer',
                fontSize: '13px', color: 'var(--text-primary)', marginBottom: '18px', lineHeight: 1.45,
              }}
            >
              <input
                id="high-ppm-ack"
                type="checkbox"
                checked={highPpmAck}
                onChange={e => setHighPpmAck(e.target.checked)}
                style={{ marginTop: '2px', width: '16px', height: '16px', accentColor: 'var(--purple-600)', flexShrink: 0 }}
              />
              <span>{t.highPpmCheckbox}</span>
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={cancelHighPpm}
                style={{
                  flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-border)',
                  background: 'var(--bg-tertiary)', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer',
                }}
              >
                {t.cancel}
              </button>
              <button
                type="button"
                disabled={!highPpmAck}
                onClick={confirmHighPpm}
                style={{
                  flex: 1, padding: '10px', borderRadius: 'var(--radius-md)', border: '1px solid var(--purple-600)',
                  background: highPpmAck ? 'var(--purple-600)' : 'var(--bg-tertiary)',
                  color: highPpmAck ? '#fff' : 'var(--text-muted)', fontSize: '13px', fontWeight: 600,
                  cursor: highPpmAck ? 'pointer' : 'not-allowed', opacity: highPpmAck ? 1 : 0.7,
                }}
              >
                {t.confirm}
              </button>
            </div>
          </div>
        </>,
        document.body,
      )
    : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.concentration}</span>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--purple-400)', fontVariantNumeric: 'tabular-nums' }}>
          {config.targetPpm} ppm
        </span>
      </div>
      <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', height: '4px', width: '100%', borderRadius: '2px', background: 'var(--bg-border)' }} />
        <div style={{
          position: 'absolute', height: '4px', width: `${pct}%`, borderRadius: '2px',
          background: 'linear-gradient(90deg, var(--purple-700), var(--purple-500))',
          transition: 'width 0.15s ease',
        }} />
        <input
          type="range" min={PPM_MIN} max={PPM_MAX} step={50}
          value={config.targetPpm}
          onChange={e => applyTarget(Number(e.target.value))}
          style={{ position: 'absolute', width: '100%', opacity: 0, cursor: 'pointer', height: '20px' }}
        />
        <div style={{
          position: 'absolute', left: `calc(${pct}% - 8px)`,
          width: '16px', height: '16px', borderRadius: '50%',
          background: 'var(--purple-500)', boxShadow: '0 0 8px var(--purple-glow)',
          transition: 'left 0.15s ease', pointerEvents: 'none',
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)' }}>{PPM_MIN}</span>
        <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)' }}>{PPM_MAX}</span>
      </div>
      {modal}
    </div>
  )
}
