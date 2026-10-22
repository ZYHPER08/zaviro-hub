# ZAVIRO Hub - Build & Auto-Update-Feed veroeffentlichen
#
# 1. Version aus package.json lesen
# 2. npm run dist (Installer + Portable bauen)
# 3. Installer/Blockmap als GitHub-Release veroeffentlichen (primärer Feed)
# 4. latest.yml + Startseite ins Feed-Repo (GitHub Pages) schreiben
# 5. optional zu Netlify spiegeln (sekundärer Feed / Fallback)
# 6. beide Feeds pruefen
#
# Voraussetzungen: gh CLI angemeldet (gh auth status), GitHub Pages fuer
# das Repo ZYHPER08/zaviro-hub-feed aktiv (Pfad /docs).
$ErrorActionPreference = 'Stop'

$hubDir   = 'E:\ZAVIRO Hub'
$dropDir  = Join-Path $hubDir 'netlify-drop'
$feedRepo = 'ZYHPER08/zaviro-hub-feed'
$pagesUrl = 'https://zyhper08.github.io/zaviro-hub-feed/'
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

function Write-Step([string]$text) { Write-Host ''; Write-Host $text -ForegroundColor Cyan }
function Get-AssetName([string]$displayName) {
  # gh ersetzt Leerzeichen in Asset-Namen durch Punkte.
  return ($displayName -replace ' ', '.')
}

Write-Host ''
Write-Host '=== ZAVIRO Hub Update veroeffentlichen ===' -ForegroundColor Cyan

