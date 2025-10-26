// ============================================
// CONTROLADOR DE EJERCICIOS
// Aplicación de Aprendizaje de C#
// ============================================

import { Response } from 'express';
import { exerciseService, CreateExerciseRequest, UpdateExerciseRequest, SubmitExerciseRequest, ReorderExercisesRequest, CreateExercisesRequest } from '../services/exercicios';
import { AuthRequest } from '../types/auth';

export class ExerciseController {
  // ============================================
  // CREAR EJERCICIO
  // ============================================
  async createExercise(req: AuthRequest, res: Response): Promise<void> {
    try {
      const data: CreateExerciseRequest = req.body;
      
      // Validaciones básicas
      if (!data.leccionId || !data.tipoEjercicioId || !data.titulo || !data.instrucciones) {
        res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: leccionId, tipoEjercicioId, titulo, instrucciones'
        });
        return;
      }

      const result = await exerciseService.createExercise(data);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in createExercise controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // OBTENER TODOS LOS EJERCICIOS
  // ============================================
  async getAllExercises(req: AuthRequest, res: Response): Promise<void> {
    try {
      console.log('🔍 getAllExercises llamado');
      const usuarioId = req.user?.UsuarioId;
      const incluirSolucion = req.query['incluirSolucion'] === 'true';
      const incluirOpciones = req.query['incluirOpciones'] === 'true';
      
      console.log('📊 Parámetros:', { usuarioId, incluirSolucion, incluirOpciones });
      
      const result = await exerciseService.getAllExercises(usuarioId, incluirSolucion, incluirOpciones);
      
      console.log('✅ Resultado obtenido:', result.success);
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error in getAllExercises controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // OBTENER EJERCICIO POR ID
  // ============================================
  async getExerciseById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params['id'];
      const ejercicioId = parseInt(id || '');
      
      if (isNaN(ejercicioId)) {
        res.status(400).json({
          success: false,
          message: 'ID de ejercicio inválido'
        });
        return;
      }

      const usuarioId = req.user?.UsuarioId;
      const incluirSolucion = req.query['incluirSolucion'] === 'true';
      const incluirOpciones = req.query['incluirOpciones'] === 'true';
      
      console.log(`🔍 getExerciseById: ID=${ejercicioId}, incluirSolucion=${incluirSolucion}, incluirOpciones=${incluirOpciones}`);
      
      const result = await exerciseService.getExerciseById(ejercicioId, usuarioId, incluirSolucion, incluirOpciones);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error in getExerciseById controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // OBTENER EJERCICIOS POR LECCIÓN
  // ============================================
  async getExercisesByLesson(req: AuthRequest, res: Response): Promise<void> {
    try {
      console.log('🔍 getExercisesByLesson llamado');
      const leccionId = req.params['leccionId'];
      console.log('📝 leccionId:', leccionId);
      const leccionIdNum = parseInt(leccionId || '');
      console.log('🔢 leccionIdNum:', leccionIdNum);
      
      if (isNaN(leccionIdNum)) {
        console.log('❌ ID de lección inválido');
        res.status(400).json({
          success: false,
          message: 'ID de lección inválido'
        });
        return;
      }

      const usuarioId = req.user?.UsuarioId;
      const incluirSolucion = req.query['incluirSolucion'] === 'true';
      const soloCompletados = req.query['soloCompletados'] === 'true';
      const incluirOpciones = req.query['incluirOpciones'] === 'true';
      
      console.log('📊 Parámetros:', { usuarioId, incluirSolucion, soloCompletados, incluirOpciones });
      
      // Usar el método que carga opciones automáticamente para ejercicios de opción múltiple
      console.log('🚀 Llamando a getExercisesByLessonWithOptions...');
      const result = await exerciseService.getExercisesByLessonWithOptions(
        leccionIdNum, 
        usuarioId, 
        incluirSolucion, 
        soloCompletados
      );
      
      console.log('✅ Resultado obtenido:', result.success);
      res.status(200).json(result);
    } catch (error) {
      console.error('❌ Error in getExercisesByLesson controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // OBTENER EJERCICIO CON OPCIONES
  // ============================================
  async getExerciseWithOptions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params['id'];
      const ejercicioId = parseInt(id || '');
      
      if (isNaN(ejercicioId)) {
        res.status(400).json({
          success: false,
          message: 'ID de ejercicio inválido'
        });
        return;
      }

      const usuarioId = req.user?.UsuarioId;
      const incluirRespuestas = req.query['incluirRespuestas'] === 'true';
      
      const result = await exerciseService.getExerciseWithOptions(ejercicioId, usuarioId, incluirRespuestas);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error in getExerciseWithOptions controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // ACTUALIZAR EJERCICIO
  // ============================================
  async updateExercise(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params['id'];
      const ejercicioId = parseInt(id || '');
      
      if (isNaN(ejercicioId)) {
        res.status(400).json({
          success: false,
          message: 'ID de ejercicio inválido'
        });
        return;
      }

      const data: UpdateExerciseRequest = req.body;
      
      const result = await exerciseService.updateExercise(ejercicioId, data);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in updateExercise controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // ELIMINAR EJERCICIO
  // ============================================
  async deleteExercise(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params['id'];
      const ejercicioId = parseInt(id || '');
      
      if (isNaN(ejercicioId)) {
        res.status(400).json({
          success: false,
          message: 'ID de ejercicio inválido'
        });
        return;
      }

      const result = await exerciseService.deleteExercise(ejercicioId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in deleteExercise controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // REORDENAR EJERCICIOS
  // ============================================
  async reorderExercises(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { leccionId } = req.params;
      const leccionIdNum = parseInt(leccionId || '');
      
      if (isNaN(leccionIdNum)) {
        res.status(400).json({
          success: false,
          message: 'ID de lección inválido'
        });
        return;
      }

      const data: ReorderExercisesRequest = req.body;
      
      if (!data.ejerciciosOrdenados || !Array.isArray(data.ejerciciosOrdenados)) {
        res.status(400).json({
          success: false,
          message: 'ejerciciosOrdenados debe ser un array válido'
        });
        return;
      }

      const result = await exerciseService.reorderExercises(leccionIdNum, data);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in reorderExercises controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // CREAR EJERCICIOS MASIVAMENTE
  // ============================================
  async createExercises(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { leccionId } = req.params;
      const leccionIdNum = parseInt(leccionId || '');
      
      if (isNaN(leccionIdNum)) {
        res.status(400).json({
          success: false,
          message: 'ID de lección inválido'
        });
        return;
      }

      const data: CreateExercisesRequest = req.body;
      
      if (!data.ejercicios || !Array.isArray(data.ejercicios)) {
        res.status(400).json({
          success: false,
          message: 'ejercicios debe ser un array válido'
        });
        return;
      }

      const result = await exerciseService.createExercises(leccionIdNum, data);
      
      if (result.success) {
        res.status(201).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in createExercises controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // OBTENER ESTADÍSTICAS DE EJERCICIO
  // ============================================
  async getExerciseStatistics(req: AuthRequest, res: Response): Promise<void> {
    try {
      const id = req.params['id'];
      const ejercicioId = parseInt(id || '');
      
      if (isNaN(ejercicioId)) {
        res.status(400).json({
          success: false,
          message: 'ID de ejercicio inválido'
        });
        return;
      }

      const periodoDias = parseInt(req.query['periodoDias'] as string) || 30;
      
      const result = await exerciseService.getExerciseStatistics(ejercicioId, periodoDias);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error in getExerciseStatistics controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // OBTENER EJERCICIOS MÁS POPULARES
  // ============================================
  async getPopularExercises(req: AuthRequest, res: Response): Promise<void> {
    try {
      const limite = parseInt(req.query['limite'] as string) || 10;
      const periodoDias = parseInt(req.query['periodoDias'] as string) || 30;
      const tipoEjercicioId = req.query['tipoEjercicioId'] ? parseInt(req.query['tipoEjercicioId'] as string) : undefined;
      
      const result = await exerciseService.getPopularExercises(limite, periodoDias, tipoEjercicioId);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getPopularExercises controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // OBTENER RECOMENDACIONES DE EJERCICIOS
  // ============================================
  async getExerciseRecommendations(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Temporalmente permitir acceso sin autenticación
      const usuarioId = req.user?.UsuarioId || 1; // Usar ID 1 como fallback
      
      console.log('🔍 Usuario ID para recomendaciones:', usuarioId);

      const limite = parseInt(req.query['limite'] as string) || 5;
      const nivelDificultad = req.query['nivelDificultad'] ? parseInt(req.query['nivelDificultad'] as string) : undefined;
      
      console.log('📊 Parámetros:', { limite, nivelDificultad });
      
      const result = await exerciseService.getExerciseRecommendations(usuarioId, limite, nivelDificultad);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getExerciseRecommendations controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // OBTENER EJERCICIOS FALLIDOS
  // ============================================
  async getFailedExercises(req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.user?.UsuarioId;

      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const limite = parseInt(req.query['limite'] as string) || 20;
      const incluirOpciones = req.query['incluirOpciones'] === 'true';

      console.log('📊 Parámetros getFailedExercises:', { usuarioId, limite, incluirOpciones });

      const result = await exerciseService.getFailedExercises(usuarioId, limite, incluirOpciones);

      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getFailedExercises controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // OBTENER EJERCICIOS RECIENTES
  // ============================================
  async getRecentExercises(req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.user?.UsuarioId;
      
      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const limite = parseInt(req.query['limite'] as string) || 10;
      
      const result = await exerciseService.getRecentExercises(usuarioId, limite);
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getRecentExercises controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // OBTENER MEJOR INTENTO
  // ============================================
  async getBestAttempt(req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.user?.UsuarioId;
      
      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const id = req.params['id'];
      const ejercicioId = parseInt(id || '');
      
      if (isNaN(ejercicioId)) {
        res.status(400).json({
          success: false,
          message: 'ID de ejercicio inválido'
        });
        return;
      }

      const result = await exerciseService.getBestAttempt(usuarioId, ejercicioId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error in getBestAttempt controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // OBTENER EJERCICIOS CON PROGRESO DE USUARIO
  // ============================================
  async getExercisesWithUserProgress(req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.user?.UsuarioId;
      
      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const leccionId = req.query['leccionId'] ? parseInt(req.query['leccionId'] as string) : undefined;
      const cursoId = req.query['cursoId'] ? parseInt(req.query['cursoId'] as string) : undefined;
      const soloCompletados = req.query['soloCompletados'] === 'true';
      const soloNoCompletados = req.query['soloNoCompletados'] === 'true';
      
      const result = await exerciseService.getExercisesWithUserProgress(
        usuarioId, 
        leccionId, 
        cursoId, 
        soloCompletados, 
        soloNoCompletados
      );
      
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in getExercisesWithUserProgress controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // ENVIAR RESPUESTA DE EJERCICIO
  // ============================================
  async submitExercise(req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.user?.UsuarioId;
      
      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const id = req.params['id'];
      const ejercicioId = parseInt(id || '');
      
      if (isNaN(ejercicioId)) {
        res.status(400).json({
          success: false,
          message: 'ID de ejercicio inválido'
        });
        return;
      }

      const data: SubmitExerciseRequest = req.body;

      // Soportar ambos campos para compatibilidad
      const respuestaUsuario = data.respuestaUsuario || data.codigoUsuario;

      if (!respuestaUsuario) {
        res.status(400).json({
          success: false,
          message: 'respuestaUsuario o codigoUsuario es requerido'
        });
        return;
      }

      // Llamar al servicio para evaluar y guardar el intento
      const result = await exerciseService.submitExercise(
        usuarioId,
        ejercicioId,
        respuestaUsuario,
        data.tiempoEjecucion,
        data.pruebasPasadas,
        data.totalPruebas,
        data.evaluacionManual
      );

      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Error in submitExercise controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // OBTENER INTENTOS DE EJERCICIOS DEL USUARIO
  // ============================================
  async getUserExerciseAttempts(req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.user?.UsuarioId;
      
      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }

      const ejercicioId = req.query['ejercicioId'] ? parseInt(req.query['ejercicioId'] as string) : undefined;
      const leccionId = req.query['leccionId'] ? parseInt(req.query['leccionId'] as string) : undefined;
      const cursoId = req.query['cursoId'] ? parseInt(req.query['cursoId'] as string) : undefined;
      const soloCorrectos = req.query['soloCorrectos'] === 'true';
      const limite = req.query['limite'] ? parseInt(req.query['limite'] as string) : 50;
      
      const result = await exerciseService.getUserExerciseAttempts(
        usuarioId, 
        ejercicioId, 
        leccionId, 
        cursoId, 
        soloCorrectos, 
        limite
      );
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error in getUserExerciseAttempts controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // OBTENER RESUMEN DE INTENTOS DEL USUARIO
  // ============================================
  async getUserExerciseSummary(req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.user?.UsuarioId;
      
      if (!usuarioId) {
        res.status(401).json({
          success: false,
          message: 'Usuario no autenticado'
        });
        return;
      }
      
      const result = await exerciseService.getUserExerciseSummary(usuarioId);
      
      if (result.success) {
        res.status(200).json(result);
      } else {
        res.status(404).json(result);
      }
    } catch (error) {
      console.error('Error in getUserExerciseSummary controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export const exerciseController = new ExerciseController();
