// ============================================
// SERVICIO DE LOGROS
// Aplicación de Aprendizaje de C#
// ============================================

import { databaseService } from './database';

export interface Logro {
  logroId: number;
  titulo: string;
  descripcion: string;
  iconoUrl?: string;
  tipoRequisito: string;
  valorRequisito: number;
  recompensaXP: number;
  fechaCreacion?: Date;
  usuariosDesbloqueado?: number;
  totalUsuarios?: number;
  porcentajeDesbloqueo?: number;
}

export interface LogroUsuario {
  logroUsuarioId: number;
  usuarioId: number;
  logroId: number;
  fechaDesbloqueo: Date;
  logroTitulo: string;
  logroDescripcion: string;
  logroIconoUrl?: string;
  logroRecompensaXP: number;
  estaDesbloqueado: boolean;
  progresoActual?: number;
  porcentajeProgreso?: number;
}

export interface EstadisticasLogros {
  totalLogros: number;
  logrosDesbloqueados: number;
  totalXPDisponible: number;
  xpGanadoLogros: number;
  porcentajeCompletado: number;
  logrosLecciones: number;
  logrosXP: number;
  logrosRacha: number;
  logrosEjercicios: number;
  logrosDiasActivos: number;
}

export class LogrosService {
  /**
   * Obtener todos los logros disponibles
   */
  static async obtenerTodos(): Promise<{ success: boolean; data?: Logro[] }> {
    try {
      const pool = await databaseService.getConnection();
      const result = await pool.request().execute('SP_Logro_ObtenerTodos');

      const logros = result.recordset.map((row: any) => ({
        logroId: row.LogroId,
        titulo: row.Titulo,
        descripcion: row.Descripcion,
        iconoUrl: row.IconoUrl,
        tipoRequisito: row.TipoRequisito,
        valorRequisito: row.ValorRequisito,
        recompensaXP: row.RecompensaXP,
        fechaCreacion: row.FechaCreacion,
        usuariosDesbloqueado: row.UsuariosDesbloqueado || 0,
        totalUsuarios: row.TotalUsuarios || 0,
        porcentajeDesbloqueo: row.PorcentajeDesbloqueo || 0
      }));

      return { success: true, data: logros };
    } catch (error: any) {
      console.error('Error en obtenerTodos:', error);
      return { success: false };
    }
  }

  /**
   * Obtener logros de un usuario específico
   */
  static async obtenerLogrosUsuario(
    usuarioId: number,
    soloDesbloqueados: boolean = false
  ): Promise<{ success: boolean; data?: LogroUsuario[] }> {
    try {
      const pool = await databaseService.getConnection();

      const result = await pool.request()
        .input('UsuarioId', usuarioId)
        .input('SoloDesbloqueados', soloDesbloqueados ? 1 : 0)
        .execute('SP_Logro_ObtenerLogrosUsuario');

      const logros = result.recordset.map((row: any) => ({
        logroUsuarioId: row.LogroUsuarioId,
        usuarioId: row.UsuarioId,
        logroId: row.LogroId,
        fechaDesbloqueo: row.FechaDesbloqueo,
        logroTitulo: row.LogroTitulo,
        logroDescripcion: row.LogroDescripcion,
        logroIconoUrl: row.LogroIconoUrl,
        logroRecompensaXP: row.LogroRecompensaXP,
        estaDesbloqueado: row.EstaDesbloqueado === 1,
        progresoActual: row.ProgresoActual,
        porcentajeProgreso: row.PorcentajeProgreso
      }));

      return { success: true, data: logros };
    } catch (error: any) {
      console.error('Error en obtenerLogrosUsuario:', error);
      return { success: false };
    }
  }

  /**
   * Desbloquear logro para un usuario
   */
  static async desbloquearLogro(
    usuarioId: number,
    logroId: number
  ): Promise<{ success: boolean; message?: string; xpGanado?: number }> {
    try {
      const pool = await databaseService.getConnection();

      const result = await pool.request()
        .input('UsuarioId', usuarioId)
        .input('LogroId', logroId)
        .execute('SP_LogroUsuario_Desbloquear');

      const row = result.recordset[0];

      if (row.Resultado === 'Error') {
        return {
          success: false,
          message: row.Mensaje
        };
      }

      return {
        success: true,
        message: row.Mensaje,
        xpGanado: row.XPGanado
      };
    } catch (error: any) {
      console.error('Error en desbloquearLogro:', error);
      return {
        success: false,
        message: error.message || 'Error al desbloquear logro'
      };
    }
  }

  /**
   * Verificar si un usuario puede desbloquear un logro
   */
  static async verificarDesbloqueo(
    usuarioId: number,
    logroId: number
  ): Promise<{ success: boolean; esDesbloqueable?: boolean; progresoActual?: number; progresoRequerido?: number }> {
    try {
      const pool = await databaseService.getConnection();

      const result = await pool.request()
        .input('UsuarioId', usuarioId)
        .input('LogroId', logroId)
        .execute('SP_Logro_VerificarDesbloqueo');

      const row = result.recordset[0];

      return {
        success: true,
        esDesbloqueable: row.EsDesbloqueable === 1,
        progresoActual: row.ProgresoActual,
        progresoRequerido: row.ProgresoRequerido
      };
    } catch (error: any) {
      console.error('Error en verificarDesbloqueo:', error);
      return { success: false };
    }
  }

