import { createHash, randomUUID } from 'crypto'
import { createWriteStream, existsSync, mkdirSync, renameSync, rmSync, statSync } from 'fs'
import { basename, join } from 'path'
import { Readable, Transform } from 'stream'
import { pipeline } from 'stream/promises'
import { app } from 'electron'
import type { FeedInfo } from './feed'
import { feedFileUrl } from './feed'
import { logErr } from '../log'

export interface DownloadCallbacks {
  onProgress?: (received: number, total: number) => void
}

export interface DownloadResult {
  filePath: string
  bytes: number
  verified: boolean
}

/** Zielordner für heruntergeladene Installer. */
export function downloadDirectory(): string {
  const dir = join(app.getPath('downloads'), 'ZAVIRO Hub')
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
  return dir
}

function fileNameFromFeed(feed: FeedInfo): string {
  if (feed.path.startsWith('http://') || feed.path.startsWith('https://')) {
    try {
      const n = basename(new URL(feed.path).pathname)
      if (n) return decodeURIComponent(n)
    } catch {}
  }
  return basename(feed.path) || 'installer.exe'
}

/**
 * Lädt einen Installer herunter und prüft die Datei gegen den SHA-512-Wert
 * aus dem Update-Feed.
 *
 * Der Download läuft in eine eindeutige Temp-Datei. Der Hash wird über einen
 * Transform-Stream berechnet, also exakt über die Bytes, die auch in die Datei
 * geschrieben werden. Erst nach erfolgreicher Prüfung wird die Datei auf den
 * endgültigen Namen umbenannt. Dadurch können parallele Downloads oder
 *abgebrochene Verbindungen keine beschädigte Datei hinterlassen.
 */
export async function downloadInstaller(
  feedUrl: string,
  feed: FeedInfo,
  callbacks: DownloadCallbacks = {}
): Promise<DownloadResult> {
  const url = feedFileUrl(feedUrl, feed.path)
  const dir = downloadDirectory()
  const fileName = fileNameFromFeed(feed)
  const filePath = join(dir, fileName)
  const tempPath = join(dir, `.${fileName}.${randomUUID()}.tmp`)

  const controller = new AbortController()
  const response = await fetch(url, { signal: controller.signal })
  if (!response.ok) {
    throw new Error(`Download fehlgeschlagen (HTTP ${response.status})`)
  }

  const total = Number(response.headers.get('content-length') ?? feed.size ?? 0)
  let received = 0
  const hash = createHash('sha512')

  const source = Readable.fromWeb(response.body as import('stream/web').ReadableStream)
  const hashing = new Transform({
    transform(chunk: Buffer, _enc, cb) {
      received += chunk.length
      hash.update(chunk)
      callbacks.onProgress?.(received, total)
      cb(null, chunk)
    }
  })

  try {
    await pipeline(source, hashing, createWriteStream(tempPath))
  } catch (error) {
    rmSync(tempPath, { force: true })
    logErr('download:pipeline', error)
    throw error instanceof Error ? error : new Error(String(error))
  }

  const actual = hash.digest('base64')
  if (actual !== feed.sha512) {
    rmSync(tempPath, { force: true })
    throw new Error('Integritätsprüfung fehlgeschlagen (SHA-512 stimmt nicht überein)')
  }

  const bytes = statSync(tempPath).size
  if (feed.size && bytes !== feed.size) {
    rmSync(tempPath, { force: true })
    throw new Error(`Größe stimmt nicht überein (${bytes} statt ${feed.size} Bytes)`)
  }

  try {
    if (existsSync(filePath)) rmSync(filePath, { force: true })
    renameSync(tempPath, filePath)
  } catch (error) {
    rmSync(tempPath, { force: true })
    logErr('download:rename', error)
    throw error instanceof Error ? error : new Error(String(error))
  }

  return { filePath, bytes, verified: true }
}
