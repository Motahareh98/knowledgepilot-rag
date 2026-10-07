$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location (Join-Path $root "ai-service")

if (!(Test-Path ".venv")) {
    python -m venv .venv
}

& ".\.venv\Scripts\python.exe" -m pip install -r requirements.txt
& ".\.venv\Scripts\python.exe" -m uvicorn main:app --reload --port 8001
