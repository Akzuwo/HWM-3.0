$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $PSScriptRoot

$backendEnv = @{
  HWM_DEBUG_MODE = "1"
}
$webEnv = @{
  VITE_API_BASE_URL = "http://localhost:5000"
}

Write-Host "Starting local HWM calendar debug backend on http://127.0.0.1:5000"
$backend = Start-Process -FilePath "powershell" -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location '$root'; `$env:HWM_DEBUG_MODE='$($backendEnv.HWM_DEBUG_MODE)'; python backend/app.py"
) -PassThru

Start-Sleep -Seconds 2

Write-Host "Starting Vite calendar debug frontend on http://127.0.0.1:5173"
$frontend = Start-Process -FilePath "powershell" -ArgumentList @(
  "-NoExit",
  "-Command",
  "Set-Location '$root'; `$env:VITE_API_BASE_URL='$($webEnv.VITE_API_BASE_URL)'; npm run dev -- --host 127.0.0.1"
) -PassThru

Write-Host ""
Write-Host "Calendar debug mode is ready when both windows finished booting:"
Write-Host "  http://127.0.0.1:5173/kalender.html?hm_debug=1"
Write-Host ""
Write-Host "Close the backend and frontend PowerShell windows to stop debug mode."
