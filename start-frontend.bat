@echo off
setlocal
title PortaLink Frontend - Puerto 4201
color 0B

echo ========================================================
echo   PORTALINK FRONTEND - SERVIDOR ANGULAR LOCAL
echo ========================================================
echo   Puerto fijado : 4201
echo   URL Frontend  : http://localhost:4201
echo   API Backend   : http://localhost:8081/api
echo ========================================================
echo.

cd /d "%~dp0portalink-frontend"

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm / Node.js no se encontro en el PATH del sistema.
    pause
    exit /b 1
)

echo Iniciando servidor de desarrollo Angular en el puerto 4201 ...
echo.

npm start
if %errorlevel% neq 0 (
    echo.
    echo [AVISO] El frontend se ha detenido o ha ocurrido un error.
    pause
)
