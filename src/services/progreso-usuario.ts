// ============================================
// SERVICIO DE PROGRESO DE USUARIOS
// Aplicación de Aprendizaje de C#
// ============================================

import { databaseService } from './database';

export interface ProgresoUsuario {
  progresoId: number;
  usuarioId: number;
  leccionId: number;
  estaCompletada: boolean;
  porcentajeCompletado: number;
  xpGanado: number;
  fechaInicio: Date;
  fechaCompletado?: Date;
  ultimoAcceso: Date;
  // Información adicional
  leccionTitulo?: string;
  leccionDescripcion?: string;
  cursoId?: number;
  cursoTitulo?: string;
  cursoNivelDificultad?: string;
  totalEjercicios?: number;
  ejerciciosCompletados?: number;
}

export interface EstadisticasProgreso {
  totalLeccionesIniciadas: number;
  leccionesCompletadas: number;
  leccionesEnProgreso: number;
  totalXPGanado: number;
  promedioProgreso: number;
  cursosIniciados: number;
  cursosCompletados: number;
  primeraLeccionIniciada?: Date;
  ultimaLeccionCompletada?: Date;
  ultimoAcceso?: Date;
  totalEjerciciosDisponibles: number;
  ejerciciosCompletados: number;
  porcentajeCompletado: number;
  diasActivos: number;
}

export interface ResumenCurso {
  cursoId: number;
  cursoTitulo: string;
  cursoNivelDificultad: string;
  cursoOrden: number;
  totalLecciones: number;
  leccionesIniciadas: number;
  leccionesCompletadas: number;
  xpGanadoEnCurso: number;
  porcentajeCompletadoCurso: number;
  primeraLeccionIniciada?: Date;
  ultimaLeccionCompletada?: Date;
  ultimoAccesoCurso?: Date;
  estadoCurso: 'No Iniciado' | 'En Progreso' | 'Completado';
}

export interface ProgresoGeneral {
  usuario: {
    usuarioId: number;
    nombreUsuario: string;
    nombreCompleto: string;
    imagenPerfil?: string;
    nivelActual: number;
    xpTotal: number;
    racha: number;
    ultimaFechaActivo?: Date;
    fechaCreacion: Date;
  };
  estadisticas: {
    totalLeccionesIniciadas: number;
    leccionesCompletadas: number;
    totalXPGanado: number;
    cursosIniciados: number;
    cursosCompletados: number;
    promedioProgreso: number;
    primeraActividad?: Date;
    ultimaActividad?: Date;
  };
  progresoPorNivel: Array<{
    nivelDificultad: string;
    leccionesIniciadas: number;
    leccionesCompletadas: number;
    xpGanado: number;
    porcentajeCompletado: number;
  }>;
}

