import { app, BrowserWindow, Menu, nativeImage, shell } from 'electron'
import { join } from 'path'
import { existsSync } from 'fs'
import type { UpdateInfo } from '@shared/types'
import { initIpc, initUpdaterEvents } from './ipc'
import { logErr } from './log'
import { configureAutoUpdate } from './services/updater'

let mainWindow: BrowserWindow | null = null

process.on('unhandledRejection', (reason) => logErr('unhandledRejection', reason))
process.on('uncaughtException', (error) => logErr('uncaughtException', error))

function appIcon(): Electron.NativeImage {
  const candidates = [
    join(process.cwd(), 'logo.png'),
    join(app.getAppPath(), 'logo.png'),
    join(__dirname, '../../logo.png'),
    join(process.cwd(), 'build/icon.ico'),
    join(app.getAppPath(), 'build/icon.ico')
  ]
  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      const image = nativeImage.createFromPath(candidate)
      if (!image.isEmpty()) return image
    }
  }
  return nativeImage.createEmpty()
}

function isSafeExternalUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' || url.protocol === 'http:'
  } catch {
    return false
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1240,
    height: 840,
    minWidth: 960,
    minHeight: 640,
    show: false,
    backgroundColor: '#0b0e14',
    title: 'ZAVIRO Hub',
    autoHideMenuBar: true,
    icon: appIcon(),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  Menu.setApplicationMenu(null)

  mainWindow.on('ready-to-show', () => {
    if (!process.env['ZAVIRO_SMOKE']) mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    if (isSafeExternalUrl(details.url)) {
      void shell.openExternal(details.url).catch((error) => logErr('openExternal', error))
    }
    return { action: 'deny' }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const allowed = url.startsWith('file://') || url.startsWith('http://localhost') || url.startsWith('https://localhost')
    if (!allowed) event.preventDefault()
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    void mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    void mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

const isPrimaryInstance = app.requestSingleInstanceLock()
if (!isPrimaryInstance) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  app.whenReady().then(() => {
    initIpc()
    createWindow()

    configureAutoUpdate()
    if (mainWindow) initUpdaterEvents(mainWindow)

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

    if (process.env['ZAVIRO_SMOKE']) {
      const smokeDelay = Number(process.env['ZAVIRO_SMOKE_DELAY'] ?? 6000)
      setTimeout(async () => {
        const ok = mainWindow && !mainWindow.isDestroyed()
        console.log(ok ? 'SMOKE_OK: main process, window created: true' : 'SMOKE_FAIL')

        if (process.env['ZAVIRO_SELFTEST']) {
          try {
            const { buildStatus } = await import('./ipc')
            const status = await buildStatus()
            console.log(
              'SELFTEST products:',
              status.products
                .map(
                  (p) =>
                    `${p.id}=${p.runtime.installed ? p.runtime.installedVersion ?? 'ja' : 'nein'}` +
                    `${p.runtime.updateAvailable ? ' (Update)' : ''}`
                )
                .join(' | ')
            )
            console.log(
              'SELFTEST installed:',
              status.installedCount,
              'updates:',
              status.updateCount
            )

            const { checkForUpdates } = await import('./services/updater')
            console.log('SELFTEST selfupdate: Pruefung startet ...')
            const timeoutResult: UpdateInfo = {
              checked: false,
              currentVersion: 'timeout',
              error: 'Zeitueberschreitung'
            }
            const upd = await Promise.race<UpdateInfo>([
              checkForUpdates(),
              new Promise<UpdateInfo>((resolve) => setTimeout(() => resolve(timeoutResult), 20000))
            ])
            console.log(
              'SELFTEST selfupdate:',
              `aktuell=${upd.currentVersion}`,
              `latest=${upd.latestVersion ?? '-'}`,
              `verfuegbar=${upd.updateAvailable ?? false}`,
              upd.error ? `fehler=${upd.error}` : ''
            )
          } catch (error) {
            console.log('SELFTEST_ERROR:', String(error))
          }
        }

        app.exit(0)
      }, 6000)
    }
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}
