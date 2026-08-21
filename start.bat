@echo off
title Agreement Platform Launcher
set PATH=C:\Users\ambar\tools\nodejs;C:\Users\ambar\AppData\Local\Programs\Python\Python313;C:\Users\ambar\AppData\Local\Programs\Python\Python313\Scripts;C:\Program Files\Git\cmd;%PATH%
echo ===================================================
echo     Commercial Agreement Platform Launcher
echo ===================================================
echo.

echo 1. Starting Backend Server (FastAPI on port 8000)...
start "Backend Server" cmd /k "set PATH=C:\Users\ambar\tools\nodejs;C:\Users\ambar\AppData\Local\Programs\Python\Python313;C:\Users\ambar\AppData\Local\Programs\Python\Python313\Scripts;C:\Program Files\Git\cmd;%%PATH%% && cd /d "%~dp0backend" && python -m pip install -r requirements.txt && python main.py"


echo 2. Waiting 3 seconds for backend server startup...
timeout /t 3 /nobreak > nul

echo 3. Starting Frontend Development Server (Vite on port 5173)...
start "Frontend Server" cmd /k "set PATH=C:\Users\ambar\tools\nodejs;C:\Users\ambar\AppData\Local\Programs\Python\Python313;C:\Users\ambar\AppData\Local\Programs\Python\Python313\Scripts;C:\Program Files\Git\cmd;%%PATH%% && cd /d "%~dp0frontend" && npm install && npm run dev"


echo.
echo ===================================================
echo   Platform Services Initialized!
echo   - Backend:  http://localhost:8000
echo   - Frontend: http://localhost:5173
echo ===================================================
echo.
pause
