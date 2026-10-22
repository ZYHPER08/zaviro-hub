import os from 'os'
import { execFileSync, spawn } from 'child_process'
import { app } from 'electron'
import { appVersion } from '../version'
import type { SystemInfo } from '@shared/types'
import { logErr } from '../log'

function isElevated(): boolean {
  try {
    execFileSync('fsutil', ['dirty', 'query', process.env['SystemDrive'] ?? 'C:'], {
      stdio: 'ignore',
      windowsHide: true
    })
    return true
  } catch {
    return false
  }
}

export function getSystemInfo(): SystemInfo {
  return {
    os: `${os.type()} ${os.release()}`,
    release: os.release(),
    isAdmin: isElevated(),
    appVersion: appVersion(),
    nodeVersion: process.versions.node
  }
}

/**
 * Startet den Hub mit Administratorrechten neu (UAC-Prompt).
 *
 * Ablauf: Ein detached PowerShell-Prozess wartet, bis die aktuelle Instanz
 * beendet ist, und startet erst dann die neue Instanz elevated â€“ sonst
 * kollidiert der Single-Instance-Lock.
 */
export async function relaunchAsAdmin(): Promise<{ ok: boolean; error?: string }> {
  if (process.platform !== 'win32') return { ok: false, error: 'Nur unter Windows verfÃ¼gbar.' }
  if (isElevated()) return { ok: false, error: 'Bereits als Administrator ausgefÃ¼hrt.' }

  try {
    const exePath = app.getPath('exe')
    const appPath = app.getAppPath()
    const args = app.isPackaged ? [] : [appPath]
    const currentPid = process.pid

    const quote = (value: string): string => `'${value.replace(/'/g, "''")}'`
    const argList = args.map(quote).join(',')

    const script = [
      `$oldPid = ${currentPid}`,
      `$exe = ${quote(exePath)}`,
      'for ($i = 0; $i -lt 150; $i++) { if (-not (Get-Process -Id $oldPid -ErrorAction SilentlyContinue)) { break }; Start-Sleep -Milliseconds 100 }',
      'Start-Sleep -Milliseconds 400',
      args.length > 0
        ? `Start-Process -FilePath $exe -ArgumentList ${argList} -Verb RunAs`
        : `Start-Process -FilePath $exe -Verb RunAs`
    ].join('\n')

    const encoded = Buffer.from(script, 'utf16le').toString('base64')

    const child = spawn(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-EncodedCommand', encoded],
      { windowsHide: true, detached: true, stdio: 'ignore' }
    )
    child.on('error', (error) => logErr('relaunchAsAdmin:child', error))
    child.unref()

    setTimeout(() => app.exit(0), 300)
    return { ok: true }
  } catch (error) {
    logErr('relaunchAsAdmin', error)
    const message = error instanceof Error ? error.message : String(error)
    return { ok: false, error: /canceled|abgebrochen/i.test(message) ? 'Abgebrochen.' : message }
  }
}
