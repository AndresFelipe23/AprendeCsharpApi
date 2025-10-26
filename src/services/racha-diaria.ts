// ============================================
// SERVICIO DE RACHA DIARIA
// Aplicación de Aprendizaje de C#
// ============================================

import { databaseService } from './database';

export interface RachaDiaria {
  rachaId: number;
  usuarioId: number;
  fechaRacha: Date;
  xpGanado: number;
  ejerciciosCompletados: number;
  nombreUsuario?: string;
  nombreCompleto?: string;
  imagenPerfil?: string;
  nivelActual?: number;
  xpTotal?: number;
  racha?: number;
}

export interface EstadisticasRacha {
  diasActivos: number;
  periodoTotal: number;
  porcentajeActividad: number;
  totalXPGanado: number;
  totalEjerciciosCompletados: number;
  promedioXPDiario: number;
  promedioEjerciciosDiarios: number;
  rachaActual: number;
  maximoXPDiario: number;
  maximoEjerciciosDiarios: number;
  primeraActividad?: Date;
  ultimaActividad?: Date;
  diasEntrePrimerYUltimo: number;
}

export interface RachaActual {
  usuarioId: number;
  nombreUsuario: string;
  nombreCompleto: string;
  rachaActual: number;
  ultimaFechaActivo?: Date;
  diasActivosRachaActual: number;
  xpGanadoRachaActual: number;
  ejerciciosCompletadosRachaActual: number;
  inicioRachaActual?: Date;
  ultimaActividadRachaActual?: Date;
  actividadHoy: boolean;
  diasParaRomperRacha: number;
}

