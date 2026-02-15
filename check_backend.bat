@echo off
REM Simple test script to check if backend is running
REM Run this in PowerShell or Command Prompt

echo ============================================
echo Infinigram Backend Status Checker
echo ============================================
echo.

REM Check if backend is running on port 5000
echo Checking if backend is running on localhost:5000...
echo.

powershell -Command "try { $response = Invoke-WebRequest -Uri 'http://localhost:5000/api/infinigram/search/users/test' -ErrorAction Stop; Write-Host '✅ Backend is RUNNING' -ForegroundColor Green; Write-Host 'Response: ' + $response.Content; } catch { Write-Host '❌ Backend is NOT RUNNING' -ForegroundColor Red; Write-Host 'Error: ' + $_.Exception.Message; }"

echo.
echo ============================================
echo To start the backend:
echo   cd career-ai-backend
echo   npm start
echo ============================================
pause
