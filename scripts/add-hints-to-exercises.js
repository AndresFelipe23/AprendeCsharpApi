// ============================================
// SCRIPT PARA AGREGAR PISTAS DE EJEMPLO
// Aplicación de Aprendizaje de C#
// ============================================

const sql = require('mssql');

// Configuración de la base de datos
const config = {
  user: 'sa',
  password: '123456',
  server: 'localhost',
  database: 'AprendeCsharp',
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

async function addHintsToExercises() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await sql.connect(config);
    console.log('✅ Conectado exitosamente');

    // Pistas para diferentes tipos de ejercicios
    const hintsData = [
      {
        ejercicioId: 1,
        titulo: 'Método Principal',
        pistas: [
          {
            texto: 'El método principal es el punto de entrada de cualquier programa en C#',
            orden: 1
          },
          {
            texto: 'Debe ser estático y público para que el sistema pueda llamarlo',
            orden: 2
          },
          {
            texto: 'La palabra clave es "Main" con M mayúscula',
            orden: 3
          }
        ]
      },
      {
        ejercicioId: 2,
        titulo: 'Imprimir Mensaje',
        pistas: [
          {
            texto: 'Usa Console.WriteLine() para imprimir texto en la consola',
            orden: 1
          },
          {
            texto: 'El texto debe ir entre comillas dobles',
            orden: 2
          },
          {
            texto: 'No olvides el punto y coma al final de la línea',
            orden: 3
          }
        ]
      },
      {
        ejercicioId: 3,
        titulo: 'Tipo de Dato Entero',
        pistas: [
          {
            texto: 'Los números enteros en C# usan un tipo específico',
            orden: 1
          },
          {
            texto: 'Es una palabra corta de 3 letras',
            orden: 2
          },
          {
            texto: 'Comienza con "i" y termina con "t"',
            orden: 3
          }
        ]
      },
      {
        ejercicioId: 4,
        titulo: 'Declarar Variable',
        pistas: [
          {
            texto: 'Primero especifica el tipo de dato, luego el nombre de la variable',
            orden: 1
          },
          {
            texto: 'Para números decimales usa "double"',
            orden: 2
          },
          {
            texto: 'El valor debe ir después del signo igual',
            orden: 3
          }
        ]
      },
      {
        ejercicioId: 10,
        titulo: 'Declaración de Variable Decimal',
        pistas: [
          {
            texto: 'Para números decimales en C# usa el tipo "decimal"',
            orden: 1
          },
          {
            texto: 'Los números decimales necesitan un sufijo para especificar el tipo',
            orden: 2
          },
          {
            texto: 'El sufijo "m" indica que es un decimal',
            orden: 3
          }
        ]
      },
      {
        ejercicioId: 11,
        titulo: 'Declarar variable entera',
        pistas: [
          {
            texto: 'Para números enteros usa el tipo "int"',
            orden: 1
          },
          {
            texto: 'Los números enteros no tienen decimales',
            orden: 2
          },
          {
            texto: 'Asigna un valor numérico sin comillas',
            orden: 3
          }
        ]
      }
    ];

    console.log('📝 Agregando pistas a los ejercicios...');

    for (const exerciseData of hintsData) {
      console.log(`\n🔧 Procesando ejercicio ${exerciseData.ejercicioId}: ${exerciseData.titulo}`);
      
      // Convertir las pistas a JSON
      const pistasJson = JSON.stringify(exerciseData.pistas);
      
      // Actualizar el ejercicio con las pistas
      const updateQuery = `
        UPDATE Ejercicios 
        SET Pistas = @pistas
        WHERE EjercicioId = @ejercicioId
      `;
      
      const result = await sql.query(updateQuery, {
        ejercicioId: exerciseData.ejercicioId,
        pistas: pistasJson
      });
      
      if (result.rowsAffected[0] > 0) {
        console.log(`✅ Pistas agregadas al ejercicio ${exerciseData.ejercicioId}`);
        console.log(`   Pistas: ${exerciseData.pistas.length}`);
        exerciseData.pistas.forEach((pista, index) => {
          console.log(`   ${index + 1}. ${pista.texto}`);
        });
      } else {
        console.log(`⚠️ No se encontró el ejercicio ${exerciseData.ejercicioId}`);
      }
    }

    console.log('\n🔍 Verificando las pistas agregadas...');
    
    // Verificar que las pistas se agregaron correctamente
    const verifyQuery = `
      SELECT EjercicioId, Titulo, Pistas
      FROM Ejercicios
      WHERE EjercicioId IN (1, 2, 3, 4, 10, 11)
      ORDER BY EjercicioId
    `;
    
    const verifyResult = await sql.query(verifyQuery);
    
    console.log('\n📊 RESULTADO DE LA VERIFICACIÓN:');
    console.log('┌─────────────┬─────────────────────────────┬─────────────────────────────────────┐');
    console.log('│ EjercicioId │ Título                       │ Pistas                              │');
    console.log('├─────────────┼─────────────────────────────┼─────────────────────────────────────┤');
    
    verifyResult.recordset.forEach(row => {
      const ejercicioId = row.EjercicioId.toString().padEnd(11);
      const titulo = (row.Titulo || '').substring(0, 27).padEnd(27);
      const pistas = row.Pistas ? '✅ Agregadas' : '❌ Sin pistas';
      console.log(`│ ${ejercicioId} │ ${titulo} │ ${pistas.padEnd(35)} │`);
    });
    
    console.log('└─────────────┴─────────────────────────────┴─────────────────────────────────────┘');

    console.log('\n🎉 ¡Pistas agregadas exitosamente!');
    console.log('\n📋 RESUMEN:');
    console.log(`✅ ${hintsData.length} ejercicios procesados`);
    console.log('✅ Pistas agregadas en formato JSON');
    console.log('✅ Verificación completada');
    
    console.log('\n💡 Las pistas ahora estarán disponibles en la aplicación Flutter');
    console.log('   y se mostrarán progresivamente cuando el usuario las solicite.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.close();
    console.log('\n🔌 Conexión cerrada');
  }
}

// Ejecutar el script
addHintsToExercises();
