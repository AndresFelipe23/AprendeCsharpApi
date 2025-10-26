const sql = require('mssql');
const config = require('../src/config/config');

async function testHintsAPI() {
  try {
    await sql.connect(config.db);
    console.log('Conectado a la base de datos.');

    // Probar algunos ejercicios que tienen pistas
    const exercisesToTest = [10, 11, 12, 14, 15, 16, 17];

    for (const exerciseId of exercisesToTest) {
      console.log(`\n🔍 Probando ejercicio ${exerciseId}:`);
      
      const result = await sql.query(`
        SELECT 
          EjercicioId,
          Titulo,
          TipoEjercicioId,
          Pistas,
          Instrucciones
        FROM Ejercicios 
        WHERE EjercicioId = ${exerciseId}
      `);

      if (result.recordset.length > 0) {
        const exercise = result.recordset[0];
        console.log(`  📝 Título: ${exercise.Titulo}`);
        console.log(`  🎯 Tipo: ${exercise.TipoEjercicioId}`);
        console.log(`  💡 Pistas: ${exercise.Pistas}`);
        
        // Intentar parsear las pistas como JSON
        if (exercise.Pistas) {
          try {
            const hints = JSON.parse(exercise.Pistas);
            console.log(`  ✅ Pistas parseadas correctamente: ${hints.length} pistas`);
            hints.forEach((hint, index) => {
              console.log(`    ${index + 1}. ${hint}`);
            });
          } catch (e) {
            console.log(`  ❌ Error parseando pistas: ${e.message}`);
          }
        } else {
          console.log(`  ⚠️ No hay pistas para este ejercicio`);
        }
      } else {
        console.log(`  ❌ Ejercicio ${exerciseId} no encontrado`);
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await sql.close();
    console.log('\n✅ Prueba completada.');
  }
}

testHintsAPI();
