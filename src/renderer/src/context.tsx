import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { AppSettings, HubStatus, InstallProgress, SystemInfo } from '@shared/types'
import { setLanguage } from './lib/i18n'

export interface Toast {
  id: number
  message: string
  type: 'ok' | 'err' | 'info'
}

interface AppCtx {
  settings: AppSettings | null
  setSettings: (s: AppSettings) => void
  system: SystemInfo | null
  status: HubStatus | null
  loading: boolean
  progress: Record<string, InstallProgress>
  toasts: Toast[]
  notify: (message: string, type?: Toast['type']) => void
  refresh: () => Promise<void>
  setProgress: (productId: string, progress: InstallProgress | undefined) => void
}

const Ctx = createContext<AppCtx | null>(null)
let toastId = 0

export function AppProvider({ children }: { children: ReactNode }): JSX.Element {
  const [settings, setSettingsState] = useState<AppSettings | null>(null)
  const [system, setSystem] = useState<SystemInfo | null>(null)
  const [status, setStatus] = useState<HubStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [progress, setProgressState] = useState<Record<string, InstallProgress>>({})
  const [toasts, setToasts] = useState<Toast[]>([])

  const notify = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4600)
  }, [])

  const setSettings = useCallback((s: AppSettings) => setSettingsState(s), [])

  const setProgress = useCallback((productId: string, value: InstallProgress | undefined) => {
    setProgressState((prev) => {
      const next = { ...prev }
      if (value) next[productId] = value
      else delete next[productId]
      return next
    })
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const next = await window.api.hub.status()
      setStatus(next)
    } catch (error) {
      notify(`Status konnte nicht geladen werden: ${String(error)}`, 'err')
    } finally {
      setLoading(false)
    }
  }, [notify])

  useEffect(() => {
    void (async () => {
      try {
        const [s, info] = await Promise.all([window.api.settings.get(), window.api.system.info()])
        setSettingsState(s)
        setSystem(info)
        await refresh()
      } catch (error) {
        notify(`Initialisierung fehlgeschlagen: ${String(error)}`, 'err')
        setLoading(false)
      }
    })()
  }, [notify, refresh])

  useEffect(() => {
    if (!settings) return
    const root = document.documentElement
    root.dataset.theme = settings.theme === 'light' ? 'light' : 'dark'
    const accent = /^#[0-9a-fA-F]{6}$/.test(settings.accentColor) ? settings.accentColor : '#7c5cff'
    root.style.setProperty('--accent', accent)
    const hex = accent.slice(1)
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    root.style.setProperty('--glow', `0 0 24px rgba(${r}, ${g}, ${b}, 0.45)`)
    root.style.setProperty('--border', `rgba(${r}, ${g}, ${b}, 0.22)`)
    root.style.setProperty('--border-strong', `rgba(${r}, ${g}, ${b}, 0.4)`)
    setLanguage(settings.language ?? 'de')
    window.dispatchEvent(new Event('zaviro-lang'))
  }, [settings])

  useEffect(() => {
    const off = window.api.hub.onProgress((value) => {
      setProgress(value.productId, value)
    })
    return off
  }, [setProgress])

  const value = useMemo<AppCtx>(
    () => ({
      settings,
      setSettings,
      system,
      status,
      loading,
      progress,
      toasts,
      notify,
      refresh,
      setProgress
    }),
    [settings, setSettings, system, status, loading, progress, toasts, notify, refresh, setProgress]
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useApp(): AppCtx {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useApp muss innerhalb von AppProvider verwendet werden')
  return ctx
}
