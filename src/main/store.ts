import { app } from 'electron'
import { join } from 'path'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs'
import type { AppSettings } from '@shared/types'
import { logErr } from './log'

const DEFAULTS: AppSettings = {
  language: 'de',
  theme: 'dark',
  accentColor: '#7c5cff',
  autoCheckUpdates: true
}

class SettingsStore {
  private file: string
  private data: AppSettings = { ...DEFAULTS }
  private loaded = false

  constructor() {
    this.file = join(app.getPath('userData'), 'settings.json')
  }

  private ensureLoaded(): void {
    if (this.loaded) return
    this.loaded = true
    try {
      if (existsSync(this.file)) {
        const parsed = JSON.parse(readFileSync(this.file, 'utf-8')) as Partial<AppSettings>
        this.data = { ...DEFAULTS, ...parsed }
      } else {
        this.persist()
      }
    } catch (error) {
      logErr('settings:load', error)
      this.data = { ...DEFAULTS }
    }
  }

  private persist(): void {
    try {
      const dir = join(this.file, '..')
      if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
      writeFileSync(this.file, JSON.stringify(this.data, null, 2), 'utf-8')
    } catch (error) {
      logErr('settings:persist', error)
    }
  }

  get(): AppSettings {
    this.ensureLoaded()
    return { ...this.data }
  }

  set(patch: Partial<AppSettings>): AppSettings {
    this.ensureLoaded()
    this.data = { ...this.data, ...patch }
    this.persist()
    return this.get()
  }
}

export const settingsStore = new SettingsStore()
