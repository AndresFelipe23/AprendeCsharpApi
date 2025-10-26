// ============================================
// SERVICIO DE EJERCICIOS
// Aplicación de Aprendizaje de C#
// ============================================

import { databaseService } from './database';
import { ApiResponse } from '../types/api';
import { LogrosService } from './logros';

export interface Exercise {
  ejercicioId: number;
  leccionId: number;
  tipoEjercicioId: number;
  tipoEjercicio: string;
  tipoDescripcion?: string;
  type?: string; // Campo para Flutter
  titulo: string;
  instrucciones: string;
  codigoInicial?: string;
  solucion?: string;
  casosPrueba?: string;
  pistas?: string;
  recompensaXP: number;
  ordenIndice: number;
  nivelDificultad: number;
  fechaCreacion: Date;
  leccionTitulo?: string;
  cursoId?: number;
  cursoTitulo?: string;
  // Estadísticas del usuario
  totalIntentos?: number;
  estaCompletado?: boolean;
  xpGanado?: number;
  ultimoIntento?: number;
  mejorTiempo?: number;
}

export interface ExerciseOption {
  opcionId: number;
  ejercicioId: number;
  textoOpcion: string;
  esCorrecta?: boolean;
  explicacion?: string;
  ordenIndice: number;
  vecesSeleccionada?: number;
  vecesSeleccionadaCorrectamente?: number;
}

export interface ExerciseWithOptions extends Exercise {
  opciones: ExerciseOption[];
}

export interface ExerciseAttempt {
  intentoId: number;
  usuarioId: number;
  ejercicioId: number;
  codigoUsuario: string;
  esCorrecto: boolean;
  tiempoEjecucion?: number;
  mensajeError?: string;
  pruebasPasadas: number;
  totalPruebas: number;
  xpGanado: number;
  numeroIntento: number;
  fechaCreacion: Date;
  ejercicioTitulo?: string;
  tipoEjercicio?: string;
  leccionTitulo?: string;
  cursoTitulo?: string;
}

export interface ExerciseStatistics {
  ejercicioId: number;
  ejercicioTitulo: string;
  tipoEjercicio: string;
  nivelDificultad: number;
  recompensaXP: number;
  totalIntentos: number;
  totalUsuarios: number;
  intentosCorrectos: number;
  usuariosCorrectos: number;
  intentosEnPeriodo: number;
  usuariosEnPeriodo: number;
  correctosEnPeriodo: number;
  tasaExitoPorcentaje: number;
  tiempoPromedioEjecucion?: number;
  tiempoMinimo?: number;
  tiempoMaximo?: number;
  promedioIntentosPorUsuario: number;
  promedioPruebasPasadas: number;
  promedioTotalPruebas: number;
  primerIntento?: Date;
  ultimoIntento?: Date;
}

export interface CreateExerciseRequest {
  leccionId: number;
  tipoEjercicioId: number;
  titulo: string;
  instrucciones: string;
  codigoInicial?: string;
  solucion?: string;
  casosPrueba?: string;
  pistas?: string;
  recompensaXP?: number;
  ordenIndice?: number;
  nivelDificultad?: number;
}

export interface UpdateExerciseRequest {
  titulo?: string;
  instrucciones?: string;
  codigoInicial?: string;
  solucion?: string;
  casosPrueba?: string;
  pistas?: string;
  recompensaXP?: number;
  ordenIndice?: number;
  nivelDificultad?: number;
}

export interface SubmitExerciseRequest {
  respuestaUsuario?: string; // Nueva nomenclatura
  codigoUsuario?: string; // Mantener para compatibilidad
  tiempoEjecucion?: number;
  mensajeError?: string;
  pruebasPasadas?: number;
  totalPruebas?: number;
  evaluacionManual?: boolean;
  esCorrectoManual?: boolean;
}

export interface ReorderExercisesRequest {
  ejerciciosOrdenados: Array<{
    ejercicioId: number;
    ordenIndice: number;
  }>;
}

export interface CreateExercisesRequest {
  ejercicios: Array<{
    titulo: string;
    tipoEjercicioId: number;
    instrucciones: string;
    codigoInicial?: string;
    solucion?: string;
    casosPrueba?: string;
    pistas?: string;
    recompensaXP?: number;
    ordenIndice?: number;
    nivelDificultad?: number;
  }>;
}

