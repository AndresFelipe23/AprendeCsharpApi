// ============================================
// RUTAS DE CURSOS
// Aplicación de Aprendizaje de C#
// ============================================

import express from 'express';
import { Request, Response } from 'express';
import { AuthRequest } from '../types/auth';
import { optionalAuth } from '../middleware/auth';
import { databaseService } from '../services/database';

const router = express.Router();

// Aplicar autenticación opcional a todas las rutas de cursos
// Esto permite que req.user y req.userId estén disponibles si el usuario está autenticado
router.use(optionalAuth);

// ============================================
// FUNCIONES AUXILIARES
// ============================================

/**
 * Verificar si un curso anterior está completo
 * @param userId ID del usuario
 * @param previousCourseOrder Orden del curso anterior
 * @returns true si el curso anterior está completo, false en caso contrario
 */
async function isPreviousCourseCompleted(userId: number, previousCourseOrder: number): Promise<boolean> {
  try {
    console.log(`🔍 Verificando curso anterior: Usuario ${userId}, Orden ${previousCourseOrder}`);
    
    // Si el usuario no está autenticado (userId = 0), no puede desbloquear cursos
    if (userId === 0) {
      console.log(`⚠️ Usuario no autenticado (ID: 0), curso anterior considerado INCOMPLETO`);
      return false;
    }
    
    const query = `
      SELECT 
        c.CursoId,
        c.Titulo,
        COUNT(l.LeccionId) as TotalLecciones,
        COALESCE(SUM(CASE WHEN pu.EstaCompletada = 1 THEN 1 ELSE 0 END), 0) as LeccionesCompletadas
      FROM Cursos c
      LEFT JOIN Lecciones l ON c.CursoId = l.CursoId
      LEFT JOIN ProgresoUsuario pu ON l.LeccionId = pu.LeccionId AND pu.UsuarioId = @userId
      WHERE c.EstaActivo = 1 AND c.OrdenIndice = @previousCourseOrder
      GROUP BY c.CursoId, c.Titulo
    `;

    const result = await databaseService.executeQuery(query, { 
      userId, 
      previousCourseOrder 
    });

    console.log(`📊 Resultado de consulta: ${result.recordset.length} registros encontrados`);

    if (result.recordset.length === 0) {
      console.log(`⚠️ No existe curso anterior con orden ${previousCourseOrder}, considerando como INCOMPLETO`);
      return false; // Cambiado: si no existe curso anterior, no desbloquear
    }

    const course = result.recordset[0];
    const isComplete = course.TotalLecciones > 0 && 
                      course.LeccionesCompletadas === course.TotalLecciones;

    console.log(`📊 Curso anterior: ${course.Titulo} (ID: ${course.CursoId})`);
    console.log(`📊 Progreso: ${course.LeccionesCompletadas}/${course.TotalLecciones} lecciones`);
    console.log(`📊 Estado: ${isComplete ? 'COMPLETO' : 'INCOMPLETO'}`);
    
    return isComplete;
  } catch (error) {
    console.error('❌ Error verificando curso anterior:', error);
    return false;
  }
}

/**
 * Determinar si un curso está desbloqueado basado en prerequisitos
 * @param userId ID del usuario
 * @param courseOrder Orden del curso actual
 * @param completedLessons Lecciones completadas en el curso actual
 * @returns true si el curso está desbloqueado
 */
async function isCourseUnlocked(userId: number, courseOrder: number, completedLessons: number): Promise<boolean> {
  console.log(`🔍 Verificando desbloqueo: Usuario ${userId}, Curso ${courseOrder}, Lecciones completadas: ${completedLessons}`);
  
  // El primer curso siempre está desbloqueado
  if (courseOrder === 1) {
    console.log(`✅ Curso ${courseOrder} desbloqueado: Primer curso`);
    return true;
  }

  // Si el usuario ya tiene lecciones completadas en este curso, está desbloqueado
  if (completedLessons > 0) {
    console.log(`✅ Curso ${courseOrder} desbloqueado: Ya tiene progreso (${completedLessons} lecciones)`);
    return true;
  }

  // Verificar si el curso anterior está completo
  console.log(`🔍 Verificando curso anterior (orden ${courseOrder - 1}) para usuario ${userId}...`);
  const previousCourseCompleted = await isPreviousCourseCompleted(userId, courseOrder - 1);
  console.log(`📊 Resultado: Curso anterior ${previousCourseCompleted ? 'COMPLETO' : 'INCOMPLETO'}`);
  return previousCourseCompleted;
}

// ============================================
// ENDPOINTS DE CURSOS
// ============================================

