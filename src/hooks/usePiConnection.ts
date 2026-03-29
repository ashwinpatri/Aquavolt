import { invoke } from '@tauri-apps/api/core'
import { listen } from '@tauri-apps/api/event'
import { useCallback, useRef } from 'react'
import { useAppStore } from '../store/appStore'

export function usePiConnection() {
  const { connected, running, config, setConnected, setDeviceModel, setLiveData, setRunning } = useAppStore()
  const unlistenDataRef   = useRef<(() => void) | null>(null)
  const unlistenCloseRef  = useRef<(() => void) | null>(null)

  const connect = useCallback(async (portName: string): Promise<void> => {
    await invoke('open_port', { portName })

    if (unlistenDataRef.current)  unlistenDataRef.current()
    if (unlistenCloseRef.current) unlistenCloseRef.current()

    unlistenDataRef.current = await listen<string>('serial-data', ({ payload }) => {
      try {
        const data = JSON.parse(payload) as Record<string, unknown>
        setLiveData({
          voltage:   typeof data.voltage   === 'number'  ? data.voltage   : 0,
          current:   typeof data.current   === 'number'  ? data.current   : 0,
          power:     typeof data.power     === 'number'  ? data.power     : 0,
          charge:    typeof data.charge    === 'number'  ? data.charge    : 0,
          uptime:    typeof data.uptime    === 'number'  ? data.uptime    : 0,
          duty:      typeof data.duty      === 'number'  ? data.duty      : 0,
          timestamp: typeof data.timestamp === 'number'  ? data.timestamp : Date.now(),
          running:   typeof data.running   === 'boolean' ? data.running   : undefined,
        })
        // Running state is controlled only by start()/stop() and disconnect
      } catch { /* ignore malformed frames */ }
    })

    unlistenCloseRef.current = await listen('serial-closed', () => {
      setConnected(false, null, null)
      setDeviceModel(null)
      setRunning(false)
    })

    setConnected(true, portName, 'usb')
    setDeviceModel('Raspberry Pi')
  }, [setConnected, setDeviceModel, setLiveData, setRunning])

  const disconnect = useCallback(() => {
    invoke('close_port')
    unlistenDataRef.current?.()
    unlistenCloseRef.current?.()
    unlistenDataRef.current  = null
    unlistenCloseRef.current = null
    setConnected(false, null, null)
    setDeviceModel(null)
    setRunning(false)
  }, [setConnected, setDeviceModel, setRunning])

  const start = useCallback(async () => {
    setRunning(true)
    try {
      await invoke('send_serial', { cmd: JSON.stringify({ action: 'START', duty_cycle: config.dutyCycle }) })
    } catch (e) {
      setRunning(false)
      setConnected(false, null, null)
      console.error('START failed:', e)
    }
  }, [config.dutyCycle, setRunning, setConnected])

  const stop = useCallback(async () => {
    setRunning(false)
    try {
      await invoke('send_serial', { cmd: JSON.stringify({ action: 'STOP' }) })
    } catch (e) {
      setConnected(false, null, null)
      console.error('STOP failed:', e)
    }
  }, [setRunning, setConnected])

  const setPower = useCallback(async (duty: number) => {
    await invoke('send_serial', { cmd: JSON.stringify({ action: 'SET_POWER', duty_cycle: duty }) })
  }, [])

  return { connected, running, connect, disconnect, start, stop, setPower }
}
