@echo off
title Employee Salary & Payslip Management - Localhost Server
echo ================================================================
echo   STARTING LOCALHOST WEB SERVER (PORT 8080)
echo   Employee Salary and Payslip Management System
echo ================================================================
echo.

cd /d "%~dp0"

echo Opening browser at http://localhost:8080 ...
start "" "http://localhost:8080"

echo.
echo Starting Python HTTP Web Server...
python web_server.py 8080

pause
