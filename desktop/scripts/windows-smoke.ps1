<#
.SYNOPSIS
  Windows smoke for the NIL Tauri shell (desktop/). Runs on windows-latest after
  `npm --prefix desktop run tauri -- build --bundles nsis,msi`.

.DESCRIPTION
  Phases (run one per CI step so each gets its own timeout and log):
    launch  Launch the unpackaged NIL.exe; it must stay alive and own a top-level
            window for -HoldSeconds, then it is stopped.
    nsis    Verify the NSIS installer, install silently (per-user, no UAC), launch the
            installed exe, uninstall silently, assert removal.
    msi     Verify the MSI, install silently (per-machine; the runner is elevated),
            launch the installed exe, uninstall silently, assert removal.
    all     launch, nsis, msi in sequence.

  What this proves: the shell links, WebView2 initializes, the frameless window is
  created, and both installers lay files down and remove them. What it cannot prove
  (needs a human on a real Windows session): rendering, dark theme, DPI scale
  changes, titlebar drag/controls, keyboard shortcuts, terminal PTY.

  Every external wait has a hard timeout so a stuck installer fails the step with a
  process listing instead of hanging until the job timeout.
#>
[CmdletBinding()]
param(
  [ValidateSet('launch', 'nsis', 'msi', 'all')]
  [string]$Phase = 'all',
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path,
  [int]$HoldSeconds = 12,
  [int]$InstallTimeoutSeconds = 300
)

$ErrorActionPreference = 'Stop'
$Desktop = Join-Path $Root 'desktop'
$TauriConf = Get-Content (Join-Path $Desktop 'src-tauri\tauri.conf.json') -Raw | ConvertFrom-Json
$ProductName = $TauriConf.productName
# Tauri's bundler uses bundle.publisher as the NSIS Publisher / MSI Manufacturer, falling
# back to the second segment of the identifier (dev.nil.workstation -> "nil").
$Publisher = $TauriConf.bundle.publisher
if (-not $Publisher) { $Publisher = ($TauriConf.identifier -split '\.')[1] }
# Both installers record their install dir here; the WiX template seeds INSTALLDIR from it.
$InstallDirKey = "HKCU:\Software\$Publisher\$ProductName"
$Release = Join-Path $Desktop 'src-tauri\target\release'
# The unpackaged binary carries the Cargo package name; installers rename it to <productName>.exe.
$CargoToml = Get-Content (Join-Path $Desktop 'src-tauri\Cargo.toml') -Raw
$CrateName = [regex]::Match($CargoToml, '(?ms)^\[package\].*?^name\s*=\s*"([^"]+)"').Groups[1].Value
if (-not $CrateName) { throw 'Could not read [package].name from desktop/src-tauri/Cargo.toml' }
$ExeName = "$CrateName.exe"
$Bundle = Join-Path $Release 'bundle'

function Log([string]$Message) { Write-Host ("[{0:HH:mm:ss}] {1}" -f (Get-Date), $Message) }
function Step([string]$Message) { Write-Host ''; Log "== $Message" }

function Dump-Processes {
  Log 'process snapshot (NIL / WebView2 / installers):'
  Get-Process -ErrorAction SilentlyContinue |
    Where-Object { $_.ProcessName -in @($ProductName, $CrateName, 'msedgewebview2', 'msiexec', 'uninstall', 'MicrosoftEdgeWebview2Setup') -or $_.ProcessName -like '*Setup*' } |
    Select-Object Id, ProcessName, MainWindowTitle, StartTime |
    Format-Table -AutoSize | Out-String | Write-Host
}

function Fail([string]$Message) {
  Log "FAIL: $Message"
  Dump-Processes
  exit 1
}

function Stop-AppProcesses {
  Get-Process -Name $ProductName, $CrateName -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
}

function Get-WebView2Version {
  $keys = @(
    'HKLM:\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}',
    'HKLM:\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}',
    'HKCU:\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}'
  )
  foreach ($key in $keys) {
    $pv = (Get-ItemProperty -Path $key -Name pv -ErrorAction SilentlyContinue).pv
    if ($pv) { return $pv }
  }
  return $null
}

