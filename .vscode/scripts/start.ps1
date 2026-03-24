$frontend = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot "..\..\src\frontend"))
$pidFile = Join-Path $env:TEMP "cen3031-teamproject-frontend.pid"

$listener = netstat -ano | Select-String "LISTENING" | Select-String ":3000"
if ($listener) {
  $existingPid = (($listener | Select-Object -First 1).ToString() -split "\s+")[-1]
  if ($existingPid -match "^\d+$") {
    taskkill /PID $existingPid /F | Out-Null
    Start-Sleep -Seconds 1
  }
}

$process = Start-Process powershell.exe -PassThru -WindowStyle Hidden -WorkingDirectory $frontend -ArgumentList @(
  "-NoProfile",
  "-ExecutionPolicy",
  "Bypass",
  "-Command",
  "$env:PORT='3000'; $env:BROWSER='none'; npm start"
)

$process.Id | Set-Content $pidFile

Start-Process powershell.exe -WindowStyle Hidden -ArgumentList @(
  "-NoProfile",
  "-ExecutionPolicy",
  "Bypass",
  "-File",
  (Join-Path $PSScriptRoot "open-browser.ps1")
)
