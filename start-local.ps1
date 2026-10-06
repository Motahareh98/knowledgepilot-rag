$ErrorActionPreference = "Stop"
Write-Host "Starting KnowledgePilot RAG without Docker..."
Start-Process powershell -ArgumentList '-NoExit','-Command','cd ai-service; if (!(Test-Path .venv)) { python -m venv .venv }; .\.venv\Scripts\Activate.ps1; pip install -r requirements.txt; uvicorn main:app --reload --port 8000'
Start-Sleep -Seconds 2
Push-Location client
npm install
npm run build
Pop-Location
Start-Process powershell -ArgumentList '-NoExit','-Command','$env:AI_URL="http://localhost:8000"; cd server; npm install; npm start'
Start-Sleep -Seconds 3
Start-Process "http://localhost:5000"
