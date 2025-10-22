// ============================================
// RUTAS DE LECCIONES
// Aplicación de Aprendizaje de C#
// ============================================

import express from 'express';
import { Request, Response } from 'express';
import { databaseService } from '../services/database';

const router = express.Router();

// ============================================
// ENDPOINTS DE LECCIONES
// ============================================

/**
 * GET /api/lessons
 * Obtener todas las lecciones (con filtros opcionales)
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { courseId, limit, offset } = req.query;
    
    let query = `
      SELECT 
        l.LeccionId,
        l.CursoId,
        l.Titulo,
        l.Descripcion,
        l.Contenido,
        l.OrdenIndice,
        l.RecompensaXP,
        l.EstaBloqueada,
        l.FechaCreacion,
        c.Titulo as CursoTitulo,
        COALESCE(pu.EstaCompletada, 0) as EstaCompletada
      FROM Lecciones l
      INNER JOIN Cursos c ON l.CursoId = c.CursoId
      LEFT JOIN ProgresoUsuario pu ON l.LeccionId = pu.LeccionId AND pu.UsuarioId = @userId
      WHERE c.EstaActivo = 1
    `;
    
    const parameters: { [key: string]: any } = { 
      userId: req.user?.usuarioId || 0 
    };
    
    if (courseId) {
      query += ' AND l.CursoId = @courseId';
      parameters.courseId = parseInt(courseId as string);
    }
    
    query += ' ORDER BY l.CursoId ASC, l.OrdenIndice ASC';
    
    if (limit) {
      query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
      parameters.limit = parseInt(limit as string);
      parameters.offset = parseInt(offset as string) || 0;
    }
    
    const result = await databaseService.executeQuery(query, parameters);
    
    const lessons = result.recordset.map((row: any) => ({
      lessonId: row.LeccionId,
      courseId: row.CursoId,
      courseTitle: row.CursoTitulo,
      title: row.Titulo,
      description: row.Descripcion,
      content: row.Contenido,
      order: row.OrdenIndice,
      xpReward: row.RecompensaXP,
      type: 'theory', // Por defecto
      codeExample: '', // Se puede expandir más tarde
      expectedOutput: '', // Se puede expandir más tarde
      hints: [], // Se puede expandir más tarde
      isCompleted: row.EstaCompletada === 1,
      isLocked: row.EstaBloqueada === 1,
      exercises: [], // Los ejercicios se cargarían por separado
      createdAt: row.FechaCreacion,
    }));
    
    res.json({
      success: true,
      message: 'Lecciones obtenidas exitosamente',
      data: lessons,
      pagination: {
        total: lessons.length,
        limit: limit ? parseInt(limit as string) : null,
        offset: offset ? parseInt(offset as string) : null,
      },
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

/**
 * GET /api/lessons/:id
 * Obtener una lección específica por ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const lessonId = parseInt(req.params.id);
    
    if (isNaN(lessonId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de lección inválido',
        error: 'INVALID_LESSON_ID',
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
        l.FechaCreacion,
        c.Titulo as CursoTitulo,
        c.NivelDificultad,
        COALESCE(pu.EstaCompletada, 0) as EstaCompletada
      FROM Lecciones l
      INNER JOIN Cursos c ON l.CursoId = c.CursoId
      LEFT JOIN ProgresoUsuario pu ON l.LeccionId = pu.LeccionId AND pu.UsuarioId = @userId
      WHERE l.LeccionId = @lessonId AND c.EstaActivo = 1
    `;
    
    const userId = req.user?.usuarioId || 0;
    const result = await databaseService.executeQuery(query, { userId, lessonId });
    
    if (result.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lección no encontrada',
        error: 'LESSON_NOT_FOUND',
      });
    }
    
    const row = result.recordset[0];
    const lesson = {
      lessonId: row.LeccionId,
      courseId: row.CursoId,
      courseTitle: row.CursoTitulo,
      courseDifficulty: row.NivelDificultad,
      title: row.Titulo,
      description: row.Descripcion,
      content: row.Contenido,
      order: row.OrdenIndice,
      xpReward: row.RecompensaXP,
      type: 'theory', // Por defecto
      codeExample: '', // Se puede expandir más tarde
      expectedOutput: '', // Se puede expandir más tarde
      hints: [], // Se puede expandir más tarde
      isCompleted: row.EstaCompletada === 1,
      isLocked: row.EstaBloqueada === 1,
      exercises: [], // Los ejercicios se cargarían por separado
      createdAt: row.FechaCreacion,
    };
    
    res.json({
      success: true,
      message: 'Lección obtenida exitosamente',
      data: lesson,
    });
  } catch (error) {
    console.error('Error obteniendo lección:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR',
    });
  }
});

/**
 * POST /api/lessons
 * Crear una nueva lección
 */
