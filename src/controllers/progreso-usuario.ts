// ============================================
// CONTROLADOR DE PROGRESO DE USUARIO SIMPLIFICADO
// Aplicación de Aprendizaje de C#
// ============================================

import { Request, Response } from 'express';
import { ProgresoUsuarioService } from '../services/progreso-usuario';
import { sendSuccess, sendError } from '../utils/response';

// Instancia del servicio
const progresoUsuarioService = new ProgresoUsuarioService();

// ============================================
// Obtener progreso por usuario
// ============================================
export async function getProgressByUser(req: any, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Usuario no autenticado', 'UNAUTHORIZED', 401);
      return;
    }

    const { cursoId, soloCompletadas } = req.query;

    const result = await progresoUsuarioService.obtenerProgresoPorUsuario({
      usuarioId: req.user.usuarioId,
      cursoId: cursoId ? parseInt(cursoId as string) : undefined,
      soloCompletadas: soloCompletadas === 'true'
    });

    if (result.resultado === 'Exito') {
      sendSuccess(res, 'Progreso obtenido exitosamente', result.datosUsuario);
      } else {
      sendError(res, result.mensaje, 'PROGRESS_ERROR', 400);
      }
    } catch (error) {
    console.error('Error obteniendo progreso:', error);
    sendError(res, 'Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
}

// ============================================
// Obtener lecciones recientes
// ============================================
export async function getRecentLessons(req: any, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Usuario no autenticado', 'UNAUTHORIZED', 401);
      return;
    }

    const { leccionId, soloCompletadas, limite } = req.query;

    const result = await progresoUsuarioService.obtenerLeccionesRecientes({
      usuarioId: req.user.usuarioId,
      leccionId: leccionId ? parseInt(leccionId as string) : undefined,
      soloCompletadas: soloCompletadas === 'true',
      limite: limite ? parseInt(limite as string) : 10
    });

    if (result.resultado === 'Exito') {
      sendSuccess(res, 'Lecciones recientes obtenidas exitosamente', result.datosUsuario);
    } else {
      sendError(res, result.mensaje, 'LESSONS_ERROR', 400);
    }
  } catch (error) {
    console.error('Error obteniendo lecciones recientes:', error);
    sendError(res, 'Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
}

// ============================================
// Obtener progreso por lección
// ============================================
export async function getProgressByLesson(req: any, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Usuario no autenticado', 'UNAUTHORIZED', 401);
      return;
    }

    const { leccionId } = req.params;

    const result = await progresoUsuarioService.obtenerProgresoPorLeccion({
      usuarioId: req.user.usuarioId,
      leccionId: parseInt(leccionId)
    });

    if (result.resultado === 'Exito') {
      sendSuccess(res, 'Progreso de lección obtenido exitosamente', result.datosUsuario);
    } else {
      sendError(res, result.mensaje, 'LESSON_PROGRESS_ERROR', 400);
    }
  } catch (error) {
    console.error('Error obteniendo progreso de lección:', error);
    sendError(res, 'Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
}

// ============================================
// Crear progreso
// ============================================
export async function createProgress(req: any, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Usuario no autenticado', 'UNAUTHORIZED', 401);
      return;
    }

    const { leccionId, porcentajeCompletado, xpGanado } = req.body;

    if (!leccionId || porcentajeCompletado === undefined) {
      sendError(res, 'Lección ID y porcentaje completado son requeridos', 'MISSING_FIELDS', 400);
      return;
    }

    const result = await progresoUsuarioService.crearProgreso({
      usuarioId: req.user.usuarioId,
        leccionId,
        porcentajeCompletado,
      xpGanado: xpGanado || 0
    });

    if (result.resultado === 'Exito') {
      sendSuccess(res, 'Progreso creado exitosamente', result.datosUsuario);
      } else {
      sendError(res, result.mensaje, 'CREATE_PROGRESS_ERROR', 400);
      }
    } catch (error) {
    console.error('Error creando progreso:', error);
    sendError(res, 'Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
}

// ============================================
// Actualizar progreso
// ============================================
export async function updateProgress(req: any, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Usuario no autenticado', 'UNAUTHORIZED', 401);
      return;
    }

    const { leccionId } = req.params;
    const { porcentajeCompletado, xpGanado } = req.body;

    if (porcentajeCompletado === undefined) {
      sendError(res, 'Porcentaje completado es requerido', 'MISSING_PERCENTAGE', 400);
      return;
    }

    const result = await progresoUsuarioService.actualizarProgreso({
      usuarioId: req.user.usuarioId,
      leccionId: parseInt(leccionId),
      porcentajeCompletado,
      xpGanado: xpGanado || 0
    });

    if (result.resultado === 'Exito') {
      sendSuccess(res, 'Progreso actualizado exitosamente', result.datosUsuario);
      } else {
      sendError(res, result.mensaje, 'UPDATE_PROGRESS_ERROR', 400);
      }
    } catch (error) {
    console.error('Error actualizando progreso:', error);
    sendError(res, 'Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
}

// ============================================
// Marcar lección como completada
// ============================================
export async function markLessonCompleted(req: any, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Usuario no autenticado', 'UNAUTHORIZED', 401);
      return;
    }

    const { leccionId } = req.params;

    const result = await progresoUsuarioService.marcarCompletada({
      usuarioId: req.user.usuarioId,
      leccionId: parseInt(leccionId)
    });

    if (result.resultado === 'Exito') {
      sendSuccess(res, 'Lección marcada como completada exitosamente', result.datosUsuario);
    } else {
      sendError(res, result.mensaje, 'MARK_COMPLETED_ERROR', 400);
    }
  } catch (error) {
    console.error('Error marcando lección como completada:', error);
    sendError(res, 'Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
}

// ============================================
// Obtener resumen de curso
// ============================================
export async function getCourseSummary(req: any, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Usuario no autenticado', 'UNAUTHORIZED', 401);
      return;
    }

    const { cursoId } = req.params;

    const result = await progresoUsuarioService.obtenerResumenCurso({
      usuarioId: req.user.usuarioId,
      cursoId: parseInt(cursoId)
    });

    if (result.resultado === 'Exito') {
      sendSuccess(res, 'Resumen de curso obtenido exitosamente', result.datosUsuario);
    } else {
      sendError(res, result.mensaje, 'COURSE_SUMMARY_ERROR', 400);
    }
  } catch (error) {
    console.error('Error obteniendo resumen de curso:', error);
    sendError(res, 'Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
}

// ============================================
// Obtener estadísticas de usuario
// ============================================
export async function getUserStats(req: any, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Usuario no autenticado', 'UNAUTHORIZED', 401);
      return;
    }

    const { limite } = req.query;

    const result = await progresoUsuarioService.obtenerEstadisticasUsuario({
      usuarioId: req.user.usuarioId,
      limite: limite ? parseInt(limite as string) : 10
    });

    if (result.resultado === 'Exito') {
      sendSuccess(res, 'Estadísticas obtenidas exitosamente', result.datosUsuario);
    } else {
      sendError(res, result.mensaje, 'STATS_ERROR', 400);
    }
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    sendError(res, 'Error interno del servidor', 'INTERNAL_ERROR', 500);
  }
}

// ============================================
// Exportar controlador para rutas
// ============================================
export const ProgresoUsuarioController = {
  getProgressByUser,
  getRecentLessons,
  getProgressByLesson,
  createProgress,
  updateProgress,
  markLessonCompleted,
  getCourseSummary,
  getUserStats
};