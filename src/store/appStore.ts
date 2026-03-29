import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { LiveData, AppConfig, SessionRecord, Language, ElectrodeType } from '../types'
import { PPM_DEFAULT, DUTY_DEFAULT, DEFAULT_EFFICIENCY, MAX_CURRENT_DEFAULT, MAX_RUNTIME_DEFAULT, DEFAULT_ELECTRICITY_RATE } from '../utils/constants'

interface AppStore {
  language: Language | null
  tosAccepted: boolean
  setLanguage: (lang: Language) => void
  setTosAccepted: () => void

  connected: boolean
  piUrl: string | null
  connectionType: 'usb' | 'bluetooth' | null
  deviceModel: string | null
  setConnected: (connected: boolean, piUrl: string | null, type: 'usb' | 'bluetooth' | null) => void
  setDeviceModel: (model: string | null) => void

  activeTab: string
  setActiveTab: (tab: string) => void
  settingsOpen: boolean
  setSettingsOpen: (open: boolean) => void

  config: AppConfig
  updateConfig: (patch: Partial<AppConfig>) => void
  lastDeployedAt: number | null
  setLastDeployedAt: (ts: number) => void

  running: boolean
  setRunning: (val: boolean) => void
  sessionActive: boolean
  setSessionActive: (val: boolean) => void
  sessionStartedAt: number | null
  setSessionStartedAt: (ts: number | null) => void

  chargeOffset: number
  setChargeOffset: (offset: number) => void

  liveData: LiveData
  chartHistory: LiveData[]
  setLiveData: (data: LiveData) => void
  clearHistory: () => void

  sessions: SessionRecord[]
  addSession: (session: SessionRecord) => void
  clearSessions: () => void

  lifetimeSeconds: number
  addLifetimeSeconds: (s: number) => void
  resetElectrode: () => void
  setElectrodeType: (type: ElectrodeType) => void
}

const DEFAULT_LIVE: LiveData = { voltage: 0, current: 0, power: 0, charge: 0, uptime: 0, duty: 0, timestamp: null }

export const useAppStore = create<AppStore>()(
  persist(
    (set) => ({
      language: null, tosAccepted: false,
      setLanguage: (lang) => set({ language: lang }),
      setTosAccepted: () => set({ tosAccepted: true }),

      connected: false, piUrl: null, connectionType: null, deviceModel: null,
      setConnected: (connected, piUrl, type) => set({ connected, piUrl: piUrl ?? null, connectionType: type ?? null }),
      setDeviceModel: (model) => set({ deviceModel: model }),

      activeTab: 'dashboard',
      setActiveTab: (tab) => set({ activeTab: tab }),
      settingsOpen: false,
      setSettingsOpen: (open) => set({ settingsOpen: open }),

      config: {
        targetPpm: PPM_DEFAULT, volumeLiters: 1.0, customVolume: null,
        efficiency: DEFAULT_EFFICIENCY, dutyCycle: DUTY_DEFAULT,
        maxCurrent: MAX_CURRENT_DEFAULT, maxRuntime: MAX_RUNTIME_DEFAULT, autoStop: true,
        electrodeType: 'graphite' as ElectrodeType,
        electricityRate: DEFAULT_ELECTRICITY_RATE,
      },
      updateConfig: (patch) => set((s) => ({ config: { ...s.config, ...patch } })),

      lastDeployedAt: null,
      setLastDeployedAt: (ts) => set({ lastDeployedAt: ts }),

      running: false,
      setRunning: (val) => set({ running: val }),
      sessionActive: false,
      setSessionActive: (val) => set({ sessionActive: val }),
      sessionStartedAt: null,
      setSessionStartedAt: (ts) => set({ sessionStartedAt: ts }),

      chargeOffset: 0,
      setChargeOffset: (offset) => set({ chargeOffset: offset }),

      liveData: DEFAULT_LIVE, chartHistory: [],
      setLiveData: (data) => set((s) => ({
        liveData: data,
        chartHistory: s.running ? [...s.chartHistory.slice(-240), data] : s.chartHistory,
      })),
      clearHistory: () => set({ chartHistory: [] }),

      sessions: [],
      addSession: (session) => set((s) => ({ sessions: [session, ...s.sessions] })),
      clearSessions: () => set({ sessions: [] }),

      lifetimeSeconds: 0,
      addLifetimeSeconds: (s) => set((st) => ({ lifetimeSeconds: st.lifetimeSeconds + s })),
      resetElectrode: () => set({ lifetimeSeconds: 0 }),
      setElectrodeType: (type) => set((s) => ({ config: { ...s.config, electrodeType: type } })),
    }),
    {
      name: 'aquavolt-store',
      partialize: (s) => ({
        language: s.language, tosAccepted: s.tosAccepted,
        config: s.config, sessions: s.sessions, lastDeployedAt: s.lastDeployedAt,
        lifetimeSeconds: s.lifetimeSeconds,
      }),
    }
  )
)
