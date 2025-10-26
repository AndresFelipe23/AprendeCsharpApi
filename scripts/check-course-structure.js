const sql = require('mssql');
const config = require('../dist/config/database');

async function checkCourseStructure() {
  try {
    await sql.connect(config.db);
    console.log('🔍 Verificando estructura de cursos y progreso...\n');

    // Verificar cursos disponibles
    console.log('📚 Cursos disponibles:');
    const coursesQuery = `
      SELECT 
        c.CursoId,
        c.Titulo,
        c.OrdenIndice,
        c.EstaActivo,
        COUNT(l.LeccionId) as TotalLecciones
      FROM Cursos c
      LEFT JOIN Lecciones l ON c.CursoId = l.CursoId
      WHERE c.EstaActivo = 1
      GROUP BY c.CursoId, c.Titulo, c.OrdenIndice, c.EstaActivo
      ORDER BY c.OrdenIndice ASC
    `;

    const coursesResult = await sql.query(coursesQuery);
    
    for (const course of coursesResult.recordset) {
      console.log(`  ${course.OrdenIndice}. ${course.Titulo} (ID: ${course.CursoId}) - ${course.TotalLecciones} lecciones`);
    }

    console.log('\n👥 Progreso de usuarios:');
    
    // Verificar progreso de usuarios
    const progressQuery = `
      SELECT 
        pu.UsuarioId,
        c.Titulo as CursoTitulo,
        c.OrdenIndice,
        COUNT(l.LeccionId) as TotalLecciones,
        SUM(CASE WHEN pu.EstaCompletada = 1 THEN 1 ELSE 0 END) as LeccionesCompletadas
      FROM ProgresoUsuario pu
      JOIN Lecciones l ON pu.LeccionId = l.LeccionId
      JOIN Cursos c ON l.CursoId = c.CursoId
      WHERE c.EstaActivo = 1
      GROUP BY pu.UsuarioId, c.CursoId, c.Titulo, c.OrdenIndice
      ORDER BY pu.UsuarioId, c.OrdenIndice
    `;

    const progressResult = await sql.query(progressQuery);
    
    if (progressResult.recordset.length === 0) {
      console.log('  ⚠️ No hay progreso de usuarios registrado');
    } else {
      let currentUserId = null;
      for (const progress of progressResult.recordset) {
        if (currentUserId !== progress.UsuarioId) {
          console.log(`\n  👤 Usuario ${progress.UsuarioId}:`);
          currentUserId = progress.UsuarioId;
        }
        
        const percentage = progress.TotalLecciones > 0 
          ? Math.round((progress.LeccionesCompletadas / progress.TotalLecciones) * 100)
          : 0;
        
        console.log(`    Curso ${progress.OrdenIndice} (${progress.CursoTitulo}): ${progress.LeccionesCompletadas}/${progress.TotalLecciones} (${percentage}%)`);
      }
    }

    console.log('\n🔧 Verificando lógica de desbloqueo:');
    
    // Probar la lógica de desbloqueo con diferentes usuarios
    const testUsers = [1, 2, 3]; // IDs de usuarios para probar
    
    for (const userId of testUsers) {
      console.log(`\n👤 Usuario ${userId}:`);
      
      const userCoursesQuery = `
        SELECT
          c.CursoId,
          c.Titulo,
          c.OrdenIndice,
          COUNT(l.LeccionId) as TotalLecciones,
          COALESCE(SUM(CASE WHEN pu.EstaCompletada = 1 THEN 1 ELSE 0 END), 0) as LeccionesCompletadas
        FROM Cursos c
        LEFT JOIN Lecciones l ON c.CursoId = l.CursoId
        LEFT JOIN ProgresoUsuario pu ON l.LeccionId = pu.LeccionId AND pu.UsuarioId = @userId
        WHERE c.EstaActivo = 1
        GROUP BY c.CursoId, c.Titulo, c.OrdenIndice
        ORDER BY c.OrdenIndice ASC
      `;

      const userResult = await sql.query(userCoursesQuery, { userId });
      
      for (const course of userResult.recordset) {
        const courseOrder = course.OrdenIndice;
        const completedLessons = course.LeccionesCompletadas;
        const totalLessons = course.TotalLecciones;
        
        // Aplicar lógica de desbloqueo
        let isUnlocked = false;
        let unlockReason = '';
        
        if (courseOrder === 1) {
          isUnlocked = true;
          unlockReason = 'Primer curso';
        } else if (completedLessons > 0) {
          isUnlocked = true;
          unlockReason = 'Ya tiene progreso';
        } else {
          // Verificar curso anterior
          const prevQuery = `
            SELECT 
              COUNT(l.LeccionId) as TotalLecciones,
              COALESCE(SUM(CASE WHEN pu.EstaCompletada = 1 THEN 1 ELSE 0 END), 0) as LeccionesCompletadas
            FROM Cursos c
            LEFT JOIN Lecciones l ON c.CursoId = l.CursoId
            LEFT JOIN ProgresoUsuario pu ON l.LeccionId = pu.LeccionId AND pu.UsuarioId = @userId
            WHERE c.EstaActivo = 1 AND c.OrdenIndice = @prevOrder
            GROUP BY c.CursoId
          `;
          
          const prevResult = await sql.query(prevQuery, { 
            userId, 
            prevOrder: courseOrder - 1 
          });
          
          if (prevResult.recordset.length > 0) {
            const prevCourse = prevResult.recordset[0];
            const prevComplete = prevCourse.TotalLecciones > 0 && 
                                prevCourse.LeccionesCompletadas === prevCourse.TotalLecciones;
            
            isUnlocked = prevComplete;
            unlockReason = prevComplete ? 'Curso anterior completo' : 'Curso anterior incompleto';
          } else {
            unlockReason = 'No existe curso anterior';
          }
        }
        
        const status = isUnlocked ? '🔓' : '🔒';
        const progress = totalLessons > 0 ? `${completedLessons}/${totalLessons}` : '0/0';
        
        console.log(`  ${status} Curso ${courseOrder}: ${progress} - ${unlockReason}`);
      }
    }

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await sql.close();
    console.log('\n✅ Verificación completada.');
  }
}

checkCourseStructure();
