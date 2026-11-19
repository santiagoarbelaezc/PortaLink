@echo off
setlocal
title PortaLink Backend - Puerto 8081
color 0A

echo ========================================================
echo   PORTALINK BACKEND - SERVIDOR PHP LOCAL
echo ========================================================
echo   Puerto fijado : 8081
echo   URL Base      : http://localhost:8081
echo   API Gateway   : http://localhost:8081/api
echo ========================================================
echo.

cd /d "%~dp0backend-php"

where php >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] PHP no se encontro en el PATH del sistema.
    echo Por favor verifique que PHP este instalado y en su PATH.
    pause
    exit /b 1
)

echo Iniciando servidor PHP en http://localhost:8081 ...
echo Presione Ctrl+C para detener el servidor.
echo.

php -S localhost:8081 index.php
if %errorlevel% neq 0 (
    echo.
    echo [AVISO] El servidor se ha detenido o ha ocurrido un error.
    pause
)
