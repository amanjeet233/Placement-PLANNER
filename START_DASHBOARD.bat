@echo off
title Placement Prep Dashboard Server
color 0A
echo.
echo  =====================================================
echo   CodeTrack 360 - Placement Prep Dashboard Server
echo  =====================================================
echo.
echo  Starting at: http://127.0.0.1:5500/dashboard.html
echo  (Same as VS Code Live Server - data will load!)
echo.
echo  Keep this window MINIMIZED while using dashboard.
echo  Press Ctrl+C to stop the server.
echo  =====================================================
echo.
cd /d "d:\CU\SEM 7\90DAY"
start http://127.0.0.1:5500/dashboard.html
npx -y serve -l 5500 --no-clipboard .
pause
