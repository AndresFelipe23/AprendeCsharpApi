// Script para verificar ejercicios en la base de datos
const sql = require('mssql');

const config = {
  user: 'sa',
  password: 'Admin123',
  server: 'localhost',
  database: 'AprendeCSharp',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function checkExercises() {
  try {
    await sql.connect(config);
    console.log('✅ Conectado a la base de datos');

    // Verificar todos los ejercicios
    const result = await sql.query(`
      SELECT 
        e.EjercicioId,
        e.Titulo,
        e.TipoEjercicioId,
        te.TipoEjercicio,
        te.TipoDescripcion,
        COUNT(o.OpcionId) as TotalOpciones
      FROM Ejercicios e
      LEFT JOIN TiposEjercicio te ON e.TipoEjercicioId = te.TipoEjercicioId
      LEFT JOIN OpcionesEjercicio o ON e.EjercicioId = o.EjercicioId
      GROUP BY e.EjercicioId, e.Titulo, e.TipoEjercicioId, te.TipoEjercicio, te.TipoDescripcion
      ORDER BY e.EjercicioId
    `);

    console.log('\n📊 EJERCICIOS EN LA BASE DE DATOS:');
    console.log('=====================================');
    
    result.recordset.forEach(exercise => {
      console.log(`ID: ${exercise.EjercicioId}`);
      console.log(`Título: ${exercise.Titulo}`);
      console.log(`Tipo ID: ${exercise.TipoEjercicioId}`);
      console.log(`Tipo: ${exercise.TipoEjercicio}`);
      console.log(`Descripción: ${exercise.TipoDescripcion}`);
      console.log(`Opciones: ${exercise.TotalOpciones}`);
      console.log('---');
    });

    // Verificar tipos de ejercicio disponibles
    const typesResult = await sql.query(`
      SELECT TipoEjercicioId, TipoEjercicio, TipoDescripcion
      FROM TiposEjercicio
      ORDER BY TipoEjercicioId
    `);

    console.log('\n📋 TIPOS DE EJERCICIO DISPONIBLES:');
    console.log('==================================');
    
    typesResult.recordset.forEach(type => {
      console.log(`ID: ${type.TipoEjercicioId} - ${type.TipoEjercicio} - ${type.TipoDescripcion}`);
    });

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await sql.close();
  }
}

checkExercises();
