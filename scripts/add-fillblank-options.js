// ============================================
// Script para agregar opciones a ejercicios de completar
// ============================================

const sql = require('mssql');

const config = {
  user: 'andres',
  password: 'Soypipe23@',
  server: 'mssql-188335-0.cloudclusters.net',
  port: 13026,
  database: 'AprendeCsharp',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

async function addFillBlankOptions() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await sql.connect(config);
    console.log('✅ Conectado exitosamente');

    // Buscar ejercicios de tipo "CompletarCodigo" o "LlenarEspacios"
    const ejerciciosResult = await sql.query`
      SELECT e.EjercicioId, e.Titulo, te.NombreTipo
      FROM Ejercicios e
      INNER JOIN TiposEjercicio te ON e.TipoEjercicioId = te.TipoEjercicioId
      WHERE te.NombreTipo IN ('CompletarCodigo', 'LlenarEspacios')
    `;

    console.log(`\n📋 Encontrados ${ejerciciosResult.recordset.length} ejercicios de completar:`);

    for (const ejercicio of ejerciciosResult.recordset) {
      console.log(`\n🔍 Procesando: ${ejercicio.Titulo} (ID: ${ejercicio.EjercicioId})`);

      // Verificar si ya tiene opciones
      const opcionesResult = await sql.query`
        SELECT COUNT(*) as Count
        FROM OpcionesEjercicio
        WHERE EjercicioId = ${ejercicio.EjercicioId}
      `;

      if (opcionesResult.recordset[0].Count > 0) {
        console.log(`   ✓ Ya tiene ${opcionesResult.recordset[0].Count} opciones`);
        continue;
      }

      // Agregar opciones según el ejercicio
      let opciones = [];

      if (ejercicio.Titulo.toLowerCase().includes('decimal')) {
        opciones = [
          { texto: 'decimal', esCorrecta: true, orden: 1 },
          { texto: 'double', esCorrecta: false, orden: 2 },
          { texto: 'float', esCorrecta: false, orden: 3 },
          { texto: 'm', esCorrecta: true, orden: 4 },
          { texto: 'f', esCorrecta: false, orden: 5 },
          { texto: 'd', esCorrecta: false, orden: 6 },
        ];
      } else {
        // Opciones por defecto
        opciones = [
          { texto: 'int', esCorrecta: false, orden: 1 },
          { texto: 'string', esCorrecta: false, orden: 2 },
          { texto: 'bool', esCorrecta: false, orden: 3 },
        ];
      }

      // Insertar opciones
      for (const opcion of opciones) {
        await sql.query`
          INSERT INTO OpcionesEjercicio (EjercicioId, TextoOpcion, EsCorrecta, OrdenIndice)
          VALUES (${ejercicio.EjercicioId}, ${opcion.texto}, ${opcion.esCorrecta}, ${opcion.orden})
        `;
      }

      console.log(`   ✅ Agregadas ${opciones.length} opciones`);
    }

    console.log('\n✅ Proceso completado exitosamente');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await sql.close();
  }
}

addFillBlankOptions();
