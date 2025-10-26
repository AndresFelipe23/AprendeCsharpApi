// ============================================
// ANÁLISIS DE EJERCICIOS DE CÓDIGO
// ============================================

// ============================================
// ANÁLISIS DE EJERCICIOS DE CÓDIGO
// ============================================

const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'password123',
  server: 'localhost',
  port: 1433,
  database: 'AprendeCsharp',
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

async function analyzeCodeExercises() {
  try {
    console.log('🔍 Conectando a la base de datos...');
    await sql.connect(config);
    
    console.log('📋 Analizando ejercicios de código...');
    
    // Consultar ejercicios de código (TipoEjercicioId = 1)
    const result = await sql.query(`
      SELECT TOP 3 
        EjercicioId, 
        Titulo, 
        Instrucciones, 
        CodigoInicial, 
        Solucion, 
        CasosPrueba, 
        Pistas,
        RecompensaXP,
        NivelDificultad
      FROM Ejercicios 
      WHERE TipoEjercicioId = 1
      ORDER BY EjercicioId
    `);
    
    console.log('\n📊 EJERCICIOS DE CÓDIGO ENCONTRADOS:');
    console.log('=====================================');
    
    result.recordset.forEach((exercise, index) => {
      console.log(`\n${index + 1}. Ejercicio ID: ${exercise.EjercicioId}`);
      console.log(`   Título: ${exercise.Titulo}`);
      console.log(`   XP: ${exercise.RecompensaXP}`);
      console.log(`   Dificultad: ${exercise.NivelDificultad}/5`);
      console.log(`   Instrucciones: ${exercise.Instrucciones?.substring(0, 100)}...`);
      console.log(`   Código Inicial: ${exercise.CodigoInicial?.substring(0, 50)}...`);
      console.log(`   Solución: ${exercise.Solucion?.substring(0, 50)}...`);
      console.log(`   Casos de Prueba: ${exercise.CasosPrueba ? 'Sí' : 'No'}`);
      console.log(`   Pistas: ${exercise.Pistas ? 'Sí' : 'No'}`);
    });
    
    // Consultar tipos de ejercicio
    console.log('\n📚 TIPOS DE EJERCICIO DISPONIBLES:');
    console.log('==================================');
    
    const typesResult = await sql.query(`
      SELECT TipoEjercicioId, Nombre, Descripcion
      FROM TiposEjercicio
      ORDER BY TipoEjercicioId
    `);
    
    typesResult.recordset.forEach(type => {
      console.log(`${type.TipoEjercicioId}. ${type.Nombre}: ${type.Descripcion}`);
    });
    
    // Consultar estadísticas de ejercicios
    console.log('\n📈 ESTADÍSTICAS DE EJERCICIOS:');
    console.log('===============================');
    
    const statsResult = await sql.query(`
      SELECT 
        te.Nombre AS TipoEjercicio,
        COUNT(e.EjercicioId) AS TotalEjercicios,
        AVG(e.RecompensaXP) AS PromedioXP,
        AVG(e.NivelDificultad) AS PromedioDificultad
      FROM TiposEjercicio te
      LEFT JOIN Ejercicios e ON te.TipoEjercicioId = e.TipoEjercicioId
      GROUP BY te.TipoEjercicioId, te.Nombre
      ORDER BY te.TipoEjercicioId
    `);
    
    statsResult.recordset.forEach(stat => {
      console.log(`${stat.TipoEjercicio}: ${stat.TotalEjercicios} ejercicios, ${stat.PromedioXP?.toFixed(1)} XP promedio, dificultad ${stat.PromedioDificultad?.toFixed(1)}/5`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await sql.close();
  }
}

analyzeCodeExercises();
