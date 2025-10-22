// ============================================
// CONTROLADOR DE PROGRESO DE USUARIO SIMPLIFICADO
// Aplicación de Aprendizaje de C#
// ============================================

import { Request, Response } from 'express';
import { ProgresoUsuarioService } from '../services/progreso-usuario';
import { sendSuccess, sendError } from '../utils/response';

// Usar métodos estáticos del servicio

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

    const result = await ProgresoUsuarioService.obtenerProgresoPorUsuario(
      req.user.usuarioId,
      cursoId ? parseInt(cursoId as string) : undefined,
      soloCompletadas === 'true'
    );

    sendSuccess(res, 'Progreso obtenido exitosamente', result);
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

    const result = await ProgresoUsuarioService.obtenerLeccionesRecientes(
      req.user.usuarioId,
      limite ? parseInt(limite as string) : 10
    );

    sendSuccess(res, 'Lecciones recientes obtenidas exitosamente', result);
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

    const result = await ProgresoUsuarioService.obtenerProgresoPorLeccion(
      parseInt(leccionId),
      false,
      50
    );

    sendSuccess(res, 'Progreso de lección obtenido exitosamente', result);
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

    const result = await ProgresoUsuarioService.crearProgreso(
      req.user.usuarioId,
      leccionId,
      porcentajeCompletado
    );

    if (result.success) {
      sendSuccess(res, 'Progreso creado exitosamente', result);
    } else {
      sendError(res, result.message, 'CREATE_PROGRESS_ERROR', 400);
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

    const result = await ProgresoUsuarioService.actualizarProgreso(
      req.user.usuarioId,
      parseInt(leccionId),
      porcentajeCompletado,
      xpGanado || 0
    );

    if (result.success) {
      sendSuccess(res, 'Progreso actualizado exitosamente', result);
    } else {
      sendError(res, result.message, 'UPDATE_PROGRESS_ERROR', 400);
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

    const result = await ProgresoUsuarioService.marcarCompletada(
      req.user.usuarioId,
      parseInt(leccionId)
    );

    if (result.success) {
      sendSuccess(res, 'Lección marcada como completada exitosamente', result);
    } else {
      sendError(res, result.message, 'MARK_COMPLETED_ERROR', 400);
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

    const result = await ProgresoUsuarioService.obtenerResumenCurso(
      req.user.usuarioId,
      parseInt(cursoId)
    );

    sendSuccess(res, 'Resumen de curso obtenido exitosamente', result);
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

    const result = await ProgresoUsuarioService.obtenerEstadisticas(req.user.usuarioId);

    sendSuccess(res, 'Estadísticas obtenidas exitosamente', result);
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