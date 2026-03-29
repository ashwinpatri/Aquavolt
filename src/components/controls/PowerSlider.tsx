import { useAppStore } from '../../store/appStore'
import { useLanguage } from '../../App'

export default function PowerSlider({ disabled }: { disabled: boolean }) {
  const { config, updateConfig } = useAppStore()
  const t = useLanguage()
  const pct = config.dutyCycle

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.dutyCycle}</span>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--blue)', fontVariantNumeric: 'tabular-nums' }}>
          {config.dutyCycle}%
        </span>
      </div>
      <div style={{ position: 'relative', height: '20px', display: 'flex', alignItems: 'center' }}>
        <div style={{ position: 'absolute', height: '4px', width: '100%', borderRadius: '2px', background: 'var(--bg-border)' }} />
        <div style={{
          position: 'absolute', height: '4px', width: `${pct}%`, borderRadius: '2px',
          background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)', transition: 'width 0.15s ease',
        }} />
        <input
          type="range" min={0} max={100} step={5}
          value={config.dutyCycle}
          onChange={e => updateConfig({ dutyCycle: Number(e.target.value) })}
          style={{ position: 'absolute', width: '100%', opacity: 0, cursor: 'pointer', height: '20px' }}
        />
        <div style={{
          position: 'absolute', left: `calc(${pct}% - 8px)`,
          width: '16px', height: '16px', borderRadius: '50%',
          background: '#3b82f6', boxShadow: '0 0 8px rgba(59,130,246,0.4)',
          transition: 'left 0.15s ease', pointerEvents: 'none',
        }} />
      </div>
    </div>
  )
}
