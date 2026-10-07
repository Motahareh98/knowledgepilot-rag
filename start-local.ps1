$ErrorActionPreference = "Stop"

$nodeDir = "C:\Program Files\nodejs"
$node = Join-Path $nodeDir "node.exe"
$npm = Join-Path $nodeDir "npm.cmd"

# Ensure npm child processes can resolve node.exe.
$env:Path = "$nodeDir;$env:Path"

if (!(Test-Path $node)) {
    throw "Node.js was not found at $nodeDir. Install Node.js LTS first."
}
if (!(Test-Path $npm)) {
    throw "npm was not found at $nodeDir."
}

Write-Host "Using Node.js from $nodeDir"
& $node --version
& $npm --version

Write-Host "Starting knowledgepilot-rag without Docker..."

$root = $PSScriptRoot

# Start the Python AI service in a separate PowerShell window.
$aiScript = Join-Path $root "start-ai-local.ps1"
Start-Process powershell -ArgumentList "-NoExit","-ExecutionPolicy","Bypass","-File",$aiScript

Start-Sleep -Seconds 3

# Build the React frontend.
Push-Location (Join-Path $root "client")
& $npm install
& $npm run build
Pop-Location

# Run the Node/Express web app in this terminal.
$env:AI_URL = "http://localhost:8001"
$env:PORT = "5001"
Push-Location (Join-Path $root "server")
& $npm install

Write-Host ""
Write-Host "Opening http://localhost:5001 ..."
Start-Process "http://localhost:5001"
& $npm start
Pop-Location
