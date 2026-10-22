import { app } from 'electron'
import { autoUpdater } from 'electron-updater'
import type { UpdateInfo } from '@shared/types'
import { logErr } from '../log'

// Selbst-Update über einen generischen Feed.
// Primär: GitHub Pages (unabhängig von Netlify-Kontolimits), Fallback: Netlify.
const FEED_URLS = ['https://zyhper08.github.io/zaviro-hub-feed/', 'https://zaviro-hub-update.netlify.app/']

type ProgressFn = (info: UpdateInfo) => void
type AvailableFn = (info: UpdateInfo) => void

let progressListener: ProgressFn | null = null
let availableListener: AvailableFn | null = null
let activeFeedIndex = 0

function parse(v: string): number[] {
  return v.split('.').map((n) => Number.parseInt(n, 10) || 0)
}

function isNewer(latest: string, current: string): boolean {
  const [a, b, c] = parse(current)
  const [x, y, z] = parse(latest)
  return x > a || (x === a && (y > b || (y === b && z > c)))
}

export function configureAutoUpdate(): void {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.logger = null
  autoUpdater.setFeedURL({ provider: 'generic', url: FEED_URLS[activeFeedIndex] })
}

export function onUpdateProgress(fn: ProgressFn): void {
  progressListener = fn
}

export function onUpdateAvailable(fn: AvailableFn): void {
  availableListener = fn
}

/** Prüft im Hintergrund beim Start, ob ein Update bereitsteht. */
export function scheduleStartupUpdateCheck(delayMs = 5000): void {
  setTimeout(() => {
    void (async () => {
      try {
        const info = await checkForUpdates()
        if (info.updateAvailable) availableListener?.(info)
      } catch (error) {
        logErr('update:startupCheck', error)
      }
    })()
  }, delayMs)
}

export async function checkForUpdates(): Promise<UpdateInfo> {
  const currentVersion = app.getVersion()
  let lastError: unknown = null
  for (let attempt = 0; attempt < FEED_URLS.length; attempt++) {
    const index = (activeFeedIndex + attempt) % FEED_URLS.length
    try {
      autoUpdater.setFeedURL({ provider: 'generic', url: FEED_URLS[index] })
      const result = await autoUpdater.checkForUpdates()
      const latest = result?.updateInfo.version
      activeFeedIndex = index
      return {
        checked: true,
        currentVersion,
        latestVersion: latest,
        updateAvailable: Boolean(latest) && isNewer(latest as string, currentVersion),
        notes:
          typeof result?.updateInfo.releaseNotes === 'string' ? result.updateInfo.releaseNotes : undefined
      }
    } catch (error) {
      lastError = error
      logErr(`update:check:${FEED_URLS[index]}`, error)
    }
  }
  return {
    checked: true,
    currentVersion,
    error: lastError instanceof Error ? lastError.message : String(lastError)
  }
}

export async function downloadUpdate(): Promise<UpdateInfo> {
  const currentVersion = app.getVersion()
  try {
    autoUpdater.removeAllListeners('download-progress')
    autoUpdater.on('download-progress', (p) => {
      progressListener?.({ checked: true, currentVersion, downloadPercent: Math.round(p.percent) })
    })
    autoUpdater.once('update-downloaded', () => {
      progressListener?.({ checked: true, currentVersion, readyToInstall: true, downloadPercent: 100 })
    })
    await autoUpdater.downloadUpdate()
    return { checked: true, currentVersion, readyToInstall: true, downloadPercent: 100 }
  } catch (error) {
    logErr('update:download', error)
    return {
      checked: true,
      currentVersion,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

export function installUpdate(): void {
  autoUpdater.quitAndInstall(true, true)
}
