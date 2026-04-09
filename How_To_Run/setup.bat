@echo off
echo =======================================================
echo Starting Liquid Glass 18x18 Tic-Tac-Toe
echo =======================================================
echo.

cd ..\antigravity-project\frontend
if not exist node_modules (
    echo Installing dependencies for the first time...
    call npm install
)

echo.
echo Starting the development server...
echo Press Ctrl+C in this window anytime to stop the server.
echo =======================================================
echo.
call npm run dev
pause
