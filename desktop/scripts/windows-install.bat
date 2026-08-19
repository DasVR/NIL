@echo off
setlocal
echo [Finn] Starting Finn Pentest Harness...
set "FINN_DIR=%~dp0"
if exist "%FINN_DIR%Finn Pentest Harness.exe" (
    start "" "%FINN_DIR%Finn Pentest Harness.exe"
    exit /b 0
)
echo [Finn] Open Finn from the Start Menu or the desktop shortcut named Finn.
echo [Finn] The API starts with the app — do not run a separate server.
pause
exit /b 1
