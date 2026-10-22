import { app } from 'electron'
import pkg from '../../package.json'

/**
 * Version der Hub-App.
 *
 * Im entpackten Entwicklungsmodus liefert app.getVersion() die Electron-Version –
 * deshalb wird dann die Version aus der package.json verwendet.
 */
export function appVersion(): string {
  return app.isPackaged ? app.getVersion() : pkg.version
}
