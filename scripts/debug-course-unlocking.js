const sql = require('mssql');
const config = require('../dist/config/database');

async function debugCourseUnlocking() {
  try {
    await sql.connect(config.db);
    console.log('🔍 Diagnosticando problema de desbloqueo de cursos...\n');

    // Verificar cursos disponibles
    console.log('📚 Cursos disponibles:');
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
      ORDER BY c.OrdenIndice ASC
    `;

    const coursesResult = await sql.query(coursesQuery);
    
    for (const course of coursesResult.recordset) {
      console.log(`  ${course.OrdenIndice}. ${course.Titulo} (ID: ${course.CursoId}) - ${course.TotalLecciones} lecciones`);
    }

    console.log('\n👥 Verificando progreso de usuarios:');
    
    // Verificar progreso de usuarios
    const progressQuery = `
      SELECT 
        pu.UsuarioId,
        c.CursoId,
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
        
        const status = progress.LeccionesCompletadas === progress.TotalLecciones && progress.TotalLecciones > 0 
          ? '✅ COMPLETO' 
          : `📊 ${percentage}%`;
        
        console.log(`    Curso ${progress.OrdenIndice} (${progress.CursoTitulo}): ${progress.LeccionesCompletadas}/${progress.TotalLecciones} ${status}`);
      }
    }

    console.log('\n🔧 Probando lógica de desbloqueo:');
    
    // Probar con usuario específico (asumir usuario ID 1)
    const testUserId = 1;
    console.log(`\n👤 Usuario ${testUserId}:`);
    
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

    const userResult = await sql.query(userCoursesQuery, { userId: testUserId });
    
    for (const course of userResult.recordset) {
      const courseOrder = course.OrdenIndice;
      const completedLessons = course.LeccionesCompletadas;
      const totalLessons = course.TotalLecciones;
      
      console.log(`\n📖 Curso ${courseOrder} (${course.Titulo}):`);
      console.log(`   Progreso: ${completedLessons}/${totalLessons} lecciones`);
      
      // Aplicar lógica de desbloqueo paso a paso
      let isUnlocked = false;
      let unlockReason = '';
      
      if (courseOrder === 1) {
        isUnlocked = true;
        unlockReason = 'Primer curso - siempre desbloqueado';
        console.log(`   ✅ ${unlockReason}`);
      } else if (completedLessons > 0) {
        isUnlocked = true;
        unlockReason = 'Ya tiene progreso en este curso';
        console.log(`   ✅ ${unlockReason}`);
      } else {
        console.log(`   🔍 Verificando curso anterior (orden ${courseOrder - 1})...`);
        
        // Verificar curso anterior
        const prevQuery = `
          SELECT 
            c.CursoId,
            c.Titulo,
            COUNT(l.LeccionId) as TotalLecciones,
            COALESCE(SUM(CASE WHEN pu.EstaCompletada = 1 THEN 1 ELSE 0 END), 0) as LeccionesCompletadas
          FROM Cursos c
          LEFT JOIN Lecciones l ON c.CursoId = l.CursoId
          LEFT JOIN ProgresoUsuario pu ON l.LeccionId = pu.LeccionId AND pu.UsuarioId = @userId
          WHERE c.EstaActivo = 1 AND c.OrdenIndice = @prevOrder
          GROUP BY c.CursoId, c.Titulo
        `;
        
        const prevResult = await sql.query(prevQuery, { 
          userId: testUserId, 
          prevOrder: courseOrder - 1 
        });
        
        if (prevResult.recordset.length === 0) {
          isUnlocked = false;
          unlockReason = 'No existe curso anterior';
          console.log(`   ❌ ${unlockReason}`);
        } else {
          const prevCourse = prevResult.recordset[0];
          const prevComplete = prevCourse.TotalLecciones > 0 && 
                              prevCourse.LeccionesCompletadas === prevCourse.TotalLecciones;
          
          console.log(`   📊 Curso anterior: ${prevCourse.Titulo}`);
          console.log(`   📊 Progreso anterior: ${prevCourse.LeccionesCompletadas}/${prevCourse.TotalLecciones}`);
          
          isUnlocked = prevComplete;
          unlockReason = prevComplete ? 'Curso anterior completo' : 'Curso anterior incompleto';
          console.log(`   ${prevComplete ? '✅' : '❌'} ${unlockReason}`);
        }
      }
      
      const status = isUnlocked ? '🔓 DESBLOQUEADO' : '🔒 BLOQUEADO';
      console.log(`   🎯 Estado final: ${status}`);
    }

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await sql.close();
    console.log('\n✅ Diagnóstico completado.');
  }
}

debugCourseUnlocking();
