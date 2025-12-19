@echo off
echo ========================================
echo   Viagem Aparecida - Iniciando Dev
echo ========================================
echo.

echo [1/2] Iniciando Backend...
start cmd /k "cd backend && npm start"
timeout /t 3 >nul

echo [2/2] Iniciando Frontend...
start cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Servidores iniciados!
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:3000
echo.
echo Pressione qualquer tecla para fechar esta janela...
pause >nul
