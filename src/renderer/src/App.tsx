import { lazy, Suspense, useState } from 'react'
import { AppProvider, useApp } from './context'
import { t } from './lib/i18n'
import logoUrl from './assets/logo.png'

const Overview = lazy(() => import('./views/Overview'))
const Updates = lazy(() => import('./views/Updates'))
const Settings = lazy(() => import('./views/Settings'))

export type NavKey = 'overview' | 'updates' | 'settings'

const NAV: { key: NavKey; icon: string; label: string }[] = [
  { key: 'overview', icon: '◈', label: 'nav.overview' },
  { key: 'updates', icon: '↻', label: 'nav.updates' },
  { key: 'settings', icon: '⚙', label: 'nav.settings' }
]

function Sidebar({ active, onChange }: { active: NavKey; onChange: (k: NavKey) => void }): JSX.Element {
  const { status } = useApp()
  const updates = status?.updateCount ?? 0

  return (
    <aside className="sidebar">
      <div className="brand">
        <img src={logoUrl} alt="ZAVIRO" />
        <div>
          <strong>ZAVIRO</strong>
          <small>{t('brand.sub')}</small>
        </div>
      </div>
      <nav>
        {NAV.map((item) => (
          <button
            key={item.key}
            className={active === item.key ? 'nav-item active' : 'nav-item'}
            onClick={() => onChange(item.key)}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{t(item.label)}</span>
            {item.key === 'updates' && updates > 0 && <span className="nav-badge">{updates}</span>}
          </button>
        ))}
      </nav>
      <div className="sidebar-foot">
        <div className="dot-row">
          <span className="dot" />
          <span>{status?.installedCount ?? 0} Tools installiert</span>
        </div>
        <small>v{status?.products.find((p) => p.self)?.runtime.installedVersion ?? '1.0.0'}</small>
      </div>
    </aside>
  )
}

function Shell(): JSX.Element {
  const { toasts } = useApp()
  const [view, setView] = useState<NavKey>('overview')

  return (
    <div className="app">
      <Sidebar active={view} onChange={setView} />
      <main className="main">
        <Suspense fallback={<div className="empty"><span className="spin" />Laden …</div>}>
          {view === 'overview' && <Overview onNavigate={setView} />}
          {view === 'updates' && <Updates />}
          {view === 'settings' && <Settings />}
        </Suspense>
      </main>
      <div className="toasts" aria-live="polite">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>{toast.message}</div>
        ))}
      </div>
    </div>
  )
}

export default function App(): JSX.Element {
  return (
    <AppProvider>
      <Suspense fallback={<div className="empty"><span className="spin" />Laden …</div>}>
        <Shell />
      </Suspense>
    </AppProvider>
  )
}
