@echo off
setlocal enabledelayedexpansion

REM run.bat — start the NIL static frontend on Windows
REM Serves the pre-built build\ directory via python http.server

cd /d "%~dp0"
if not exist "build\" (
  echo [NIL] build\ directory not found. Build first with:
  echo   cd frontend ^&^& npm install ^&^& npm run build
  exit /b 1
)

if "%1"=="" (
  set PORT=3000
) else (
  set PORT=%1
)

echo [NIL] serving build\ on http://localhost:%PORT%
python -m http.server %PORT% --directory "build"
