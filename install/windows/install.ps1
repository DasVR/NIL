# Finn Setup (Windows). Double-click the NSIS .exe for a native progress installer.
# This script is the same engine in CLI form, and can open the GUI if Tk is present.
param(
  [switch]$User,
  [switch]$Admin,
  [switch]$Online,
  [switch]$Offline,
  [switch]$HostSandbox,
  [switch]$Docker,
  [switch]$AcceptDockerTos,
  [switch]$PrintDockerTos,
  [switch]$Cli,
  [string]$Tag = "latest"
)

$ErrorActionPreference = "Stop"
$WindowsDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$Here = Split-Path -Parent $WindowsDir
$py = $null
foreach ($cmd in @("py", "python", "python3")) {
  try {
    $v = & $cmd -c "import sys; print(int(sys.version_info >= (3,11)))" 2>$null
    if ($v -eq "1") { $py = $cmd; break }
  } catch { }
}
if (-not $py) { throw "Python 3.11+ is required for Finn Setup." }

$argv = @()
if ($Cli -or $PrintDockerTos -or $User -or $Admin -or $Online -or $Offline -or $HostSandbox -or $Docker) {
  $argv += "--cli"
}
if ($User) { $argv += "--user" }
if ($Admin) { $argv += "--admin" }
if ($Online) { $argv += "--online" }
if ($Offline) { $argv += "--offline" }
if ($HostSandbox) { $argv += "--host" }
if ($Docker) { $argv += "--docker" }
if ($AcceptDockerTos) { $argv += "--accept-docker-tos" }
if ($PrintDockerTos) { $argv += "--print-docker-tos" }
if ($Tag) { $argv += "--tag"; $argv += $Tag }

& $py (Join-Path $Here "wizard.py") @argv