function Invoke-WithTimeout([string]$FilePath, [string[]]$Arguments, [int]$Seconds, [string]$Label) {
  Log "$Label -> $FilePath $($Arguments -join ' ')"
  $proc = Start-Process -FilePath $FilePath -ArgumentList $Arguments -PassThru
  if (-not $proc.WaitForExit($Seconds * 1000)) {
    Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
    Fail "$Label did not finish within ${Seconds}s"
  }
  Log "$Label exited $($proc.ExitCode)"
  return $proc.ExitCode
}

function Wait-ForProcessWindow([System.Diagnostics.Process]$Process, [int]$Seconds) {
  $deadline = (Get-Date).AddSeconds($Seconds)
  $sawWindow = $false
  while ((Get-Date) -lt $deadline) {
    Start-Sleep -Milliseconds 500
    if ($Process.HasExited) {
      Fail "$($Process.ProcessName) exited early with code $($Process.ExitCode)."
    }
    $Process.Refresh()
    if ($Process.MainWindowHandle -ne [IntPtr]::Zero) { $sawWindow = $true }
  }
  if (-not $sawWindow) {
    Fail "$($Process.ProcessName) stayed alive for ${Seconds}s but never created a top-level window."
  }
  Log "alive for ${Seconds}s, window handle present, title='$($Process.MainWindowTitle)'"
}

function Assert-Launches([string]$ExePath, [string]$Label) {
  if (-not (Test-Path $ExePath)) { Fail "$Label not found at $ExePath" }
  Log "launching ${Label}: $ExePath"
  $proc = Start-Process -FilePath $ExePath -PassThru
  try {
    Wait-ForProcessWindow -Process $proc -Seconds $HoldSeconds
  } finally {
    if (-not $proc.HasExited) { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue }
    Stop-AppProcesses
  }
}

function Assert-Installer([string]$Pattern, [string]$Label) {
  $file = Get-ChildItem -Path $Pattern -ErrorAction SilentlyContinue | Select-Object -First 1
  if (-not $file) { Fail "$Label not produced (looked for $Pattern)" }
  if ($file.Length -lt 1MB) { Fail "$Label is suspiciously small: $($file.Length) bytes" }
  Log "$Label -> $($file.FullName) ($([math]::Round($file.Length / 1MB, 1)) MB)"
  return $file.FullName
}

function Phase-Launch {
  Step 'Environment'
  $wv2 = Get-WebView2Version
  if ($wv2) { Log "WebView2 runtime $wv2" } else { Log 'WebView2 runtime NOT registered; the shell will fail to create its webview until an installer bootstraps it.' }
  Log "OS $([System.Environment]::OSVersion.VersionString)"

  Step 'Unpackaged binary launches and stays up'
  Assert-Launches -ExePath (Join-Path $Release $ExeName) -Label 'release exe'
}

function Phase-Nsis {
  Step 'NSIS installer exists'
  $nsis = Assert-Installer -Pattern (Join-Path $Bundle 'nsis\*.exe') -Label 'NSIS installer'

  Step 'NSIS silent install (per-user), launch, uninstall'
  $nsisDir = Join-Path $env:LOCALAPPDATA $ProductName
  Stop-AppProcesses
  $code = Invoke-WithTimeout -FilePath $nsis -Arguments @('/S') -Seconds $InstallTimeoutSeconds -Label 'NSIS install'
  if ($code -ne 0) { Fail "NSIS installer exited with $code" }
  Log "WebView2 runtime after install: $(Get-WebView2Version)"
  Assert-Launches -ExePath (Join-Path $nsisDir $ExeName) -Label 'NSIS-installed exe'

  $uninstaller = Join-Path $nsisDir 'uninstall.exe'
  if (-not (Test-Path $uninstaller)) { Fail "NSIS uninstaller missing at $uninstaller" }
  # NSIS uninstallers copy themselves to %TEMP% and return immediately; _?= keeps it in place so the wait is real.
  $code = Invoke-WithTimeout -FilePath $uninstaller -Arguments @('/S', "_?=$nsisDir") -Seconds $InstallTimeoutSeconds -Label 'NSIS uninstall'
  if ($code -ne 0) { Fail "NSIS uninstaller exited with $code" }
  if (Test-Path (Join-Path $nsisDir $ExeName)) { Fail 'NSIS uninstall left the exe behind' }
  Log 'NSIS install/uninstall round-trip ok'
}

