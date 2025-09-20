@echo off
setlocal ENABLEDELAYEDEXPANSION

REM Ensure we are at repo root; if script was run from elsewhere, cd to script dir then to backend
pushd %~dp0
cd backend

REM Activate virtual environment (batch requires 'call'). If missing, create it with the system Python.
if not exist venv (
	echo [setup] Creating Python venv in %cd%\venv ...
	py -3 -m venv venv || (
		echo [error] Failed to create venv. Ensure Python is installed and on PATH.
		goto :end
	)
)

call venv\Scripts\activate.bat || (
	echo [error] Failed to activate venv.
	goto :end
)

REM Optional: set DATABASE_URL here for a shared team DB (uncomment and edit)
REM set "DATABASE_URL=postgres://USER:PASSWORD@HOST:PORT/DBNAME"

REM Install requirements if needed (skip on CI to speed up)
if exist requirements.txt (
	echo [setup] Installing/validating Python dependencies...
	python -m pip install --upgrade pip >nul 2>&1
	pip install -r requirements.txt
)

echo [run] Starting Django development server at http://127.0.0.1:8000/
python manage.py runserver

:end
popd
endlocal
pause
