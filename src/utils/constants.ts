export const FARADAY_CONSTANT = 96485        // C/mol
export const NAOCL_MOLAR_MASS = 74.44        // g/mol
export const ELECTRONS_PER_MOLECULE = 2
export const DEFAULT_EFFICIENCY = 0.70       // 70%
export const DOSE_PPM = 2                    // ppm dose for drinking water treatment

export const VOLUME_OPTIONS: { label: string; value: number | null }[] = [
  { label: '500 mL', value: 0.5 },
  { label: '1 L',    value: 1.0 },
  { label: '2 L',    value: 2.0 },
  { label: 'Custom', value: null },
]

export const PPM_MIN = 100
/** Hard slider maximum (requires confirmation above `PPM_HIGH_CONFIRM_THRESHOLD`). */
export const PPM_MAX = 1500
/** Above this value, the UI requires acknowledgment before applying a new target. */
export const PPM_HIGH_CONFIRM_THRESHOLD = 1000
export const PPM_DEFAULT = 500

export const DUTY_DEFAULT = 70

export const MAX_CURRENT_DEFAULT = 3.0       // A
export const MAX_RUNTIME_DEFAULT = 60        // minutes

// Electrode specs: max operational hours before replacement recommended
// Graphite: degrades continuously via oxidation (~100 hrs for hobbyist cells)
// Titanium MMO (DSA): 3,000–50,000 hrs rated; 5,000 used as conservative hobbyist estimate
// Platinum: effectively no wear for hobbyist use
export const ELECTRODE_SPECS = {
  graphite:     { label: 'Graphite',     maxHours: 100  },
  titanium_mmo: { label: 'Titanium MMO', maxHours: 5000 },
  platinum:     { label: 'Platinum',     maxHours: 0    }, // 0 = no wear tracking
} as const

export const MOCK_INTERVAL_MS = 500          // how often mock data updates
export const CHART_WINDOW = 120              // seconds of history to show in charts

// Ordered by total speakers (native + L2), largest first
export const LANGUAGES: { code: string; label: string; flag: string }[] = [
  { code: 'en', label: 'English',    flag: '🇬🇧' }, // ~1.5B
  { code: 'zh', label: '中文',        flag: '🇨🇳' }, // ~1.1B
  { code: 'hi', label: 'हिन्दी',      flag: '🇮🇳' }, // ~600M
  { code: 'es', label: 'Español',    flag: '🇪🇸' }, // ~560M
  { code: 'ar', label: 'العربية',    flag: '🇸🇦' }, // ~420M
  { code: 'fr', label: 'Français',   flag: '🇫🇷' }, // ~280M
  { code: 'bn', label: 'বাংলা',       flag: '🇧🇩' }, // ~270M
  { code: 'pt', label: 'Português',  flag: '🇧🇷' }, // ~250M
  { code: 'id', label: 'Indonesia',  flag: '🇮🇩' }, // ~200M
  { code: 'sw', label: 'Kiswahili',  flag: '🇰🇪' }, // ~200M
  { code: 'ru', label: 'Русский',    flag: '🇷🇺' }, // ~155M
  { code: 'de', label: 'Deutsch',    flag: '🇩🇪' }, // ~132M
  { code: 'yo', label: 'Yorùbá',     flag: '🇳🇬' }, // ~50M
  { code: 'af', label: 'Afrikaans',  flag: '🇿🇦' }, // ~17M
]
