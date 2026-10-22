import type { CSSProperties } from 'react'
import type { ProductStatus } from '@shared/types'
import { useApp } from '../context'
import { t } from '../lib/i18n'

interface Props {
  product: ProductStatus
  busy: boolean
  onInstall: () => void
  onLaunch: () => void
  onWebsite: () => void
  onChangelog: () => void
}

export default function ProductCard({
  product,
  busy,
  onInstall,
  onLaunch,
  onWebsite,
  onChangelog
}: Props): JSX.Element {
  const { progress } = useApp()
  const live = progress[product.id]
  const runtime = product.runtime

  const stateLabel = (): string => {
    if (product.self) return t('state.current')
    if (product.state === 'in-development') return t('state.development')
    if (product.state === 'planned') return t('state.planned')
    if (runtime.updateAvailable) return t('state.update')
    if (runtime.installed) return t('state.current')
    return t('state.notInstalled')
  }

  const stateClass = (): string => {
    if (product.state !== 'released') return 'badge muted'
    if (runtime.updateAvailable) return 'badge warn'
    if (runtime.installed) return 'badge ok'
    return 'badge'
  }

  const phaseLabel = (): string => {
    switch (live?.phase) {
      case 'downloading':
        return t('state.downloading')
      case 'verifying':
        return t('state.verifying')
      case 'installing':
      case 'waiting':
        return t('state.installing')
      case 'done':
        return t('state.done')
      default:
        return ''
    }
  }

  const style = { '--pc-accent': product.accent } as CSSProperties

  return (
    <article className={`product-card ${busy ? 'busy' : ''}`} style={style}>
      <header className="pc-head">
        <div className="pc-icon">{product.icon}</div>
        <div className="pc-title">
          <strong>{product.name}</strong>
          <span className={stateClass()}>{stateLabel()}</span>
        </div>
      </header>

      <p className="pc-tagline">{product.tagline}</p>
      <p className="pc-desc">{product.description}</p>

      {product.features.length > 0 && (
        <ul className="pc-features">
          {product.features.slice(0, 4).map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      )}

      <div className="pc-versions">
        {product.self ? (
          <span className="version-chip">v{runtime.installedVersion ?? '1.0.0'} · {t('updates.self')}</span>
        ) : (
          <>
            <span className="version-chip">
              {runtime.installed
                ? `Installiert: v${runtime.installedVersion ?? '?'}`
                : t('state.notInstalled')}
            </span>
            {runtime.latestVersion && (
              <span className={`version-chip ${runtime.updateAvailable ? 'accent' : ''}`}>
                Aktuell: v{runtime.latestVersion}
              </span>
            )}
          </>
        )}
      </div>

      {live && live.phase !== 'done' && live.phase !== 'error' && (
        <div className="pc-progress">
          <div className="progress-label">
            <span>{phaseLabel()}</span>
            <span>{live.percent}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${live.percent}%` }} />
          </div>
        </div>
      )}

      {live?.message && live.phase !== 'error' && <p className="pc-note">{live.message}</p>}
      {live?.phase === 'error' && <p className="pc-note error">{live.message}</p>}

      <footer className="pc-actions">
        {product.self ? (
          <button className="btn sm" onClick={onWebsite}>
            {t('action.website')}
          </button>
        ) : product.state !== 'released' ? (
          <button className="btn sm" disabled>
            {product.state === 'in-development' ? t('state.development') : t('state.planned')}
          </button>
        ) : runtime.updateAvailable ? (
          <>
            <button className="btn primary sm" onClick={onInstall} disabled={busy}>
              {t('action.update')}
            </button>
            <button className="btn sm" onClick={onLaunch} disabled={busy}>
              {t('action.launch')}
            </button>
          </>
        ) : runtime.installed ? (
          <button className="btn primary sm" onClick={onLaunch} disabled={busy}>
            {t('action.launch')}
          </button>
        ) : (
          <button className="btn primary sm" onClick={onInstall} disabled={busy}>
            {t('action.install')}
          </button>
        )}

        {!product.self && product.state === 'released' && (
          <button className="btn sm ghost" onClick={onChangelog}>
            {t('action.changelog')}
          </button>
        )}
        {!product.self && (
          <button className="btn sm ghost" onClick={onWebsite}>
            {t('action.website')}
          </button>
        )}
      </footer>
    </article>
  )
}