function Dump-MsiState([string]$MsiLog) {
  $identity = [Security.Principal.WindowsIdentity]::GetCurrent()
  $isAdmin = ([Security.Principal.WindowsPrincipal]$identity).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
  Log "running as $($identity.Name), elevated=$isAdmin"
  if (Test-Path $MsiLog) {
    Log "tail of $MsiLog"
    Get-Content $MsiLog -Tail 120 | Write-Host
  }
  Log 'Program Files entries matching NIL:'
  Get-ChildItem -Path $env:ProgramFiles, ${env:ProgramFiles(x86)} -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "*$ProductName*" } | Select-Object -ExpandProperty FullName | Write-Host
  Log 'Uninstall registry entries matching NIL:'
  Get-ChildItem 'HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall', 'HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall', 'HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall' -ErrorAction SilentlyContinue |
    ForEach-Object { Get-ItemProperty $_.PSPath -ErrorAction SilentlyContinue } |
    Where-Object { $_.DisplayName -like "*$ProductName*" } |
    Select-Object DisplayName, DisplayVersion, InstallLocation, UninstallString | Format-List | Out-String | Write-Host
}

function Find-MsiInstallDir {
  $fromRegistry = (Get-ItemProperty -Path $InstallDirKey -Name InstallDir -ErrorAction SilentlyContinue).InstallDir
  if ($fromRegistry -and (Test-Path $fromRegistry)) { return $fromRegistry }
  foreach ($root in @($env:ProgramFiles, ${env:ProgramFiles(x86)})) {
    $candidate = Join-Path $root $ProductName
    if (Test-Path (Join-Path $candidate $ExeName)) { return $candidate }
  }
  return $null
}

function Phase-Msi {
  Step 'MSI installer exists'
  $msi = Assert-Installer -Pattern (Join-Path $Bundle 'msi\*.msi') -Label 'MSI installer'

  Step 'MSI silent install (per-machine), launch, uninstall'
  $msiLog = Join-Path $env:TEMP 'nil-msi-install.log'
  Stop-AppProcesses
  # A prior NSIS install (or its uninstaller's leftover key) would redirect the MSI into
  # %LOCALAPPDATA%; clear it so this phase tests the MSI's own Program Files default.
  if (Test-Path $InstallDirKey) {
    Log "removing leftover $InstallDirKey so the MSI uses its default INSTALLDIR"
    Remove-Item -Path $InstallDirKey -Recurse -Force
  }
  $code = Invoke-WithTimeout -FilePath 'msiexec.exe' -Arguments @('/i', "`"$msi`"", '/qn', '/norestart', '/l*v', "`"$msiLog`"") -Seconds $InstallTimeoutSeconds -Label 'msiexec /i'
  if ($code -ne 0) {
    Dump-MsiState -MsiLog $msiLog
    Fail "msiexec /i exited with $code"
  }
  $installDir = Find-MsiInstallDir
  if (-not $installDir) {
    Dump-MsiState -MsiLog $msiLog
    Fail "msiexec /i exited 0 but no $ProductName install directory was found"
  }
  Log "MSI install dir: $installDir"
  $msiExe = Join-Path $installDir $ExeName
  Assert-Launches -ExePath $msiExe -Label 'MSI-installed exe'

  $code = Invoke-WithTimeout -FilePath 'msiexec.exe' -Arguments @('/x', "`"$msi`"", '/qn', '/norestart') -Seconds $InstallTimeoutSeconds -Label 'msiexec /x'
  if ($code -ne 0) { Fail "msiexec /x exited with $code" }
  if (Test-Path $msiExe) { Fail 'MSI uninstall left the exe behind' }
  Log 'MSI install/uninstall round-trip ok'
}

switch ($Phase) {
  'launch' { Phase-Launch }
  'nsis' { Phase-Nsis }
  'msi' { Phase-Msi }
  'all' { Phase-Launch; Phase-Nsis; Phase-Msi }
}

Write-Host ''
Log "Windows smoke phase '$Phase' passed."