router.post('/', async (req: Request, res: Response) => {
  try {
    const { 
      courseId, 
      title, 
      description, 
      content, 
      order, 
      xpReward, 
      isLocked,
      type,
      codeExample,
      expectedOutput,
      hints
    } = req.body;
    
    // Validaciones
    if (!courseId || !title || !description || !content) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios: courseId, title, description, content',
        error: 'MISSING_REQUIRED_FIELDS',
      });
    }
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'courseId debe ser un número válido',
        error: 'INVALID_COURSE_ID',
      });
    }
    
    // Verificar que el curso existe
    const checkCourseQuery = 'SELECT CursoId FROM Cursos WHERE CursoId = @courseId AND EstaActivo = 1';
    const checkCourseResult = await databaseService.executeQuery(checkCourseQuery, { courseId });
    
    if (checkCourseResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado',
        error: 'COURSE_NOT_FOUND',
      });
    }
    
    // Si no se proporciona order, obtener el siguiente número
    let finalOrder = order;
    if (!finalOrder) {
      const maxOrderQuery = 'SELECT ISNULL(MAX(OrdenIndice), 0) + 1 as NextOrder FROM Lecciones WHERE CursoId = @courseId';
      const maxOrderResult = await databaseService.executeQuery(maxOrderQuery, { courseId });
      finalOrder = maxOrderResult.recordset[0].NextOrder;
    }
    
    const query = `
      INSERT INTO Lecciones (
        CursoId, 
        Titulo, 
        Descripcion, 
        Contenido, 
        OrdenIndice, 
        RecompensaXP, 
        EstaBloqueada, 
        FechaCreacion
      )
      OUTPUT INSERTED.LeccionId
      VALUES (
        @courseId, 
        @title, 
        @description, 
        @content, 
        @order, 
        @xpReward, 
        @isLocked, 
        GETDATE()
      )
    `;
    
    const parameters = {
      courseId,
      title,
      description,
      content,
      order: finalOrder,
      xpReward: xpReward || 50,
      isLocked: isLocked ? 1 : 0,
    };
    
    const result = await databaseService.executeQuery(query, parameters);
    const newLessonId = result.recordset[0].LeccionId;
    
    // Obtener la lección creada para devolverla
    const getLessonQuery = `
      SELECT 
        l.LeccionId,
        l.CursoId,
        l.Titulo,
        l.Descripcion,
        l.Contenido,
        l.OrdenIndice,
        l.RecompensaXP,
        l.EstaBloqueada,
        l.FechaCreacion,
        c.Titulo as CursoTitulo
      FROM Lecciones l
      INNER JOIN Cursos c ON l.CursoId = c.CursoId
      WHERE l.LeccionId = @lessonId
    `;
    
    const lessonResult = await databaseService.executeQuery(getLessonQuery, { lessonId: newLessonId });
    const lessonRow = lessonResult.recordset[0];
    
    const newLesson = {
      lessonId: lessonRow.LeccionId,
      courseId: lessonRow.CursoId,
      courseTitle: lessonRow.CursoTitulo,
      title: lessonRow.Titulo,
      description: lessonRow.Descripcion,
      content: lessonRow.Contenido,
      order: lessonRow.OrdenIndice,
      xpReward: lessonRow.RecompensaXP,
      type: type || 'theory',
      codeExample: codeExample || '',
      expectedOutput: expectedOutput || '',
      hints: hints || [],
      isCompleted: false,
      isLocked: lessonRow.EstaBloqueada === 1,
      exercises: [],
      createdAt: lessonRow.FechaCreacion,
    };
    
    res.status(201).json({
      success: true,
      message: 'Lección creada exitosamente',
      data: newLesson,
    });
  } catch (error) {
    console.error('Error creando lección:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR',
    });
  }
});

