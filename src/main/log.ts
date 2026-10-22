const stamp = (): string => new Date().toISOString()

export function logErr(scope: string, error: unknown): void {
  const message = error instanceof Error ? (error.stack ?? error.message) : String(error)
  console.error(`[ZAVIRO Hub ${stamp()}] [${scope}] ${message}`)
}

export function logInfo(scope: string, message: string): void {
  console.log(`[ZAVIRO Hub ${stamp()}] [${scope}] ${message}`)
}
