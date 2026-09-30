@echo off
echo Starting SmartCivic Backend (FastAPI)...
start "SmartCivic Backend" cmd /k "d:\Smart_Civic_Issue\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --app-dir backend --reload"

echo Starting SmartCivic Frontend (Vite + React)...
start "SmartCivic Frontend" cmd /k "cd frontend && npm run dev"

echo SmartCivic System Launched!
echo Frontend: http://localhost:5173
echo Backend API Docs: http://localhost:8000/docs
