@echo off
echo ==========================================
echo   ABRIR PUERTO 3000 EN FIREWALL
echo ==========================================
echo.
echo Este script creara una regla en el firewall de Windows
echo para permitir conexiones al puerto 3000 desde tu red local.
echo.
echo IMPORTANTE: Ejecutar como Administrador
echo.
pause

echo.
echo Creando regla de firewall...

netsh advfirewall firewall add rule name="AprendeCsharp Backend" dir=in action=allow protocol=TCP localport=3000

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo   EXITO: Regla de firewall creada
    echo ==========================================
    echo.
    echo El puerto 3000 esta ahora abierto para conexiones locales.
    echo Puedes probar desde tu telefono.
) else (
    echo.
    echo ==========================================
    echo   ERROR: No se pudo crear la regla
    echo ==========================================
    echo.
    echo Posibles causas:
    echo - No ejecutaste este archivo como Administrador
    echo - El firewall de Windows esta desactivado
    echo.
    echo Solucion:
    echo 1. Clic derecho en este archivo
    echo 2. Selecciona "Ejecutar como administrador"
)

echo.
pause