/**
 * POST /api/courses/:courseId/lessons
 * Crear una lección en un curso específico
 */
router.post('/courses/:courseId/lessons', async (req: Request, res: Response) => {
  try {
    const courseId = parseInt(req.params.courseId);
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de curso inválido',
        error: 'INVALID_COURSE_ID',
      });
    }
    
    // Agregar courseId al body
    req.body.courseId = courseId;
    
    // Reutilizar la lógica del POST /api/lessons
    return router.handle(req, res);
  } catch (error) {
    console.error('Error creando lección en curso:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR',
    });
  }
});

/**
 * PUT /api/lessons/:id
 * Actualizar una lección existente
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const lessonId = parseInt(req.params.id);
    
    if (isNaN(lessonId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de lección inválido',
        error: 'INVALID_LESSON_ID',
      });
    }
    
    const { 
      title, 
      description, 
      content, 
      order, 
      xpReward, 
      isLocked,
      type,
      codeExample,
      expectedOutput,
      hints
    } = req.body;
    
    // Verificar que la lección existe
    const checkQuery = 'SELECT LeccionId FROM Lecciones WHERE LeccionId = @lessonId';
    const checkResult = await databaseService.executeQuery(checkQuery, { lessonId });
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lección no encontrada',
        error: 'LESSON_NOT_FOUND',
      });
    }
    
    // Construir query dinámicamente basado en los campos proporcionados
    const updates = [];
    const parameters: { [key: string]: any } = { lessonId };
    
    if (title !== undefined) {
      updates.push('Titulo = @title');
      parameters.title = title;
    }
    if (description !== undefined) {
      updates.push('Descripcion = @description');
      parameters.description = description;
    }
    if (content !== undefined) {
      updates.push('Contenido = @content');
      parameters.content = content;
    }
    if (order !== undefined) {
      if (order < 1) {
        return res.status(400).json({
          success: false,
          message: 'El orden debe ser mayor a 0',
          error: 'INVALID_ORDER',
        });
      }
      updates.push('OrdenIndice = @order');
      parameters.order = order;
    }
    if (xpReward !== undefined) {
      if (xpReward < 0) {
        return res.status(400).json({
          success: false,
          message: 'La recompensa XP debe ser mayor o igual a 0',
          error: 'INVALID_XP_REWARD',
        });
      }
      updates.push('RecompensaXP = @xpReward');
      parameters.xpReward = xpReward;
    }
    if (isLocked !== undefined) {
      updates.push('EstaBloqueada = @isLocked');
      parameters.isLocked = isLocked ? 1 : 0;
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No hay campos para actualizar',
        error: 'NO_FIELDS_TO_UPDATE',
      });
    }
    
    const query = `UPDATE Lecciones SET ${updates.join(', ')} WHERE LeccionId = @lessonId`;
    await databaseService.executeQuery(query, parameters);
    
    res.json({
      success: true,
      message: 'Lección actualizada exitosamente',
    });
  } catch (error) {
    console.error('Error actualizando lección:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR',
    });
  }
});

/**
 * DELETE /api/lessons/:id
 * Eliminar una lección
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const lessonId = parseInt(req.params.id);
    
    if (isNaN(lessonId)) {
      return res.status(400).json({
        success: false,
        message: 'ID de lección inválido',
        error: 'INVALID_LESSON_ID',
      });
    }
    
    // Verificar que la lección existe
    const checkQuery = 'SELECT LeccionId FROM Lecciones WHERE LeccionId = @lessonId';
    const checkResult = await databaseService.executeQuery(checkQuery, { lessonId });
    
    if (checkResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Lección no encontrada',
        error: 'LESSON_NOT_FOUND',
      });
    }
    
    // Eliminar la lección (hard delete)
    const query = 'DELETE FROM Lecciones WHERE LeccionId = @lessonId';
    await databaseService.executeQuery(query, { lessonId });
    
    res.json({
      success: true,
      message: 'Lección eliminada exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando lección:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR',
    });
  }
});

/**
 * POST /api/lessons/bulk
 * Crear múltiples lecciones de una vez
 */