# --- 1. Version lesen ---
$pkg = Get-Content (Join-Path $hubDir 'package.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$version = $pkg.version
Write-Host "Version: $version" -ForegroundColor Yellow

# --- 2. Bauen ---
Write-Step 'Baue Installer (npm run dist)...'
$buildLog = Join-Path $hubDir 'publish-build.log'
Push-Location $hubDir
try {
  # Hinweis: Ausgabe ueber cmd umleiten. Sonst bricht PowerShell 5.1 bei
  # stderr-Ausgaben (z. B. Vite-Warnungen) wegen ErrorActionPreference=Stop ab.
  cmd /c "npm run dist > `"$buildLog`" 2>&1"
  if ($LASTEXITCODE -ne 0) {
    Get-Content $buildLog -Tail 30 | Write-Host
    throw "npm run dist fehlgeschlagen (Exit $LASTEXITCODE)"
  }
  Get-Content $buildLog -Tail 5 | Write-Host
} finally {
  Pop-Location
}

$installer = Join-Path $hubDir "dist\ZAVIRO Hub Setup $version.exe"
$portable  = Join-Path $hubDir "dist\ZAVIRO $version.exe"
if (-not (Test-Path $portable)) { $portable = Join-Path $hubDir "dist\ZAVIRO Hub $version.exe" }
$blockmap  = "$installer.blockmap"
$latest    = Join-Path $hubDir 'dist\latest.yml'

foreach ($f in @($installer, $portable, $blockmap, $latest)) {
  if (-not (Test-Path $f)) { throw "Build-Artefakt fehlt: $f" }
}

$latestText = Get-Content $latest -Raw -Encoding UTF8
$sha512 = ([regex]::Match($latestText, 'sha512:\s*(\S+)')).Groups[1].Value
$size   = ([regex]::Match($latestText, 'size:\s*(\d+)')).Groups[1].Value

# --- 3. GitHub-Release anlegen/ersetzen ---
Write-Step "Veroeffentliche Release v$version im Repo $feedRepo ..."
$tag = "v$version"
$exists = $false
try { gh release view $tag --repo $feedRepo --json tagName *> $null; $exists = $true } catch { $exists = $false }

if ($exists) {
  gh release upload $tag $installer $blockmap --repo $feedRepo --clobber | Out-Null
  Write-Host "Release $tag aktualisiert." -ForegroundColor Green
} else {
  gh release create $tag $installer $blockmap --repo $feedRepo --title "ZAVIRO Hub $version" --notes "Update-Paket des ZAVIRO Hub." | Out-Null
  Write-Host "Release $tag angelegt." -ForegroundColor Green
}

$assets = (gh release view $tag --repo $feedRepo --json assets | ConvertFrom-Json).assets
$exeAsset = $assets | Where-Object { $_.name -like '*.exe' } | Select-Object -First 1
if (-not $exeAsset) { throw 'Kein Installer-Asset im Release gefunden.' }
$assetUrl = $exeAsset.url
Write-Host "Installer-Asset: $($exeAsset.name) ($($exeAsset.size) Bytes)"

# --- 4. Feed-Dateien nach GitHub Pages schreiben ---
Write-Step 'Schreibe latest.yml und Startseite nach GitHub Pages ...'
$feedYml = @"
version: $version
files:
  - url: $assetUrl
    sha512: $sha512
    size: $size
path: $assetUrl
sha512: $sha512
releaseDate: '$((Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH:mm:ss.fffZ'))'
"@

function Write-GithubFile([string]$path, [string]$content, [string]$message) {
  $existing = gh api "repos/$feedRepo/contents/$path" --jq '.sha' 2>$null
  $args = @("repos/$feedRepo/contents/$path", '-X', 'PUT', '-f', "message=$message")
  if ($existing) { $args += @('-f', "sha=$existing") }
  $args += @('-f', "content=$([Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($content)))")
  gh api @args *> $null
}

Write-GithubFile 'docs/latest.yml' $feedYml "Update-Feed auf Version $version"

$indexTemplate = Join-Path $hubDir 'build\feed-index.html'
if (Test-Path $indexTemplate) {
  $html = Get-Content $indexTemplate -Raw -Encoding UTF8
  $html = $html -replace '__VERSION__', $version
  $html = $html -replace '__INSTALLER__', $exeAsset.name
  $html = $html -replace '__SHA512__', $sha512
  $html = $html -replace '__SIZE__', $size
  $html = $html -replace '__URL__', $assetUrl
  Write-GithubFile 'docs/index.html' $html "Feed-Startseite auf Version $version aktualisieren"
}

# --- 5. Zu Netlify spiegeln (Fallback-Feed, optional) ---
Write-Step 'Spiegele zu Netlify (Fallback-Feed)...'
if (-not (Test-Path $dropDir)) { New-Item -ItemType Directory -Path $dropDir | Out-Null }
Get-ChildItem $dropDir -Filter 'ZAVIRO Hub Setup *.exe'        | Remove-Item -Force -ErrorAction SilentlyContinue
Get-ChildItem $dropDir -Filter 'ZAVIRO Hub Setup *.exe.blockmap' | Remove-Item -Force -ErrorAction SilentlyContinue
Copy-Item $installer $dropDir -Force
Copy-Item $blockmap  $dropDir -Force
Copy-Item $latest    $dropDir -Force
Set-Content -Path (Join-Path $dropDir '.netlifyignore') -Value ".netlify`n*.log" -Encoding ASCII -NoNewline

# Wichtig: Das Logfile darf NICHT im Deploy-Ordner liegen, sonst aendert sich
# die Datei waehrend des Uploads und Netlify lehnt den Upload ab.
$netlifyOk = $false
$netlifyLog = Join-Path $hubDir 'netlify-deploy.log'
Push-Location $dropDir
try {
  cmd /c "netlify deploy --prod --dir . --no-build > `"$netlifyLog`" 2>&1"
  $netlifyOk = ($LASTEXITCODE -eq 0)
  if (-not $netlifyOk) { Get-Content $netlifyLog -Tail 12 | Write-Host }
} catch {
  $netlifyOk = $false
} finally {
  Pop-Location
}
if ($netlifyOk) {
  Write-Host 'Netlify-Spiegel aktualisiert.' -ForegroundColor Green
} else {
  Write-Host 'Netlify-Spiegel fehlgeschlagen (Kontolimit o. ae.) - GitHub Pages bleibt der Primaer-Feed.' -ForegroundColor Yellow
}

# --- 6. Feed pruefen ---
Write-Step 'Pruefe den Feed ...'
$localHash = $sha512
$ok = $false
for ($i = 1; $i -le 30; $i++) {
  try {
    $response = Invoke-WebRequest -Uri "$pagesUrl/latest.yml" -UseBasicParsing -TimeoutSec 60
    $remoteHash = ([regex]::Match([string]$response.Content, 'sha512:\s*(\S+)')).Groups[1].Value
    $remoteVersion = ([regex]::Match([string]$response.Content, 'version:\s*(\S+)')).Groups[1].Value
    if ($remoteHash -eq $localHash -and $remoteVersion -eq $version) { $ok = $true; break }
    Write-Host "  GitHub Pages liefert noch $remoteVersion (Versuch $i)..."
  } catch {
    Write-Host "  GitHub Pages noch nicht erreichbar (Versuch $i)..."
  }
  Start-Sleep -Seconds 20
}
if (-not $ok) { throw "Feed auf GitHub Pages nicht aktualisiert: $pagesUrl" }
Write-Host "Feed OK: $pagesUrl (Version $version, Pruefsumme stimmt)." -ForegroundColor Green

if ($netlifyOk) {
  try {
    $response = Invoke-WebRequest -Uri 'https://zaviro-hub-update.netlify.app/latest.yml' -UseBasicParsing -TimeoutSec 60
    $remoteHash = ([regex]::Match([string]$response.Content, 'sha512:\s*(\S+)')).Groups[1].Value
    if ($remoteHash -eq $localHash) {
      Write-Host 'Netlify-Feed OK (Fallback).' -ForegroundColor Green
    } else {
      Write-Host 'Netlify-Feed erreichbar, aber Pruefsumme weicht ab.' -ForegroundColor Yellow
    }
  } catch {
    Write-Host "Netlify-Feed nicht erreichbar: $($_.Exception.Message)" -ForegroundColor Yellow
  }
}

Write-Host ''
Write-Host '=== FERTIG ===' -ForegroundColor Green
Write-Host "Version:   $version"
Write-Host "Installer: $installer"
Write-Host "Feed:      $pagesUrl"
Write-Host ''