export class ProgresoUsuarioService {
  /**
   * Crear nuevo progreso de usuario en una lección
   */
  static async crearProgreso(
    usuarioId: number,
    leccionId: number,
    porcentajeCompletado: number = 0
  ): Promise<{ success: boolean; message: string; progresoId?: number }> {
    try {
      const result = await databaseService.executeProcedure(
        'SP_ProgresoUsuario_Crear',
        {
          UsuarioId: usuarioId,
          LeccionId: leccionId,
          PorcentajeCompletado: porcentajeCompletado
        }
      );

      const row = result.recordset[0];
      
      if (row.Resultado === 'Exito') {
        return {
          success: true,
          message: row.Mensaje,
          progresoId: row.ProgresoId
        };
      } else {
        return {
          success: false,
          message: row.Mensaje
        };
      }
    } catch (error) {
      console.error('Error creando progreso:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Obtener progreso de un usuario en todas las lecciones
   */
  static async obtenerProgresoPorUsuario(
    usuarioId: number,
    cursoId?: number,
    soloCompletadas: boolean = false
  ): Promise<ProgresoUsuario[]> {
    try {
      console.log(`📥 Obteniendo progreso - Usuario: ${usuarioId}, Curso: ${cursoId}, SoloCompletadas: ${soloCompletadas}`);

      const result = await databaseService.executeProcedure(
        'SP_ProgresoUsuario_ObtenerPorUsuario',
        {
          UsuarioId: usuarioId,
          CursoId: cursoId || null,
          SoloCompletadas: soloCompletadas ? 1 : 0
        }
      );

      console.log(`📊 Registros obtenidos: ${result.recordset.length}`);
      if (result.recordset.length > 0 && result.recordset.length <= 5) {
        console.log('🔍 Primeros registros:', result.recordset.map((r: any) => ({
          leccionId: r.LeccionId,
          estaCompletada: r.EstaCompletada,
          porcentaje: r.PorcentajeCompletado
        })));
      }

      return result.recordset.map((row: any) => {
        const estaCompletada = row.EstaCompletada === 1 || row.EstaCompletada === true;
        
        // Si está completada, asegurar que el porcentaje sea 100
        const porcentajeCompletado = estaCompletada ? 100 : row.PorcentajeCompletado;

        console.log(`🔍 Mapeando lección ${row.LeccionId}: EstaCompletada=${row.EstaCompletada} -> ${estaCompletada}, Porcentaje=${row.PorcentajeCompletado} -> ${porcentajeCompletado}`);

        return {
          progresoId: row.ProgresoId,
          usuarioId: row.UsuarioId,
          leccionId: row.LeccionId,
          estaCompletada: estaCompletada,
          porcentajeCompletado: porcentajeCompletado,
          xpGanado: row.XPGanado,
          fechaInicio: row.FechaInicio,
          fechaCompletado: row.FechaCompletado,
          ultimoAcceso: row.UltimoAcceso,
          leccionTitulo: row.LeccionTitulo,
          leccionDescripcion: row.LeccionDescripcion,
          cursoId: row.CursoId,
          cursoTitulo: row.CursoTitulo,
          cursoNivelDificultad: row.CursoNivelDificultad,
          totalEjercicios: row.TotalEjercicios,
          ejerciciosCompletados: row.EjerciciosCompletados
        };
      });
    } catch (error) {
      console.error('Error obteniendo progreso por usuario:', error);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Obtener progreso de todos los usuarios en una lección
   */
  static async obtenerProgresoPorLeccion(
    leccionId: number,
    soloCompletadas: boolean = false,
    limite: number = 50
  ): Promise<ProgresoUsuario[]> {
    try {
      const result = await databaseService.executeProcedure(
        'SP_ProgresoUsuario_ObtenerPorLeccion',
        {
          LeccionId: leccionId,
          SoloCompletadas: soloCompletadas ? 1 : 0,
          Limite: limite
        }
      );

      return result.recordset.map((row: any) => {
        const estaCompletada = row.EstaCompletada === 1 || row.EstaCompletada === true;
        const porcentajeCompletado = estaCompletada ? 100 : row.PorcentajeCompletado;
        
        return {
          progresoId: row.ProgresoId,
          usuarioId: row.UsuarioId,
          leccionId: row.LeccionId,
          estaCompletada: estaCompletada,
          porcentajeCompletado: porcentajeCompletado,
          xpGanado: row.XPGanado,
          fechaInicio: row.FechaInicio,
          fechaCompletado: row.FechaCompletado,
          ultimoAcceso: row.UltimoAcceso,
          leccionTitulo: row.LeccionTitulo
        };
      });
    } catch (error) {
      console.error('Error obteniendo progreso por lección:', error);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Actualizar progreso de usuario en una lección
   */
  static async actualizarProgreso(
    usuarioId: number,
    leccionId: number,
    porcentajeCompletado: number,
    xpGanado: number = 0
  ): Promise<{ success: boolean; message: string }> {
    try {
      const result = await databaseService.executeProcedure(
        'SP_ProgresoUsuario_ActualizarProgreso',
        {
          UsuarioId: usuarioId,
          LeccionId: leccionId,
          PorcentajeCompletado: porcentajeCompletado,
          XPGanado: xpGanado
        }
      );

      const row = result.recordset[0];
      
      return {
        success: row.Resultado === 'Exito',
        message: row.Mensaje
      };
    } catch (error) {
      console.error('Error actualizando progreso:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Marcar lección como completada por usuario
   */
  static async marcarCompletada(
    usuarioId: number,
    leccionId: number,
    xpGanado?: number
  ): Promise<{ success: boolean; message: string; xpGanado?: number }> {
    try {
      console.log(`✅ Marcando lección ${leccionId} como completada para usuario ${usuarioId}, XP=${xpGanado}`);

      const result = await databaseService.executeProcedure(
        'SP_ProgresoUsuario_MarcarCompletada',
        {
          UsuarioId: usuarioId,
          LeccionId: leccionId,
          XPGanado: xpGanado || null
        }
      );

      const row = result.recordset[0];
      console.log(`📊 Resultado SP_MarcarCompletada:`, row);

      return {
        success: row.Resultado === 'Exito',
        message: row.Mensaje,
        xpGanado: row.XPGanado
      };
    } catch (error) {
      console.error('Error marcando lección como completada:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  /**
   * Obtener estadísticas de progreso de un usuario
   */
  static async obtenerEstadisticas(usuarioId: number): Promise<EstadisticasProgreso> {
    try {
      const result = await databaseService.executeProcedure(
        'SP_ProgresoUsuario_ObtenerEstadisticas',
        { UsuarioId: usuarioId }
      );

      const row = result.recordset[0];
      
      return {
        totalLeccionesIniciadas: row.TotalLeccionesIniciadas || 0,
        leccionesCompletadas: row.LeccionesCompletadas || 0,
        leccionesEnProgreso: row.LeccionesEnProgreso || 0,
        totalXPGanado: row.TotalXPGanado || 0,
        promedioProgreso: row.PromedioProgreso || 0,
        cursosIniciados: row.CursosIniciados || 0,
        cursosCompletados: row.CursosCompletados || 0,
        primeraLeccionIniciada: row.PrimeraLeccionIniciada,
        ultimaLeccionCompletada: row.UltimaLeccionCompletada,
        ultimoAcceso: row.UltimoAcceso,
        totalEjerciciosDisponibles: row.TotalEjerciciosDisponibles || 0,
        ejerciciosCompletados: row.EjerciciosCompletados || 0,
        porcentajeCompletado: row.PorcentajeCompletado || 0,
        diasActivos: row.DiasActivos || 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Obtener resumen de progreso por curso
   */
  static async obtenerResumenCurso(
    usuarioId: number,
    cursoId?: number
  ): Promise<ResumenCurso[]> {
    try {
      const result = await databaseService.executeProcedure(
        'SP_ProgresoUsuario_ObtenerResumenCurso',
        {
          UsuarioId: usuarioId,
          CursoId: cursoId || null
        }
      );

      return result.recordset.map((row: any) => ({
        cursoId: row.CursoId,
        cursoTitulo: row.CursoTitulo,
        cursoNivelDificultad: row.CursoNivelDificultad,
        cursoOrden: row.CursoOrden,
        totalLecciones: row.TotalLecciones || 0,
        leccionesIniciadas: row.LeccionesIniciadas || 0,
        leccionesCompletadas: row.LeccionesCompletadas || 0,
        xpGanadoEnCurso: row.XPGanadoEnCurso || 0,
        porcentajeCompletadoCurso: row.PorcentajeCompletadoCurso || 0,
        primeraLeccionIniciada: row.PrimeraLeccionIniciada,
        ultimaLeccionCompletada: row.UltimaLeccionCompletada,
        ultimoAccesoCurso: row.UltimoAccesoCurso,
        estadoCurso: row.EstadoCurso as 'No Iniciado' | 'En Progreso' | 'Completado'
      }));
    } catch (error) {
      console.error('Error obteniendo resumen de curso:', error);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Obtener progreso general del usuario
   */
  static async obtenerProgresoGeneral(usuarioId: number): Promise<ProgresoGeneral> {
    try {
      const result = await databaseService.executeProcedure(
        'SP_ProgresoUsuario_ObtenerProgresoGeneral',
        { UsuarioId: usuarioId }
      );

      // El SP devuelve múltiples result sets
      const usuario = result.recordset[0];
      const estadisticas = result.recordset[1];
      const progresoPorNivel = result.recordset.slice(2);

      return {
        usuario: {
          usuarioId: usuario.UsuarioId,
          nombreUsuario: usuario.NombreUsuario,
          nombreCompleto: usuario.NombreCompleto,
          imagenPerfil: usuario.ImagenPerfil,
          nivelActual: usuario.NivelActual,
          xpTotal: usuario.XPTotal,
          racha: usuario.Racha,
          ultimaFechaActivo: usuario.UltimaFechaActivo,
          fechaCreacion: usuario.FechaCreacion
        },
        estadisticas: {
          totalLeccionesIniciadas: estadisticas.TotalLeccionesIniciadas || 0,
          leccionesCompletadas: estadisticas.LeccionesCompletadas || 0,
          totalXPGanado: estadisticas.TotalXPGanado || 0,
          cursosIniciados: estadisticas.CursosIniciados || 0,
          cursosCompletados: estadisticas.CursosCompletados || 0,
          promedioProgreso: estadisticas.PromedioProgreso || 0,
          primeraActividad: estadisticas.PrimeraActividad,
          ultimaActividad: estadisticas.UltimaActividad
        },
        progresoPorNivel: progresoPorNivel.map((row: any) => ({
          nivelDificultad: row.NivelDificultad,
          leccionesIniciadas: row.LeccionesIniciadas || 0,
          leccionesCompletadas: row.LeccionesCompletadas || 0,
          xpGanado: row.XPGanado || 0,
          porcentajeCompletado: row.PorcentajeCompletado || 0
        }))
      };
    } catch (error) {
      console.error('Error obteniendo progreso general:', error);
      throw new Error('Error interno del servidor');
    }
  }

  /**
   * Obtener lecciones recientes del usuario
   */
  static async obtenerLeccionesRecientes(
    usuarioId: number,
    limite: number = 10
  ): Promise<ProgresoUsuario[]> {
    try {
      const result = await databaseService.executeProcedure(
        'SP_ProgresoUsuario_ObtenerLeccionesRecientes',
        {
          UsuarioId: usuarioId,
          Limite: limite
        }
      );

      return result.recordset.map((row: any) => {
        const estaCompletada = row.EstaCompletada === 1 || row.EstaCompletada === true;
        const porcentajeCompletado = estaCompletada ? 100 : row.PorcentajeCompletado;
        
        return {
          progresoId: row.ProgresoId,
          usuarioId: usuarioId,
          leccionId: row.LeccionId,
          estaCompletada: estaCompletada,
          porcentajeCompletado: porcentajeCompletado,
          xpGanado: row.XPGanado,
          fechaInicio: row.FechaInicio,
          fechaCompletado: row.FechaCompletado,
          ultimoAcceso: row.UltimoAcceso,
          leccionTitulo: row.LeccionTitulo,
          leccionDescripcion: row.LeccionDescripcion,
          cursoId: row.CursoId,
          cursoTitulo: row.CursoTitulo,
          cursoNivelDificultad: row.CursoNivelDificultad
        };
      });
    } catch (error) {
      console.error('Error obteniendo lecciones recientes:', error);
      throw new Error('Error interno del servidor');
    }
  }
}
