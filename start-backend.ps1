# Script PowerShell para iniciar PortaLink Backend en el puerto 8081
$Host.UI.RawUI.WindowTitle = "PortaLink Backend - Puerto 8081"
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  PORTALINK BACKEND - SERVIDOR PHP LOCAL" -ForegroundColor Green
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Puerto fijado : 8081" -ForegroundColor Yellow
Write-Host "  URL Base      : http://localhost:8081" -ForegroundColor White
Write-Host "  API Gateway   : http://localhost:8081/api" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

$backendDir = Join-Path $PSScriptRoot "backend-php"
Set-Location $backendDir

if (-not (Get-Command php -ErrorAction SilentlyContinue)) {
    Write-Host "[ERROR] PHP no fue encontrado en el PATH del sistema." -ForegroundColor Red
    pause
    exit 1
}

Write-Host "Iniciando servidor PHP en http://localhost:8081 ..." -ForegroundColor Green
Write-Host "Presione Ctrl+C para detener el servidor.`n" -ForegroundColor Gray

php -S localhost:8081 index.php
