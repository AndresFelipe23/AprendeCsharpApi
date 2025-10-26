// ============================================
// CONTROLADOR DE PROGRESO DE USUARIOS
// Aplicación de Aprendizaje de C#
// ============================================

import { Request, Response } from 'express';
import { ProgresoUsuarioService } from '../services/progreso-usuario';
import { AuthRequest } from '../types/auth';

export class ProgresoUsuarioController {
  /**
   * POST /api/progress
   * Crear nuevo progreso de usuario en una lección
   */
  static async crearProgreso(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { leccionId, porcentajeCompletado = 0 } = req.body;
      const usuarioId = req.user?.UsuarioId;

      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED'
        });
      }

      if (!leccionId) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios: leccionId',
          error: 'MISSING_REQUIRED_FIELDS'
        });
      }

      if (isNaN(leccionId)) {
        return res.status(400).json({
          success: false,
          message: 'leccionId debe ser un número válido',
          error: 'INVALID_LESSON_ID'
        });
      }

      if (porcentajeCompletado < 0 || porcentajeCompletado > 100) {
        return res.status(400).json({
          success: false,
          message: 'El porcentaje completado debe estar entre 0 y 100',
          error: 'INVALID_PERCENTAGE'
        });
      }

      const resultado = await ProgresoUsuarioService.crearProgreso(
        usuarioId,
        leccionId,
        porcentajeCompletado
      );

      if (resultado.success) {
        res.status(201).json({
          success: true,
          message: resultado.message,
          data: {
            progresoId: resultado.progresoId,
            usuarioId,
            leccionId,
            porcentajeCompletado
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: resultado.message,
          error: 'PROGRESS_CREATION_FAILED'
        });
      }
    } catch (error) {
      console.error('Error en crearProgreso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * GET /api/progress
   * Obtener progreso del usuario autenticado
   */
  static async obtenerProgreso(req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.user?.UsuarioId;
      const cursoId = req.query['cursoId'] ? parseInt(req.query['cursoId'] as string) : undefined;
      const soloCompletadas = req.query['soloCompletadas'] === 'true';

      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED'
        });
      }

      const progreso = await ProgresoUsuarioService.obtenerProgresoPorUsuario(
        usuarioId,
        cursoId,
        soloCompletadas
      );

      res.json({
        success: true,
        message: 'Progreso obtenido exitosamente',
        data: progreso
      });
    } catch (error) {
      console.error('Error en obtenerProgreso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * GET /api/progress/lesson/:leccionId
   * Obtener progreso de todos los usuarios en una lección específica
   */
  static async obtenerProgresoPorLeccion(req: AuthRequest, res: Response): Promise<void> {
    try {
      const leccionId = parseInt(req.params['leccionId']);
      const soloCompletadas = req.query['soloCompletadas'] === 'true';
      const limite = req.query['limite'] ? parseInt(req.query['limite'] as string) : 50;

      if (isNaN(leccionId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de lección inválido',
          error: 'INVALID_LESSON_ID'
        });
      }

      const progreso = await ProgresoUsuarioService.obtenerProgresoPorLeccion(
        leccionId,
        soloCompletadas,
        limite
      );

      res.json({
        success: true,
        message: 'Progreso por lección obtenido exitosamente',
        data: progreso
      });
    } catch (error) {
      console.error('Error en obtenerProgresoPorLeccion:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * PUT /api/progress/:leccionId
   * Actualizar progreso de usuario en una lección específica
   */
  static async actualizarProgreso(req: AuthRequest, res: Response): Promise<void> {
    try {
      const leccionId = parseInt(req.params['leccionId']);
      const { porcentajeCompletado, xpGanado = 0 } = req.body;
      const usuarioId = req.user?.UsuarioId;

      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED'
        });
      }

      if (isNaN(leccionId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de lección inválido',
          error: 'INVALID_LESSON_ID'
        });
      }

      if (porcentajeCompletado === undefined || porcentajeCompletado === null) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios: porcentajeCompletado',
          error: 'MISSING_REQUIRED_FIELDS'
        });
      }

      if (porcentajeCompletado < 0 || porcentajeCompletado > 100) {
        return res.status(400).json({
          success: false,
          message: 'El porcentaje completado debe estar entre 0 y 100',
          error: 'INVALID_PERCENTAGE'
        });
      }

      if (xpGanado < 0) {
        return res.status(400).json({
          success: false,
          message: 'El XP ganado no puede ser negativo',
          error: 'INVALID_XP'
        });
      }

      const resultado = await ProgresoUsuarioService.actualizarProgreso(
        usuarioId,
        leccionId,
        porcentajeCompletado,
        xpGanado
      );

      if (resultado.success) {
        res.json({
          success: true,
          message: resultado.message,
          data: {
            usuarioId,
            leccionId,
            porcentajeCompletado,
            xpGanado
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: resultado.message,
          error: 'PROGRESS_UPDATE_FAILED'
        });
      }
    } catch (error) {
      console.error('Error en actualizarProgreso:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * POST /api/progress/:leccionId/complete
   * Marcar lección como completada
   */
  static async marcarCompletada(req: AuthRequest, res: Response): Promise<void> {
    try {
      const leccionId = parseInt(req.params['leccionId']);
      const { xpGanado } = req.body;
      const usuarioId = req.user?.UsuarioId;

      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED'
        });
      }

      if (isNaN(leccionId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de lección inválido',
          error: 'INVALID_LESSON_ID'
        });
      }

      if (xpGanado !== undefined && xpGanado < 0) {
        return res.status(400).json({
          success: false,
          message: 'El XP ganado no puede ser negativo',
          error: 'INVALID_XP'
        });
      }

      const resultado = await ProgresoUsuarioService.marcarCompletada(
        usuarioId,
        leccionId,
        xpGanado
      );

      if (resultado.success) {
        res.json({
          success: true,
          message: resultado.message,
          data: {
            usuarioId,
            leccionId,
            xpGanado: resultado.xpGanado,
            completada: true
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: resultado.message,
          error: 'COMPLETION_FAILED'
        });
      }
    } catch (error) {
      console.error('Error en marcarCompletada:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * GET /api/progress/stats
   * Obtener estadísticas de progreso del usuario
   */
  static async obtenerEstadisticas(req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.user?.UsuarioId;

      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED'
        });
      }

      const estadisticas = await ProgresoUsuarioService.obtenerEstadisticas(usuarioId);

      res.json({
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: estadisticas
      });
    } catch (error) {
      console.error('Error en obtenerEstadisticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * GET /api/progress/courses
   * Obtener resumen de progreso por curso
   */
  static async obtenerResumenCursos(req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.user?.UsuarioId;
      const cursoId = req.query['cursoId'] ? parseInt(req.query['cursoId'] as string) : undefined;

      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED'
        });
      }

      const resumenCursos = await ProgresoUsuarioService.obtenerResumenCurso(
        usuarioId,
        cursoId
      );

      res.json({
        success: true,
        message: 'Resumen de cursos obtenido exitosamente',
        data: resumenCursos
      });
    } catch (error) {
      console.error('Error en obtenerResumenCursos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * GET /api/progress/general
   * Obtener progreso general del usuario
   */
  static async obtenerProgresoGeneral(req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.user?.UsuarioId;

      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED'
        });
      }

      const progresoGeneral = await ProgresoUsuarioService.obtenerProgresoGeneral(usuarioId);

      res.json({
        success: true,
        message: 'Progreso general obtenido exitosamente',
        data: progresoGeneral
      });
    } catch (error) {
      console.error('Error en obtenerProgresoGeneral:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * GET /api/progress/recent
   * Obtener lecciones recientes del usuario
   */
  static async obtenerLeccionesRecientes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.user?.UsuarioId;
      const limite = req.query['limite'] ? parseInt(req.query['limite'] as string) : 10;

      if (!usuarioId) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED'
        });
      }

      if (limite < 1 || limite > 50) {
        return res.status(400).json({
          success: false,
          message: 'El límite debe estar entre 1 y 50',
          error: 'INVALID_LIMIT'
        });
      }

      const leccionesRecientes = await ProgresoUsuarioService.obtenerLeccionesRecientes(
        usuarioId,
        limite
      );

      res.json({
        success: true,
        message: 'Lecciones recientes obtenidas exitosamente',
        data: leccionesRecientes
      });
    } catch (error) {
      console.error('Error en obtenerLeccionesRecientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }
}
