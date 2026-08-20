@echo off
REM Launch Finn (API starts with the app). Looks in the usual install folders.
setlocal
set "EXE="
for %%D in (
  "%LOCALAPPDATA%\Finn Pentest Harness\Finn Pentest Harness.exe"
  "%LOCALAPPDATA%\Programs\Finn Pentest Harness\Finn Pentest Harness.exe"
  "%ProgramFiles%\Finn Pentest Harness\Finn Pentest Harness.exe"
  "%~dp0Finn Pentest Harness.exe"
) do (
  if exist %%~D (
    set "EXE=%%~D"
    goto :run
  )
)
echo Finn is not installed yet. Double-click Finn-Setup.exe first.
pause
exit /b 1

:run
start "" "%EXE%"
endlocal