export class ExerciseService {
  // ============================================
  // CREAR EJERCICIO
  // ============================================
  async createExercise(data: CreateExerciseRequest): Promise<ApiResponse<{ ejercicioId: number }>> {
    try {
      const result = await databaseService.executeProcedure('SP_Ejercicio_Crear', {
        LeccionId: data.leccionId,
        TipoEjercicioId: data.tipoEjercicioId,
        Titulo: data.titulo,
        Instrucciones: data.instrucciones,
        CodigoInicial: data.codigoInicial || null,
        Solucion: data.solucion || null,
        CasosPrueba: data.casosPrueba || null,
        Pistas: data.pistas || null,
        RecompensaXP: data.recompensaXP || 5,
        OrdenIndice: data.ordenIndice || null,
        NivelDificultad: data.nivelDificultad || 1
      });

      const response = result.recordset[0];
      
      if (response.Resultado === 'Exito') {
        return {
          success: true,
          message: response.Mensaje,
          data: { ejercicioId: response.EjercicioId }
        };
      } else {
        return {
          success: false,
          message: response.Mensaje
        };
      }
    } catch (error) {
      console.error('Error creating exercise:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // OBTENER TODOS LOS EJERCICIOS
  // ============================================
  async getAllExercises(
    usuarioId?: number,
    incluirSolucion: boolean = false,
    incluirOpciones: boolean = false
  ): Promise<ApiResponse<Exercise[]>> {
    try {
      console.log('🔍 getAllExercises service called');
      console.log('📊 Parámetros:', { usuarioId, incluirSolucion, incluirOpciones });

      const result = await databaseService.executeProcedure('SP_Ejercicio_ObtenerConProgresoUsuario', {
        UsuarioId: usuarioId || null,
        LeccionId: null,
        CursoId: null,
        SoloCompletados: 0,
        SoloNoCompletados: 0
      });

      if (result.recordset.length === 0) {
        return {
          success: true,
          message: 'No se encontraron ejercicios',
          data: []
        };
      }

      const exercises = result.recordset.map((record: any) => this.mapExerciseFromRecord(record));

      // Si se requieren opciones, cargarlas para ejercicios de opción múltiple y completar
      if (incluirOpciones) {
        console.log('🔧 incluirOpciones es TRUE, cargando opciones...');
        for (const exercise of exercises) {
          console.log(`🔧 Procesando ejercicio ${exercise.ejercicioId}: ${exercise.titulo}, tipo: ${exercise.tipoEjercicio}`);
          if (exercise.tipoEjercicio === 'OpcionMultiple' || 
              exercise.tipoEjercicio === 'CompletarCodigo' || 
              exercise.tipoEjercicio === 'LlenarEspacios') {
            console.log(`  📝 Es OpcionMultiple, cargando opciones...`);
            try {
              const optionsResult = await databaseService.executeQuery(`
                SELECT
                  OpcionId,
                  EjercicioId,
                  TextoOpcion,
                  EsCorrecta,
                  Explicacion,
                  OrdenIndice
                FROM OpcionesEjercicio
                WHERE EjercicioId = @ejercicioId
                ORDER BY OrdenIndice ASC
              `, { ejercicioId: exercise.ejercicioId });
              
              const mappedOptions = optionsResult.recordset?.map((record: any) => this.mapExerciseOptionFromRecord(record)) || [];
              (exercise as any).opciones = mappedOptions;
              console.log(`  ✅ Cargadas ${mappedOptions.length} opciones para ejercicio ${exercise.ejercicioId}`);
              console.log(`  📋 Opciones:`, mappedOptions.map(o => o.textoOpcion));
            } catch (optionError) {
              console.warn(`No se pudieron cargar opciones para ejercicio ${exercise.ejercicioId}:`, optionError);
              (exercise as any).opciones = [];
            }
          } else {
            console.log(`  ⏭️ No es OpcionMultiple, saltando...`);
          }
        }
        console.log('🔧 Terminado de cargar opciones');
      } else {
        console.log('🔧 incluirOpciones es FALSE, no se cargan opciones');
      }

      // Debug final: ver cuántos ejercicios tienen opciones
      const withOptions = exercises.filter((e: any) => e.opciones && e.opciones.length > 0);
      console.log(`✅ ${exercises.length} ejercicios obtenidos, ${withOptions.length} con opciones`);
      
      return {
        success: true,
        message: 'Ejercicios obtenidos exitosamente',
        data: exercises
      };
    } catch (error) {
      console.error('Error getting all exercises:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // OBTENER EJERCICIO POR ID
  // ============================================
  async getExerciseById(
    ejercicioId: number, 
    usuarioId?: number, 
    incluirSolucion: boolean = false,
    incluirOpciones: boolean = false
  ): Promise<ApiResponse<Exercise>> {
    try {
      const result = await databaseService.executeProcedure('SP_Ejercicio_ObtenerPorId', {
        EjercicioId: ejercicioId,
        UsuarioId: usuarioId || null,
        IncluirSolucion: incluirSolucion ? 1 : 0
      });

      if (result.recordset.length === 0) {
        return {
          success: false,
          message: 'Ejercicio no encontrado'
        };
      }

      const exercise = this.mapExerciseFromRecord(result.recordset[0]);
      
      // Si se requieren opciones y es de opción múltiple o completar, cargarlas
      if (incluirOpciones && (exercise.tipoEjercicio === 'OpcionMultiple' || 
          exercise.tipoEjercicio === 'CompletarCodigo' || 
          exercise.tipoEjercicio === 'LlenarEspacios')) {
        console.log(`🔍 Cargando opciones para ejercicio ${ejercicioId}...`);
        try {
          const optionsResult = await databaseService.executeQuery(`
            SELECT
              OpcionId,
              EjercicioId,
              TextoOpcion,
              CAST(NULL AS BIT) AS EsCorrecta,
              CAST(NULL AS NVARCHAR(MAX)) AS Explicacion,
              OrdenIndice
            FROM OpcionesEjercicio
            WHERE EjercicioId = @ejercicioId
            ORDER BY OrdenIndice ASC
          `, { ejercicioId });
          
          const mappedOptions = optionsResult.recordset?.map((record: any) => this.mapExerciseOptionFromRecord(record)) || [];
          (exercise as any).opciones = mappedOptions;
          console.log(`✅ Cargadas ${mappedOptions.length} opciones para ejercicio ${ejercicioId}`);
        } catch (optionError) {
          console.warn(`No se pudieron cargar opciones para ejercicio ${ejercicioId}:`, optionError);
          (exercise as any).opciones = [];
        }
      }
      
      return {
        success: true,
        message: 'Ejercicio obtenido exitosamente',
        data: exercise
      };
    } catch (error) {
      console.error('Error getting exercise by ID:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // OBTENER EJERCICIOS POR LECCIÓN
  // ============================================
  async getExercisesByLesson(
    leccionId: number,
    usuarioId?: number,
    incluirSolucion: boolean = false,
    soloCompletados: boolean = false
  ): Promise<ApiResponse<Exercise[]>> {
    try {
      const result = await databaseService.executeProcedure('SP_Ejercicio_ObtenerPorLeccion', {
        LeccionId: leccionId,
        UsuarioId: usuarioId || null,
        IncluirSolucion: incluirSolucion ? 1 : 0,
        SoloCompletados: soloCompletados ? 1 : 0
      });

      const exercises = result.recordset.map(record => this.mapExerciseFromRecord(record));
      
      return {
        success: true,
        message: 'Ejercicios obtenidos exitosamente',
        data: exercises
      };
    } catch (error) {
      console.error('Error getting exercises by lesson:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // OBTENER EJERCICIOS POR LECCIÓN CON OPCIONES
  // ============================================
  async getExercisesByLessonWithOptions(
    leccionId: number,
    usuarioId?: number,
    incluirSolucion: boolean = false,
    soloCompletados: boolean = false
  ): Promise<ApiResponse<ExerciseWithOptions[]>> {
    try {
      // Primero obtener los ejercicios
      const exercisesResult = await databaseService.executeProcedure('SP_Ejercicio_ObtenerPorLeccion', {
        LeccionId: leccionId,
        UsuarioId: usuarioId || null,
        IncluirSolucion: incluirSolucion ? 1 : 0,
        SoloCompletados: soloCompletados ? 1 : 0
      });

      const exercises = exercisesResult.recordset.map(record => this.mapExerciseFromRecord(record));
      
      // Para ejercicios de opción múltiple y completar, cargar las opciones automáticamente
      const exercisesWithOptions: ExerciseWithOptions[] = [];

      for (const exercise of exercises) {
        console.log(`🔍 Processing exercise ${exercise.ejercicioId}: ${exercise.titulo}, type: ${exercise.tipoEjercicio}`);
        
        // Cargar opciones para OpcionMultiple, CompletarCodigo y LlenarEspacios
        if (exercise.tipoEjercicio === 'OpcionMultiple' || 
            exercise.tipoEjercicio === 'CompletarCodigo' || 
            exercise.tipoEjercicio === 'LlenarEspacios') {
          console.log(`  📝 Exercise is ${exercise.tipoEjercicio}, loading options...`);
          try {
            // Usar consulta SQL directa para obtener opciones
            // NO incluir EsCorrecta para no revelar la respuesta correcta
            const optionsQuery = `
              SELECT
                OpcionId,
                EjercicioId,
                TextoOpcion,
                CAST(NULL AS BIT) AS EsCorrecta,
                CAST(NULL AS NVARCHAR(MAX)) AS Explicacion,
                OrdenIndice
              FROM OpcionesEjercicio
              WHERE EjercicioId = @ejercicioId
              ORDER BY OrdenIndice ASC
            `;

            const optionsResult = await databaseService.executeQuery(optionsQuery, {
              ejercicioId: exercise.ejercicioId
            });

            const options = optionsResult.recordset?.map((record: any) => this.mapExerciseOptionFromRecord(record)) || [];

            console.log(`  ✅ Loaded ${options.length} options for ${exercise.tipoEjercicio} exercise ${exercise.ejercicioId}`);

            exercisesWithOptions.push({
              ...exercise,
              opciones: options
            });
          } catch (optionError) {
            console.warn(`No se pudieron cargar opciones para ejercicio ${exercise.ejercicioId}:`, optionError);
            // Agregar ejercicio sin opciones
            exercisesWithOptions.push({
              ...exercise,
              opciones: []
            });
          }
        } else {
          // Para otros tipos de ejercicio, no cargar opciones
          exercisesWithOptions.push({
            ...exercise,
            opciones: []
          });
        }
      }
      
      return {
        success: true,
        message: 'Ejercicios obtenidos exitosamente',
        data: exercisesWithOptions
      };
    } catch (error) {
      console.error('Error getting exercises by lesson with options:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // OBTENER EJERCICIO CON OPCIONES
  // ============================================
  async getExerciseWithOptions(
    ejercicioId: number,
    usuarioId?: number,
    incluirRespuestas: boolean = false
  ): Promise<ApiResponse<ExerciseWithOptions>> {
    try {
      const result = await databaseService.executeProcedure('SP_Ejercicio_ObtenerConOpciones', {
        EjercicioId: ejercicioId,
        UsuarioId: usuarioId || null,
        IncluirRespuestas: incluirRespuestas ? 1 : 0
      });

      if (result.recordset.length === 0) {
        return {
          success: false,
          message: 'Ejercicio no encontrado'
        };
      }

      // El primer recordset contiene el ejercicio
      const exercise = this.mapExerciseFromRecord(result.recordset[0]);
      
      // El segundo recordset contiene las opciones
      const options = (result.recordsets as any[])[1]?.map((record: any) => this.mapExerciseOptionFromRecord(record)) || [];
      
      const exerciseWithOptions: ExerciseWithOptions = {
        ...exercise,
        opciones: options
      };
      
      return {
        success: true,
        message: 'Ejercicio con opciones obtenido exitosamente',
        data: exerciseWithOptions
      };
    } catch (error) {
      console.error('Error getting exercise with options:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // ACTUALIZAR EJERCICIO
  // ============================================
  async updateExercise(
    ejercicioId: number, 
    data: UpdateExerciseRequest
  ): Promise<ApiResponse<void>> {
    try {
      const result = await databaseService.executeProcedure('SP_Ejercicio_Actualizar', {
        EjercicioId: ejercicioId,
        Titulo: data.titulo || null,
        Instrucciones: data.instrucciones || null,
        CodigoInicial: data.codigoInicial || null,
        Solucion: data.solucion || null,
        CasosPrueba: data.casosPrueba || null,
        Pistas: data.pistas || null,
        RecompensaXP: data.recompensaXP || null,
        OrdenIndice: data.ordenIndice || null,
        NivelDificultad: data.nivelDificultad || null
      });

      const response = result.recordset[0];
      
      if (response.Resultado === 'Exito') {
        return {
          success: true,
          message: response.Mensaje
        };
      } else {
        return {
          success: false,
          message: response.Mensaje
        };
      }
    } catch (error) {
      console.error('Error updating exercise:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // ELIMINAR EJERCICIO
  // ============================================
  async deleteExercise(ejercicioId: number): Promise<ApiResponse<void>> {
    try {
      const result = await databaseService.executeProcedure('SP_Ejercicio_Eliminar', {
        EjercicioId: ejercicioId
      });

      const response = result.recordset[0];
      
      if (response.Resultado === 'Exito') {
        return {
          success: true,
          message: response.Mensaje
        };
      } else {
        return {
          success: false,
          message: response.Mensaje
        };
      }
    } catch (error) {
      console.error('Error deleting exercise:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // REORDENAR EJERCICIOS
  // ============================================
  async reorderExercises(
    leccionId: number, 
    data: ReorderExercisesRequest
  ): Promise<ApiResponse<void>> {
    try {
      const ejerciciosOrdenados = JSON.stringify(data.ejerciciosOrdenados);
      
      const result = await databaseService.executeProcedure('SP_Ejercicio_Reordenar', {
        LeccionId: leccionId,
        EjerciciosOrdenados: ejerciciosOrdenados
      });

      const response = result.recordset[0];
      
      if (response.Resultado === 'Exito') {
        return {
          success: true,
          message: response.Mensaje
        };
      } else {
        return {
          success: false,
          message: response.Mensaje
        };
      }
    } catch (error) {
      console.error('Error reordering exercises:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // CREAR EJERCICIOS MASIVAMENTE
  // ============================================
  async createExercises(
    leccionId: number, 
    data: CreateExercisesRequest
  ): Promise<ApiResponse<{ ejerciciosCreados: number }>> {
    try {
      const ejercicios = JSON.stringify(data.ejercicios);
      
      const result = await databaseService.executeProcedure('SP_Ejercicio_CrearMasivamente', {
        LeccionId: leccionId,
        Ejercicios: ejercicios
      });

      const response = result.recordset[0];
      
      if (response.Resultado === 'Exito') {
        return {
          success: true,
          message: response.Mensaje,
          data: { ejerciciosCreados: response.EjerciciosCreados }
        };
      } else {
        return {
          success: false,
          message: response.Mensaje
        };
      }
    } catch (error) {
      console.error('Error creating exercises:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // OBTENER ESTADÍSTICAS DE EJERCICIO
  // ============================================
  async getExerciseStatistics(
    ejercicioId: number, 
    periodoDias: number = 30
  ): Promise<ApiResponse<ExerciseStatistics>> {
    try {
      const result = await databaseService.executeProcedure('SP_Ejercicio_ObtenerEstadisticas', {
        EjercicioId: ejercicioId,
        PeriodoDias: periodoDias
      });

      if (result.recordset.length === 0) {
        return {
          success: false,
          message: 'Ejercicio no encontrado'
        };
      }

      const statistics = this.mapExerciseStatisticsFromRecord(result.recordset[0]);
      
      return {
        success: true,
        message: 'Estadísticas obtenidas exitosamente',
        data: statistics
      };
    } catch (error) {
      console.error('Error getting exercise statistics:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // OBTENER EJERCICIOS MÁS POPULARES
  // ============================================
  async getPopularExercises(
    limite: number = 10,
    periodoDias: number = 30,
    tipoEjercicioId?: number
  ): Promise<ApiResponse<Exercise[]>> {
    try {
      const result = await databaseService.executeProcedure('SP_Ejercicio_ObtenerMasPopulares', {
        Limite: limite,
        PeriodoDias: periodoDias,
        TipoEjercicioId: tipoEjercicioId || null
      });

      const exercises = result.recordset.map(record => this.mapExerciseFromRecord(record));
      
      return {
        success: true,
        message: 'Ejercicios populares obtenidos exitosamente',
        data: exercises
      };
    } catch (error) {
      console.error('Error getting popular exercises:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // OBTENER RECOMENDACIONES DE EJERCICIOS
  // ============================================
  async getExerciseRecommendations(
    usuarioId: number,
    limite: number = 5,
    nivelDificultad?: number
  ): Promise<ApiResponse<ExerciseWithOptions[]>> {
    try {
      const result = await databaseService.executeProcedure('SP_Ejercicio_ObtenerRecomendaciones', {
        UsuarioId: usuarioId,
        Limite: limite,
        NivelDificultad: nivelDificultad || null
      });

      const exercises = result.recordset.map(record => this.mapExerciseFromRecord(record));

      // Cargar opciones para ejercicios de opción múltiple y completar
      const exercisesWithOptions: ExerciseWithOptions[] = [];

      for (const exercise of exercises) {
        console.log(`🔍 Processing exercise ${exercise.ejercicioId}, type: ${exercise.tipoEjercicio}`);
        if (exercise.tipoEjercicio === 'OpcionMultiple' || 
            exercise.tipoEjercicio === 'CompletarCodigo' || 
            exercise.tipoEjercicio === 'LlenarEspacios') {
          try {
            const optionsQuery = `
              SELECT
                OpcionId,
                EjercicioId,
                TextoOpcion,
                CAST(NULL AS BIT) AS EsCorrecta,
                CAST(NULL AS NVARCHAR(MAX)) AS Explicacion,
                OrdenIndice
              FROM OpcionesEjercicio
              WHERE EjercicioId = @ejercicioId
              ORDER BY OrdenIndice ASC
            `;

            console.log(`🔍 Querying options for exercise ${exercise.ejercicioId}`);
            const optionsResult = await databaseService.executeQuery(optionsQuery, {
              ejercicioId: exercise.ejercicioId
            });

            console.log(`🔍 Options query result recordset:`, optionsResult.recordset);
            console.log(`🔍 Number of options found: ${optionsResult.recordset?.length || 0}`);

            const options = optionsResult.recordset?.map((record: any) => this.mapExerciseOptionFromRecord(record)) || [];
            console.log(`🔍 Mapped options:`, options);

            exercisesWithOptions.push({
              ...exercise,
              opciones: options
            });
          } catch (optionError) {
            console.warn(`No se pudieron cargar opciones para ejercicio ${exercise.ejercicioId}:`, optionError);
            exercisesWithOptions.push({
              ...exercise,
              opciones: []
            });
          }
        } else {
          exercisesWithOptions.push({
            ...exercise,
            opciones: []
          });
        }
      }

      return {
        success: true,
        message: 'Recomendaciones obtenidas exitosamente',
        data: exercisesWithOptions
      };
    } catch (error) {
      console.error('Error getting exercise recommendations:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // OBTENER EJERCICIOS FALLIDOS
  // ============================================
  async getFailedExercises(
    usuarioId: number,
    limite: number = 20,
    incluirOpciones: boolean = false
  ): Promise<ApiResponse<Exercise[]>> {
    try {
      const result = await databaseService.executeProcedure('SP_Ejercicio_ObtenerEjerciciosFallidos', {
        UsuarioId: usuarioId,
        Limite: limite
      });

      const exercises = result.recordset.map(record => this.mapExerciseFromRecord(record));

      // Si se requieren opciones, cargarlas para ejercicios de opción múltiple y completar
      if (incluirOpciones) {
        for (const exercise of exercises) {
          if (exercise.tipoEjercicio === 'OpcionMultiple' || 
              exercise.tipoEjercicio === 'CompletarCodigo' || 
              exercise.tipoEjercicio === 'LlenarEspacios') {
            try {
              const optionsResult = await databaseService.executeQuery(`
                SELECT
                  OpcionId,
                  EjercicioId,
                  TextoOpcion,
                  EsCorrecta,
                  Explicacion,
                  OrdenIndice
                FROM OpcionesEjercicio
                WHERE EjercicioId = @ejercicioId
                ORDER BY OrdenIndice ASC
              `, { ejercicioId: exercise.ejercicioId });

              (exercise as any).opciones = optionsResult.recordset?.map((record: any) => this.mapExerciseOptionFromRecord(record)) || [];
            } catch (optionError) {
              console.warn(`No se pudieron cargar opciones para ejercicio ${exercise.ejercicioId}:`, optionError);
              (exercise as any).opciones = [];
            }
          }
        }
      }

      return {
        success: true,
        message: 'Ejercicios fallidos obtenidos exitosamente',
        data: exercises
      };
    } catch (error) {
      console.error('Error getting failed exercises:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // OBTENER EJERCICIOS RECIENTES
  // ============================================
  async getRecentExercises(
    usuarioId: number,
    limite: number = 10
  ): Promise<ApiResponse<Exercise[]>> {
    try {
      const result = await databaseService.executeProcedure('SP_Ejercicio_ObtenerEjerciciosRecientes', {
        UsuarioId: usuarioId,
        Limite: limite
      });

      const exercises = result.recordset.map(record => this.mapExerciseFromRecord(record));
      
      return {
        success: true,
        message: 'Ejercicios recientes obtenidos exitosamente',
        data: exercises
      };
    } catch (error) {
      console.error('Error getting recent exercises:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // OBTENER MEJOR INTENTO
  // ============================================
  async getBestAttempt(
    usuarioId: number,
    ejercicioId: number
  ): Promise<ApiResponse<ExerciseAttempt>> {
    try {
      const result = await databaseService.executeProcedure('SP_Ejercicio_ObtenerMejorIntento', {
        UsuarioId: usuarioId,
        EjercicioId: ejercicioId
      });

      if (result.recordset.length === 0) {
        return {
          success: false,
          message: 'No se encontraron intentos para este ejercicio'
        };
      }

      const attempt = this.mapExerciseAttemptFromRecord(result.recordset[0]);
      
      return {
        success: true,
        message: 'Mejor intento obtenido exitosamente',
        data: attempt
      };
    } catch (error) {
      console.error('Error getting best attempt:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // OBTENER EJERCICIOS CON PROGRESO DE USUARIO
  // ============================================
  async getExercisesWithUserProgress(
    usuarioId: number,
    leccionId?: number,
    cursoId?: number,
    soloCompletados: boolean = false,
    soloNoCompletados: boolean = false
  ): Promise<ApiResponse<Exercise[]>> {
    try {
      const result = await databaseService.executeProcedure('SP_Ejercicio_ObtenerConProgresoUsuario', {
        UsuarioId: usuarioId,
        LeccionId: leccionId || null,
        CursoId: cursoId || null,
        SoloCompletados: soloCompletados ? 1 : 0,
        SoloNoCompletados: soloNoCompletados ? 1 : 0
      });

      const exercises = result.recordset.map(record => this.mapExerciseFromRecord(record));
      
      return {
        success: true,
        message: 'Ejercicios con progreso obtenidos exitosamente',
        data: exercises
      };
    } catch (error) {
      console.error('Error getting exercises with user progress:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // MÉTODOS DE MAPEO
  // ============================================
  private mapExerciseFromRecord(record: any): Exercise {
    // Mapear tipo de ejercicio a formato compatible con Flutter
    const tipoEjercicioMap: { [key: string]: string } = {
      'OpcionMultiple': 'multipleChoice',
      'CompletarCodigo': 'fillBlank',
      'CorregirError': 'code',
      'SalidaCodigo': 'code',
      'LlenarEspacios': 'fillBlank',
      'Codigo': 'code',
      'VerdaderoFalso': 'trueFalse',
      'OrdenarCodigo': 'code'
    };

    return {
      ejercicioId: record.EjercicioId,
      leccionId: record.LeccionId,
      tipoEjercicioId: record.TipoEjercicioId,
      tipoEjercicio: record.TipoEjercicio,
      tipoDescripcion: record.TipoDescripcion,
      type: tipoEjercicioMap[record.TipoEjercicio] || 'code', // Campo para Flutter
      titulo: record.Titulo,
      instrucciones: record.Instrucciones,
      codigoInicial: record.CodigoInicial,
      solucion: record.Solucion,
      casosPrueba: record.CasosPrueba,
      pistas: record.Pistas,
      recompensaXP: record.RecompensaXP,
      ordenIndice: record.OrdenIndice,
      nivelDificultad: record.NivelDificultad,
      fechaCreacion: record.FechaCreacion,
      leccionTitulo: record.LeccionTitulo,
      cursoId: record.CursoId,
      cursoTitulo: record.CursoTitulo,
      totalIntentos: record.TotalIntentos,
      estaCompletado: record.EstaCompletado === 1,
      xpGanado: record.XPGanado,
      ultimoIntento: record.UltimoIntento,
      mejorTiempo: record.MejorTiempo
    };
  }

  private mapExerciseOptionFromRecord(record: any): ExerciseOption {
    return {
      opcionId: record.OpcionId,
      ejercicioId: record.EjercicioId,
      textoOpcion: record.TextoOpcion,
      esCorrecta: record.EsCorrecta === null ? false : record.EsCorrecta === 1,
      explicacion: record.Explicacion,
      ordenIndice: record.OrdenIndice,
      vecesSeleccionada: record.VecesSeleccionada,
      vecesSeleccionadaCorrectamente: record.VecesSeleccionadaCorrectamente
    };
  }

  private mapExerciseAttemptFromRecord(record: any): ExerciseAttempt {
    return {
      intentoId: record.IntentoId,
      usuarioId: record.UsuarioId,
      ejercicioId: record.EjercicioId,
      codigoUsuario: record.CodigoUsuario,
      esCorrecto: record.EsCorrecto === 1,
      tiempoEjecucion: record.TiempoEjecucion,
      mensajeError: record.MensajeError,
      pruebasPasadas: record.PruebasPasadas,
      totalPruebas: record.TotalPruebas,
      xpGanado: record.XPGanado,
      numeroIntento: record.NumeroIntento,
      fechaCreacion: record.FechaCreacion,
      ejercicioTitulo: record.EjercicioTitulo,
      tipoEjercicio: record.TipoEjercicio,
      leccionTitulo: record.LeccionTitulo,
      cursoTitulo: record.CursoTitulo
    };
  }

  private mapExerciseStatisticsFromRecord(record: any): ExerciseStatistics {
    return {
      ejercicioId: record.EjercicioId,
      ejercicioTitulo: record.EjercicioTitulo,
      tipoEjercicio: record.TipoEjercicio,
      nivelDificultad: record.NivelDificultad,
      recompensaXP: record.RecompensaXP,
      totalIntentos: record.TotalIntentos,
      totalUsuarios: record.TotalUsuarios,
      intentosCorrectos: record.IntentosCorrectos,
      usuariosCorrectos: record.UsuariosCorrectos,
      intentosEnPeriodo: record.IntentosEnPeriodo,
      usuariosEnPeriodo: record.UsuariosEnPeriodo,
      correctosEnPeriodo: record.CorrectosEnPeriodo,
      tasaExitoPorcentaje: record.TasaExitoPorcentaje,
      tiempoPromedioEjecucion: record.TiempoPromedioEjecucion,
      tiempoMinimo: record.TiempoMinimo,
      tiempoMaximo: record.TiempoMaximo,
      promedioIntentosPorUsuario: record.PromedioIntentosPorUsuario,
      promedioPruebasPasadas: record.PromedioPruebasPasadas,
      promedioTotalPruebas: record.PromedioTotalPruebas,
      primerIntento: record.PrimerIntento,
      ultimoIntento: record.UltimoIntento
    };
  }

  // ============================================
  // ENVIAR RESPUESTA DE EJERCICIO
  // ============================================
  async submitExercise(
    usuarioId: number,
    ejercicioId: number,
    respuestaUsuario: string,
    tiempoEjecucion?: number,
    pruebasPasadas?: number,
    totalPruebas?: number,
    evaluacionManual?: boolean
  ): Promise<ApiResponse<any>> {
    try {
      // Primero obtener el ejercicio para saber su tipo
      const exerciseResult = await this.getExerciseById(ejercicioId, usuarioId);
      if (!exerciseResult.success || !exerciseResult.data) {
        return {
          success: false,
          message: 'Ejercicio no encontrado'
        };
      }

      const exercise = exerciseResult.data;
      let esCorrecto = false;
      let mensajeError: string | null = null;
      let feedback: string | null = null;

      // Evaluar según el tipo de ejercicio
      if (exercise.tipoEjercicio === 'OpcionMultiple') {
        // Para opción múltiple, verificar si la respuesta coincide con la opción correcta
        const optionsQuery = `
          SELECT OpcionId, TextoOpcion, EsCorrecta
          FROM OpcionesEjercicio
          WHERE EjercicioId = @ejercicioId AND EsCorrecta = 1
        `;

        const optionsResult = await databaseService.executeQuery(optionsQuery, {
          ejercicioId: ejercicioId
        });

        if (optionsResult.recordset && optionsResult.recordset.length > 0) {
          const correctOption = optionsResult.recordset[0];
          // Comparar la respuesta del usuario con la opción correcta (ignorando mayúsculas/minúsculas y espacios extras)
          const normalizedUserAnswer = respuestaUsuario.trim().toLowerCase();
          const normalizedCorrectAnswer = correctOption.TextoOpcion.trim().toLowerCase();

          esCorrecto = normalizedUserAnswer === normalizedCorrectAnswer;

          if (!esCorrecto) {
            mensajeError = 'Respuesta incorrecta';
            feedback = `La respuesta correcta es: ${correctOption.TextoOpcion}`;
          } else {
            feedback = '¡Correcto! Excelente trabajo';
          }

          // Para opción múltiple, las pruebas son 1 de 1
          pruebasPasadas = esCorrecto ? 1 : 0;
          totalPruebas = 1;
        }
      } else if (exercise.tipoEjercicio === 'CompletarCodigo' || exercise.tipoEjercicio === 'LlenarEspacios') {
        // Para ejercicios de completar, comparar contra la solución
        if (exercise.solucion) {
          const normalizedUserAnswer = respuestaUsuario.trim().replace(/\s+/g, ' ').toLowerCase();
          const normalizedCorrectAnswer = exercise.solucion.trim().replace(/\s+/g, ' ').toLowerCase();

          esCorrecto = normalizedUserAnswer === normalizedCorrectAnswer;

          if (!esCorrecto) {
            mensajeError = 'Respuesta incorrecta';
            feedback = `La respuesta correcta es: ${exercise.solucion}`;
          } else {
            feedback = '¡Correcto! Excelente trabajo';
          }

          // Para completar código, las pruebas son 1 de 1
          pruebasPasadas = esCorrecto ? 1 : 0;
          totalPruebas = 1;
        }
      }

      // Llamar al stored procedure para guardar el intento
      const result = await databaseService.executeProcedure('SP_IntentoEjercicio_EvaluarRespuesta', {
        UsuarioId: usuarioId,
        EjercicioId: ejercicioId,
        CodigoUsuario: respuestaUsuario,
        TiempoEjecucion: tiempoEjecucion || null,
        MensajeError: mensajeError,
        PruebasPasadas: pruebasPasadas || 0,
        TotalPruebas: totalPruebas || 0,
        EvaluacionManual: evaluacionManual ? 1 : 0,
        EsCorrectoManual: evaluacionManual ? (esCorrecto ? 1 : 0) : null
      });

      const response = result.recordset[0];

      if (response.Resultado === 'Exito') {
        // Verificar y desbloquear logros automáticamente si el ejercicio fue correcto
        if (response.EsCorrecto) {
          LogrosService.verificarYDesbloquearLogros(usuarioId, [
            'EjerciciosCorrectos',
            'PuntajePerfecto'
          ]).then(result => {
            if (result.logrosDesbloqueados > 0) {
              console.log(`🎉 Desbloqueados ${result.logrosDesbloqueados} logros (+${result.xpTotalGanado} XP total)`);
            }
          }).catch(err => {
            console.error('Error verificando logros:', err);
            // No bloquear la respuesta por error en verificación de logros
          });
        }

        return {
          success: true,
          message: response.Mensaje,
          data: {
            intentoId: response.IntentoId,
            esCorrecto: response.EsCorrecto,
            xpGanado: response.XPGanado,
            numeroIntento: response.NumeroIntento,
            feedback: feedback,
            mensajeError: mensajeError
          }
        };
      } else {
        return {
          success: false,
          message: response.Mensaje
        };
      }
    } catch (error) {
      console.error('Error submitting exercise:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // OBTENER INTENTOS DE EJERCICIOS DEL USUARIO
  // ============================================
  async getUserExerciseAttempts(
    usuarioId: number,
    ejercicioId?: number,
    leccionId?: number,
    cursoId?: number,
    soloCorrectos: boolean = false,
    limite: number = 50
  ): Promise<ApiResponse<ExerciseAttempt[]>> {
    try {
      const result = await databaseService.executeProcedure('SP_IntentosEjercicio_ObtenerPorUsuario', {
        UsuarioId: usuarioId,
        EjercicioId: ejercicioId || null,
        LeccionId: leccionId || null,
        CursoId: cursoId || null,
        SoloCorrectos: soloCorrectos ? 1 : 0,
        Limite: limite
      });

      if (result.recordset.length === 0) {
        return {
          success: false,
          message: 'No se encontraron intentos para este usuario'
        };
      }

      const attempts = result.recordset.map(record => this.mapExerciseAttemptFromRecord(record));
      
      return {
        success: true,
        message: 'Intentos obtenidos exitosamente',
        data: attempts
      };
    } catch (error) {
      console.error('Error getting user exercise attempts:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // OBTENER RESUMEN DE INTENTOS DEL USUARIO
  // ============================================
  async getUserExerciseSummary(usuarioId: number): Promise<ApiResponse<{
    resumenGeneral: any;
    resumenPorTipo: any[];
    resumenPorCurso: any[];
    ejerciciosDificiles: any[];
  }>> {
    try {
      const result = await databaseService.executeProcedure('SP_IntentosEjercicio_ObtenerResumenUsuario', {
        UsuarioId: usuarioId
      });

      if (result.recordset.length === 0) {
        return {
          success: false,
          message: 'No se encontraron datos para este usuario'
        };
      }

      // El resultado contiene múltiples conjuntos de datos
      const resumenGeneral = result.recordset[0];
      const resumenPorTipo = result.recordset.slice(1, result.recordset.length - 2); // Excluir el último que es el mensaje
      const resumenPorCurso = result.recordset.slice(-3, -1); // Los últimos antes del mensaje
      const ejerciciosDificiles = result.recordset.slice(-2, -1); // El penúltimo

      return {
        success: true,
        message: 'Resumen obtenido exitosamente',
        data: {
          resumenGeneral,
          resumenPorTipo,
          resumenPorCurso,
          ejerciciosDificiles
        }
      };
    } catch (error) {
      console.error('Error getting user exercise summary:', error);
      return {
        success: false,
        message: 'Error interno del servidor'
      };
    }
  }
}

export const exerciseService = new ExerciseService();
