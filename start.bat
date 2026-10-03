@echo off
cd /d "%~dp0"

echo ================================================================
echo   STARTING JAVA SERVER (PORT 8080)
echo   Employee Salary and Payslip Management System
echo ================================================================
echo.

start "" "http://localhost:8080"
java -jar app.jar