/**
 * POST /api/courses
 * Crear nuevo curso
 * Requiere autenticación
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { titulo, descripcion, nivelDificultad, imagenUrl, ordenIndice } = req.body;
    
    if (!titulo || !nivelDificultad) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: titulo, nivelDificultad',
        error: 'MISSING_REQUIRED_FIELDS',
        required: ['titulo', 'nivelDificultad']
      });
    }

    // Validar nivel de dificultad
    const nivelesValidos = ['Principiante', 'Intermedio', 'Avanzado'];
    if (!nivelesValidos.includes(nivelDificultad)) {
      return res.status(400).json({
        success: false,
        message: 'Nivel de dificultad debe ser: Principiante, Intermedio o Avanzado',
        error: 'INVALID_DIFFICULTY_LEVEL'
      });
    }

    const result = await databaseService.executeStoredProcedure(
      'SP_Curso_Crear',
      { titulo, descripcion, nivelDificultad, imagenUrl, ordenIndice }
    );

    if (result.recordset[0].Resultado === 'Exito') {
      res.status(201).json({
        success: true,
        message: result.recordset[0].Mensaje,
        data: {
          cursoId: result.recordset[0].CursoId
        }
      });
    } else {
      res.status(400).json({
        success: false,
        message: result.recordset[0].Mensaje
      });
    }
  } catch (error) {
    console.error('Error creando curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR'
    });
  }
});

/**
 * GET /api/courses
 * Obtener todos los cursos disponibles
 */
router.get('/', async (req: AuthRequest, res: Response) => {
  console.log('🚀🚀🚀 INICIO DE RUTA GET /api/courses - Petición recibida');
  console.log('🔍 Headers:', JSON.stringify(req.headers, null, 2));
  console.log('🔍 URL completa:', req.url);
  console.log('🔍 Método:', req.method);
  try {
        const query = `
        SELECT
          c.CursoId,
          c.Titulo,
          c.Descripcion,
          c.ImagenUrl,
          c.NivelDificultad,
          c.OrdenIndice,
          c.EstaActivo,
          c.FechaCreacion,
          COUNT(l.LeccionId) as TotalLecciones,
          COALESCE(SUM(CASE WHEN pu.EstaCompletada = 1 THEN 1 ELSE 0 END), 0) as LeccionesCompletadas
        FROM Cursos c
        LEFT JOIN Lecciones l ON c.CursoId = l.CursoId
        LEFT JOIN ProgresoUsuario pu ON l.LeccionId = pu.LeccionId AND pu.UsuarioId = @userId
        WHERE c.EstaActivo = 1
        GROUP BY c.CursoId, c.Titulo, c.Descripcion, c.ImagenUrl, c.NivelDificultad, c.OrdenIndice, c.EstaActivo, c.FechaCreacion
        ORDER BY c.OrdenIndice ASC, c.FechaCreacion ASC
      `;

    const userId = req.user?.UsuarioId || req.userId || 0; // Primero intentar req.user.UsuarioId, luego req.userId
    console.log(`🔍 Obteniendo cursos para usuario: ${userId}`);
    console.log(`🔍 req.user:`, req.user);
    console.log(`🔍 req.userId:`, req.userId);
    const result = await databaseService.executeQuery(query, { userId });

    console.log(`📊 Cursos encontrados en BD: ${result.recordset.length}`);

    // Procesar cursos con lógica de desbloqueo secuencial
    const courses = await Promise.all(
      result.recordset.map(async (row: any) => {
        console.log(`\n📖 Procesando curso: ${row.Titulo} (Orden: ${row.OrdenIndice})`);
        console.log(`📊 Lecciones completadas: ${row.LeccionesCompletadas}/${row.TotalLecciones}`);
        
        const isUnlocked = await isCourseUnlocked(
          userId, 
          row.OrdenIndice, 
          row.LeccionesCompletadas
        );

        console.log(`🎯 Curso ${row.OrdenIndice} ${isUnlocked ? 'DESBLOQUEADO' : 'BLOQUEADO'}`);

        return {
          courseId: row.CursoId,
          title: row.Titulo,
          description: row.Descripcion,
          imageUrl: row.ImagenUrl || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
          level: row.OrdenIndice || 1,
          estimatedHours: 10, // Default por ahora
          difficulty: row.NivelDificultad || 'Principiante',
          totalLessons: row.TotalLecciones,
          completedLessons: row.LeccionesCompletadas,
          progress: row.TotalLecciones > 0 ? (row.LeccionesCompletadas / row.TotalLecciones) * 100 : 0,
          isUnlocked: isUnlocked,
          topics: [],
          isActive: row.EstaActivo,
          createdAt: row.FechaCreacion,
        };
      })
    );

    res.json({
      success: true,
      message: 'Cursos obtenidos exitosamente',
      data: courses,
    });
  } catch (error) {
    console.error('Error obteniendo cursos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR',
    });
  }
});

