export interface LiveData {
  voltage: number
  current: number
  power: number
  charge: number
  uptime: number
  duty: number
  timestamp: number | null
  running?: boolean
}

export type ElectrodeType = 'graphite' | 'titanium_mmo' | 'platinum'

export interface AppConfig {
  targetPpm: number
  volumeLiters: number | null
  customVolume: number | null
  efficiency: number
  dutyCycle: number
  maxCurrent: number
  maxRuntime: number
  autoStop: boolean
  electrodeType: ElectrodeType
  electricityRate: number
}

export interface SessionRecord {
  id: string
  startTime: number
  endTime: number
  duration: number
  durationLabel: string
  grams: number
  ppm: number | null
  efficiency: number
  wattHours: number
  coulombs: number
  volumeL: number | null
  targetPpm: number
  costUsd: number
  costPerWh: number
  costPerGram: number
  status: 'complete' | 'interrupted'
}

export interface Translations {
  selectLanguage: string
  continue: string
  termsTitle: string
  termsScroll: string
  termsAgree: string
  termsBody: string
  connected: string
  disconnected: string
  connecting: string
  connectionFailed: string
  connectUsb: string
  connectBluetooth: string
  connectionHint: string
  connectedTo: string
  disconnect: string
  dashboard: string
  sessionLog: string
  device: string
  piModel: string
  connectionType: string
  uptime: string
  target: string
  concentration: string
  highPpmTitle: string
  highPpmBody: string
  highPpmCheckbox: string
  cancel: string
  confirm: string
  containerSize: string
  efficiency: string
  power: string
  dutyCycle: string
  start: string
  stop: string
  deploy: string
  lastDeploy: string
  never: string
  voltage: string
  current: string
  powerW: string
  coulombs: string
  gramsProduced: string
  estimatedPpm: string
  progress: string
  eta: string
  treatable: string
  energyUsed: string
  sessions: string
  noSessions: string
  exportCsv: string
  sessionStart: string
  sessionDuration: string
  sessionGrams: string
  sessionPpm: string
  sessionEff: string
  sessionStatus: string
  complete: string
  interrupted: string
  settings: string
  connectionSettings: string
  preferences: string
  language: string
  advanced: string
  efficiencyOverride: string
  maxCurrent: string
  maxRuntime: string
  about: string
  version: string
  docs: string
  assemblyGuide: string
  chemistryExplained: string
  wiringDiagram: string
  autoStop: string
  running: string
  idle: string
  targetReached: string
  safeToUse: string
  electrodes: string
  electrodeType: string
  electrodeHealth: string
  resetElectrode: string
  hoursUsed: string
  hoursRemaining: string
  energyCost: string
  graphite: string
  titaniumMmo: string
  platinum: string
}

export type Language = 'en' | 'de' | 'ru' | 'zh' | 'hi' | 'es' | 'ar' | 'fr' | 'bn' | 'pt' | 'id' | 'af' | 'yo' | 'sw'
