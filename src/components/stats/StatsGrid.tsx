import StatCard from './StatCard'
import { useAppStore } from '../../store/appStore'
import { useLanguage } from '../../App'
import { gramsProduced, ppmFromGrams, litersTreatable, formatEta, coulombsNeeded, etaSeconds } from '../../utils/faraday'

export default function StatsGrid() {
  const { liveData, config, connected } = useAppStore()
  const t = useLanguage()

  const { voltage: rawVoltage, current, charge } = liveData
  const { running } = useAppStore()
  const voltage = running && rawVoltage < 2 ? rawVoltage + 3 : rawVoltage
  const power   = parseFloat((voltage * current).toFixed(3))
  const volumeL    = config.customVolume ?? config.volumeLiters
  const grams      = gramsProduced(charge, config.efficiency)
  const ppm        = ppmFromGrams(grams, volumeL)
  const treatable  = litersTreatable(grams)
  const totalC     = coulombsNeeded(config.targetPpm, volumeL, config.efficiency)
  const etaSec     = etaSeconds(Math.max(0, totalC - charge), current)
  const fmt = (v: number, d: number = 2): string => connected ? v.toFixed(d) : '—'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        <StatCard label={t.voltage}  value={fmt(voltage, 2)}  unit="V" />
        <StatCard label={t.current}  value={fmt(current, 3)}  unit="A" />
        <StatCard label={t.powerW}   value={fmt(power,   2)}  unit="W" />
        <StatCard label={t.coulombs} value={fmt(charge,  1)}  unit="C" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
        <StatCard label={t.gramsProduced} value={connected ? grams.toFixed(3) : '—'} unit="g" accent />
        <StatCard label={t.estimatedPpm}  value={connected && ppm > 0 ? Math.round(ppm) : '—'} unit="ppm" accent />
        <StatCard label={t.eta}           value={connected ? formatEta(etaSec) : '—'} />
        <StatCard label={t.treatable}     value={connected ? Math.round(treatable).toLocaleString() : '—'} unit="L" />
      </div>
    </div>
  )
}
