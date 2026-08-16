import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

interface DashboardContextValue {
  /** Language of the most recently analyzed message/link/call in this session. */
  detectedLanguage: string | null
  setDetectedLanguage: (language: string | null) => void
  /**
   * Increments every time resetCheck() runs. Module pages can watch this to
   * clear their own local input/result state without needing to lift it here.
   */
  resetSignal: number
  /** Clears the detected-language context and signals every module to reset. */
  resetCheck: () => void
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [detectedLanguage, setDetectedLanguage] = useState<string | null>('Hindi')
  const [resetSignal, setResetSignal] = useState(0)

  const resetCheck = useCallback(() => {
    setDetectedLanguage(null)
    setResetSignal((n) => n + 1)
  }, [])

  return (
    <DashboardContext.Provider
      value={{ detectedLanguage, setDetectedLanguage, resetSignal, resetCheck }}
    >
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboardContext() {
  const ctx = useContext(DashboardContext)
  if (!ctx) {
    throw new Error('useDashboardContext must be used within a DashboardProvider')
  }
  return ctx
}
