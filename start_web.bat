@echo off
title Employee Salary & Payslip System - Web Server
echo ================================================================
echo   STARTING LOCALHOST WEB SERVER
echo   Employee Salary and Payslip Management System
echo ================================================================
echo.

cd /d "%~dp0"

echo Opening http://localhost:8080 in your default browser...
start "" "http://localhost:8080"

echo.
echo Starting Local Web Server on Port 8080...
echo (Keep this window open while using the web application)
echo.
python web_server.py 8080

pause
