import { autoUpdater } from 'electron-updater'
import type { UpdateInfo } from '@shared/types'
import { logErr, logInfo } from '../log'
import { settingsStore } from '../store'
import { appVersion } from '../version'

// Selbst-Update über den GitHub-Pages-Feed. Der alte Netlify-Fallback lieferte
// veraltete Versionen (1.0.0) und wird deshalb nicht mehr verwendet.
const FEED_URL = 'https://zyhper08.github.io/zaviro-hub-feed/'
const CHECK_TIMEOUT_MS = 20_000
const DOWNLOAD_TIMEOUT_MS = 300_000

type ProgressFn = (info: UpdateInfo) => void
type AvailableFn = (info: UpdateInfo) => void

let progressListener: ProgressFn | null = null
let availableListener: AvailableFn | null = null
let checking = false
let downloadedVersion: string | null = null

function parse(v: string): number[] {
  return v.split('.').map((n) => Number.parseInt(n, 10) || 0)
}

function isNewer(latest: string, current: string): boolean {
  const [a, b, c] = parse(current)
  const [x, y, z] = parse(latest)
  return x > a || (x === a && (y > b || (y === b && z > c)))
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout>
  const timeout = new Promise<T>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`${label}: Zeitüberschreitung nach ${ms / 1000} s`)), ms)
  })
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer))
}

export function configureAutoUpdate(): void {
  autoUpdater.autoDownload = false
  autoUpdater.autoInstallOnAppQuit = true
  autoUpdater.logger = null
  autoUpdater.setFeedURL({ provider: 'generic', url: FEED_URL })
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
    if (!settingsStore.get().autoCheckUpdates) return
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
  const currentVersion = appVersion()
  if (checking) {
    return { checked: false, currentVersion, error: 'Es läuft bereits eine Update-Prüfung.' }
  }
  checking = true
  try {
    autoUpdater.setFeedURL({ provider: 'generic', url: FEED_URL })
    const result = await withTimeout(autoUpdater.checkForUpdates(), CHECK_TIMEOUT_MS, 'update:check')
    const latest = result?.updateInfo?.version
    const info: UpdateInfo = {
      checked: true,
      currentVersion,
      latestVersion: latest,
      updateAvailable: Boolean(latest) && isNewer(latest as string, currentVersion),
      notes:
        typeof result?.updateInfo?.releaseNotes === 'string' ? result.updateInfo.releaseNotes : undefined
    }
    logInfo('update:check', `current=${currentVersion} latest=${latest ?? '-'} available=${info.updateAvailable}`)
    return info
  } catch (error) {
    logErr('update:check', error)
    return { checked: true, currentVersion, error: errorMessage(error) }
  } finally {
    checking = false
  }
}

export async function downloadUpdate(): Promise<UpdateInfo> {
  const currentVersion = appVersion()
  if (downloadedVersion && isNewer(downloadedVersion, currentVersion)) {
    return { checked: true, currentVersion, readyToInstall: true, downloadPercent: 100 }
  }
  try {
    autoUpdater.removeAllListeners('download-progress')
    autoUpdater.on('download-progress', (p) => {
      progressListener?.({ checked: true, currentVersion, downloadPercent: Math.round(p.percent) })
    })
    autoUpdater.once('update-downloaded', (info) => {
      downloadedVersion = info?.version ?? null
      progressListener?.({ checked: true, currentVersion, readyToInstall: true, downloadPercent: 100 })
    })
    await withTimeout(autoUpdater.downloadUpdate(), DOWNLOAD_TIMEOUT_MS, 'update:download')
    logInfo('update:download', `ready current=${currentVersion}`)
    return { checked: true, currentVersion, readyToInstall: true, downloadPercent: 100 }
  } catch (error) {
    logErr('update:download', error)
    return { checked: true, currentVersion, error: errorMessage(error) }
  }
}

export function installUpdate(): void {
  try {
    logInfo('update:install', 'quitAndInstall')
    autoUpdater.quitAndInstall(true, true)
  } catch (error) {
    logErr('update:install', error)
  }
}
