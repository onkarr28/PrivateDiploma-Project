@echo off
REM PrivateDiploma - Setup Script for Windows
REM Run: setup.bat

echo.
echo ================================================
echo  PrivateDiploma Setup
echo ================================================
echo.

REM Check Node.js
echo Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js not found. Please install Node.js 16+
    echo Download from: https://nodejs.org
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Found: %NODE_VERSION%
echo.

REM Check npm
echo Checking npm installation...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: npm not found. Please reinstall Node.js
    pause
    exit /b 1
)
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo Found: %NPM_VERSION%
echo.

REM Install dependencies
echo Installing dependencies...
echo This may take a few minutes...
echo.
call npm install

if errorlevel 1 (
    echo.
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)

echo.
echo ================================================
echo  Setup Complete!
echo ================================================
echo.
echo Next steps:
echo.
echo 1. Start development server:
echo    npm run dev
echo.
echo 2. Browser will open automatically at:
echo    http://localhost:3000
echo.
echo 3. Choose a role:
echo    - University: Issue diplomas
echo    - Student: Manage credentials
echo    - Employer: Verify credentials
echo.
echo Happy Building! :)
echo.
pause
