param(
    [switch]$BuildBackendExe,
    [switch]$SkipBackendExe,
    [switch]$Clean,
    [switch]$OpenDist
)

$ErrorActionPreference = "Stop"

function Fail($Message) {
    Write-Host ""
    Write-Host "FEHLER: $Message" -ForegroundColor Red
    exit 1
}

Write-Host "Baue HWM Server Control Center..." -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$appDir = Join-Path $repoRoot "apps\control-center"
$packageJson = Join-Path $appDir "package.json"
$nodeModules = Join-Path $appDir "node_modules"
$distDir = Join-Path $appDir "dist"

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Fail "Node.js wurde nicht gefunden. Bitte Node.js installieren und PowerShell neu starten."
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Fail "npm wurde nicht gefunden. Bitte Node.js/npm installieren und PowerShell neu starten."
}

if (-not (Test-Path $packageJson)) {
    Fail "package.json nicht gefunden: $packageJson"
}

$package = Get-Content $packageJson -Raw | ConvertFrom-Json
$version = $package.version
Write-Host "Version: $version" -ForegroundColor Gray

if ($Clean) {
    Write-Host "Bereinige Control-Center-Buildartefakte..." -ForegroundColor Yellow
    foreach ($target in @($distDir, (Join-Path $appDir "dist-renderer"))) {
        if (Test-Path $target) { Remove-Item -LiteralPath $target -Recurse -Force }
    }
}

if ($BuildBackendExe -and -not $SkipBackendExe) {
    & (Join-Path $repoRoot "scripts\build_backend_exe.ps1")
    if (-not $?) { Fail "backend.exe Build ist fehlgeschlagen." }
}

& (Join-Path $repoRoot "scripts\prepare_control_center_resources.ps1")
if (-not $?) { Fail "Ressourcen-Vorbereitung ist fehlgeschlagen." }

Push-Location $appDir
try {

    if (-not (Test-Path $nodeModules)) {
        Write-Host "node_modules fehlt, fuehre npm install aus..." -ForegroundColor Yellow
        npm install
        if ($LASTEXITCODE -ne 0) {
            Fail "npm install ist fehlgeschlagen."
        }
    } else {
        Write-Host "node_modules gefunden, ueberspringe npm install." -ForegroundColor Gray
    }

    Write-Host "Starte Windows-Build..." -ForegroundColor Cyan
    npm run dist:win
    if ($LASTEXITCODE -ne 0) {
        Fail "npm run dist:win ist fehlgeschlagen."
    }
} finally {
    Pop-Location
}

$exe = Get-ChildItem -Path $distDir -Filter "*.exe" -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "*$version*.exe" } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1

if (-not $exe) {
    Fail "Build abgeschlossen, aber keine .exe mit Version $version in $distDir gefunden."
}

$relativeExe = Resolve-Path -Path $exe.FullName -Relative
Write-Host ""
Write-Host "Fertig: $relativeExe" -ForegroundColor Green

if ($OpenDist) {
    Invoke-Item $distDir
}
