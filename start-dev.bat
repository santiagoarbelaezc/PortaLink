@echo off
setlocal
title Lanzador PortaLink (Dev Completo)
color 0E

echo ========================================================
echo   LANZADOR PORTALINK (DESARROLLO DUAL)
echo ========================================================
echo   Backend  : http://localhost:8081  (start-backend.bat)
echo   Frontend : http://localhost:4201  (start-frontend.bat)
echo ========================================================
echo.

echo Abriendo consola del Backend en puerto 8081...
start "PortaLink Backend [8081]" cmd /k "%~dp0start-backend.bat"

timeout /t 2 >nul

echo Abriendo consola del Frontend en puerto 4201...
start "PortaLink Frontend [4201]" cmd /k "%~dp0start-frontend.bat"

echo.
echo ========================================================
echo   Ambos servicios han sido iniciados en ventanas separadas.
echo ========================================================
timeout /t 4 >nul
