@echo off
REM Double-click this to open Finn Setup (progress wizard). Windows users should prefer the NSIS .exe.
cd /d "%~dp0"
where py >nul 2>&1 && (
  py -3 "%~dp0finn-setup.py"
  goto :eof
)
python "%~dp0finn-setup.py"
