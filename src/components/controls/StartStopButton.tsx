import { useAppStore } from '../../store/appStore'
import { usePiConnection } from '../../hooks/usePiConnection'
import { useSession } from '../../hooks/useSession'
import { useLanguage } from '../../App'

export default function StartStopButton({ disabled }: { disabled: boolean }) {
  const { running, connected } = useAppStore()
  const { start, stop } = usePiConnection()
  const { beginSession, endSession } = useSession()
  const t = useLanguage()

  const handleClick = async () => {
    if (!connected) return
    if (running) {
      await stop()
      endSession('interrupted')
    } else {
      beginSession()
      await start()
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      style={{
        width:         '100%', padding: '13px', borderRadius: 'var(--radius-md)',
        border:        'none',
        background:    disabled
          ? 'var(--bg-border)'
          : running
          ? 'linear-gradient(135deg, #991b1b, #ef4444)'
          : 'linear-gradient(135deg, #065f46, #10b981)',
        color:         disabled ? 'var(--text-muted)' : '#fff',
        fontSize:      '15px', fontWeight: 700,
        letterSpacing: '0.04em', textTransform: 'uppercase',
        cursor:        disabled ? 'not-allowed' : 'pointer',
        transition:    'all 0.2s ease',
        boxShadow:     disabled ? 'none' : running
          ? '0 4px 20px rgba(239,68,68,0.3)'
          : '0 4px 20px rgba(16,185,129,0.3)',
      }}
    >
      {disabled ? '— —' : running ? t.stop : t.start}
    </button>
  )
}
