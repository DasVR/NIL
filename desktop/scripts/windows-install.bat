@echo off
setlocal EnableDelayedExpansion

:: windows-install.bat — First-run helper for the Finn Windows app.
:: Checks for WebView2 Runtime and offers to download it if missing,
:: then launches Finn. No admin rights required for the app itself.

echo [Finn] Starting Finn Pentest Harness...

:: Check for WebView2 by looking for the runtime DLL registration.
reg query "HKLM\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" 2>nul >nul
if %errorlevel% == 0 (
    echo [Finn] WebView2 Runtime found.
    goto :launch
)

reg query "HKCU\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}" 2>nul >nul
if %errorlevel% == 0 (
    echo [Finn] WebView2 Runtime found (user install).
    goto :launch
)

echo [Finn] WebView2 Runtime not detected.
echo [Finn] Finn needs Microsoft Edge WebView2 to run its user interface.
echo [Finn] You can install it from: https://developer.microsoft.com/en-us/microsoft-edge/webview2/
echo [Finn] The installer will ask for admin rights only if you choose the machine-wide option.
echo.
choice /C YN /M "Open the WebView2 download page now"
if %errorlevel% == 1 (
    start "" "https://developer.microsoft.com/en-us/microsoft-edge/webview2/"
)
echo.
echo [Finn] After installing WebView2, run this shortcut again.
pause
exit /b 1

:launch
:: Check backend health before launching the UI.
curl -fsS --max-time 1 "http://127.0.0.1:8766/health" >nul 2>nul
if %errorlevel% == 0 (
    echo [Finn] Backend online.
) else (
    echo [Finn] Backend offline. Start it with: finn server
)

:: Start the Finn desktop binary from the same folder as this script.
set "FINN_DIR=%~dp0"
start "" "%FINN_DIR%Finn Pentest Harness.exe"
endlocal
exit /b 0
