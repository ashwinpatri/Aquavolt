import { createContext, useContext, useEffect, useMemo } from 'react'
import { useAppStore } from './store/appStore'
import type { Translations } from './types'
import en from './i18n/en'
import de from './i18n/de'
import ru from './i18n/ru'
import zh from './i18n/zh'
import hi from './i18n/hi'
import es from './i18n/es'
import ar from './i18n/ar'
import fr from './i18n/fr'
import bn from './i18n/bn'
import pt from './i18n/pt'
import id from './i18n/id'
import af from './i18n/af'
import yo from './i18n/yo'
import sw from './i18n/sw'
import LanguageSelect from './screens/LanguageSelect'
import TermsOfService from './screens/TermsOfService'
import Dashboard from './screens/Dashboard'

const TRANSLATIONS: Record<string, Translations> = { en, de, ru, zh, hi, es, ar, fr, bn, pt, id, af, yo, sw }

const LanguageContext = createContext<Translations>(en)
export const useLanguage = (): Translations => useContext(LanguageContext)

export default function App() {
  const { language, tosAccepted } = useAppStore()

  const t = useMemo(() => (language ? (TRANSLATIONS[language] ?? en) : en), [language])

  useEffect(() => {
    document.documentElement.lang = language ?? 'en'
  }, [language])

  // language=null -> pick language first; then TOS; then dashboard
  const screen = !language ? 'language' : !tosAccepted ? 'tos' : 'dashboard'

  return (
    <LanguageContext.Provider value={t}>
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
        {screen === 'language'  && <LanguageSelect />}
        {screen === 'tos'       && <TermsOfService />}
        {screen === 'dashboard' && <Dashboard />}
      </div>
    </LanguageContext.Provider>
  )
}