router.post('/bulk', async (req: Request, res: Response) => {
  try {
    const { courseId, lessons } = req.body;
    
    if (!courseId || !lessons || !Array.isArray(lessons)) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios: courseId y lessons (array)',
        error: 'MISSING_REQUIRED_FIELDS',
      });
    }
    
    if (isNaN(courseId)) {
      return res.status(400).json({
        success: false,
        message: 'courseId debe ser un número válido',
        error: 'INVALID_COURSE_ID',
      });
    }
    
    // Verificar que el curso existe
    const checkCourseQuery = 'SELECT CursoId FROM Cursos WHERE CursoId = @courseId AND EstaActivo = 1';
    const checkCourseResult = await databaseService.executeQuery(checkCourseQuery, { courseId });
    
    if (checkCourseResult.recordset.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Curso no encontrado',
        error: 'COURSE_NOT_FOUND',
      });
    }
    
    const createdLessons = [];
    
    for (let i = 0; i < lessons.length; i++) {
      const lesson = lessons[i];
      const { 
        title, 
        description, 
        content, 
        order, 
        xpReward, 
        isLocked,
        type,
        codeExample,
        expectedOutput,
        hints,
        // Campos en español para compatibilidad
        titulo,
        descripcion,
        contenido,
        ordenIndice,
        recompensaXP,
        estaBloqueada,
        tipoLeccion,
        codigoEjemplo,
        salidaEsperada,
        pistas
      } = lesson;
      
      // Usar campos en español si están disponibles, sino usar los en inglés
      const finalTitle = titulo || title;
      const finalDescription = descripcion || description;
      const finalContent = contenido || content;
      const finalOrder = ordenIndice || order;
      const finalXpReward = recompensaXP || xpReward;
      const finalIsLocked = estaBloqueada !== undefined ? estaBloqueada : isLocked;
      const finalType = tipoLeccion || type;
      const finalCodeExample = codigoEjemplo || codeExample;
      const finalExpectedOutput = salidaEsperada || expectedOutput;
      const finalHints = pistas || hints;
      
      if (!finalTitle || !finalDescription || !finalContent) {
        return res.status(400).json({
          success: false,
          message: `Lección ${i + 1}: Faltan campos obligatorios: title/titulo, description/descripcion, content/contenido`,
          error: 'MISSING_REQUIRED_FIELDS',
        });
      }
      
      const query = `
        INSERT INTO Lecciones (
          CursoId, 
          Titulo, 
          Descripcion, 
          Contenido, 
          OrdenIndice, 
          RecompensaXP, 
          EstaBloqueada, 
          FechaCreacion
        )
        OUTPUT INSERTED.LeccionId
        VALUES (
          @courseId, 
          @title, 
          @description, 
          @content, 
          @order, 
          @xpReward, 
          @isLocked, 
          GETDATE()
        )
      `;
      
      const parameters = {
        courseId,
        title: finalTitle,
        description: finalDescription,
        content: finalContent,
        order: finalOrder || (i + 1),
        xpReward: finalXpReward || 50,
        isLocked: finalIsLocked ? 1 : 0,
      };
      
      const result = await databaseService.executeQuery(query, parameters);
      const newLessonId = result.recordset[0].LeccionId;
      
      createdLessons.push({
        lessonId: newLessonId,
        courseId,
        title: finalTitle,
        description: finalDescription,
        content: finalContent,
        order: parameters.order,
        xpReward: parameters.xpReward,
        type: finalType || 'theory',
        codeExample: finalCodeExample || '',
        expectedOutput: finalExpectedOutput || '',
        hints: finalHints || [],
        isCompleted: false,
        isLocked: parameters.isLocked === 1,
        exercises: [],
      });
    }
    
    res.status(201).json({
      success: true,
      message: `${createdLessons.length} lecciones creadas exitosamente`,
      data: createdLessons,
    });
  } catch (error) {
    console.error('Error creando lecciones en lote:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_ERROR',
    });
  }
});

export default router;
