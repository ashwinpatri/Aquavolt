import { Settings, BookOpen } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { useLanguage } from '../../App'
import ConnectionButton from '../connection/ConnectionButton'

export default function TopBar({ onDocsOpen }: { onDocsOpen: () => void }) {
  const { activeTab, setActiveTab, setSettingsOpen } = useAppStore()
  const t = useLanguage()

  const tabs = [
    { key: 'dashboard',  label: t.dashboard },
    { key: 'sessionlog', label: t.sessionLog },
  ]

  return (
    <>
      <div
        className="drag-region"
        style={{
          height:       'var(--topbar-height)',
          background:   'var(--bg-secondary)',
          borderBottom: '1px solid var(--bg-border)',
          display:      'flex',
          alignItems:   'center',
          padding:      '0 16px 0 80px',
          gap:          '16px',
          flexShrink:   0,
          position:     'relative',
          zIndex:       10,
        }}
      >
        {/* Logo */}
        <div className="no-drag" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginRight: '8px' }}>
          <div style={{
            width:        '26px', height: '26px', borderRadius: '6px',
            background:   'linear-gradient(135deg, var(--purple-700), var(--purple-500))',
            display:      'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow:    '0 0 12px var(--purple-glow)',
            fontSize:     '13px', fontWeight: 800, color: '#fff',
          }}>A</div>
          <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
            AquaVolt
          </span>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', fontWeight: 400 }}>v1.0.0</span>
        </div>

        {/* Tab bar — centered */}
        <div className="no-drag" style={{
          position: 'absolute', left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center',
          background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)',
          padding: '3px', gap: '2px',
        }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSettingsOpen(false) }}
              style={{
                padding:      '5px 16px',
                borderRadius: '7px',
                fontSize:     '13px',
                fontWeight:   activeTab === tab.key ? 600 : 400,
                color:        activeTab === tab.key ? 'var(--text-primary)' : 'var(--text-muted)',
                background:   activeTab === tab.key ? 'var(--bg-secondary)' : 'transparent',
                border:       activeTab === tab.key ? '1px solid var(--bg-border)' : '1px solid transparent',
                cursor:       'pointer',
                transition:   'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right side */}
        <div className="no-drag" style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ConnectionButton />

          <button
            onClick={onDocsOpen}
            title="Documentation"
            style={{
              width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--bg-border)', background: 'var(--bg-tertiary)',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--purple-600)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--bg-border)' }}
          >
            <BookOpen size={15} />
          </button>

          <button
            onClick={() => setSettingsOpen(true)}
            title="Settings"
            style={{
              width: '32px', height: '32px', borderRadius: 'var(--radius-md)',
              border: '1px solid var(--bg-border)', background: 'var(--bg-tertiary)',
              color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
              justifyContent: 'center', cursor: 'pointer', transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.borderColor = 'var(--purple-600)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--bg-border)' }}
          >
            <Settings size={15} />
          </button>
        </div>
      </div>

    </>
  )
}
