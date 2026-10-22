import { spawn } from 'child_process'
import type { ChildProcess } from 'child_process'
import type { ProductDefinition } from '@shared/types'
import { detectProduct, invalidateRegistryCache } from './installed'
import { logErr, logInfo } from '../log'

export interface InstallerOutcome {
  started: boolean
  version?: string
  message?: string
}

/**
 * Startet einen Installer und wartet anschließend auf die neue Version.
 *
 * Erfolgskriterium ist die erwartete Version aus dem Update-Feed – so wird auch
 * eine Neuinstallation derselben Version korrekt erkannt. Bricht der Installer
 * ab, wird das früh gemeldet statt bis zum Timeout zu warten.
 */
export async function runInstaller(
  product: ProductDefinition,
  filePath: string,
  expectedVersion?: string,
  timeoutMs = 240000
): Promise<InstallerOutcome> {
  const before = await detectProduct(product, true)

  let child: ChildProcess
  try {
    child = spawn(filePath, [], {
      detached: true,
      stdio: 'ignore',
      windowsHide: false
    })
    child.unref()
    logInfo('installer', `Installer gestartet: ${filePath}`)
  } catch (error) {
    logErr('installer:spawn', error)
    return { started: false, message: error instanceof Error ? error.message : String(error) }
  }

  let installerExited = false
  child.on('exit', () => {
    installerExited = true
  })
  child.on('error', (error) => {
    logErr('installer:child', error)
    installerExited = true
  })

  const deadline = Date.now() + timeoutMs
  let lastVersion = before.installedVersion

  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, 2000))
    invalidateRegistryCache()
    const current = await detectProduct(product, true)

    if (expectedVersion && current.installedVersion === expectedVersion) {
      return {
        started: true,
        version: current.installedVersion,
        message: `${product.name} ${current.installedVersion} installiert`
      }
    }

    if (current.installedVersion) lastVersion = current.installedVersion

    if (installerExited) {
      // Der Installer wurde geschlossen – Version ein letztes Mal prüfen.
      invalidateRegistryCache()
      const after = await detectProduct(product, true)
      if (after.installedVersion && after.installedVersion !== lastVersion) {
        return {
          started: true,
          version: after.installedVersion,
          message: `${product.name} ${after.installedVersion} installiert`
        }
      }
      return {
        started: true,
        message:
          'Der Installer wurde geschlossen. Prüfe, ob die Installation abgeschlossen wurde.',
        error: undefined
      } as InstallerOutcome
    }
  }

  return {
    started: true,
    message: 'Installer läuft noch – die Installation wird im Installer-Fenster abgeschlossen.'
  }
}

/** Startet eine installierte ZAVIRO-Anwendung. */
export function launchApp(exePath: string): boolean {
  try {
    const child = spawn(exePath, [], {
      detached: true,
      stdio: 'ignore',
      windowsHide: false
    })
    child.unref()
    logInfo('launcher', `Anwendung gestartet: ${exePath}`)
    return true
  } catch (error) {
    logErr('launcher:spawn', error)
    return false
  }
}
