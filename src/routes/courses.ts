// ============================================
// RUTAS DE CURSOS SIMPLIFICADAS
// Aplicación de Aprendizaje de C#
// ============================================

import { Router } from 'express';
import { databaseService } from '../services/database';
import { authenticateToken } from '../middleware/auth';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

// ============================================
// GET /api/courses - Obtener todos los cursos
// ============================================
router.get('/', async (req: any, res: any) => {
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
        COUNT(l.LeccionId) as TotalLecciones
      FROM Cursos c
      LEFT JOIN Lecciones l ON c.CursoId = l.CursoId AND l.EstaActivo = 1
      WHERE c.EstaActivo = 1
      GROUP BY c.CursoId, c.Titulo, c.Descripcion, c.ImagenUrl, c.NivelDificultad, c.OrdenIndice, c.EstaActivo
      ORDER BY c.OrdenIndice ASC
    `;

    const result = await databaseService.executeQuery(query);
    
    if (result.recordset) {
      sendSuccess(res, 'Cursos obtenidos exitosamente', result.recordset);
    } else {
      sendError(res, 'Error obteniendo cursos', 'COURSES_ERROR', 500);
    }
  } catch (error) {
    console.error('Error en GET /courses:', error);
    sendError(res, 'Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
});

// ============================================
// GET /api/courses/:id - Obtener curso específico
// ============================================
router.get('/:id', async (req: any, res: any) => {
  try {
    const courseId = req.params.id;
    
    const query = `
      SELECT
        c.CursoId,
        c.Titulo,
        c.Descripcion,
        c.ImagenUrl,
        c.NivelDificultad,
        c.OrdenIndice,
        c.EstaActivo,
        COUNT(l.LeccionId) as TotalLecciones
      FROM Cursos c
      LEFT JOIN Lecciones l ON c.CursoId = l.CursoId AND l.EstaActivo = 1
      WHERE c.CursoId = @courseId AND c.EstaActivo = 1
      GROUP BY c.CursoId, c.Titulo, c.Descripcion, c.ImagenUrl, c.NivelDificultad, c.OrdenIndice, c.EstaActivo
    `;

    const result = await databaseService.executeQuery(query, [{ name: 'courseId', value: courseId }]);
    
    if (result.recordset && result.recordset.length > 0) {
      sendSuccess(res, 'Curso obtenido exitosamente', result.recordset[0]);
    } else {
      sendError(res, 'Curso no encontrado', 'COURSE_NOT_FOUND', 404);
    }
  } catch (error) {
    console.error('Error en GET /courses/:id:', error);
    sendError(res, 'Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
});

// ============================================
// GET /api/courses/:id/lessons - Obtener lecciones de un curso
// ============================================
router.get('/:id/lessons', authenticateToken, async (req: any, res: any) => {
  try {
    const courseId = req.params.id;
    
    const query = `
      SELECT
        l.LeccionId,
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
        l.EstaBloqueada
      FROM Lecciones l
      WHERE l.CursoId = @courseId AND l.EstaActivo = 1
      ORDER BY l.OrdenIndice ASC
    `;

    const result = await databaseService.executeQuery(query, [{ name: 'courseId', value: courseId }]);
    
    if (result.recordset) {
      sendSuccess(res, 'Lecciones obtenidas exitosamente', result.recordset);
    } else {
      sendError(res, 'Error obteniendo lecciones', 'LESSONS_ERROR', 500);
    }
  } catch (error) {
    console.error('Error en GET /courses/:id/lessons:', error);
    sendError(res, 'Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
});

export default router;