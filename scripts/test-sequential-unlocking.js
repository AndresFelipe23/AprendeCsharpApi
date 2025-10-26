const sql = require('mssql');
const config = require('../dist/config/database');

async function testSequentialUnlocking() {
  try {
    await sql.connect(config.db);
    console.log('🔍 Probando el sistema de desbloqueo secuencial de cursos...\n');

    // Simular diferentes escenarios de usuario
    const testScenarios = [
      {
        name: 'Usuario nuevo (sin progreso)',
        userId: 999, // ID que no existe o no tiene progreso
        expected: {
          course1: true,  // Primer curso siempre desbloqueado
          course2: false, // Segundo curso bloqueado
          course3: false  // Tercer curso bloqueado
        }
      },
      {
        name: 'Usuario con curso 1 completo',
        userId: 1, // Asumir que existe un usuario con ID 1
        expected: {
          course1: true,  // Primer curso desbloqueado
          course2: true,  // Segundo curso desbloqueado (curso 1 completo)
          course3: false  // Tercer curso bloqueado (curso 2 no completo)
        }
      }
    ];

    for (const scenario of testScenarios) {
      console.log(`📋 Escenario: ${scenario.name}`);
      console.log(`👤 Usuario ID: ${scenario.userId}`);
      
      // Obtener cursos para este usuario
      const query = `
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

      const result = await sql.query(query, { userId: scenario.userId });
      
      console.log('📊 Cursos encontrados:');
      for (const row of result.recordset) {
        const courseOrder = row.OrdenIndice;
        const completedLessons = row.LeccionesCompletadas;
        const totalLessons = row.TotalLecciones;
        
        // Simular la lógica de desbloqueo
        let isUnlocked = false;
        
        if (courseOrder === 1) {
          isUnlocked = true; // Primer curso siempre desbloqueado
        } else if (completedLessons > 0) {
          isUnlocked = true; // Si ya tiene progreso en este curso
        } else {
          // Verificar si el curso anterior está completo
          const previousCourseQuery = `
            SELECT 
              COUNT(l.LeccionId) as TotalLecciones,
              COALESCE(SUM(CASE WHEN pu.EstaCompletada = 1 THEN 1 ELSE 0 END), 0) as LeccionesCompletadas
            FROM Cursos c
            LEFT JOIN Lecciones l ON c.CursoId = l.CursoId
            LEFT JOIN ProgresoUsuario pu ON l.LeccionId = pu.LeccionId AND pu.UsuarioId = @userId
            WHERE c.EstaActivo = 1 AND c.OrdenIndice = @previousOrder
            GROUP BY c.CursoId
          `;
          
          const previousResult = await sql.query(previousCourseQuery, { 
            userId: scenario.userId, 
            previousOrder: courseOrder - 1 
          });
          
          if (previousResult.recordset.length > 0) {
            const prevCourse = previousResult.recordset[0];
            isUnlocked = prevCourse.TotalLecciones > 0 && 
                        prevCourse.LeccionesCompletadas === prevCourse.TotalLecciones;
          }
        }
        
        const status = isUnlocked ? '🔓 DESBLOQUEADO' : '🔒 BLOQUEADO';
        const progress = totalLessons > 0 ? `${completedLessons}/${totalLessons}` : '0/0';
        
        console.log(`  Curso ${courseOrder} (${row.Titulo}): ${status} - Progreso: ${progress}`);
        
        // Verificar si coincide con lo esperado
        const expectedKey = `course${courseOrder}`;
        if (scenario.expected[expectedKey] !== undefined) {
          const expected = scenario.expected[expectedKey];
          const actual = isUnlocked;
          const match = expected === actual ? '✅' : '❌';
          console.log(`    ${match} Esperado: ${expected ? 'DESBLOQUEADO' : 'BLOQUEADO'}, Actual: ${actual ? 'DESBLOQUEADO' : 'BLOQUEADO'}`);
        }
      }
      
      console.log(''); // Línea en blanco
    }

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await sql.close();
    console.log('✅ Prueba completada.');
  }
}

testSequentialUnlocking();
