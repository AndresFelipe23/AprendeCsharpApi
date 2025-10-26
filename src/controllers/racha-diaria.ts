// ============================================
// CONTROLADOR DE RACHA DIARIA
// Aplicación de Aprendizaje de C#
// ============================================

import { Response } from 'express';
import { RachaDiariaService } from '../services/racha-diaria';
import { AuthRequest } from '../types/auth';

export class RachaDiariaController {
  /**
   * POST /api/streak
   * Registrar actividad diaria del usuario
   * Body:
   * - xpGanado (opcional): XP ganado
   * - ejerciciosCompletados (opcional): Número de ejercicios completados
   * Requiere autenticación
   */
  static async registrarActividad(req: AuthRequest, res: Response): Promise<void> {
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

      const { xpGanado = 0, ejerciciosCompletados = 0 } = req.body;

      const resultado = await RachaDiariaService.registrarActividad(
        usuarioId,
        xpGanado,
        ejerciciosCompletados
      );

      if (resultado.success) {
        res.status(200).json({
          success: true,
          message: resultado.message,
          data: resultado.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: resultado.message,
          error: 'STREAK_REGISTRATION_FAILED'
        });
      }
    } catch (error) {
      console.error('Error en registrarActividad:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * GET /api/streak
   * Obtener racha diaria del usuario autenticado
   * Query params:
   * - limite (opcional): Número máximo de resultados (default: 30)
   * - ordenDescendente (opcional): true/false (default: true)
   * Requiere autenticación
   */
  static async obtenerRachaPorUsuario(req: AuthRequest, res: Response): Promise<void> {
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

      const limite = req.query['limite'] ? parseInt(req.query['limite'] as string) : 30;
      const ordenDescendente = req.query['ordenDescendente'] !== 'false';

      const resultado = await RachaDiariaService.obtenerRachaPorUsuario(
        usuarioId,
        limite,
        ordenDescendente
      );

      if (resultado.success) {
        res.status(200).json({
          success: true,
          data: resultado.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al obtener racha diaria',
          error: 'STREAK_FETCH_FAILED'
        });
      }
    } catch (error) {
      console.error('Error en obtenerRachaPorUsuario:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * GET /api/streak/current
   * Obtener racha actual del usuario autenticado
   * Requiere autenticación
   */
  static async obtenerRachaActual(req: AuthRequest, res: Response): Promise<void> {
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

      const resultado = await RachaDiariaService.obtenerRachaActual(usuarioId);

      if (resultado.success) {
        res.status(200).json({
          success: true,
          data: resultado.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al obtener racha actual',
          error: 'STREAK_CURRENT_FETCH_FAILED'
        });
      }
    } catch (error) {
      console.error('Error en obtenerRachaActual:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * GET /api/streak/stats
   * Obtener estadísticas de racha diaria del usuario autenticado
   * Query params:
   * - periodoDias (opcional): Período en días para las estadísticas (default: 30)
   * Requiere autenticación
   */
  static async obtenerEstadisticas(req: AuthRequest, res: Response): Promise<void> {
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

      const periodoDias = req.query['periodoDias'] ? parseInt(req.query['periodoDias'] as string) : 30;

      const resultado = await RachaDiariaService.obtenerEstadisticas(usuarioId, periodoDias);

      if (resultado.success) {
        res.status(200).json({
          success: true,
          data: resultado.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al obtener estadísticas',
          error: 'STREAK_STATS_FETCH_FAILED'
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
   * GET /api/streak/ranking
   * Obtener ranking de usuarios por racha
   * Query params:
   * - limite (opcional): Número máximo de resultados (default: 20)
   * - periodoDias (opcional): Período en días (default: 30)
   * Ruta pública (no requiere autenticación)
   */
  static async obtenerRanking(req: AuthRequest, res: Response): Promise<void> {
    try {
      const limite = req.query['limite'] ? parseInt(req.query['limite'] as string) : 20;
      const periodoDias = req.query['periodoDias'] ? parseInt(req.query['periodoDias'] as string) : 30;

      const resultado = await RachaDiariaService.obtenerRanking(limite, periodoDias);

      if (resultado.success) {
        res.status(200).json({
          success: true,
          data: resultado.data
        });
      } else {
        res.status(400).json({
          success: false,
          message: 'Error al obtener ranking',
          error: 'STREAK_RANKING_FETCH_FAILED'
        });
      }
    } catch (error) {
      console.error('Error en obtenerRanking:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }

  /**
   * PUT /api/streak/update
   * Actualizar racha del usuario autenticado
   * Requiere autenticación
   */
  static async actualizarRacha(req: AuthRequest, res: Response): Promise<void> {
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

      const resultado = await RachaDiariaService.actualizarRacha(usuarioId);

      if (resultado.success) {
        res.status(200).json({
          success: true,
          message: resultado.message,
          data: {
            rachaActual: resultado.rachaActual
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: resultado.message,
          error: 'STREAK_UPDATE_FAILED'
        });
      }
    } catch (error) {
      console.error('Error en actualizarRacha:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    }
  }
}

