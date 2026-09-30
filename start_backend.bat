@echo off
echo Starting SmartCivic Backend on http://127.0.0.1:8000
d:\Smart_Civic_Issue\venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000 --app-dir backend --reload
