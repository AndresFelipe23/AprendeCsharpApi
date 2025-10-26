// ============================================
// CONTROLADOR DE LOGROS
// Aplicación de Aprendizaje de C#
// ============================================

import { Response } from 'express';
import { LogrosService } from '../services/logros';
import { AuthRequest } from '../types/auth';

export class LogrosController {
  /**
   * GET /api/achievements
   * Obtener todos los logros disponibles
   * Ruta pública
   */
  static async obtenerTodos(req: AuthRequest, res: Response): Promise<void> {
    try {
      const resultado = await LogrosService.obtenerTodos();

      if (resultado.success) {
        res.status(200).json({
          success: true,
          data: resultado.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al obtener logros',
          error: 'ACHIEVEMENTS_FETCH_FAILED'
        });
      }
    } catch (error) {
      console.error('Error en obtenerTodos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * GET /api/achievements/user
   * Obtener logros del usuario autenticado
   * Query params:
   * - soloDesbloqueados (opcional): true/false (default: false)
   * Requiere autenticación
   */
  static async obtenerLogrosUsuario(req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.user?.UsuarioId;

      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      const soloDesbloqueados = req.query['soloDesbloqueados'] === 'true';

      const resultado = await LogrosService.obtenerLogrosUsuario(
        usuarioId,
        soloDesbloqueados
      );

      if (resultado.success) {
        res.status(200).json({
          success: true,
          data: resultado.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al obtener logros del usuario',
          error: 'USER_ACHIEVEMENTS_FETCH_FAILED'
        });
      }
    } catch (error) {
      console.error('Error en obtenerLogrosUsuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * POST /api/achievements/:logroId/unlock
   * Desbloquear logro para el usuario autenticado
   * Requiere autenticación
   */
  static async desbloquearLogro(req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.user?.UsuarioId;

      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      const id = req.params['logroId'];
      const logroId = parseInt(id || '');

      if (isNaN(logroId)) {
        res.status(400).json({
          success: false,
          message: 'ID de logro inválido',
          error: 'INVALID_ACHIEVEMENT_ID'
        });
        return;
      }

      const resultado = await LogrosService.desbloquearLogro(usuarioId, logroId);

      if (resultado.success) {
        res.status(200).json({
          success: true,
          message: resultado.message,
          data: {
            logroId,
            xpGanado: resultado.xpGanado
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: resultado.message,
          error: 'ACHIEVEMENT_UNLOCK_FAILED'
        });
      }
    } catch (error) {
      console.error('Error en desbloquearLogro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * GET /api/achievements/verify/:logroId
   * Verificar si un logro puede ser desbloqueado
   * Requiere autenticación
   */
  static async verificarDesbloqueo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.user?.UsuarioId;

      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      const id = req.params['logroId'];
      const logroId = parseInt(id || '');

      if (isNaN(logroId)) {
        res.status(400).json({
          success: false,
          message: 'ID de logro inválido',
          error: 'INVALID_ACHIEVEMENT_ID'
        });
        return;
      }

      const resultado = await LogrosService.verificarDesbloqueo(usuarioId, logroId);

      if (resultado.success) {
        res.status(200).json({
          success: true,
          data: {
            esDesbloqueable: resultado.esDesbloqueable,
            progresoActual: resultado.progresoActual,
            progresoRequerido: resultado.progresoRequerido
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al verificar desbloqueo',
          error: 'ACHIEVEMENT_VERIFY_FAILED'
        });
      }
    } catch (error) {
      console.error('Error en verificarDesbloqueo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * GET /api/achievements/recent
   * Obtener logros recientemente desbloqueados
   * Query params:
   * - limite (opcional): Número máximo de resultados (default: 10)
   * - periodoDias (opcional): Período en días (default: 7)
   * - usuarioId (opcional): ID de usuario específico
   * Ruta pública
   */
  static async obtenerLogrosRecientes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const limite = req.query['limite'] ? parseInt(req.query['limite'] as string) : 10;
      const periodoDias = req.query['periodoDias'] ? parseInt(req.query['periodoDias'] as string) : 7;
      const usuarioId = req.query['usuarioId'] ? parseInt(req.query['usuarioId'] as string) : req.user?.UsuarioId;

      const resultado = await LogrosService.obtenerLogrosRecientes(
        usuarioId,
        limite,
        periodoDias
      );

      if (resultado.success) {
        res.status(200).json({
          success: true,
          data: resultado.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al obtener logros recientes',
          error: 'RECENT_ACHIEVEMENTS_FETCH_FAILED'
        });
      }
    } catch (error) {
      console.error('Error en obtenerLogrosRecientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * GET /api/achievements/stats
   * Obtener estadísticas de logros
   * Query params:
   * - usuarioId (opcional): ID de usuario específico (solo si es admin)
   * Ruta pública
   */
  static async obtenerEstadisticas(req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.query['usuarioId'] ? parseInt(req.query['usuarioId'] as string) : req.user?.UsuarioId;

      const resultado = await LogrosService.obtenerEstadisticas(usuarioId);

      if (resultado.success) {
        res.status(200).json({
          success: true,
          data: resultado.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al obtener estadísticas',
          error: 'ACHIEVEMENT_STATS_FETCH_FAILED'
        });
      }
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
   * GET /api/achievements/available
   * Obtener logros disponibles para un usuario (no desbloqueados)
   * Requiere autenticación
   */
  static async obtenerLogrosDisponibles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.user?.UsuarioId;

      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      const resultado = await LogrosService.obtenerLogrosDisponibles(usuarioId);

      if (resultado.success) {
        res.status(200).json({
          success: true,
          data: resultado.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al obtener logros disponibles',
          error: 'AVAILABLE_ACHIEVEMENTS_FETCH_FAILED'
        });
      }
    } catch (error) {
      console.error('Error en obtenerLogrosDisponibles:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * POST /api/achievements/check
   * Verificar y desbloquear logros automáticamente
   * Body:
   * - tiposLogros (opcional): Array de tipos de logros a verificar
   * Requiere autenticación
   */
  static async verificarYDesbloquear(req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.user?.UsuarioId;

      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado',
          error: 'UNAUTHORIZED'
        });
        return;
      }

      const { tiposLogros } = req.body;
      
      // Tipos por defecto si no se especifican
      const tipos = tiposLogros || [
        'CompletarLecciones',
        'GanarXP',
        'Racha',
        'EjerciciosCorrectos',
        'DiasActivos'
      ];

      const resultado = await LogrosService.verificarYDesbloquearLogros(
        usuarioId,
        tipos
      );

      res.status(200).json({
        success: true,
        message: `${resultado.logrosDesbloqueados} logros desbloqueados`,
        data: {
          logrosDesbloqueados: resultado.logrosDesbloqueados,
          xpTotalGanado: resultado.xpTotalGanado
        }
      });
    } catch (error) {
      console.error('Error en verificarYDesbloquear:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }
}

