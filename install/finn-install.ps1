# Finn one-file installer (Windows).
#   User (default): no admin, host sandbox, files under $HOME.
#   Admin: Program Files + optional Docker.
#   Online (default): GitHub Releases. Offline: files next to this script.
param(
  [switch]$User,
  [switch]$Admin,
  [switch]$Online,
  [switch]$Offline,
  [switch]$HostSandbox,
  [switch]$Docker,
  [switch]$AcceptDockerTos,
  [switch]$PrintDockerTos,
  [switch]$FromSource,
  [string]$Tag = "latest"
)

$ErrorActionPreference = "Stop"
$Repo = if ($env:FINN_REPO) { $env:FINN_REPO } else { "DasVR/finn-pentest-harness" }
$Mode = if ($Admin) { "admin" } else { "user" }
$Channel = if ($Offline) { "offline" } else { "online" }
$Sandbox = if ($Docker) { "docker" } else { "host" }

$DockerTos = @"
Docker sandbox terms

Finn can run approved commands inside a Docker container on this computer. That uses your machine as the sandbox host.
Docker Desktop typically requires administrator rights to install.
Isolation is engagement separation, not a hypervisor jail.
"@

if ($PrintDockerTos) {
  Write-Output $DockerTos
  exit 0
}
if ($Sandbox -eq "docker" -and -not $AcceptDockerTos) {
  Write-Error "Docker sandbox requires -AcceptDockerTos. Read it with -PrintDockerTos."
}

$Here = Split-Path -Parent $MyInvocation.MyCommand.Path
if ($Mode -eq "user") {
  $Prefix = Join-Path $env:LOCALAPPDATA "Finn"
  $Venv = Join-Path $env:USERPROFILE ".finn-pentest\venv"
} else {
  $Prefix = Join-Path ${env:ProgramFiles} "Finn"
  $Venv = Join-Path $Prefix "venv"
}

function Get-Python {
  foreach ($cmd in @("py", "python", "python3")) {
    try {
      $v = & $cmd -c "import sys; print(sys.version_info >= (3,11))"
      if ($v -match "True") { return $cmd }
    } catch { }
  }
  throw "Python 3.11+ is required."
}

function Get-AssetUrl([string]$Needle) {
  if ($Tag -eq "latest") {
    $api = "https://api.github.com/repos/$Repo/releases/latest"
  } else {
    $api = "https://api.github.com/repos/$Repo/releases/tags/$Tag"
  }
  $rel = Invoke-RestMethod -Uri $api -Headers @{ "User-Agent" = "finn-install" }
  $asset = $rel.assets | Where-Object { $_.name.ToLower().Contains($Needle.ToLower()) } | Select-Object -First 1
  if (-not $asset) { throw "No GitHub asset matching $Needle" }
  return $asset.browser_download_url
}

Write-Host "==> Finn installer  mode=$Mode channel=$Channel sandbox=$Sandbox"
New-Item -ItemType Directory -Force -Path $Prefix | Out-Null
$py = Get-Python

$apiSrc = $Here
if (Test-Path (Join-Path $Here "api")) { $apiSrc = Join-Path $Here "api" }
elseif (Test-Path (Join-Path $Here "..\finn_pentest")) { $apiSrc = (Resolve-Path (Join-Path $Here "..")).Path }
if (Test-Path (Join-Path $apiSrc "finn_pentest")) {
  Copy-Item -Recurse -Force (Join-Path $apiSrc "finn_pentest") $Prefix
}
if (Test-Path (Join-Path $apiSrc "pyproject.toml")) {
  Copy-Item -Force (Join-Path $apiSrc "pyproject.toml") (Join-Path $Prefix "pyproject.toml")
}
if (Test-Path (Join-Path $apiSrc "prompts")) {
  Copy-Item -Recurse -Force (Join-Path $apiSrc "prompts") (Join-Path $Prefix "prompts")
}
if (Test-Path (Join-Path $Here "run-api.py")) {
  Copy-Item -Force (Join-Path $Here "run-api.py") (Join-Path $Prefix "run-api.py")
}
if (Test-Path (Join-Path $apiSrc "run-api.py")) {
  Copy-Item -Force (Join-Path $apiSrc "run-api.py") (Join-Path $Prefix "run-api.py")
}
if ($Channel -eq "online") {
  try {
    $wheel = Get-AssetUrl ".whl"
    Invoke-WebRequest -Uri $wheel -OutFile (Join-Path $Prefix "finn-pentest.whl")
  } catch {
    Write-Host "No wheel on this release; will pip-install from source tree if present."
  }
  try {
    $exe = Get-AssetUrl "windows"
    $setup = Join-Path $env:TEMP "finn-setup.exe"
    Invoke-WebRequest -Uri $exe -OutFile $setup
    if ($Mode -eq "admin") {
      Start-Process $setup -Verb RunAs -Wait
    } else {
      Start-Process $setup -Wait
    }
  } catch {
    Write-Host "No Windows desktop asset downloaded (ok if you only want the API)."
  }
}

$env:FINN_API_ROOT = $Prefix
$env:FINN_VENV = $Venv
& $py (Join-Path $Prefix "run-api.py") --check

$runtimeDir = Join-Path $env:USERPROFILE ".finn-pentest"
New-Item -ItemType Directory -Force -Path $runtimeDir | Out-Null
$runtime = @{
  schema = 1
  setup_complete = $true
  variant = "bundled"
  privilege = $Mode
  channel = $Channel
  sandbox = $Sandbox
  features = @{ ai = $true; tui = $true; bundled_api = $true; docker = ($Sandbox -eq "docker") }
  docker_tos_accepted = ($Sandbox -eq "docker" -and $AcceptDockerTos)
  docker_tos_accepted_at = if ($Sandbox -eq "docker" -and $AcceptDockerTos) { (Get-Date).ToUniversalTime().ToString("o") } else { $null }
}
$runtime | ConvertTo-Json | Set-Content (Join-Path $runtimeDir "runtime.json")
Write-Host "==> Done. Open Finn — the API starts with the app."
if ($Mode -eq "admin") {
  Write-Host "    Launch Finn as a normal user after this install."
}
