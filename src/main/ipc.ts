import { BrowserWindow, ipcMain, shell } from 'electron'
import { app } from 'electron'
import { appVersion } from './version'
import type {
  AppSettings,
  HubStatus,
  InstallProgress,
  InstallResult,
  ProductStatus,
  UpdateInfo
} from '@shared/types'
import { PRODUCTS, getProduct } from '@shared/catalog'
import { settingsStore } from './store'
import { getSystemInfo, relaunchAsAdmin } from './services/system'
import { detectProduct, invalidateRegistryCache } from './services/installed'
import { fetchFeed } from './services/feed'
import type { FeedInfo } from './services/feed'
import { downloadInstaller } from './services/download'
import { launchApp, runInstaller } from './services/installer'
import {
  checkForUpdates,
  downloadUpdate,
  installUpdate,
  onUpdateAvailable,
  onUpdateProgress,
  scheduleStartupUpdateCheck
} from './services/updater'
import { logErr } from './log'

const feedCache = new Map<string, FeedInfo | null>()

async function latestFor(productId: string): Promise<FeedInfo | null> {
  const product = getProduct(productId)
  if (!product?.feedUrl) return null
  if (feedCache.has(productId)) return feedCache.get(productId) ?? null
  try {
    const info = await fetchFeed(product.feedUrl)
    feedCache.set(productId, info)
    return info
  } catch {
    feedCache.set(productId, null)
    return null
  }
}

export async function buildStatus(): Promise<HubStatus> {
  const products: ProductStatus[] = await Promise.all(
    PRODUCTS.map(async (product) => {
      const runtime = await detectProduct(product)
      const feed = await latestFor(product.id)

      if (feed) {
        runtime.latestVersion = feed.version
        runtime.updateAvailable =
          runtime.installedVersion !== undefined &&
          feed.version !== runtime.installedVersion &&
          compareVersions(feed.version, runtime.installedVersion) > 0
      }

      return { ...product, runtime }
    })
  )

  return {
    products,
    checkedAt: new Date().toISOString(),
    updateCount: products.filter((p) => p.runtime.updateAvailable).length,
    installedCount: products.filter((p) => p.runtime.installed && !p.self).length
  }
}

function compareVersions(a: string, b: string): number {
  const pa = a.split('.').map((n) => Number.parseInt(n, 10) || 0)
  const pb = b.split('.').map((n) => Number.parseInt(n, 10) || 0)
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const va = pa[i] ?? 0
    const vb = pb[i] ?? 0
    if (va !== vb) return va > vb ? 1 : -1
  }
  return 0
}

function sendProgress(window: BrowserWindow | null, progress: InstallProgress): void {
  if (window && !window.isDestroyed()) window.webContents.send('install:progress', progress)
}

export function initIpc(): void {
  ipcMain.handle('app:version', () => appVersion())
  ipcMain.handle('system:info', () => getSystemInfo())
  ipcMain.handle('system:relaunchAsAdmin', () => relaunchAsAdmin())

  ipcMain.handle('hub:status', () => buildStatus())
  ipcMain.handle('hub:refresh', async () => {
    invalidateRegistryCache()
    feedCache.clear()
    return buildStatus()
  })
  ipcMain.handle('hub:openExternal', (_event, url: string) => {
    if (/^https?:\/\//i.test(url)) void shell.openExternal(url)
  })

  ipcMain.handle('hub:install', async (event, productId: string): Promise<InstallResult> => {
    const product = getProduct(productId)
    if (!product) return { ok: false, productId, error: 'Unbekanntes Produkt.' }
    if (!product.feedUrl) {
      return { ok: false, productId, error: 'Für dieses Produkt gibt es noch keinen Installer.' }
    }
    if (product.state !== 'released') {
      return { ok: false, productId, error: 'Dieses Produkt ist noch in Entwicklung.' }
    }

    const window = BrowserWindow.fromWebContents(event.sender)

    try {
      let feed = feedCache.get(productId) ?? null
      if (!feed) {
        feed = await fetchFeed(product.feedUrl)
        feedCache.set(productId, feed)
      }

      sendProgress(window, {
        productId,
        phase: 'downloading',
        receivedBytes: 0,
        totalBytes: feed.size,
        percent: 0
      })

      const download = await downloadInstaller(product.feedUrl, feed, {
        onProgress: (received, total) => {
          const percent = total > 0 ? Math.min(100, Math.round((received / total) * 100)) : 0
          sendProgress(window, {
            productId,
            phase: 'downloading',
            receivedBytes: received,
            totalBytes: total,
            percent
          })
        }
      })

      sendProgress(window, {
        productId,
        phase: 'verifying',
        receivedBytes: download.bytes,
        totalBytes: download.bytes,
        percent: 100,
        message: 'Integrität geprüft – Installer wird gestartet'
      })

      sendProgress(window, {
        productId,
        phase: 'installing',
        receivedBytes: download.bytes,
        totalBytes: download.bytes,
        percent: 100,
        message: 'Installer läuft – bitte im Fenster bestätigen'
      })

      const outcome = await runInstaller(product, download.filePath, feed.version)

      sendProgress(window, {
        productId,
        phase: outcome.version ? 'done' : 'ready',
        receivedBytes: download.bytes,
        totalBytes: download.bytes,
        percent: 100,
        message: outcome.message
      })

      invalidateRegistryCache()
      feedCache.delete(productId)

      return {
        ok: true,
        productId,
        message: outcome.message,
        installedVersion: outcome.version
      }
    } catch (error) {
      logErr('hub:install', error)
      const message = error instanceof Error ? error.message : String(error)
      sendProgress(window, {
        productId,
        phase: 'error',
        receivedBytes: 0,
        totalBytes: 0,
        percent: 0,
        message
      })
      return { ok: false, productId, error: message }
    }
  })

  ipcMain.handle('hub:launch', async (_event, productId: string): Promise<InstallResult> => {
    const product = getProduct(productId)
    if (!product) return { ok: false, productId, error: 'Unbekanntes Produkt.' }

    const runtime = await detectProduct(product, true)
    if (!runtime.installed || !runtime.exePath) {
      return { ok: false, productId, error: `${product.name} ist nicht installiert.` }
    }

    const ok = launchApp(runtime.exePath)
    return {
      ok,
      productId,
      message: ok ? `${product.name} gestartet.` : 'Start fehlgeschlagen.',
      error: ok ? undefined : 'Start fehlgeschlagen.'
    }
  })

  ipcMain.handle('settings:get', () => settingsStore.get())
  ipcMain.handle('settings:set', (_event, patch: Partial<AppSettings>) => {
    try {
      return settingsStore.set(patch)
    } catch (error) {
      logErr('settings:set', error)
      return settingsStore.get()
    }
  })

  ipcMain.handle('update:check', () => checkForUpdates())
  ipcMain.handle('update:download', () => downloadUpdate())
  ipcMain.handle('update:install', () => {
    installUpdate()
  })
}

export function initUpdaterEvents(window: BrowserWindow): void {
  onUpdateProgress((info: UpdateInfo) => {
    if (!window.isDestroyed()) window.webContents.send('update:progress', info)
  })
  onUpdateAvailable((info: UpdateInfo) => {
    if (!window.isDestroyed()) window.webContents.send('update:available', info)
  })
  scheduleStartupUpdateCheck(6000)
}