@echo off
echo ==========================================
echo   ENCONTRAR IP DE LA COMPUTADORA
echo ==========================================
echo.
echo Tu telefono: 192.168.1.2
echo Tu router:   192.168.1.254
echo.
echo Buscando IP de esta computadora...
echo.

ipconfig | findstr "IPv4 Adaptador" > temp_ip.txt

echo Adaptadores de red encontrados:
echo.
type temp_ip.txt
echo.
echo ==========================================
echo IMPORTANTE:
echo - Busca la IP que este en el rango 192.168.1.X
echo - NO uses 192.168.1.2 (es tu telefono)
echo - NO uses 192.168.1.254 (es tu router)
echo - Usa la IP del adaptador WiFi o Ethernet activo
echo ==========================================
echo.

del temp_ip.txt

pause
