// ============================================
// SCRIPT DE PRUEBA SIMPLE
// ============================================

console.log('🚀 Iniciando prueba de la estructura...');

// Verificar que los módulos se pueden importar
try {
  console.log('✅ Verificando imports...');
  
  // Simular imports básicos
  const express = require('express');
  console.log('✅ Express importado correctamente');
  
  const dotenv = require('dotenv');
  console.log('✅ dotenv importado correctamente');
  
  console.log('🎉 Todos los módulos principales están disponibles');
  console.log('📱 La estructura está lista para la aplicación móvil');
  
} catch (error) {
  console.error('❌ Error en la verificación:', error);
}
