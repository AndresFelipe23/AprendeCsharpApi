// Script simple para verificar progreso de usuarios
const sql = require('mssql');

// Configuración de base de datos (ajustar según tu configuración)
const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'tu_password',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'AprendeCsharp',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function checkUserProgress() {
  try {
    await sql.connect(config);
    console.log('🔍 Verificando progreso de usuarios...\n');

    // Verificar usuarios que tienen progreso
    console.log('👥 Usuarios con progreso:');
    const usersQuery = `
      SELECT DISTINCT pu.UsuarioId, COUNT(*) as TotalProgresos
      FROM ProgresoUsuario pu
      GROUP BY pu.UsuarioId
      ORDER BY pu.UsuarioId
    `;

    const usersResult = await sql.query(usersQuery);
    
    if (usersResult.recordset.length === 0) {
      console.log('  ⚠️ No hay usuarios con progreso registrado');
    } else {
      for (const user of usersResult.recordset) {
        console.log(`\n👤 Usuario ${user.UsuarioId} (${user.TotalProgresos} registros de progreso):`);
        
        // Verificar progreso por curso
        const progressQuery = `
          SELECT 
            c.CursoId,
            c.Titulo,
            c.OrdenIndice,
            COUNT(l.LeccionId) as TotalLecciones,
            SUM(CASE WHEN pu.EstaCompletada = 1 THEN 1 ELSE 0 END) as LeccionesCompletadas
          FROM ProgresoUsuario pu
          JOIN Lecciones l ON pu.LeccionId = l.LeccionId
          JOIN Cursos c ON l.CursoId = c.CursoId
          WHERE pu.UsuarioId = @userId AND c.EstaActivo = 1
          GROUP BY c.CursoId, c.Titulo, c.OrdenIndice
          ORDER BY c.OrdenIndice
        `;

        const progressResult = await sql.query(progressQuery, { userId: user.UsuarioId });
        
        for (const progress of progressResult.recordset) {
          const percentage = progress.TotalLecciones > 0 
            ? Math.round((progress.LeccionesCompletadas / progress.TotalLecciones) * 100)
            : 0;
          
          const status = progress.LeccionesCompletadas === progress.TotalLecciones && progress.TotalLecciones > 0 
            ? '✅ COMPLETO' 
            : `📊 ${percentage}%`;
          
          console.log(`  Curso ${progress.OrdenIndice} (${progress.Titulo}): ${progress.LeccionesCompletadas}/${progress.TotalLecciones} ${status}`);
        }
      }
    }

    console.log('\n📚 Verificando estructura de cursos:');
    const coursesQuery = `
      SELECT 
        c.CursoId,
        c.Titulo,
        c.OrdenIndice,
        COUNT(l.LeccionId) as TotalLecciones
      FROM Cursos c
      LEFT JOIN Lecciones l ON c.CursoId = l.CursoId
      WHERE c.EstaActivo = 1
      GROUP BY c.CursoId, c.Titulo, c.OrdenIndice
      ORDER BY c.OrdenIndice
    `;

    const coursesResult = await sql.query(coursesQuery);
    
    for (const course of coursesResult.recordset) {
      console.log(`  ${course.OrdenIndice}. ${course.Titulo} (ID: ${course.CursoId}) - ${course.TotalLecciones} lecciones`);
    }

  } catch (err) {
    console.error('❌ Error:', err.message);
  } finally {
    await sql.close();
    console.log('\n✅ Verificación completada.');
  }
}

checkUserProgress();