  /**
   * Verificar y desbloquear automáticamente logros de tipos específicos
   */
  static async verificarYDesbloquearLogros(
    usuarioId: number,
    tiposLogros: string[]
  ): Promise<{ logrosDesbloqueados: number; xpTotalGanado: number }> {
    let logrosDesbloqueados = 0;
    let xpTotalGanado = 0;

    try {
      // Obtener todos los logros
      const todosLogros = await this.obtenerTodos();

      if (!todosLogros.success || !todosLogros.data) {
        return { logrosDesbloqueados: 0, xpTotalGanado: 0 };
      }

      // Filtrar logros de los tipos especificados que aún no estén desbloqueados
      const logrosACheckear = todosLogros.data.filter(logro =>
        tiposLogros.includes(logro.tipoRequisito)
      );

      for (const logro of logrosACheckear) {
        // Verificar si ya está desbloqueado
        const verificacion = await this.verificarDesbloqueo(usuarioId, logro.logroId);

        if (verificacion.success && verificacion.esDesbloqueable) {
          // Intentar desbloquear
          const desbloqueo = await this.desbloquearLogro(usuarioId, logro.logroId);

          if (desbloqueo.success) {
            logrosDesbloqueados++;
            xpTotalGanado += desbloqueo.xpGanado || 0;
            console.log(`🎉 Logro desbloqueado: ${logro.titulo} (+${desbloqueo.xpGanado} XP)`);
          }
        }
      }

      return { logrosDesbloqueados, xpTotalGanado };
    } catch (error: any) {
      console.error('Error en verificarYDesbloquearLogros:', error);
      return { logrosDesbloqueados: 0, xpTotalGanado: 0 };
    }
  }

  /**
   * Obtener logros recientemente desbloqueados
   */
  static async obtenerLogrosRecientes(
    usuarioId?: number,
    limite: number = 10,
    periodoDias: number = 7
  ): Promise<{ success: boolean; data?: LogroUsuario[] }> {
    try {
      const pool = await databaseService.getConnection();

      const result = await pool.request()
        .input('UsuarioId', usuarioId || null)
        .input('Limite', limite)
        .input('PeriodoDias', periodoDias)
        .execute('SP_LogroUsuario_ObtenerRecientes');

      const logros = result.recordset.map((row: any) => ({
        logroUsuarioId: row.LogroUsuarioId,
        usuarioId: row.UsuarioId,
        logroId: row.LogroId,
        fechaDesbloqueo: row.FechaDesbloqueo,
        logroTitulo: row.LogroTitulo,
        logroDescripcion: row.LogroDescripcion,
        logroIconoUrl: row.LogroIconoUrl,
        logroRecompensaXP: row.LogroRecompensaXP,
        estaDesbloqueado: true
      }));

      return { success: true, data: logros };
    } catch (error: any) {
      console.error('Error en obtenerLogrosRecientes:', error);
      return { success: false };
    }
  }

  /**
   * Obtener estadísticas de logros
   */
  static async obtenerEstadisticas(
    usuarioId?: number
  ): Promise<{ success: boolean; data?: EstadisticasLogros }> {
    try {
      const pool = await databaseService.getConnection();

      const result = await pool.request()
        .input('UsuarioId', usuarioId || null)
        .execute('SP_Logro_ObtenerEstadisticas');

      const stats = result.recordset[0];

      const estadisticas: EstadisticasLogros = {
        totalLogros: stats.TotalLogros || 0,
        logrosDesbloqueados: stats.LogrosDesbloqueados || 0,
        totalXPDisponible: stats.TotalXPDisponible || 0,
        xpGanadoLogros: stats.XPGanadoLogros || 0,
        porcentajeCompletado: stats.PorcentajeCompletado || 0,
        logrosLecciones: stats.LogrosLecciones || 0,
        logrosXP: stats.LogrosXP || 0,
        logrosRacha: stats.LogrosRacha || 0,
        logrosEjercicios: stats.LogrosEjercicios || 0,
        logrosDiasActivos: stats.LogrosDiasActivos || 0
      };

      return { success: true, data: estadisticas };
    } catch (error: any) {
      console.error('Error en obtenerEstadisticas:', error);
      return { success: false };
    }
  }

  /**
   * Obtener logros disponibles para un usuario (no desbloqueados)
   */
  static async obtenerLogrosDisponibles(
    usuarioId: number
  ): Promise<{ success: boolean; data?: LogroUsuario[] }> {
    try {
      const pool = await databaseService.getConnection();

      const result = await pool.request()
        .input('UsuarioId', usuarioId)
        .execute('SP_Logro_ObtenerLogrosDisponibles');

      const logros = result.recordset.map((row: any) => ({
        logroId: row.LogroId,
        titulo: row.Titulo,
        descripcion: row.Descripcion,
        iconoUrl: row.IconoUrl,
        tipoRequisito: row.TipoRequisito,
        valorRequisito: row.ValorRequisito,
        recompensaXP: row.RecompensaXP,
        estaDesbloqueado: row.EstadoLogro === 'Desbloqueado',
        progresoActual: row.ProgresoActual || 0,
        porcentajeProgreso: row.PorcentajeProgreso || 0
      }));

      return { success: true, data: logros };
    } catch (error: any) {
      console.error('Error en obtenerLogrosDisponibles:', error);
      return { success: false };
    }
  }
}

export const logrosService = new LogrosService();

