import { useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import type { ProductCategory, ProductStatus } from '@shared/types'
import { CATEGORY_ORDER } from '../../../shared/catalog'
import { useApp } from '../context'
import { t } from '../lib/i18n'
import ProductCard from '../components/ProductCard'

// Screenshots werden vom Bundler als URLs eingebunden.
import hubOverview from '../assets/store-hub-overview.png'
import hubUpdates from '../assets/store-hub-updates.png'
import launcherDashboard from '../assets/store-launcher-dashboard.png'
import launcherGames from '../assets/store-launcher-games.png'
import cleanerDashboard from '../assets/store-cleaner-dashboard.png'
import cleanerStorage from '../assets/store-cleaner-storage.png'
import cleanerDrivers from '../assets/store-cleaner-drivers.png'

const SHOTS: Record<string, string[]> = {
  hub: [hubOverview, hubUpdates],
  'gaming-launcher': [launcherDashboard, launcherGames],
  cleaner: [cleanerDashboard, cleanerStorage, cleanerDrivers]
}

type Filter = 'all' | ProductCategory | 'installed' | 'updates'

interface Props {
  onChangelog: (productId: string) => void
}

const CATEGORY_LABEL: Record<ProductCategory, string> = {
  hub: 'store.cat.hub',
  system: 'store.cat.system',
  gaming: 'store.cat.gaming',
  bot: 'store.cat.bot',
  server: 'store.cat.server'
}

function badgeLabel(badge: string): string {
  if (badge === 'neu') return t('store.badge.new')
  if (badge === 'beliebt') return t('store.badge.popular')
  return t('store.badge.recommended')
}

interface StoreCardProps {
  product: ProductStatus
  busy: boolean
  onInstall: () => void
  onLaunch: () => void
  onWebsite: () => void
  onChangelog: () => void
}

function StoreCard({ product, busy, onInstall, onLaunch, onWebsite, onChangelog }: StoreCardProps): JSX.Element {
  const shots = SHOTS[product.id] ?? []
  const [active, setActive] = useState(0)
  const style = { '--pc-accent': product.accent } as CSSProperties
  const badge = product.badge ? badgeLabel(product.badge) : null

  return (
    <article className={`store-card ${busy ? 'busy' : ''}`} style={style}>
      {shots.length > 0 && (
        <div className="store-shot">
          <img src={shots[active] ?? shots[0]} alt={`${product.name} Vorschau`} />
          <div className="store-shot-overlay">
            {badge && <span className="store-badge">{badge}</span>}
            <span className="store-cat">{t(CATEGORY_LABEL[product.category ?? 'hub'])}</span>
          </div>
          {shots.length > 1 && (
            <div className="store-dots">
              {shots.map((_, i) => (
                <button
                  key={i}
                  className={i === active ? 'dot active' : 'dot'}
                  aria-label={`Vorschau ${i + 1}`}
                  onClick={() => setActive(i)}
                />
              ))}
            </div>
          )}
        </div>
      )}
      <ProductCard
        product={product}
        busy={busy}
        onInstall={onInstall}
        onLaunch={onLaunch}
        onWebsite={onWebsite}
        onChangelog={onChangelog}
      />
    </article>
  )
}

export default function Store({ onChangelog }: Props): JSX.Element {
  const { status, loading, refresh, notify, setProgress } = useApp()
  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<'default' | 'name' | 'state'>('default')
  const [busyId, setBusyId] = useState<string | null>(null)

  const products = status?.products ?? []

  const handleInstall = async (productId: string, name: string): Promise<void> => {
    setBusyId(productId)
    try {
      const result = await window.api.hub.install(productId)
      if (result.ok) {
        notify(
          result.installedVersion ? t('toast.installed', { name }) : t('toast.installerStarted'),
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

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    let list = products.filter((p) => {
      if (filter === 'installed') return p.runtime.installed && !p.self
      if (filter === 'updates') return p.runtime.updateAvailable
      if (filter !== 'all') return p.category === filter
      return true
    })
    if (q) {
      list = list.filter((p) => {
        const haystack = [p.name, p.tagline, p.description, ...(p.tags ?? []), ...p.features]
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
    }
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name, 'de'))
    if (sort === 'state') {
      const rank = (p: ProductStatus): number => {
        if (p.runtime.updateAvailable) return 0
        if (p.self) return 1
        if (p.state === 'released') return 2
        if (p.state === 'in-development') return 3
        return 4
      }
      list = [...list].sort((a, b) => rank(a) - rank(b))
    }
    return list
  }, [products, filter, query, sort])

  const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: t('store.filter.all') },
    { key: 'installed', label: t('store.filter.installed') },
    { key: 'updates', label: t('store.filter.updates') },
    ...CATEGORY_ORDER.map((c) => ({ key: c as Filter, label: t(CATEGORY_LABEL[c]) }))
  ]

  return (
    <div className="view">
      <section className="hero store-hero">
        <div>
          <h1>{t('store.title')}</h1>
          <p>{t('store.subtitle')}</p>
        </div>
        <div className="hero-actions">
          <button className="btn sm" onClick={() => void refresh()} disabled={loading}>
            {loading ? t('overview.refreshing') : t('overview.refresh')}
          </button>
        </div>
      </section>

      <section className="store-toolbar">
        <div className="store-search">
          <span className="store-search-icon">⌕</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('store.search')}
            aria-label={t('store.search')}
          />
          {query && (
            <button className="store-clear" onClick={() => setQuery('')} aria-label="Suche leeren">
              ×
            </button>
          )}
        </div>
        <select
          className="store-sort"
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          aria-label={t('store.sort')}
        >
          <option value="default">{t('store.sort.default')}</option>
          <option value="state">{t('store.sort.state')}</option>
          <option value="name">{t('store.sort.name')}</option>
        </select>
      </section>

      <section className="store-filters">
        {filters.map((f) => (
          <button
            key={f.key}
            className={filter === f.key ? 'chip active' : 'chip'}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            {f.key === 'updates' && (status?.updateCount ?? 0) > 0 && (
              <span className="chip-count">{status?.updateCount}</span>
            )}
          </button>
        ))}
      </section>

      <div className="store-count muted small">
        {visible.length} {visible.length === 1 ? t('store.result.one') : t('store.result.many')}
      </div>

      {visible.length === 0 ? (
        <div className="empty panel">{t('store.empty')}</div>
      ) : (
        <section className="store-grid">
          {visible.map((product) => (
            <StoreCard
              key={product.id}
              product={product}
              busy={busyId === product.id}
              onInstall={() => void handleInstall(product.id, product.name)}
              onLaunch={() => void handleLaunch(product.id, product.name)}
              onWebsite={() => void window.api.hub.openExternal(product.homepage)}
              onChangelog={() => onChangelog(product.id)}
            />
          ))}
        </section>
      )}
    </div>
  )
}
