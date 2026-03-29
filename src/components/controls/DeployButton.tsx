import { useState } from 'react'
import { Upload, Check } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { usePiConnection } from '../../hooks/usePiConnection'
import { useLanguage } from '../../App'

type DeployState = 'idle' | 'deploying' | 'done' | 'error'

export default function DeployButton({ disabled }: { disabled: boolean }) {
  const [state, setState] = useState<DeployState>('idle')
  const { config, lastDeployedAt, setLastDeployedAt } = useAppStore()
  const { deploy } = usePiConnection()
  const t = useLanguage()

  const handleDeploy = async () => {
    setState('deploying')
    try {
      await deploy(config)
      setLastDeployedAt(Date.now())
      setState('done')
      setTimeout(() => setState('idle'), 2500)
    } catch {
      setState('error')
      setTimeout(() => setState('idle'), 2500)
    }
  }

  const label = state === 'deploying' ? 'Pushing...'
              : state === 'done'      ? 'Deployed!'
              : state === 'error'     ? 'Failed'
              : t.deploy

  const bg          = state === 'done' ? 'rgba(16,185,129,0.15)' : state === 'error' ? 'rgba(239,68,68,0.15)' : 'var(--bg-tertiary)'
  const borderColor = state === 'done' ? 'rgba(16,185,129,0.4)'  : state === 'error' ? 'rgba(239,68,68,0.4)'  : 'var(--bg-border)'
  const textColor   = state === 'done' ? 'var(--green)'           : state === 'error' ? 'var(--red)'           : 'var(--text-secondary)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <button
        onClick={handleDeploy}
        disabled={disabled || state === 'deploying'}
        style={{
          width:        '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap:          '8px', padding: '10px', borderRadius: 'var(--radius-md)',
          border:       `1px solid ${borderColor}`, background: bg, color: textColor,
          fontSize:     '14px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
        }}
      >
        {state === 'done' ? <Check size={14} /> : <Upload size={14} />}
        {label}
      </button>
      {lastDeployedAt !== null && (
        <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', textAlign: 'center' }}>
          {t.lastDeploy}: {new Date(lastDeployedAt).toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}
