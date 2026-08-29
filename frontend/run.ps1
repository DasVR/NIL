# run.ps1 — start the NIL static frontend on Windows
# Usage: .\run.ps1 [port]
# Serves the pre-built build/ directory via python http.server.

param(
    [int]$Port = 3000
)

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$buildDir = Join-Path $scriptDir "build"

if (-not (Test-Path $buildDir -PathType Container)) {
    Write-Host "[NIL] build/ directory not found. Build first with:" -ForegroundColor Red
    Write-Host "  cd frontend; npm install; npm run build"
    exit 1
}

Write-Host "[NIL] serving build/ on http://localhost:$Port"
python -m http.server $Port --directory $buildDir
