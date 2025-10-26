#!/bin/bash

echo "============================================"
echo "  INICIANDO BACKEND DE APRENDECSHARP"
echo "============================================"
echo

echo "Verificando Node.js..."
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js no está instalado"
    exit 1
fi
node --version

echo
echo "Verificando npm..."
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm no está disponible"
    exit 1
fi
npm --version

echo
echo "Instalando dependencias..."
npm install
if [ $? -ne 0 ]; then
    echo "ERROR: No se pudieron instalar las dependencias"
    exit 1
fi

echo
echo "Iniciando servidor de desarrollo..."
echo "El backend estará disponible en: http://localhost:3000"
echo
npm run dev
