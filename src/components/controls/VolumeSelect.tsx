import { useState } from 'react'
import { useAppStore } from '../../store/appStore'
import { useLanguage } from '../../App'
import { VOLUME_OPTIONS } from '../../utils/constants'

export default function VolumeSelect({ disabled }: { disabled: boolean }) {
  const { config, updateConfig } = useAppStore()
  const t = useLanguage()
  const [showCustom, setShowCustom] = useState(config.volumeLiters === null)

  const handleSelect = (opt: { label: string; value: number | null }) => {
    if (opt.value === null) {
      setShowCustom(true)
      updateConfig({ volumeLiters: null })
    } else {
      setShowCustom(false)
      updateConfig({ volumeLiters: opt.value, customVolume: null })
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', opacity: disabled ? 0.4 : 1, pointerEvents: disabled ? 'none' : 'auto' }}>
      <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500 }}>{t.containerSize}</span>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
        {VOLUME_OPTIONS.map(opt => {
          const selected = opt.value === null ? showCustom : (!showCustom && config.volumeLiters === opt.value)
          return (
            <button
              key={opt.label}
              onClick={() => handleSelect(opt)}
              style={{
                padding:      '7px 4px', borderRadius: 'var(--radius-sm)',
                border:       `1px solid ${selected ? 'var(--purple-600)' : 'var(--bg-border)'}`,
                background:   selected ? 'rgba(124,58,237,0.15)' : 'var(--bg-tertiary)',
                color:        selected ? 'var(--purple-400)' : 'var(--text-secondary)',
                fontSize:     '12px', fontWeight: selected ? 600 : 500,
                cursor:       'pointer', transition: 'all 0.15s ease', whiteSpace: 'nowrap',
              }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>
      {showCustom && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <input
            type="number" min="0.1" max="20" step="0.1" placeholder="e.g. 1.5"
            value={config.customVolume ?? ''}
            onChange={e => updateConfig({ customVolume: parseFloat(e.target.value) || null })}
            style={{
              flex: 1, background: 'var(--bg-tertiary)', border: '1px solid var(--purple-600)',
              borderRadius: 'var(--radius-sm)', padding: '7px 10px',
              color: 'var(--text-primary)', fontSize: '14px', fontWeight: 500,
            }}
          />
          <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}>L</span>
        </div>
      )}
    </div>
  )
}
