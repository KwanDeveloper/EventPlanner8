$browserPidFile = Join-Path $env:TEMP "cen3031-teamproject-browser.pid"
$browserProfileDir = Join-Path $env:TEMP "cen3031-teamproject-browser-profile"
$chromePath = "C:\Program Files\Google\Chrome\Application\chrome.exe"
$edgePaths = @(
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)

Start-Sleep -Seconds 5

if (Test-Path $chromePath) {
  $browserProcess = Start-Process $chromePath -PassThru -ArgumentList @(
    "--user-data-dir=$browserProfileDir",
    "--no-first-run",
    "--new-window",
    "http://localhost:3000"
  )

  $browserProcess.Id | Set-Content $browserPidFile

  Start-Process powershell.exe -WindowStyle Hidden -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy",
    "Bypass",
    "-File",
    (Join-Path $PSScriptRoot "watch-browser.ps1"),
    "-BrowserPid",
    $browserProcess.Id
  )
} else {
  $edgePath = $edgePaths | Where-Object { Test-Path $_ } | Select-Object -First 1

  if ($edgePath) {
    $browserProcess = Start-Process $edgePath -PassThru -ArgumentList @(
      "--user-data-dir=$browserProfileDir",
      "--no-first-run",
      "--new-window",
      "http://localhost:3000"
    )

    $browserProcess.Id | Set-Content $browserPidFile

    Start-Process powershell.exe -WindowStyle Hidden -ArgumentList @(
      "-NoProfile",
      "-ExecutionPolicy",
      "Bypass",
      "-File",
      (Join-Path $PSScriptRoot "watch-browser.ps1"),
      "-BrowserPid",
      $browserProcess.Id
    )
  } else {
    Start-Process "http://localhost:3000"
  }
}
