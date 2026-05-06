@echo off
cd /d %~dp0

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [FreeClaw] Node.js is not installed.
    echo.
    echo Please download and install Node.js from:
    echo https://nodejs.org/
    echo.
    echo After installation, run this script again.
    pause
    exit /b 1
)

:: Display Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo [FreeClaw] Node.js %NODE_VERSION% detected.

echo Starting FreeClaw Server...
node server.js
pause