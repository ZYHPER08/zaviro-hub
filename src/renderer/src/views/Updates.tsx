import { useEffect, useState } from 'react'
import type { UpdateInfo } from '@shared/types'
import { useApp } from '../context'
import { t } from '../lib/i18n'

export default function Updates(): JSX.Element {
  const { status, notify } = useApp()
  const [info, setInfo] = useState<UpdateInfo | null>(null)
  const [busy, setBusy] = useState(false)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const off = window.api.update.onAvailable((value) => setInfo(value))
    return off
  }, [])

  const check = async (): Promise<void> => {
    setBusy(true)
    try {
      const result = await window.api.update.check()
      setInfo(result)
      if (result.updateAvailable) {
        notify(t('overview.selfUpdateAvailable', { version: result.latestVersion ?? '' }), 'info')
      } else {
        notify(t('updates.current'), 'ok')
      }
    } catch (error) {
      notify(t('toast.error', { message: String(error) }), 'err')
    } finally {
      setBusy(false)
    }
  }

  const download = async (): Promise<void> => {
    setBusy(true)
    try {
      const result = await window.api.update.download()
      setInfo(result)
      if (result.readyToInstall) notify(t('toast.updateDone'), 'ok')
      else if (result.error) notify(t('toast.error', { message: result.error }), 'err')
    } finally {
      setBusy(false)
    }
  }

  const products = (status?.products ?? []).filter((product) => product.changelog.length > 0)

  return (
    <div className="view">
      <section className="view-head">
        <h1>{t('updates.title')}</h1>
        <p>{t('updates.subtitle')}</p>
      </section>

      <section className="panel self-update">
        <div className="self-update-head">
          <div>
            <h3>{t('overview.selfUpdate')}</h3>
            <p className="muted small">
              {info?.latestVersion
                ? t('overview.selfUpdateAvailable', { version: info.latestVersion })
                : t('overview.selfUpdateCurrent')}
            </p>
          </div>
          <div className="banner-actions">
            <button className="btn sm" onClick={() => void check()} disabled={busy}>
              {busy ? t('updates.checking') : t('updates.check')}
            </button>
            {info?.updateAvailable && !info.readyToInstall && (
              <button className="btn primary sm" onClick={() => void download()} disabled={busy}>
                {t('overview.selfUpdateDownload')}
              </button>
            )}
            {info?.readyToInstall && (
              <button className="btn primary sm" onClick={() => window.api.update.install()}>
                {t('overview.selfUpdateInstall')}
              </button>
            )}
          </div>
        </div>
        {info?.downloadPercent !== undefined && !info.readyToInstall && (
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${info.downloadPercent}%` }} />
          </div>
        )}
        {info?.error && <p className="warn-text">{info.error}</p>}
      </section>

      {products.length === 0 && <div className="empty">{t('updates.noEntries')}</div>}

      {products.map((product) => (
        <section className="panel changelog-panel" key={product.id}>
          <div className="changelog-head">
            <span className="pc-icon small">{product.icon}</span>
            <div>
              <h3>{product.name}</h3>
              <span className="muted small">{t('updates.released')}</span>
            </div>
            <button
              className="btn sm ghost spacer-right"
              onClick={() => setExpanded((prev) => ({ ...prev, [product.id]: !prev[product.id] }))}
            >
              {expanded[product.id] ? '−' : '+'}
            </button>
          </div>

          <div className="changelog-list">
            {product.changelog.map((entry) => (
              <article className="changelog-entry" key={`${product.id}-${entry.version}`}>
                <div className="cl-meta">
                  <span className="version-chip accent">v{entry.version}</span>
                  <span className="muted small">{entry.date}</span>
                </div>
                <ul>
                  {entry.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
