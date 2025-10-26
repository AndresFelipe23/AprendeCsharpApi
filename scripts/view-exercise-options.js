// ============================================
// Script para ver las opciones de un ejercicio
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

async function viewExerciseOptions() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await sql.connect(config);
    console.log('✅ Conectado exitosamente\n');

    // Ver el ejercicio 10
    const ejercicioResult = await sql.query`
      SELECT e.EjercicioId, e.Titulo, e.Instrucciones, te.NombreTipo
      FROM Ejercicios e
      INNER JOIN TiposEjercicio te ON e.TipoEjercicioId = te.TipoEjercicioId
      WHERE e.EjercicioId = 10
    `;

    if (ejercicioResult.recordset.length === 0) {
      console.log('❌ No se encontró el ejercicio');
      return;
    }

    const ejercicio = ejercicioResult.recordset[0];
    console.log('📝 Ejercicio:');
    console.log(`   ID: ${ejercicio.EjercicioId}`);
    console.log(`   Título: ${ejercicio.Titulo}`);
    console.log(`   Tipo: ${ejercicio.NombreTipo}`);
    console.log(`   Instrucciones: ${ejercicio.Instrucciones}`);

    // Ver las opciones
    const opcionesResult = await sql.query`
      SELECT OpcionId, TextoOpcion, EsCorrecta, OrdenIndice
      FROM OpcionesEjercicio
      WHERE EjercicioId = 10
      ORDER BY OrdenIndice
    `;

    console.log('\n🎯 Opciones disponibles:');
    for (const opcion of opcionesResult.recordset) {
      const correcto = opcion.EsCorrecta ? '✅ CORRECTA' : '❌ Incorrecta';
      console.log(`   ${opcion.OrdenIndice}. "${opcion.TextoOpcion}" - ${correcto}`);
    }

    console.log('\n💡 Respuesta correcta esperada:');
    const correctas = opcionesResult.recordset.filter((o) => o.EsCorrecta);
    console.log(`   ${correctas.map((o) => o.TextoOpcion).join(' ')}`);
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await sql.close();
  }
}

viewExerciseOptions();
