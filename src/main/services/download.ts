import { createHash } from 'crypto'
import { createWriteStream, existsSync, mkdirSync, rmSync, statSync } from 'fs'
import { join } from 'path'
import { Readable } from 'stream'
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

/**
 * Lädt einen Installer herunter und prüft die Datei gegen den SHA-512-Wert
 * aus dem Update-Feed. Eine abweichende Datei wird gelöscht.
 */
export async function downloadInstaller(
  feedUrl: string,
  feed: FeedInfo,
  callbacks: DownloadCallbacks = {}
): Promise<DownloadResult> {
  const url = feedFileUrl(feedUrl, feed.path)
  const dir = downloadDirectory()
  const filePath = join(dir, feed.path)

  const controller = new AbortController()
  const response = await fetch(url, { signal: controller.signal })
  if (!response.ok) {
    throw new Error(`Download fehlgeschlagen (HTTP ${response.status})`)
  }

  const total = Number(response.headers.get('content-length') ?? feed.size ?? 0)
  let received = 0

  const hash = createHash('sha512')
  const source = Readable.fromWeb(response.body as import('stream/web').ReadableStream)

  source.on('data', (chunk: Buffer) => {
    received += chunk.length
    hash.update(chunk)
    callbacks.onProgress?.(received, total)
  })

  try {
    await pipeline(source, createWriteStream(filePath))
  } catch (error) {
    rmSync(filePath, { force: true })
    logErr('download:pipeline', error)
    throw error instanceof Error ? error : new Error(String(error))
  }

  const actual = hash.digest('base64')
  const verified = actual === feed.sha512

  if (!verified) {
    rmSync(filePath, { force: true })
    throw new Error('Integritätsprüfung fehlgeschlagen (SHA-512 stimmt nicht überein)')
  }

  const bytes = existsSync(filePath) ? statSync(filePath).size : received

  return { filePath, bytes, verified }
}
