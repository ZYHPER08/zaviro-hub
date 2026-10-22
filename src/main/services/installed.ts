import { execFile } from 'child_process'
import { promisify } from 'util'
import { homedir } from 'os'
import { join } from 'path'
import { existsSync } from 'fs'
import { app } from 'electron'
import { appVersion } from '../version'
import type { ProductDefinition, ProductRuntime } from '@shared/types'
import { logErr } from '../log'

const execFileAsync = promisify(execFile)

/** %LOCALAPPDATA% â€“ Electron kennt den Ordner nicht direkt. */
function localAppData(): string {
  return process.env['LOCALAPPDATA'] ?? join(homedir(), 'AppData', 'Local')
}

interface UninstallEntry {
  DisplayName: string
  DisplayVersion: string
}

/** Ein einziger PowerShell-Aufruf liefert alle Uninstall-EintrÃ¤ge (HKCU + HKLM + WOW). */
const PS_SCRIPT = String.raw`
$roots = @(
  'HKCU:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
  'HKLM:\Software\Microsoft\Windows\CurrentVersion\Uninstall\*',
  'HKLM:\Software\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\*'
)
$out = @()
foreach ($r in $roots) {
  Get-ItemProperty -Path $r -ErrorAction SilentlyContinue |
    Where-Object { $_.DisplayName } |
    ForEach-Object {
      $out += [PSCustomObject]@{
        DisplayName = [string]$_.DisplayName
        DisplayVersion = [string]$_.DisplayVersion
      }
    }
}
if ($out.Count -eq 0) { Write-Output '[]' } else { $out | ConvertTo-Json -Compress }
`

let cache: { at: number; entries: UninstallEntry[] } | null = null
const CACHE_MS = 4000

async function readUninstallEntries(force = false): Promise<UninstallEntry[]> {
  if (!force && cache && Date.now() - cache.at < CACHE_MS) return cache.entries
  try {
    const { stdout } = await execFileAsync(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', PS_SCRIPT],
      { windowsHide: true, maxBuffer: 4 * 1024 * 1024, timeout: 20000 }
    )
    const parsed = JSON.parse(stdout.trim() || '[]')
    const entries: UninstallEntry[] = (Array.isArray(parsed) ? parsed : [parsed]).filter(
      (entry) => entry && typeof entry.DisplayName === 'string'
    )
    cache = { at: Date.now(), entries }
    return entries
  } catch (error) {
    logErr('installed:registry', error)
    return cache?.entries ?? []
  }
}

/** Pfad der installierten Anwendung (leer, wenn nicht gefunden). */
export function installedExePath(product: ProductDefinition): string | undefined {
  if (!product.programFolder || !product.exeName) return undefined
  const exe = join(localAppData(), 'Programs', product.programFolder, product.exeName)
  return existsSync(exe) ? exe : undefined
}

/** Erkennt, ob ein Produkt installiert ist, und welche Version. */
export async function detectProduct(product: ProductDefinition, force = false): Promise<ProductRuntime> {
  const runtime: ProductRuntime = {
    installed: false,
    updateAvailable: false
  }

  if (product.self) {
    runtime.installed = true
    runtime.installedVersion = appVersion()
    runtime.exePath = process.execPath
    return runtime
  }

  const entries = await readUninstallEntries(force)
  const entry = product.registryName
    ? entries.find((item) => item.DisplayName.trim() === product.registryName)
    : undefined

  const exePath = installedExePath(product)

  if (entry) {
    runtime.installed = true
    runtime.installedVersion = entry.DisplayVersion || undefined
  } else if (exePath) {
    // Registry-Eintrag fehlt (z. B. portable Installation) â€“ Datei existiert aber.
    runtime.installed = true
  }

  if (exePath) runtime.exePath = exePath

  return runtime
}

/** Erzwingt einen frischen Registry-Read (z. B. nach einer Installation). */
export function invalidateRegistryCache(): void {
  cache = null
}
