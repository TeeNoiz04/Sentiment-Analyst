@echo off
REM Activate virtual environment and run FastAPI server
call venv\Scripts\activate.bat
uvicorn main:app --reload --host 0.0.0.0 --port 8000

