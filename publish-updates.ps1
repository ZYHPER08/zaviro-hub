# ZAVIRO Hub - Build & Auto-Update-Feed veroeffentlichen
# 1. Version aus package.json lesen
# 2. npm run dist (Installer + Portable bauen)
# 3. latest.yml + Installer + Blockmap in den Netlify-Drop-Ordner kopieren
# 4. Dateien zu Netlify hochladen (Auto-Update-Feed)
$ErrorActionPreference = 'Stop'

$hubDir  = 'E:\ZAVIRO Hub'
$dropDir = Join-Path $hubDir 'netlify-drop'

Write-Host ''
Write-Host '=== ZAVIRO Hub Update veroeffentlichen ===' -ForegroundColor Cyan

# --- 1. Version lesen ---
$pkg = Get-Content (Join-Path $hubDir 'package.json') -Raw | ConvertFrom-Json
$version = $pkg.version
Write-Host "Version: $version" -ForegroundColor Yellow

# --- 2. Bauen ---
Write-Host ''
Write-Host 'Baue Installer (npm run dist)...' -ForegroundColor Cyan
Push-Location $hubDir
try {
  npm run dist
  if ($LASTEXITCODE -ne 0) { throw "npm run dist fehlgeschlagen (Exit $LASTEXITCODE)" }
} finally {
  Pop-Location
}

$installer = Join-Path $hubDir "dist\ZAVIRO Hub Setup $version.exe"
$portable  = Join-Path $hubDir "dist\ZAVIRO Hub $version.exe"
$blockmap  = "$installer.blockmap"
$latest    = Join-Path $hubDir 'dist\latest.yml'

foreach ($f in @($installer, $portable, $blockmap, $latest)) {
  if (-not (Test-Path $f)) { throw "Build-Artefakt fehlt: $f" }
}

# --- 3. In den Drop-Ordner kopieren ---
Write-Host ''
Write-Host 'Kopiere Dateien in den Upload-Ordner...' -ForegroundColor Cyan
if (-not (Test-Path $dropDir)) { New-Item -ItemType Directory -Path $dropDir | Out-Null }

# Alte Installer/Blockmaps entfernen (nur die aktuellen behalten)
Get-ChildItem $dropDir -Filter 'ZAVIRO Hub Setup *.exe'        | Remove-Item -Force -ErrorAction SilentlyContinue
Get-ChildItem $dropDir -Filter 'ZAVIRO Hub Setup *.exe.blockmap' | Remove-Item -Force -ErrorAction SilentlyContinue

Copy-Item $installer $dropDir -Force
Copy-Item $blockmap  $dropDir -Force
Copy-Item $latest    $dropDir -Force

# Startseite fuer die Root-URL (sonst liefert Netlify dort eine 404-Seite).
# Wichtig: Explizit als UTF-8 lesen und ohne BOM schreiben, sonst werden
# Umlaute und Sonderzeichen doppelt kodiert.
$indexTemplate = Join-Path $hubDir 'build\feed-index.html'
if (Test-Path $indexTemplate) {
  $indexHtml = Get-Content $indexTemplate -Raw -Encoding UTF8
  $indexHtml = $indexHtml -replace '__VERSION__', $version
  $indexHtml = $indexHtml -replace '__INSTALLER__', "ZAVIRO Hub Setup $version.exe"
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  [System.IO.File]::WriteAllText((Join-Path $dropDir 'index.html'), $indexHtml, $utf8NoBom)
}

# --- 4. Zu Netlify hochladen ---
# Wichtig: Das Logfile darf NICHT im Deploy-Ordner liegen – sonst aendert sich
# die Datei waehrend des Uploads und Netlify lehnt den Upload mit
# "422 no records matched" ab. Ausserdem wird kein Build ausgefuehrt
# (--no-build), weil die Dateien bereits fertig im Drop-Ordner liegen.
Write-Host ''
Write-Host 'Lade zu Netlify hoch (Auto-Update-Feed)...' -ForegroundColor Cyan
$netlifyIgnore = Join-Path $dropDir '.netlifyignore'
Set-Content -Path $netlifyIgnore -Value ".netlify`n*.log" -Encoding ASCII -NoNewline

$deployLog = Join-Path $hubDir 'netlify-deploy.log'
Push-Location $dropDir
try {
  netlify deploy --prod --dir . --no-build *>&1 | Tee-Object -FilePath $deployLog
  if ($LASTEXITCODE -ne 0) { throw "Netlify-Upload fehlgeschlagen (Exit $LASTEXITCODE)" }
} finally {
  Pop-Location
}

# --- 5. Pruefen, ob der Feed oeffentlich erreichbar ist ---
# Netlify setzt bei neuen Sites standardmaessig "Visitor access: require login".
# Abhilfe (einmalig, wenn der Feed 401 liefert):
#   $token = '<Netlify-Token>'
#   Invoke-RestMethod -Uri 'https://api.netlify.com/api/v1/sites/<site_id>' `
#     -Headers @{ Authorization = "Bearer $token" } -Method Patch `
#     -Body '{"sso_login_context":"non_production"}' -ContentType 'application/json'
Write-Host ''
Write-Host 'Pruefe, ob der Feed oeffentlich erreichbar ist...' -ForegroundColor Cyan
$feedUrl = 'https://zaviro-hub-update.netlify.app/latest.yml'
try {
  $response = Invoke-WebRequest -Uri $feedUrl -UseBasicParsing -TimeoutSec 60
  if ($response.StatusCode -eq 200) {
    $remoteHash = ([regex]::Match([System.Text.Encoding]::UTF8.GetString($response.Content), 'sha512:\s*(\S+)')).Groups[1].Value
    $localHash  = ([regex]::Match((Get-Content $latest -Raw), 'sha512:\s*(\S+)')).Groups[1].Value
    if ($remoteHash -eq $localHash) {
      Write-Host 'Feed OK - Pruefsumme stimmt.' -ForegroundColor Green
    } else {
      throw 'Feed erreichbar, aber Pruefsumme weicht ab (remote != local).'
    }
  } else {
    throw "Feed antwortet mit Status $($response.StatusCode)."
  }
} catch {
  Write-Host "FEHLER: $($_.Exception.Message)" -ForegroundColor Red
  Write-Host 'Hinweis: Der Feed ist nicht oeffentlich erreichbar (siehe Kommentar in diesem Skript).' -ForegroundColor Yellow
  throw
}

Write-Host ''
Write-Host '=== FERTIG ===' -ForegroundColor Green
Write-Host "Version:   $version"
Write-Host "Installer: $installer"
Write-Host 'Feed:      https://zaviro-hub-update.netlify.app/'
Write-Host ''
