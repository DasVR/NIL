@echo off
setlocal EnableDelayedExpansion

:: windows-build.bat — Build the Finn Windows installer on a Windows dev box.
:: Requires: Node, npm, Rust with target x86_64-pc-windows-msvc, Visual Studio Build Tools,
::           cargo-tauri (installed via cargo install tauri-cli --version ^2.0).

echo [Finn] Windows build starting...

:: Install JS deps for the web frontend and the desktop wrapper.
cd /d "%~dp0\.."
npm run setup
if %errorlevel% neq 0 (
    echo [Finn] npm setup failed.
    pause
    exit /b 1
)

:: Add Windows target if missing.
rustup target add x86_64-pc-windows-msvc

:: Build the installer. Uses NSIS by default (per-user, no admin).
npm run build:windows
if %errorlevel% neq 0 (
    echo [Finn] Tauri Windows build failed.
    pause
    exit /b 1
)

echo.
echo [Finn] Build complete. Outputs:
dir "src-tauri\target\x86_64-pc-windows-msvc\release\bundle\nsis\*.exe" 2>nul
dir "src-tauri\target\x86_64-pc-windows-msvc\release\bundle\msi\*.msi" 2>nul
pause
