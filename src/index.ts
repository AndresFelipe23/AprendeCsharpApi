// ============================================
// ARCHIVO PRINCIPAL DEL PROYECTO APRENDECSHARP
// Aplicación de Aprendizaje de C#
// ============================================

import app from './app';

// Iniciar la aplicación
app.start().catch((error) => {
  console.error('❌ Error fatal iniciando la aplicación:', error);
  process.exit(1);
});



