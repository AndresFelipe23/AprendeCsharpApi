// ============================================
// Script para corregir opciones de ejercicios de completar
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

async function fixFillBlankOptions() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await sql.connect(config);
    console.log('✅ Conectado exitosamente\n');

    // Ver opciones actuales
    console.log('📋 Opciones actuales del ejercicio 10:');
    const currentOptions = await sql.query`
      SELECT OpcionId, TextoOpcion, EsCorrecta
      FROM OpcionesEjercicio
      WHERE EjercicioId = 10
      ORDER BY OrdenIndice
    `;

    for (const opt of currentOptions.recordset) {
      console.log(`   - "${opt.TextoOpcion}" (${opt.EsCorrecta ? 'Correcta' : 'Incorrecta'})`);
    }

    // Verificar si hay alguna opción incorrecta (como "19.99")
    const badOptions = currentOptions.recordset.filter(
      (opt) => !['decimal', 'double', 'float', 'm', 'f', 'd'].includes(opt.TextoOpcion)
    );

    if (badOptions.length > 0) {
      console.log('\n⚠️ Encontradas opciones incorrectas que deben eliminarse:');
      for (const opt of badOptions) {
        console.log(`   - "${opt.TextoOpcion}"`);
        await sql.query`DELETE FROM OpcionesEjercicio WHERE OpcionId = ${opt.OpcionId}`;
      }
      console.log('✅ Opciones incorrectas eliminadas');
    } else {
      console.log('\n✅ No hay opciones incorrectas');
    }

    // Verificar opciones finales
    console.log('\n📋 Opciones finales:');
    const finalOptions = await sql.query`
      SELECT TextoOpcion, EsCorrecta, OrdenIndice
      FROM OpcionesEjercicio
      WHERE EjercicioId = 10
      ORDER BY OrdenIndice
    `;

    for (const opt of finalOptions.recordset) {
      const status = opt.EsCorrecta ? '✅ CORRECTA' : '❌ Incorrecta';
      console.log(`   ${opt.OrdenIndice}. "${opt.TextoOpcion}" - ${status}`);
    }

    console.log('\n✅ Proceso completado');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await sql.close();
  }
}

fixFillBlankOptions();
