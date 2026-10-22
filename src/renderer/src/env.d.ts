/// <reference types="vite/client" />

import type { HubApi } from '../../preload/index'

declare global {
  interface Window {
    api: HubApi
  }
}

export {}
