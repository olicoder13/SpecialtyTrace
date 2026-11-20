@echo off
title Servidor Backend - Specialty Trace
cd /d "%~dp0backend"
set "PYTHON_CMD="

if exist "%~dp0.venv\Scripts\python.exe" set "PYTHON_CMD=%~dp0.venv\Scripts\python.exe"
if not defined PYTHON_CMD if exist "%LOCALAPPDATA%\Python\pythoncore-3.15-64\python.exe" set "PYTHON_CMD=%LOCALAPPDATA%\Python\pythoncore-3.15-64\python.exe"
if not defined PYTHON_CMD where py >nul 2>&1 && set "PYTHON_CMD=py -3"
if not defined PYTHON_CMD where python >nul 2>&1 && set "PYTHON_CMD=python"

if not defined PYTHON_CMD (
    echo No se encontro Python.
    echo Instale Python o active un entorno virtual en la carpeta del proyecto.
    pause
    exit /b 1
)

%PYTHON_CMD% -m uvicorn main:app --reload
pause