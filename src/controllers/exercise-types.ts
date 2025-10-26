// ============================================
// CONTROLADOR DE TIPOS DE EJERCICIO
// Aplicación de Aprendizaje de C#
// ============================================

import { Response } from 'express';
import { databaseService } from '../services/database';
import { AuthRequest } from '../types/api';

export class ExerciseTypeController {
  // ============================================
  // CREAR TIPO DE EJERCICIO
  // ============================================
  async createExerciseType(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { nombreTipo, descripcion } = req.body;
      
      if (!nombreTipo) {
        res.status(400).json({
          success: false,
          message: 'El nombre del tipo de ejercicio es requerido'
        });
        return;
      }

      const result = await databaseService.executeProcedure(
        'SP_TipoEjercicio_Crear',
        { nombreTipo, descripcion }
      );

      if (result.recordset[0].Resultado === 'Exito') {
        res.status(201).json({
          success: true,
          message: result.recordset[0].Mensaje,
          data: {
            tipoEjercicioId: result.recordset[0].TipoEjercicioId
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.recordset[0].Mensaje
        });
      }
    } catch (error) {
      console.error('Error in createExerciseType controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // OBTENER TODOS LOS TIPOS DE EJERCICIO
  // ============================================
  async getAllExerciseTypes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await databaseService.executeProcedure(
        'SP_TipoEjercicio_ObtenerTodos'
      );

      const exerciseTypes = result.recordset.map((row: any) => ({
        tipoEjercicioId: row.TipoEjercicioId,
        nombreTipo: row.NombreTipo,
        descripcion: row.Descripcion,
        totalEjercicios: row.TotalEjercicios,
        totalIntentos: row.TotalIntentos,
        intentosCorrectos: row.IntentosCorrectos,
        tasaExitoPorcentaje: row.TasaExitoPorcentaje
      }));

      res.status(200).json({
        success: true,
        message: 'Tipos de ejercicio obtenidos exitosamente',
        data: exerciseTypes
      });
    } catch (error) {
      console.error('Error in getAllExerciseTypes controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // OBTENER TIPO DE EJERCICIO POR ID
  // ============================================
  async getExerciseTypeById(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tipoEjercicioId = parseInt(req.params.id);
      
      if (isNaN(tipoEjercicioId)) {
        res.status(400).json({
          success: false,
          message: 'ID de tipo de ejercicio inválido'
        });
        return;
      }

      const result = await databaseService.executeProcedure(
        'SP_TipoEjercicio_ObtenerPorId',
        { tipoEjercicioId }
      );

      if (result.recordset.length === 0) {
        res.status(404).json({
          success: false,
          message: 'Tipo de ejercicio no encontrado'
        });
        return;
      }

      const exerciseType = result.recordset[0];
      const response = {
        tipoEjercicioId: exerciseType.TipoEjercicioId,
        nombreTipo: exerciseType.NombreTipo,
        descripcion: exerciseType.Descripcion,
        totalEjercicios: exerciseType.TotalEjercicios,
        totalIntentos: exerciseType.TotalIntentos,
        intentosCorrectos: exerciseType.IntentosCorrectos,
        usuariosQueIntentaron: exerciseType.UsuariosQueIntentaron,
        tasaExitoPorcentaje: exerciseType.TasaExitoPorcentaje,
        tiempoPromedioEjecucion: exerciseType.TiempoPromedioEjecucion,
        promedioIntentosPorEjercicio: exerciseType.PromedioIntentosPorEjercicio
      };

      res.status(200).json({
        success: true,
        message: 'Tipo de ejercicio obtenido exitosamente',
        data: response
      });
    } catch (error) {
      console.error('Error in getExerciseTypeById controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // ACTUALIZAR TIPO DE EJERCICIO
  // ============================================
  async updateExerciseType(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tipoEjercicioId = parseInt(req.params.id);
      const { nombreTipo, descripcion } = req.body;
      
      if (isNaN(tipoEjercicioId)) {
        res.status(400).json({
          success: false,
          message: 'ID de tipo de ejercicio inválido'
        });
        return;
      }

      const result = await databaseService.executeProcedure(
        'SP_TipoEjercicio_Actualizar',
        { tipoEjercicioId, nombreTipo, descripcion }
      );

      if (result.recordset[0].Resultado === 'Exito') {
        res.status(200).json({
          success: true,
          message: result.recordset[0].Mensaje
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.recordset[0].Mensaje
        });
      }
    } catch (error) {
      console.error('Error in updateExerciseType controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }

  // ============================================
  // OBTENER TIPOS MÁS POPULARES
  // ============================================
  async getPopularExerciseTypes(req: AuthRequest, res: Response): Promise<void> {
    try {
      const limite = parseInt(req.query.limite as string) || 10;
      const periodoDias = parseInt(req.query.periodoDias as string) || 30;

      const result = await databaseService.executeProcedure(
        'SP_TipoEjercicio_ObtenerMasPopulares',
        { limite, periodoDias }
      );

      const popularTypes = result.recordset.map((row: any) => ({
        tipoEjercicioId: row.TipoEjercicioId,
        nombreTipo: row.NombreTipo,
        descripcion: row.Descripcion,
        intentosEnPeriodo: row.IntentosEnPeriodo,
        usuariosActivosEnPeriodo: row.UsuariosActivosEnPeriodo,
        totalEjercicios: row.TotalEjercicios,
        intentosCorrectosEnPeriodo: row.IntentosCorrectosEnPeriodo,
        tasaExitoPorcentaje: row.TasaExitoPorcentaje
      }));

      res.status(200).json({
        success: true,
        message: 'Tipos de ejercicio populares obtenidos exitosamente',
        data: popularTypes
      });
    } catch (error) {
      console.error('Error in getPopularExerciseTypes controller:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
}

export const exerciseTypeController = new ExerciseTypeController();
