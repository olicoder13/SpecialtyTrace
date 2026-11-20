@echo off
title Servidor Backend - Specialty Trace
cd /d "%~dp0backend"
where python >nul 2>&1
if errorlevel 1 (
    echo No se encontro Python en el PATH.
    echo Instale Python o active un entorno virtual antes de ejecutar este archivo.
    pause
    exit /b 1
)
python -m uvicorn main:app --reload
pause