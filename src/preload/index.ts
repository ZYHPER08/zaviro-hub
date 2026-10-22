import { contextBridge, ipcRenderer } from 'electron'
import type {
  AppSettings,
  HubStatus,
  InstallProgress,
  InstallResult,
  SystemInfo,
  UpdateInfo
} from '@shared/types'

export interface HubApi {
  version: () => Promise<string>
  system: {
    info: () => Promise<SystemInfo>
    relaunchAsAdmin: () => Promise<{ ok: boolean; error?: string }>
  }
  hub: {
    status: () => Promise<HubStatus>
    refresh: () => Promise<HubStatus>
    install: (productId: string) => Promise<InstallResult>
    launch: (productId: string) => Promise<InstallResult>
    openExternal: (url: string) => Promise<void>
    onProgress: (callback: (progress: InstallProgress) => void) => () => void
  }
  update: {
    check: () => Promise<UpdateInfo>
    download: () => Promise<UpdateInfo>
    install: () => Promise<void>
    onProgress: (callback: (progress: UpdateInfo) => void) => () => void
    onAvailable: (callback: (info: UpdateInfo) => void) => () => void
  }
  settings: {
    get: () => Promise<AppSettings>
    set: (patch: Partial<AppSettings>) => Promise<AppSettings>
  }
}

const api: HubApi = {
  version: () => ipcRenderer.invoke('app:version'),
  system: {
    info: () => ipcRenderer.invoke('system:info'),
    relaunchAsAdmin: () => ipcRenderer.invoke('system:relaunchAsAdmin')
  },
  hub: {
    status: () => ipcRenderer.invoke('hub:status'),
    refresh: () => ipcRenderer.invoke('hub:refresh'),
    install: (productId) => ipcRenderer.invoke('hub:install', productId),
    launch: (productId) => ipcRenderer.invoke('hub:launch', productId),
    openExternal: (url) => ipcRenderer.invoke('hub:openExternal', url),
    onProgress: (callback) => {
      const listener = (_event: unknown, progress: InstallProgress): void => callback(progress)
      ipcRenderer.on('install:progress', listener)
      return () => ipcRenderer.removeListener('install:progress', listener)
    }
  },
  update: {
    check: () => ipcRenderer.invoke('update:check'),
    download: () => ipcRenderer.invoke('update:download'),
    install: () => ipcRenderer.invoke('update:install'),
    onProgress: (callback) => {
      const listener = (_event: unknown, progress: UpdateInfo): void => callback(progress)
      ipcRenderer.on('update:progress', listener)
      return () => ipcRenderer.removeListener('update:progress', listener)
    },
    onAvailable: (callback) => {
      const listener = (_event: unknown, info: UpdateInfo): void => callback(info)
      ipcRenderer.on('update:available', listener)
      return () => ipcRenderer.removeListener('update:available', listener)
    }
  },
  settings: {
    get: () => ipcRenderer.invoke('settings:get'),
    set: (patch) => ipcRenderer.invoke('settings:set', patch)
  }
}

contextBridge.exposeInMainWorld('api', api)
