$ErrorActionPreference = "Stop"

$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$Port = 8000
$Url = "http://127.0.0.1:$Port"
$BundledPython = "C:\Users\KYH\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"

function Test-AppServer {
  try {
    $response = Invoke-WebRequest -UseBasicParsing -Uri $Url -TimeoutSec 1
    return $response.StatusCode -eq 200
  } catch {
    return $false
  }
}

function Resolve-Python {
  if (Test-Path $BundledPython) {
    return $BundledPython
  }

  $pythonCommand = Get-Command python -ErrorAction SilentlyContinue
  if ($pythonCommand) {
    return $pythonCommand.Source
  }

  $pyCommand = Get-Command py -ErrorAction SilentlyContinue
  if ($pyCommand) {
    return $pyCommand.Source
  }

  throw "Python 실행 파일을 찾을 수 없습니다."
}

function Resolve-Edge {
  $candidates = @(
    "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "$env:LocalAppData\Microsoft\Edge\Application\msedge.exe"
  )

  foreach ($candidate in $candidates) {
    if ($candidate -and (Test-Path $candidate)) {
      return $candidate
    }
  }

  return $null
}

if (-not (Test-AppServer)) {
  $python = Resolve-Python
  Start-Process -WindowStyle Hidden -FilePath $python -ArgumentList "-m http.server $Port --bind 127.0.0.1" -WorkingDirectory $Root

  for ($i = 0; $i -lt 20; $i++) {
    Start-Sleep -Milliseconds 250
    if (Test-AppServer) {
      break
    }
  }
}

$edge = Resolve-Edge
if ($edge) {
  Start-Process -FilePath $edge -ArgumentList "--app=$Url", "--new-window"
} else {
  Start-Process $Url
}
