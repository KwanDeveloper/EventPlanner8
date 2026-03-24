param(
  [Parameter(Mandatory = $true)]
  [int]$BrowserPid
)

$frontendPidFile = Join-Path $env:TEMP "cen3031-teamproject-frontend.pid"
$browserPidFile = Join-Path $env:TEMP "cen3031-teamproject-browser.pid"
$browserProfileDir = Join-Path $env:TEMP "cen3031-teamproject-browser-profile"

try {
  Wait-Process -Id $BrowserPid -ErrorAction Stop
} catch {
  exit 0
}

if (Test-Path $frontendPidFile) {
  $frontendPid = (Get-Content $frontendPidFile | Select-Object -First 1).Trim()
  if ($frontendPid -match "^\d+$") {
    taskkill /PID $frontendPid /T /F | Out-Null
  }
}

$backendListener = netstat -ano | Select-String "LISTENING" | Select-String ":8000"
if ($backendListener) {
  $backendPid = (($backendListener | Select-Object -First 1).ToString() -split "\s+")[-1]
  if ($backendPid -match "^\d+$") {
    taskkill /PID $backendPid /T /F | Out-Null
  }
}

Remove-Item $frontendPidFile -ErrorAction SilentlyContinue
Remove-Item $browserPidFile -ErrorAction SilentlyContinue
Remove-Item $browserProfileDir -Recurse -Force -ErrorAction SilentlyContinue