/**
 * GET /api/courses/:id
 * Obtener un curso específico por ID
 */
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de curso inválido',
        error: 'INVALID_COURSE_ID',
      });
    }

        const query = `
        SELECT
          c.CursoId,
          c.Titulo,
          c.Descripcion,
          c.ImagenUrl,
          c.NivelDificultad,
          c.OrdenIndice,
          c.EstaActivo,
          c.FechaCreacion,
          COUNT(l.LeccionId) as TotalLecciones,
          COALESCE(SUM(CASE WHEN pu.EstaCompletada = 1 THEN 1 ELSE 0 END), 0) as LeccionesCompletadas
        FROM Cursos c
        LEFT JOIN Lecciones l ON c.CursoId = l.CursoId
        LEFT JOIN ProgresoUsuario pu ON l.LeccionId = pu.LeccionId AND pu.UsuarioId = @userId
        WHERE c.CursoId = @courseId AND c.EstaActivo = 1
        GROUP BY c.CursoId, c.Titulo, c.Descripcion, c.ImagenUrl, c.NivelDificultad, c.OrdenIndice, c.EstaActivo, c.FechaCreacion
      `;

    const userId = req.user?.UsuarioId || req.userId || 0;
    const result = await databaseService.executeQuery(query, { userId, courseId });

    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado',
        error: 'COURSE_NOT_FOUND',
      });
    }

    const row = result.recordset[0];
    const isUnlocked = await isCourseUnlocked(
      userId, 
      row.OrdenIndice, 
      row.LeccionesCompletadas
    );

    const course = {
      courseId: row.CursoId,
      title: row.Titulo,
      description: row.Descripcion,
      imageUrl: row.ImagenUrl || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
      level: row.OrdenIndice || 1,
      estimatedHours: 10,
      difficulty: row.NivelDificultad || 'Principiante',
      totalLessons: row.TotalLecciones,
      completedLessons: row.LeccionesCompletadas,
      progress: row.TotalLecciones > 0 ? (row.LeccionesCompletadas / row.TotalLecciones) * 100 : 0,
      isUnlocked: isUnlocked,
      topics: [],
      isActive: row.EstaActivo,
      createdAt: row.FechaCreacion,
    };

    res.json({
      success: true,
      message: 'Curso obtenido exitosamente',
      data: course,
    });
  } catch (error) {
    console.error('Error obteniendo curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR',
    });
  }
});

