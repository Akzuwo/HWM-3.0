param(
    [switch]$UseVenv
)

$ErrorActionPreference = "Stop"

function Fail($Message) {
    Write-Host "FEHLER: $Message" -ForegroundColor Red
    exit 1
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$backendDir = Join-Path $repoRoot "apps\backend"
$outDir = Join-Path $repoRoot "apps\control-center\resources\backend-exe"
$entry = Join-Path $backendDir "run_local_server.py"
$schema = Join-Path $backendDir "schema.sql"

Write-Host "Baue HWM backend.exe..." -ForegroundColor Cyan

if (-not (Test-Path $entry)) { Fail "run_local_server.py fehlt: $entry" }
if (-not (Test-Path $schema)) { Fail "schema.sql fehlt: $schema" }
if (-not (Get-Command py -ErrorAction SilentlyContinue) -and -not (Get-Command python -ErrorAction SilentlyContinue)) {
    Fail "Python wurde nicht gefunden."
}

$python = "python"
if (Get-Command py -ErrorAction SilentlyContinue) { $python = "py -3" }

Push-Location $backendDir
try {
    if ($UseVenv) {
        if (-not (Test-Path ".venv")) {
            Invoke-Expression "$python -m venv .venv"
        }
        $venvPython = Join-Path $backendDir ".venv\Scripts\python.exe"
        $python = "`"$venvPython`""
    }

    Invoke-Expression "$python -m pip install -r requirements.txt"
    if ($LASTEXITCODE -ne 0) { Fail "requirements Installation fehlgeschlagen." }

    Invoke-Expression "$python -m pip install pyinstaller"
    if ($LASTEXITCODE -ne 0) { Fail "PyInstaller Installation fehlgeschlagen." }

    $addData = "schema.sql;."
    Invoke-Expression "$python -m PyInstaller --clean --onefile --name backend --add-data `"$addData`" run_local_server.py"
    if ($LASTEXITCODE -ne 0) { Fail "PyInstaller Build fehlgeschlagen." }
} finally {
    Pop-Location
}

New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$sourceExe = Join-Path $backendDir "dist\backend.exe"
$targetExe = Join-Path $outDir "backend.exe"
for ($attempt = 1; $attempt -le 10; $attempt++) {
    try {
        Copy-Item -LiteralPath $sourceExe -Destination $targetExe -Force
        break
    } catch {
        if ($attempt -eq 10) { throw }
        Start-Sleep -Milliseconds 500
    }
}
Write-Host "Fertig: apps\control-center\resources\backend-exe\backend.exe" -ForegroundColor Green
