import { useState, useEffect } from 'react'
import { useAppStore } from '../../store/appStore'
import { usePiConnection } from '../../hooks/usePiConnection'
import { useSession } from '../../hooks/useSession'
import { useLanguage } from '../../App'

function useElapsed(sessionStartedAt: number | null): string {
  const [elapsed, setElapsed] = useState(0)
  useEffect(() => {
    if (!sessionStartedAt) { setElapsed(0); return }
    setElapsed(Math.floor((Date.now() - sessionStartedAt) / 1000))
    const id = setInterval(() => setElapsed(Math.floor((Date.now() - sessionStartedAt) / 1000)), 1000)
    return () => clearInterval(id)
  }, [sessionStartedAt])
  const m = Math.floor(elapsed / 60), s = elapsed % 60
  return `${m}m ${String(s).padStart(2, '0')}s`
}

export default function StartStopButton({ disabled }: { disabled: boolean }) {
  const { running, connected, sessionActive, sessionStartedAt } = useAppStore()
  const elapsed = useElapsed(sessionActive ? sessionStartedAt : null)
  const { start, stop } = usePiConnection()
  const { beginSession, endSession } = useSession()
  const t = useLanguage()

  const handleDeploy = async () => {
    if (!connected) return
    beginSession()
    await start()
  }

  const handlePause = async () => {
    if (!connected) return
    await stop()
  }

  const handleEndSession = async () => {
    if (!connected) return
    if (running) await stop()
    endSession('interrupted')
  }

  const btnBase: React.CSSProperties = {
    width: '100%', padding: '13px', borderRadius: 'var(--radius-md)',
    border: 'none', color: disabled ? 'var(--text-muted)' : '#fff',
    fontSize: '15px', fontWeight: 700,
    letterSpacing: '0.04em', textTransform: 'uppercase',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
  }

  if (!sessionActive && !running) {
    return (
      <button
        onClick={handleDeploy}
        disabled={disabled}
        style={{
          ...btnBase,
          background: disabled ? 'var(--bg-border)' : 'linear-gradient(135deg, #065f46, #10b981)',
          boxShadow: disabled ? 'none' : '0 4px 20px rgba(16,185,129,0.3)',
        }}
      >
        {disabled ? '— —' : t.start}
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', fontWeight: 500, color: 'var(--text-muted)' }}>
        <span>Elapsed</span>
        <span style={{ fontWeight: 700, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>{elapsed}</span>
      </div>
      {running ? (
        <button
          onClick={handlePause}
          disabled={disabled}
          style={{
            ...btnBase,
            background: disabled ? 'var(--bg-border)' : 'linear-gradient(135deg, #92400e, #f59e0b)',
            boxShadow: disabled ? 'none' : '0 4px 20px rgba(245,158,11,0.3)',
          }}
        >
          Pause
        </button>
      ) : (
        <button
          onClick={handleDeploy}
          disabled={disabled}
          style={{
            ...btnBase,
            background: disabled ? 'var(--bg-border)' : 'linear-gradient(135deg, #1e3a5f, #3b82f6)',
            boxShadow: disabled ? 'none' : '0 4px 20px rgba(59,130,246,0.3)',
          }}
        >
          Resume
        </button>
      )}
      <button
        onClick={handleEndSession}
        disabled={disabled}
        style={{
          ...btnBase,
          padding: '10px',
          fontSize: '13px',
          background: disabled ? 'var(--bg-border)' : 'linear-gradient(135deg, #991b1b, #ef4444)',
          boxShadow: disabled ? 'none' : '0 4px 20px rgba(239,68,68,0.3)',
        }}
      >
        End Session
      </button>
    </div>
  )
}
