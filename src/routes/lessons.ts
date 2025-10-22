// ============================================
// RUTAS DE LECCIONES SIMPLIFICADAS
// Aplicación de Aprendizaje de C#
// ============================================

import { Router } from 'express';
import { databaseService } from '../services/database';
import { authenticateToken } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

// ============================================
// GET /api/lessons - Obtener todas las lecciones
// ============================================
router.get('/', authenticateToken, async (req: any, res: any) => {
  try {
    const { courseId, limit = 10, offset = 0 } = req.query;
    
    let query = `
      SELECT
        l.LeccionId,
        l.CursoId,
        l.Titulo,
        l.Descripcion,
        l.Contenido,
        l.EjemploCodigo,
        l.ResultadoEsperado,
        l.Pistas,
        l.OrdenIndice,
        l.RecompensaXP,
        l.TipoLeccion,
        l.EstaActivo,
        l.EstaBloqueada,
        c.Titulo as CursoTitulo
      FROM Lecciones l
      INNER JOIN Cursos c ON l.CursoId = c.CursoId
      WHERE l.EstaActivo = 1
    `;
    
    const params: any[] = [];
    
    if (courseId) {
      query += ' AND l.CursoId = @courseId';
      params.push({ name: 'courseId', value: courseId });
    }
    
    query += ' ORDER BY l.OrdenIndice ASC';
    query += ' OFFSET @offset ROWS FETCH NEXT @limit ROWS ONLY';
    
    params.push({ name: 'offset', value: parseInt(offset as string) });
    params.push({ name: 'limit', value: parseInt(limit as string) });

    const result = await databaseService.executeQuery(query, params);
    
    if (result.recordset) {
      sendSuccess(res, 'Lecciones obtenidas exitosamente', result.recordset);
    } else {
      sendError(res, 'Error obteniendo lecciones', 'LESSONS_ERROR', 500);
    }
  } catch (error) {
    console.error('Error en GET /lessons:', error);
    sendError(res, 'Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
});

// ============================================
// GET /api/lessons/:id - Obtener lección específica
// ============================================
router.get('/:id', authenticateToken, async (req: any, res: any) => {
  try {
    const lessonId = req.params.id;
    
    const query = `
      SELECT
        l.LeccionId,
        l.CursoId,
        l.Titulo,
        l.Descripcion,
        l.Contenido,
        l.EjemploCodigo,
        l.ResultadoEsperado,
        l.Pistas,
        l.OrdenIndice,
        l.RecompensaXP,
        l.TipoLeccion,
        l.EstaActivo,
        l.EstaBloqueada,
        c.Titulo as CursoTitulo
      FROM Lecciones l
      INNER JOIN Cursos c ON l.CursoId = c.CursoId
      WHERE l.LeccionId = @lessonId AND l.EstaActivo = 1
    `;

    const result = await databaseService.executeQuery(query, [{ name: 'lessonId', value: lessonId }]);
    
    if (result.recordset && result.recordset.length > 0) {
      sendSuccess(res, 'Lección obtenida exitosamente', result.recordset[0]);
    } else {
      sendError(res, 'Lección no encontrada', 'LESSON_NOT_FOUND', 404);
    }
  } catch (error) {
    console.error('Error en GET /lessons/:id:', error);
    sendError(res, 'Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
});

export default router;