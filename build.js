#!/usr/bin/env node

// ============================================
// SCRIPT DE BUILD PERSONALIZADO PARA VERCEL
// Aplicación de Aprendizaje de C#
// ============================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔄 Iniciando build personalizado...');

try {
  // Verificar si TypeScript está disponible
  console.log('📦 Verificando TypeScript...');
  
  // Intentar diferentes métodos para ejecutar TypeScript
  const methods = [
    () => execSync('npx tsc', { stdio: 'inherit' }),
    () => execSync('tsc', { stdio: 'inherit' }),
    () => execSync('./node_modules/.bin/tsc', { stdio: 'inherit' }),
    () => {
      // Fallback: usar la API de TypeScript directamente
      const ts = require('typescript');
      const config = require('./tsconfig.json');
      
      console.log('🔧 Usando API de TypeScript directamente...');
      
      const program = ts.createProgram(
        config.include.map(pattern => pattern.replace('src/**/*', 'src')),
        config.compilerOptions
      );
      
      const emitResult = program.emit();
      
      if (emitResult.diagnostics && emitResult.diagnostics.length > 0) {
        console.error('❌ Errores de TypeScript:');
        emitResult.diagnostics.forEach(diagnostic => {
          console.error(diagnostic.messageText);
        });
        process.exit(1);
      }
      
      console.log('✅ Compilación exitosa');
    }
  ];
  
  let success = false;
  for (const method of methods) {
    try {
      method();
      success = true;
      break;
    } catch (error) {
      console.log(`⚠️ Método falló: ${error.message}`);
      continue;
    }
  }
  
  if (!success) {
    throw new Error('Todos los métodos de compilación fallaron');
  }
  
  // Verificar que se creó el directorio dist
  if (!fs.existsSync('dist')) {
    throw new Error('Directorio dist no fue creado');
  }
  
  console.log('✅ Build completado exitosamente');
  
} catch (error) {
  console.error('❌ Error en build:', error.message);
  process.exit(1);
}
