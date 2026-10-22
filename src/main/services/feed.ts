import { logErr } from '../log'

export interface FeedInfo {
  version: string
  path: string
  sha512: string
  size: number
  releaseDate?: string
}

/** Minimales Parsen für die von electron-builder erzeugte latest.yml. */
export function parseLatestYml(content: string): FeedInfo | null {
  // Die Werte stehen teils eingerückt unter "files:", teils auf oberster Ebene.
  const read = (key: string): string | undefined => {
    const match = content.match(new RegExp(`^\\s*${key}:\\s*(.+)$`, 'm'))
    if (!match) return undefined
    return match[1].trim().replace(/^['"]|['"]$/g, '')
  }

  const version = read('version')
  const path = read('path')
  const sha512 = read('sha512')
  const size = Number.parseInt(read('size') ?? '', 10)

  if (!version || !path || !sha512 || Number.isNaN(size)) return null

  return {
    version,
    path,
    sha512,
    size,
    releaseDate: read('releaseDate')
  }
}

/** Basis-URL des Feeds (mit abschließendem Slash). */
function baseUrl(feedUrl: string): string {
  return feedUrl.endsWith('/') ? feedUrl : `${feedUrl}/`
}

/** Liest die Metadaten des Update-Feeds eines Produkts. */
export async function fetchFeed(feedUrl: string, timeoutMs = 15000): Promise<FeedInfo> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  const ymlUrl = new URL('latest.yml', baseUrl(feedUrl)).toString()
  try {
    const response = await fetch(ymlUrl, {
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    })
    if (!response.ok) throw new Error(`Feed antwortete mit HTTP ${response.status}`)
    const content = await response.text()
    const info = parseLatestYml(content)
    if (!info) {
      throw new Error(
        `Feed unlesbar – url=${response.url} status=${response.status} typ=${response.headers.get('content-type')}`
      )
    }
    return info
  } catch (error) {
    logErr('feed:fetch', error)
    throw error instanceof Error ? error : new Error(String(error))
  } finally {
    clearTimeout(timer)
  }
}

/** Vollständige Download-URL einer Datei im Feed. */
export function feedFileUrl(feedUrl: string, filePath: string): string {
  return new URL(filePath, baseUrl(feedUrl)).toString()
}
