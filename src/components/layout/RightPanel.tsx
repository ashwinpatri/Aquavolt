import { useEffect, useRef } from 'react'
import StatsGrid from '../stats/StatsGrid'
import StatCard from '../stats/StatCard'
import ProgressRing from '../charts/ProgressRing'
import CurrentChart from '../charts/CurrentChart'
import PowerChart from '../charts/PowerChart'
import NaOClChart from '../charts/NaOClChart'
import { useAppStore } from '../../store/appStore'
import { useLanguage } from '../../App'
import { gramsProduced, litersTreatable } from '../../utils/faraday'
import { DEFAULT_ELECTRICITY_RATE } from '../../utils/constants'

export default function RightPanel() {
  const { liveData, config, connected, lastDeployedAt, chargeOffset, running } = useAppStore()
  const t = useLanguage()

  const grams      = gramsProduced(liveData.charge, config.efficiency)
  const treatable  = litersTreatable(grams)
  const charge = Math.max(0, liveData.charge - chargeOffset)
  const sensorVoltage = liveData.voltage
  const effectiveVoltage = running && sensorVoltage < 2 ? sensorVoltage + 3 : sensorVoltage
  const energyGrams = gramsProduced(charge, config.efficiency)
  const sessionWhCandidate = Math.max(0, (charge * effectiveVoltage) / 3600)
  const sessionWhRef = useRef(0)

  useEffect(() => {
    if (!connected) {
      sessionWhRef.current = 0
      return
    }
    if (charge <= 0.0001) {
      sessionWhRef.current = 0
      return
    }
    if (running) {
      sessionWhRef.current = Math.max(sessionWhRef.current, sessionWhCandidate)
    }
  }, [connected, charge, running, sessionWhCandidate])

  const sessionWh = connected ? sessionWhRef.current : null
  const whPerGram = connected && energyGrams > 0 ? (sessionWh / energyGrams) : null
  const electricityRate = config.electricityRate ?? DEFAULT_ELECTRICITY_RATE
  const sessionUsd = connected ? (sessionWh / 1000) * electricityRate : null
  const energyCostSub = whPerGram !== null ? `${whPerGram.toFixed(2)} Wh/g` : undefined
  const usdStep = 0.00001 // 0.001 cents
  const roundedUpUsd = sessionUsd !== null ? Math.ceil(sessionUsd / usdStep) * usdStep : null
  const minUsdAfterDeploy = connected && lastDeployedAt !== null ? usdStep : null
  const displayUsd = roundedUpUsd !== null
    ? Math.max(roundedUpUsd, minUsdAfterDeploy ?? 0)
    : null
  const energyWhDisplay = sessionWh !== null
    ? (sessionWh >= 0.001 ? sessionWh.toFixed(3) : sessionWh.toFixed(5))
    : '—'
  const energyUsdDisplay = displayUsd !== null
    ? (displayUsd >= 0.01 ? displayUsd.toFixed(2) : displayUsd.toFixed(5))
    : '—'

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      {/* Scrollable content with visible scrollbar */}
      <div
        className="dashboard-scroll"
        style={{ flex: 1, minHeight: 0, overflowY: 'scroll', padding: '16px 16px 32px', display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        <StatsGrid />

        <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <ProgressRing />
            <StatCard label={t.energyUsed} value={energyWhDisplay} unit="Wh" />
            <StatCard
              label={t.energyCost}
              value={energyUsdDisplay !== '—' ? `$${energyUsdDisplay}` : '—'}
              unit="USD"
              sub={energyCostSub}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', height: '100%' }}>
            <CurrentChart flex />
            <PowerChart flex />
          </div>
        </div>

        {/* NaOCl chart — always visible when scrolled */}
        <NaOClChart />

        {/* Treatable water summary */}
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--bg-border)',
          borderRadius: 'var(--radius-lg)', padding: '14px 18px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
              {t.treatable} at 2 ppm dose
            </div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--green)', marginTop: '2px', fontVariantNumeric: 'tabular-nums' }}>
              {connected ? Math.round(treatable).toLocaleString() : '—'} L
            </div>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)', textAlign: 'right', maxWidth: '200px' }}>
            {connected && liveData.charge > 0
              ? `${grams.toFixed(3)}g NaOCl × 500 = ${Math.round(treatable).toLocaleString()} liters`
              : 'Start a session to see treatment capacity'}
          </div>
        </div>

      </div>
    </div>
  )
}
