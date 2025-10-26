import { Request, Response } from 'express';
import { databaseService } from '../services/database';
import { AuthRequest } from '../types/api';

export class ExerciseOptionsController {
  /**
   * Crear una nueva opción de ejercicio
   */
  async createExerciseOption(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ejercicioId, textoOpcion, esCorrecta, ordenIndice, explicacion } = req.body;

      // Validar campos requeridos
      if (!ejercicioId || !textoOpcion || esCorrecta === undefined) {
        res.status(400).json({
          success: false,
          message: 'Faltan campos requeridos: ejercicioId, textoOpcion, esCorrecta',
          error: 'MISSING_REQUIRED_FIELDS',
          required: ['ejercicioId', 'textoOpcion', 'esCorrecta']
        });
        return;
      }

      // Validar que esCorrecta sea boolean
      if (typeof esCorrecta !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'esCorrecta debe ser un valor booleano (true/false)',
          error: 'INVALID_BOOLEAN_VALUE'
        });
        return;
      }

      // Validar que ordenIndice sea número si se proporciona
      if (ordenIndice !== undefined && typeof ordenIndice !== 'number') {
        res.status(400).json({
          success: false,
          message: 'ordenIndice debe ser un número',
          error: 'INVALID_NUMBER_VALUE'
        });
        return;
      }

      // Ejecutar stored procedure
      const result = await databaseService.executeProcedure(
        'SP_OpcionEjercicio_Crear',
        {
          ejercicioId,
          textoOpcion,
          esCorrecta,
          ordenIndice: ordenIndice || 1,
          explicacion: explicacion || ''
        }
      );

      // El stored procedure devuelve: Resultado, Mensaje, OpcionId
      if (result.Resultado === 'Exito') {
        res.status(201).json({
          success: true,
          message: result.Mensaje || 'Opción de ejercicio creada exitosamente',
          data: {
            opcionId: result.OpcionId
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.Mensaje || 'Error al crear la opción de ejercicio',
          error: 'DATABASE_ERROR'
        });
      }
    } catch (error) {
      console.error('Error en createExerciseOption:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Obtener todas las opciones de un ejercicio
   */
  async getExerciseOptions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ejercicioId } = req.params;

      if (!ejercicioId) {
        res.status(400).json({
          success: false,
          message: 'ID del ejercicio es requerido',
          error: 'MISSING_EXERCISE_ID'
        });
        return;
      }

      const result = await databaseService.executeProcedure(
        'SP_OpcionEjercicio_ObtenerPorEjercicio',
        { ejercicioId: parseInt(ejercicioId) }
      );

      // El stored procedure devuelve directamente los datos
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Error en getExerciseOptions:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Actualizar una opción de ejercicio
   */
  async updateExerciseOption(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { textoOpcion, esCorrecta, ordenIndice, explicacion } = req.body;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de la opción es requerido',
          error: 'MISSING_OPTION_ID'
        });
        return;
      }

      // Validar que esCorrecta sea boolean si se proporciona
      if (esCorrecta !== undefined && typeof esCorrecta !== 'boolean') {
        res.status(400).json({
          success: false,
          message: 'esCorrecta debe ser un valor booleano (true/false)',
          error: 'INVALID_BOOLEAN_VALUE'
        });
        return;
      }

      // Validar que ordenIndice sea número si se proporciona
      if (ordenIndice !== undefined && typeof ordenIndice !== 'number') {
        res.status(400).json({
          success: false,
          message: 'ordenIndice debe ser un número',
          error: 'INVALID_NUMBER_VALUE'
        });
        return;
      }

      const result = await databaseService.executeProcedure(
        'SP_OpcionEjercicio_Actualizar',
        {
          opcionId: parseInt(id),
          textoOpcion,
          esCorrecta,
          ordenIndice,
          explicacion
        }
      );

      // El stored procedure devuelve: Resultado, Mensaje
      if (result.Resultado === 'Exito') {
        res.status(200).json({
          success: true,
          message: result.Mensaje || 'Opción de ejercicio actualizada exitosamente',
          data: result
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.Mensaje || 'Error al actualizar la opción de ejercicio',
          error: 'DATABASE_ERROR'
        });
      }
    } catch (error) {
      console.error('Error en updateExerciseOption:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }

  /**
   * Eliminar una opción de ejercicio
   */
  async deleteExerciseOption(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          success: false,
          message: 'ID de la opción es requerido',
          error: 'MISSING_OPTION_ID'
        });
        return;
      }

      const result = await databaseService.executeProcedure(
        'SP_OpcionEjercicio_Eliminar',
        { opcionId: parseInt(id) }
      );

      // El stored procedure devuelve: Resultado, Mensaje
      if (result.Resultado === 'Exito') {
        res.status(200).json({
          success: true,
          message: result.Mensaje || 'Opción de ejercicio eliminada exitosamente'
        });
      } else {
        res.status(400).json({
          success: false,
          message: result.Mensaje || 'Error al eliminar la opción de ejercicio',
          error: 'DATABASE_ERROR'
        });
      }
    } catch (error) {
      console.error('Error en deleteExerciseOption:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_SERVER_ERROR'
      });
    }
  }
}

export const exerciseOptionsController = new ExerciseOptionsController();
