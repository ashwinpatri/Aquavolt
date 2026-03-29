import { useCallback, useRef } from 'react'
import { useAppStore } from '../store/appStore'
import { gramsProduced, ppmFromGrams, formatDuration } from '../utils/faraday'

interface SessionRef {
  startTime:   number
  startCharge: number
  startVoltage: number
}

export function useSession() {
  const { liveData, config, addSession, addLifetimeSeconds, setSessionActive, setSessionStartedAt, setChargeOffset, clearHistory } = useAppStore()
  const sessionRef = useRef<SessionRef | null>(null)

  const beginSession = useCallback(() => {
    const now = Date.now()
    sessionRef.current = {
      startTime:    now,
      startCharge:  liveData.charge,
      startVoltage: liveData.voltage,
    }
    setSessionActive(true)
    setSessionStartedAt(now)
  }, [liveData.charge, liveData.voltage, setSessionActive, setSessionStartedAt])

  const endSession = useCallback((status: 'complete' | 'interrupted' = 'complete') => {
    if (!sessionRef.current) return

    const { startTime, startCharge, startVoltage } = sessionRef.current
    const endTime     = Date.now()
    const duration    = endTime - startTime
    const deltaCharge = Math.max(0, liveData.charge - startCharge)
    const grams       = gramsProduced(deltaCharge, config.efficiency)
    const volumeL     = config.customVolume ?? config.volumeLiters
    const ppm         = volumeL ? ppmFromGrams(grams, volumeL) : null
    const avgVoltage  = (startVoltage + liveData.voltage) / 2
    const wattHours   = parseFloat(((deltaCharge * avgVoltage) / 3600).toFixed(4))
    const rate        = config.electricityRate ?? 0.13
    const costUsd     = parseFloat((wattHours * rate / 1000).toFixed(6))
    const costPerWh   = wattHours > 0 ? parseFloat((costUsd / wattHours).toFixed(6)) : 0
    const costPerGram = grams > 0 ? parseFloat((costUsd / grams).toFixed(4)) : 0

    addLifetimeSeconds(Math.floor(duration / 1000))
    addSession({
      id:            `session-${startTime}`,
      startTime,
      endTime,
      duration,
      durationLabel: formatDuration(duration),
      grams:         parseFloat(grams.toFixed(3)),
      ppm:           ppm !== null ? parseFloat(ppm.toFixed(0)) : null,
      efficiency:    config.efficiency,
      wattHours,
      coulombs:      parseFloat(deltaCharge.toFixed(1)),
      volumeL:       volumeL ?? null,
      targetPpm:     config.targetPpm,
      costUsd,
      costPerWh,
      costPerGram,
      status,
    })

    sessionRef.current = null
    setSessionActive(false)
    setSessionStartedAt(null)
    setChargeOffset(liveData.charge)
    clearHistory()
  }, [liveData.charge, liveData.voltage, config, addSession, addLifetimeSeconds, setSessionActive, setSessionStartedAt, setChargeOffset, clearHistory])

  return { beginSession, endSession }
}
