param()

$ErrorActionPreference = "Stop"

function Copy-BackendTree($Source, $Target) {
    $excludeDirs = @("data", "logs", "imports", "exports", "backups", "__pycache__", ".pytest_cache", ".venv", "venv", "tests")
    $excludeFiles = @("*.sqlite", "*.sqlite3", "*.db", "*.log", ".env", ".env.*", "create_missing_tables.py", "create_remaining_tables.py", "import_from_mysql_dump.py")

    New-Item -ItemType Directory -Force -Path $Target | Out-Null

    Get-ChildItem -LiteralPath $Source -Force | ForEach-Object {
        if ($_.PSIsContainer) {
            if ($excludeDirs -contains $_.Name) { return }
            Copy-BackendTree -Source $_.FullName -Target (Join-Path $Target $_.Name)
        } else {
            foreach ($pattern in $excludeFiles) {
                if ($_.Name -like $pattern) { return }
            }
            Copy-Item -LiteralPath $_.FullName -Destination (Join-Path $Target $_.Name) -Force
        }
    }
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$repoRoot = Resolve-Path (Join-Path $scriptDir "..")
$backendDir = Join-Path $repoRoot "apps\backend"
$controlDir = Join-Path $repoRoot "apps\control-center"
$resourcesDir = Join-Path $controlDir "resources"
$backendPython = Join-Path $resourcesDir "backend-python"
$backendExe = Join-Path $resourcesDir "backend-exe"
$builtBackendExe = Join-Path $backendExe "backend.exe"

Write-Host "Bereite Control-Center-Ressourcen vor..." -ForegroundColor Cyan

if (-not (Test-Path (Join-Path $backendDir "app.py"))) {
    throw "Backend app.py nicht gefunden: $backendDir"
}

if (Test-Path $backendPython) {
    Remove-Item -LiteralPath $backendPython -Recurse -Force
}
New-Item -ItemType Directory -Force -Path $backendPython, $backendExe | Out-Null

Copy-BackendTree -Source $backendDir -Target $backendPython

if (-not (Test-Path (Join-Path $backendPython "schema.sql"))) {
    throw "schema.sql fehlt nach dem Kopieren in $backendPython"
}

if (Test-Path $builtBackendExe) {
    Write-Host "backend.exe vorhanden: $builtBackendExe" -ForegroundColor Gray
} else {
    Write-Host "Keine backend.exe gefunden. Build ohne Exe-Modus-Ressource; Python-Modus bleibt verfuegbar." -ForegroundColor Yellow
}

Write-Host "Ressourcen bereit: $resourcesDir" -ForegroundColor Green
