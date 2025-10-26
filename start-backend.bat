@echo off
echo ============================================
echo   INICIANDO BACKEND DE APRENDECSHARP
echo ============================================
echo.

echo Verificando Node.js...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    pause
    exit /b 1
)

echo.
echo Verificando npm...
npm --version
if %errorlevel% neq 0 (
    echo ERROR: npm no esta disponible
    pause
    exit /b 1
)

echo.
echo Instalando dependencias...
npm install
if %errorlevel% neq 0 (
    echo ERROR: No se pudieron instalar las dependencias
    pause
    exit /b 1
)

echo.
echo Iniciando servidor de desarrollo...
echo El backend estara disponible en: http://localhost:3000
echo.
npm run dev

pause
