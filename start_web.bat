@echo off
title Employee Salary ^& Payslip System - Java Server
echo ================================================================
echo   STARTING JAVA WEB SERVER (PORT 8080)
echo   Employee Salary and Payslip Management System
echo ================================================================
echo.

cd /d "%~dp0"

echo Opening http://localhost:8080 in your default browser...
start "" "http://localhost:8080"

echo.
echo Starting Java Web Server on Port 8080...
echo (Keep this window open while using the web application)
echo.

cd backend
call mvn compile exec:java

pause
