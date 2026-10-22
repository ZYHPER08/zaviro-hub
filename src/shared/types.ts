export interface AppSettings {
  language: 'de' | 'en'
  theme: 'dark' | 'light'
  accentColor: string
  autoCheckUpdates: boolean
}

export interface SystemInfo {
  os: string
  release: string
  isAdmin: boolean
  appVersion: string
  nodeVersion: string
}

export interface ChangelogEntry {
  version: string
  date: string
  notes: string[]
}

/** Status eines Produkts in der Katalog-Definition (statisch, im Code hinterlegt). */
export type ProductState = 'released' | 'in-development' | 'planned'

export interface ProductDefinition {
  id: string
  name: string
  tagline: string
  description: string
  icon: string
  accent: string
  homepage: string
  /** Update-Feed mit latest.yml (optional bei Platzhaltern). */
  feedUrl?: string
  /** Produktname in der Windows-Uninstall-Registry (für die Erkennung). */
  registryName?: string
  /** Installationsordner unter %LOCALAPPDATA%\Programs. */
  programFolder?: string
  /** Dateiname der installierten Anwendung. */
  exeName?: string
  state: ProductState
  /** true bei diesem Tool selbst – dann gibt es keine Installations-Buttons. */
  self?: boolean
  features: string[]
  changelog: ChangelogEntry[]
}

export interface ProductRuntime {
  installed: boolean
  installedVersion?: string
  latestVersion?: string
  updateAvailable: boolean
  exePath?: string
  error?: string
}

export interface ProductStatus extends ProductDefinition {
  runtime: ProductRuntime
}

export interface HubStatus {
  products: ProductStatus[]
  checkedAt: string
  updateCount: number
  installedCount: number
}

export type InstallPhase =
  | 'idle'
  | 'downloading'
  | 'verifying'
  | 'ready'
  | 'installing'
  | 'waiting'
  | 'done'
  | 'error'

export interface InstallProgress {
  productId: string
  phase: InstallPhase
  receivedBytes: number
  totalBytes: number
  percent: number
  message?: string
}

export interface InstallResult {
  ok: boolean
  productId: string
  message?: string
  error?: string
  installedVersion?: string
}

export interface UpdateInfo {
  checked: boolean
  currentVersion: string
  latestVersion?: string
  updateAvailable?: boolean
  downloadPercent?: number
  readyToInstall?: boolean
  notes?: string
  error?: string
}