export class RachaDiariaService {
  /**
   * Registrar actividad diaria del usuario
   */
  static async registrarActividad(
    usuarioId: number,
    xpGanado: number = 0,
    ejerciciosCompletados: number = 0,
    fechaRacha?: Date
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const pool = await databaseService.getConnection();

      const result = await pool.request()
        .input('UsuarioId', usuarioId)
        .input('FechaRacha', fechaRacha || null)
        .input('XPGanado', xpGanado)
        .input('EjerciciosCompletados', ejerciciosCompletados)
        .execute('SP_RachaDiaria_RegistrarActividad');

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
        data: {
          rachaId: row.RachaId,
          resultado: row.Resultado
        }
      };
    } catch (error: any) {
      console.error('Error en registrarActividad:', error);
      return {
        success: false,
        message: error.message || 'Error al registrar actividad diaria'
      };
    }
  }

  /**
   * Obtener racha diaria de un usuario
   */
  static async obtenerRachaPorUsuario(
    usuarioId: number,
    limite: number = 30,
    ordenDescendente: boolean = true
  ): Promise<{ success: boolean; data?: RachaDiaria[] }> {
    try {
      const pool = await databaseService.getConnection();

      const result = await pool.request()
        .input('UsuarioId', usuarioId)
        .input('Limite', limite)
        .input('OrdenDescendente', ordenDescendente ? 1 : 0)
        .execute('SP_RachaDiaria_ObtenerPorUsuario');

      const rachas = result.recordset.map((row: any) => ({
        rachaId: row.RachaId,
        usuarioId: row.UsuarioId,
        fechaRacha: row.FechaRacha,
        xpGanado: row.XPGanado,
        ejerciciosCompletados: row.EjerciciosCompletados,
        nombreUsuario: row.NombreUsuario,
        nombreCompleto: row.NombreCompleto,
        imagenPerfil: row.ImagenPerfil,
        nivelActual: row.NivelActual,
        xpTotal: row.XPTotal,
        racha: row.Racha,
        diasDesdeActividad: row.DiasDesdeActividad,
        esHoy: row.EsHoy === 1
      }));

      return {
        success: true,
        data: rachas
      };
    } catch (error: any) {
      console.error('Error en obtenerRachaPorUsuario:', error);
      return {
        success: false
      };
    }
  }

  /**
   * Obtener actividad de todos los usuarios en una fecha específica
   */
  static async obtenerRachaPorFecha(
    fechaRacha: Date,
    limite: number = 50,
    ordenarPor: string = 'XPGanado',
    ordenDescendente: boolean = true
  ): Promise<{ success: boolean; data?: RachaDiaria[] }> {
    try {
      const pool = await databaseService.getConnection();

      const result = await pool.request()
        .input('FechaRacha', fechaRacha)
        .input('Limite', limite)
        .input('OrdenarPor', ordenarPor)
        .input('OrdenDescendente', ordenDescendente ? 1 : 0)
        .execute('SP_RachaDiaria_ObtenerPorFecha');

      const rachas = result.recordset.map((row: any) => ({
        rachaId: row.RachaId,
        usuarioId: row.UsuarioId,
        fechaRacha: row.FechaRacha,
        xpGanado: row.XPGanado,
        ejerciciosCompletados: row.EjerciciosCompletados,
        nombreUsuario: row.NombreUsuario,
        nombreCompleto: row.NombreCompleto,
        imagenPerfil: row.ImagenPerfil,
        nivelActual: row.NivelActual,
        xpTotal: row.XPTotal,
        racha: row.Racha,
        totalDiasActivos: row.TotalDiasActivos,
        totalXPGanado: row.TotalXPGanado,
        totalEjerciciosCompletados: row.TotalEjerciciosCompletados
      }));

      return {
        success: true,
        data: rachas
      };
    } catch (error: any) {
      console.error('Error en obtenerRachaPorFecha:', error);
      return {
        success: false
      };
    }
  }

  /**
   * Actualizar racha del usuario basada en actividad diaria
   */
  static async actualizarRacha(
    usuarioId: number
  ): Promise<{ success: boolean; message?: string; rachaActual?: number }> {
    try {
      const pool = await databaseService.getConnection();

      const result = await pool.request()
        .input('UsuarioId', usuarioId)
        .execute('SP_RachaDiaria_ActualizarRacha');

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
        rachaActual: row.RachaActual
      };
    } catch (error: any) {
      console.error('Error en actualizarRacha:', error);
      return {
        success: false,
        message: error.message || 'Error al actualizar racha'
      };
    }
  }

  /**
   * Obtener estadísticas de racha diaria
   */
  static async obtenerEstadisticas(
    usuarioId?: number,
    periodoDias: number = 30
  ): Promise<{ success: boolean; data?: EstadisticasRacha }> {
    try {
      const pool = await databaseService.getConnection();

      const result = await pool.request()
        .input('UsuarioId', usuarioId || null)
        .input('PeriodoDias', periodoDias)
        .execute('SP_RachaDiaria_ObtenerEstadisticas');

      const stats = result.recordset[0];

      const estadisticas = {
        diasActivos: stats.DiasActivos || 0,
        periodoTotal: stats.PeriodoTotal || periodoDias,
        porcentajeActividad: stats.PorcentajeActividad || 0,
        totalXPGanado: stats.TotalXPGanado || 0,
        totalEjerciciosCompletados: stats.TotalEjerciciosCompletados || 0,
        promedioXPDiario: stats.PromedioXPDiario || 0,
        promedioEjerciciosDiarios: stats.PromedioEjerciciosDiarios || 0,
        rachaActual: stats.RachaActual || 0,
        maximoXPDiario: stats.MaximoXPDiario || 0,
        maximoEjerciciosDiarios: stats.MaximoEjerciciosDiarios || 0,
        primeraActividad: stats.PrimeraActividad,
        ultimaActividad: stats.UltimaActividad,
        diasEntrePrimerYUltimo: stats.DiasEntrePrimerYUltimo || 0
      };

      return {
        success: true,
        data: estadisticas
      };
    } catch (error: any) {
      console.error('Error en obtenerEstadisticas:', error);
      return {
        success: false
      };
    }
  }

  /**
   * Obtener ranking de usuarios por racha
   */
  static async obtenerRanking(
    limite: number = 20,
    periodoDias: number = 30
  ): Promise<{ success: boolean; data?: any[] }> {
    try {
      const pool = await databaseService.getConnection();

      const result = await pool.request()
        .input('Limite', limite)
        .input('PeriodoDias', periodoDias)
        .execute('SP_RachaDiaria_ObtenerRanking');

      const ranking = result.recordset.map((row: any) => ({
        usuarioId: row.UsuarioId,
        nombreUsuario: row.NombreUsuario,
        nombreCompleto: row.NombreCompleto,
        imagenPerfil: row.ImagenPerfil,
        nivelActual: row.NivelActual,
        xpTotal: row.XPTotal,
        racha: row.Racha,
        ultimaFechaActivo: row.UltimaFechaActivo,
        diasActivos: row.DiasActivos || 0,
        totalXPGanado: row.TotalXPGanado || 0,
        totalEjerciciosCompletados: row.TotalEjerciciosCompletados || 0,
        promedioXPDiario: row.PromedioXPDiario || 0,
        promedioEjerciciosDiarios: row.PromedioEjerciciosDiarios || 0,
        rankingRacha: row.RankingRacha,
        rankingActividad: row.RankingActividad
      }));

      return {
        success: true,
        data: ranking
      };
    } catch (error: any) {
      console.error('Error en obtenerRanking:', error);
      return {
        success: false
      };
    }
  }

  /**
   * Obtener racha actual del usuario
   */
  static async obtenerRachaActual(
    usuarioId: number
  ): Promise<{ success: boolean; data?: RachaActual }> {
    try {
      const pool = await databaseService.getConnection();

      const result = await pool.request()
        .input('UsuarioId', usuarioId)
        .execute('SP_RachaDiaria_ObtenerRachaActual');

      const row = result.recordset[0];

      const rachaActual: RachaActual = {
        usuarioId: row.UsuarioId,
        nombreUsuario: row.NombreUsuario,
        nombreCompleto: row.NombreCompleto,
        rachaActual: row.RachaActual,
        ultimaFechaActivo: row.UltimaFechaActivo,
        diasActivosRachaActual: row.DiasActivosRachaActual || 0,
        xpGanadoRachaActual: row.XPGanadoRachaActual || 0,
        ejerciciosCompletadosRachaActual: row.EjerciciosCompletadosRachaActual || 0,
        inicioRachaActual: row.InicioRachaActual,
        ultimaActividadRachaActual: row.UltimaActividadRachaActual,
        actividadHoy: row.ActividadHoy === 1,
        diasParaRomperRacha: row.DiasParaRomperRacha || 0
      };

      return {
        success: true,
        data: rachaActual
      };
    } catch (error: any) {
      console.error('Error en obtenerRachaActual:', error);
      return {
        success: false
      };
    }
  }
}

export const rachaDiariaService = new RachaDiariaService();

