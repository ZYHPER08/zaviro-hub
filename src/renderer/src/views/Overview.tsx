import { useEffect, useState } from 'react'
import type { UpdateInfo } from '@shared/types'
import { useApp } from '../context'
import { t } from '../lib/i18n'
import ProductCard from '../components/ProductCard'
import type { NavKey } from '../App'

interface Props {
  onNavigate: (key: NavKey) => void
}

export default function Overview({ onNavigate }: Props): JSX.Element {
  const { status, loading, refresh, notify, setProgress } = useApp()
  const [busyId, setBusyId] = useState<string | null>(null)
  const [selfUpdate, setSelfUpdate] = useState<UpdateInfo | null>(null)
  const [selfBusy, setSelfBusy] = useState(false)

  useEffect(() => {
    const off = window.api.update.onAvailable((info) => setSelfUpdate(info))
    return off
  }, [])

  const handleInstall = async (productId: string, name: string): Promise<void> => {
    setBusyId(productId)
    try {
      const result = await window.api.hub.install(productId)
      if (result.ok) {
        notify(
          result.installedVersion
            ? t('toast.installed', { name })
            : t('toast.installerStarted'),
          'ok'
        )
        await refresh()
      } else {
        notify(t('toast.error', { message: result.error ?? 'unbekannt' }), 'err')
      }
    } catch (error) {
      notify(t('toast.error', { message: String(error) }), 'err')
    } finally {
      setBusyId(null)
      window.setTimeout(() => setProgress(productId, undefined), 2500)
    }
  }

  const handleLaunch = async (productId: string, name: string): Promise<void> => {
    setBusyId(productId)
    try {
      const result = await window.api.hub.launch(productId)
      if (result.ok) notify(t('toast.launched', { name }), 'ok')
      else notify(t('toast.error', { message: result.error ?? 'unbekannt' }), 'err')
    } finally {
      setBusyId(null)
    }
  }

  const checkSelfUpdate = async (): Promise<void> => {
    setSelfBusy(true)
    try {
      const info = await window.api.update.check()
      setSelfUpdate(info)
      if (info.updateAvailable) notify(t('overview.selfUpdateAvailable', { version: info.latestVersion ?? '' }), 'info')
      else notify(t('overview.selfUpdateCurrent'), 'ok')
    } catch (error) {
      notify(t('toast.error', { message: String(error) }), 'err')
    } finally {
      setSelfBusy(false)
    }
  }

  const downloadSelfUpdate = async (): Promise<void> => {
    setSelfBusy(true)
    try {
      const info = await window.api.update.download()
      setSelfUpdate(info)
      if (info.readyToInstall) notify(t('toast.updateDone'), 'ok')
    } finally {
      setSelfBusy(false)
    }
  }

  const products = status?.products ?? []
  const self = products.find((product) => product.self)

  return (
    <div className="view">
      <section className="hero">
        <div>
          <h1>{t('overview.title')}</h1>
          <p>{t('overview.subtitle')}</p>
        </div>
        <div className="hero-actions">
          <span className="muted small">
            {t('overview.lastCheck')}:{' '}
            {status?.checkedAt ? new Date(status.checkedAt).toLocaleTimeString() : '–'}
          </span>
          <button className="btn sm" onClick={() => void refresh()} disabled={loading}>
            {loading ? t('overview.refreshing') : t('overview.refresh')}
          </button>
        </div>
      </section>

      <section className="stat-grid">
        <div className="stat-card">
          <span className="stat-label">{t('overview.installed')}</span>
          <strong>{status?.installedCount ?? 0}</strong>
          <small>von {products.filter((p) => !p.self && p.state === 'released').length} Tools</small>
        </div>
        <div className="stat-card">
          <span className="stat-label">{t('overview.updates')}</span>
          <strong className={status?.updateCount ? 'warn' : 'good'}>{status?.updateCount ?? 0}</strong>
          <small>{status?.updateCount ? t('overview.noUpdatesHint') : t('overview.noUpdates')}</small>
        </div>
        <div className="stat-card">
          <span className="stat-label">{t('overview.products')}</span>
          <strong>{products.length}</strong>
          <small>{self ? `Hub v${self.runtime.installedVersion ?? '1.0.0'}` : ''}</small>
        </div>
      </section>

      {selfUpdate?.updateAvailable && (
        <section className="notice info banner">
          <div>
            <strong>{t('overview.selfUpdate')}</strong>
            <div>{t('overview.selfUpdateAvailable', { version: selfUpdate.latestVersion ?? '' })}</div>
          </div>
          <div className="banner-actions">
            {selfUpdate.readyToInstall ? (
              <button className="btn primary sm" onClick={() => window.api.update.install()}>
                {t('overview.selfUpdateInstall')}
              </button>
            ) : (
              <button className="btn primary sm" onClick={() => void downloadSelfUpdate()} disabled={selfBusy}>
                {t('overview.selfUpdateDownload')}
              </button>
            )}
            <button className="btn sm" onClick={() => onNavigate('updates')}>
              {t('nav.updates')}
            </button>
          </div>
        </section>
      )}

      <section className="product-grid">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            busy={busyId === product.id}
            onInstall={() => void handleInstall(product.id, product.name)}
            onLaunch={() => void handleLaunch(product.id, product.name)}
            onWebsite={() => void window.api.hub.openExternal(product.homepage)}
            onChangelog={() => onNavigate('updates')}
          />
        ))}
      </section>
    </div>
  )
}
