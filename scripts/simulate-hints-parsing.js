// Script para simular el parsing de pistas que hace Flutter
// Este script no requiere conexión a la base de datos

console.log('🔍 Simulando el parsing de pistas en Flutter...\n');

// Simular diferentes formatos de pistas que pueden venir de la base de datos
const testCases = [
  {
    name: 'Formato Array de Strings (actual)',
    pistas: '["Para valores monetarios usa \'decimal\'", "El sufijo \'m\' indica que es decimal", "Los tipos de dato van antes del nombre de la variable"]'
  },
  {
    name: 'Formato Array de Objetos',
    pistas: '[{"texto": "Para valores monetarios usa \'decimal\'", "orden": 1}, {"texto": "El sufijo \'m\' indica que es decimal", "orden": 2}]'
  },
  {
    name: 'String simple',
    pistas: 'Esta es una pista simple'
  },
  {
    name: 'JSON inválido',
    pistas: 'texto sin formato json'
  }
];

// Función que simula el parsing de Flutter
function parseHints(pistasJson) {
  if (!pistasJson || pistasJson.toString().trim() === '') {
    return null;
  }

  try {
    // Intentar parsear como JSON
    if (pistasJson.toString().startsWith('[') || pistasJson.toString().startsWith('{')) {
      const parsed = JSON.parse(pistasJson);
      
      if (Array.isArray(parsed)) {
        // Verificar si es una lista de strings o de objetos
        if (parsed.length > 0 && typeof parsed[0] === 'string') {
          // Lista de strings simples: ["pista1", "pista2", "pista3"]
          console.log('  📋 Detectado: Array de strings');
          return parsed.map((texto, index) => ({
            texto: texto,
            orden: index + 1,
            esRevelada: false
          }));
        } else {
          // Lista de objetos: [{"texto": "pista1", "orden": 1}, ...]
          console.log('  📋 Detectado: Array de objetos');
          return parsed.map(pista => ({
            texto: pista.texto || pista.pista || '',
            orden: pista.orden || pista.ordenIndice || 0,
            esRevelada: pista.esRevelada || false
          }));
        }
      } else if (typeof parsed === 'object') {
        // Objeto único
        console.log('  📋 Detectado: Objeto único');
        return [{
          texto: parsed.texto || parsed.pista || '',
          orden: parsed.orden || parsed.ordenIndice || 1,
          esRevelada: parsed.esRevelada || false
        }];
      }
    } else {
      // Si no es JSON válido, tratar como string simple
      console.log('  📋 Detectado: String simple');
      return [{
        texto: pistasJson.toString(),
        orden: 1,
        esRevelada: false
      }];
    }
  } catch (e) {
    console.log(`  ❌ Error parseando: ${e.message}`);
    return null;
  }
}

// Probar cada caso
testCases.forEach((testCase, index) => {
  console.log(`${index + 1}. ${testCase.name}:`);
  console.log(`  📄 Input: ${testCase.pistas}`);
  
  const result = parseHints(testCase.pistas);
  
  if (result) {
    console.log(`  ✅ Resultado: ${result.length} pistas procesadas`);
    result.forEach((hint, i) => {
      console.log(`    ${i + 1}. "${hint.texto}" (orden: ${hint.orden})`);
    });
  } else {
    console.log(`  ❌ No se pudieron procesar las pistas`);
  }
  console.log('');
});

console.log('✅ Simulación completada.');
console.log('\n💡 Recomendación: El formato actual (array de strings) funciona correctamente.');
console.log('   Las pistas se mostrarán sin comillas ni corchetes en la UI.');
