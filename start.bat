@echo off
title LeetFlix V3 - Launcher
color 0A

echo ====================================
echo   LEETFLIX V3 - Starting Services
echo ====================================
echo.

echo [1/2] Starting Backend (NestJS on port 5001)...
start "LeetFlix Backend" cmd /k "cd /d "%~dp0backend" && npm run start:dev"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend (Next.js on port 5000)...
start "LeetFlix Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ====================================
echo  Backend  : http://localhost:5001/api
echo  Frontend : http://localhost:5000
echo ====================================
echo.
echo Both servers are starting in separate windows.
echo Press any key to open the browser...
pause >nul

start "" "http://localhost:5000"
