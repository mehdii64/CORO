@echo off
start cmd /k "cd /d %~dp0backend && .venv\Scripts\activate && uvicorn main:app --reload --port 8000"
start cmd /k "cd /d %~dp0frontend && npm run dev"
echo Serveur backend: http://localhost:8000
echo Serveur frontend: http://localhost:5173
