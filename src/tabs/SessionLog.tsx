import { Download, ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useAppStore } from '../store/appStore'
import { useLanguage } from '../App'
import type { SessionRecord } from '../types'

function exportCsv(sessions: SessionRecord[]) {
  const headers = ['Start Time', 'End Time', 'Duration', 'NaOCl (g)', 'Est. PPM', 'Target PPM', 'Volume (L)', 'Charge (C)', 'Energy (Wh)', 'Efficiency', 'Status']
  const rows = sessions.map(s => [
    new Date(s.startTime).toLocaleString(),
    new Date(s.endTime).toLocaleString(),
    s.durationLabel,
    s.grams,
    s.ppm ?? '',
    s.targetPpm,
    s.volumeL ?? '',
    s.coulombs ?? '',
    s.wattHours,
    `${Math.round(s.efficiency * 100)}%`,
    s.status,
  ])
  const csv  = [headers, ...rows].map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `aquavolt-sessions-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

function StatusBadge({ status }: { status: SessionRecord['status'] }) {
  const isComplete = status === 'complete'
  return (
    <span style={{
      fontSize:      '11px', fontWeight: 600, padding: '2px 8px', borderRadius: '4px',
      background:    isComplete ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
      color:         isComplete ? 'var(--green)' : 'var(--amber)',
      border:        `1px solid ${isComplete ? 'rgba(16,185,129,0.25)' : 'rgba(245,158,11,0.25)'}`,
      textTransform: 'capitalize',
    }}>
      {status}
    </span>
  )
}

const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: '13px', color: 'var(--text-secondary)', verticalAlign: 'middle' }

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '2px' }}>{label}</div>
      <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500 }}>{value}</div>
    </div>
  )
}

function SessionRow({ session }: { session: SessionRecord }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr onClick={() => setExpanded(e => !e)} style={{ cursor: 'pointer', borderBottom: '1px solid var(--bg-border)' }}>
        <td style={tdStyle}>{new Date(session.startTime).toLocaleString()}</td>
        <td style={tdStyle}>{session.durationLabel}</td>
        <td style={{ ...tdStyle, color: 'var(--purple-400)', fontWeight: 600 }}>{session.grams}g</td>
        <td style={tdStyle}>{session.ppm != null ? `${session.ppm} ppm` : '—'}</td>
        <td style={tdStyle}>{Math.round(session.efficiency * 100)}%</td>
        <td style={tdStyle}><StatusBadge status={session.status} /></td>
        <td style={tdStyle}>{expanded ? <ChevronUp size={14} color="var(--text-muted)" /> : <ChevronDown size={14} color="var(--text-muted)" />}</td>
      </tr>
      {expanded && (
        <tr style={{ background: 'var(--bg-tertiary)' }}>
          <td colSpan={7} style={{ padding: '14px 16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
              <InfoItem label="Start Time"       value={new Date(session.startTime).toLocaleString()} />
              <InfoItem label="End Time"         value={new Date(session.endTime).toLocaleString()} />
              <InfoItem label="Duration"         value={session.durationLabel} />
              <InfoItem label="Status"           value={session.status.charAt(0).toUpperCase() + session.status.slice(1)} />
              <InfoItem label="NaOCl Produced"   value={`${session.grams} g`} />
              <InfoItem label="Est. Concentration" value={session.ppm != null ? `${session.ppm} ppm` : '—'} />
              <InfoItem label="Target PPM"       value={`${session.targetPpm} ppm`} />
              <InfoItem label="Volume"           value={session.volumeL != null ? `${session.volumeL} L` : '—'} />
              <InfoItem label="Charge Used"      value={`${session.coulombs ?? '—'} C`} />
              <InfoItem label="Energy Used"      value={`${session.wattHours} Wh`} />
              <InfoItem label="Efficiency"       value={`${Math.round(session.efficiency * 100)}%`} />
              <InfoItem label="Session ID"       value={session.id} />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function SessionLog() {
  const { sessions, clearSessions } = useAppStore()
  const t = useLanguage()

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{
        display:        'flex', alignItems: 'center', justifyContent: 'space-between',
        padding:        '16px 20px', borderBottom: '1px solid var(--bg-border)',
        background:     'var(--bg-secondary)', flexShrink: 0,
      }}>
        <div>
          <h2 style={{ fontSize: '15px', fontWeight: 600 }}>{t.sessions}</h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
            {sessions.length} session{sessions.length !== 1 ? 's' : ''} recorded
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {sessions.length > 0 && (
            <>
              <button
                onClick={() => exportCsv(sessions)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 12px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--bg-border)', background: 'var(--bg-tertiary)',
                  color: 'var(--text-secondary)', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                }}
              >
                <Download size={13} /> {t.exportCsv}
              </button>
              <button
                onClick={clearSessions}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '7px 12px', borderRadius: 'var(--radius-md)',
                  border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.08)',
                  color: 'var(--red)', fontSize: '12px', fontWeight: 500, cursor: 'pointer',
                }}
              >
                <Trash2 size={13} /> Clear
              </button>
            </>
          )}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {sessions.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)', fontSize: '14px' }}>
            {t.noSessions}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--bg-border)', background: 'var(--bg-secondary)', position: 'sticky', top: 0 }}>
                {[t.sessionStart, t.sessionDuration, t.sessionGrams, t.sessionPpm, t.sessionEff, t.sessionStatus, ''].map((h, i) => (
                  <th key={i} style={{ padding: '10px 16px', fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'left' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.map(s => <SessionRow key={s.id} session={s} />)}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
