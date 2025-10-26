const sql = require('mssql');
const config = require('../dist/config/database');

async function testHintsParsing() {
  try {
    await sql.connect(config.db);
    console.log('🔍 Probando el parsing de pistas...\n');

    // Probar algunos ejercicios que tienen pistas
    const exercisesToTest = [10, 11, 12, 14, 15, 16, 17];

    for (const exerciseId of exercisesToTest) {
      console.log(`📝 Ejercicio ${exerciseId}:`);
      
      const result = await sql.query(`
        SELECT 
          EjercicioId,
          Titulo,
          Pistas
        FROM Ejercicios 
        WHERE EjercicioId = ${exerciseId}
      `);

      if (result.recordset.length > 0) {
        const exercise = result.recordset[0];
        console.log(`  Título: ${exercise.Titulo}`);
        
        if (exercise.Pistas) {
          try {
            const hints = JSON.parse(exercise.Pistas);
            console.log(`  ✅ Pistas parseadas: ${hints.length} pistas`);
            
            // Simular el parsing que hace Flutter
            if (Array.isArray(hints) && hints.length > 0) {
              if (typeof hints[0] === 'string') {
                console.log(`  📋 Formato: Array de strings`);
                hints.forEach((hint, index) => {
                  console.log(`    ${index + 1}. "${hint}"`);
                });
              } else if (typeof hints[0] === 'object') {
                console.log(`  📋 Formato: Array de objetos`);
                hints.forEach((hint, index) => {
                  console.log(`    ${index + 1}. texto: "${hint.texto}", orden: ${hint.orden}`);
                });
              }
            }
          } catch (e) {
            console.log(`  ❌ Error parseando pistas: ${e.message}`);
            console.log(`  📄 Contenido raw: ${exercise.Pistas}`);
          }
        } else {
          console.log(`  ⚠️ No hay pistas para este ejercicio`);
        }
      } else {
        console.log(`  ❌ Ejercicio ${exerciseId} no encontrado`);
      }
      console.log(''); // Línea en blanco
    }

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await sql.close();
    console.log('✅ Prueba completada.');
  }
}

testHintsParsing();