/**
 * POST /api/courses
 * Crear un nuevo curso
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, level, estimatedHours, difficulty, imageUrl, topics } = req.body;

    // Validaciones
    if (!title || !description || !level || !estimatedHours || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos',
        error: 'MISSING_REQUIRED_FIELDS',
        required: ['title', 'description', 'level', 'estimatedHours', 'difficulty'],
      });
    }

    if (level < 1 || level > 3) {
      return res.status(400).json({
        success: false,
        message: 'El nivel debe estar entre 1 y 3',
        error: 'INVALID_LEVEL',
      });
    }

    const validDifficulties = ['Principiante', 'Intermedio', 'Avanzado'];
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Dificultad inválida',
        error: 'INVALID_DIFFICULTY',
        validDifficulties,
      });
    }

    const query = `
      INSERT INTO Cursos (Titulo, Descripcion, ImagenUrl, NivelDificultad, OrdenIndice, EstaActivo, FechaCreacion)
      VALUES (@title, @description, @imageUrl, @difficulty, @level, 1, GETDATE())
    `;

    const result = await databaseService.executeQuery(query, {
      title,
      description,
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
      difficulty,
      level,
    });

    // Para SQL Server, necesitamos obtener el ID del último registro insertado
    const getIdQuery = 'SELECT SCOPE_IDENTITY() as NewCourseId';
    const idResult = await databaseService.executeQuery(getIdQuery, {});
    const newCourseId = idResult.recordset[0].NewCourseId;

    res.status(201).json({
      success: true,
      message: 'Curso creado exitosamente',
      data: {
        courseId: newCourseId,
        title,
        description,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400',
        level,
        estimatedHours,
        difficulty,
        totalLessons: 0,
        completedLessons: 0,
        progress: 0,
        isUnlocked: level === 1,
        topics: topics || [],
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error creando curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR',
    });
  }
});

/**
 * PUT /api/courses/:id
 * Actualizar un curso existente
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de curso inválido',
        error: 'INVALID_COURSE_ID',
      });
    }

    const { title, description, level, estimatedHours, difficulty, imageUrl, isActive } = req.body;

    // Verificar que el curso existe
    const checkQuery = 'SELECT CursoId FROM Cursos WHERE CursoId = @courseId';
    const checkResult = await databaseService.executeQuery(checkQuery, { courseId });

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado',
        error: 'COURSE_NOT_FOUND',
      });
    }

    // Construir query dinámicamente basado en los campos proporcionados
    const updates = [];
    const parameters: { [key: string]: any } = { courseId };

    if (title !== undefined) {
      updates.push('Titulo = @title');
      parameters.title = title;
    }
    if (description !== undefined) {
      updates.push('Descripcion = @description');
      parameters.description = description;
    }
    if (level !== undefined) {
      if (level < 1) {
        return res.status(400).json({
          success: false,
          message: 'El nivel debe ser mayor a 0',
          error: 'INVALID_LEVEL',
        });
      }
      updates.push('OrdenIndice = @level');
      parameters.level = level;
    }
    if (difficulty !== undefined) {
      const validDifficulties = ['Principiante', 'Intermedio', 'Avanzado'];
      if (!validDifficulties.includes(difficulty)) {
        return res.status(400).json({
          success: false,
          message: 'Dificultad inválida',
          error: 'INVALID_DIFFICULTY',
          validDifficulties,
        });
      }
      updates.push('NivelDificultad = @difficulty');
      parameters.difficulty = difficulty;
    }
    if (imageUrl !== undefined) {
      updates.push('ImagenUrl = @imageUrl');
      parameters.imageUrl = imageUrl;
    }
    if (isActive !== undefined) {
      updates.push('EstaActivo = @isActive');
      parameters.isActive = isActive ? 1 : 0;
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar',
        error: 'NO_FIELDS_TO_UPDATE',
      });
    }

    const query = `UPDATE Cursos SET ${updates.join(', ')} WHERE CursoId = @courseId`;
    await databaseService.executeQuery(query, parameters);

    res.json({
      success: true,
      message: 'Curso actualizado exitosamente',
    });
  } catch (error) {
    console.error('Error actualizando curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR',
    });
  }
});

/**
 * DELETE /api/courses/:id
 * Eliminar un curso (soft delete)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de curso inválido',
        error: 'INVALID_COURSE_ID',
      });
    }

    // Verificar que el curso existe
    const checkQuery = 'SELECT CursoId FROM Cursos WHERE CursoId = @courseId';
    const checkResult = await databaseService.executeQuery(checkQuery, { courseId });

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado',
        error: 'COURSE_NOT_FOUND',
      });
    }

    // Soft delete - marcar como inactivo
    const query = 'UPDATE Cursos SET EstaActivo = 0 WHERE CursoId = @courseId';
    await databaseService.executeQuery(query, { courseId });

    res.json({
      success: true,
      message: 'Curso eliminado exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR',
    });
  }
});

/**
 * GET /api/courses/:id/lessons
 * Obtener lecciones de un curso específico
 */
router.get('/:id/lessons', async (req: AuthRequest, res: Response) => {
  try {
    const courseId = parseInt(req.params.id);
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de curso inválido',
        error: 'INVALID_COURSE_ID',
      });
    }

    const query = `
      SELECT 
        l.LeccionId,
        l.CursoId,
        l.Titulo,
        l.Descripcion,
        l.Contenido,
        l.OrdenIndice,
        l.RecompensaXP,
        l.EstaBloqueada,
        COALESCE(pu.EstaCompletada, 0) as EstaCompletada
      FROM Lecciones l
      LEFT JOIN ProgresoUsuario pu ON l.LeccionId = pu.LeccionId AND pu.UsuarioId = @userId
      WHERE l.CursoId = @courseId
      ORDER BY l.OrdenIndice ASC
    `;

    const userId = req.user?.UsuarioId || req.userId || 0;
    const result = await databaseService.executeQuery(query, { userId, courseId });

    const lessons = result.recordset.map((row: any) => ({
      lessonId: row.LeccionId,
      courseId: row.CursoId,
      title: row.Titulo,
      description: row.Descripcion,
      content: row.Contenido,
      order: row.OrdenIndice,
      xpReward: row.RecompensaXP,
      type: 'theory', // Por defecto, se puede expandir más tarde
      codeExample: '', // Se puede obtener de otra tabla si existe
      expectedOutput: '', // Se puede obtener de otra tabla si existe
      hints: [], // Se puede obtener de otra tabla si existe
      isCompleted: row.EstaCompletada === 1,
      exercises: [], // Los ejercicios se cargarían por separado
    }));

    res.json({
      success: true,
      message: 'Lecciones obtenidas exitosamente',
      data: lessons,
    });
  } catch (error) {
    console.error('Error obteniendo lecciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR',
    });
  }
});

export default router;