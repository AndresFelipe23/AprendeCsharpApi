// ============================================
// RUTAS DE EJERCICIOS
// Aplicación de Aprendizaje de C#
// ============================================

import express from 'express';
import { exerciseController } from '../controllers/ejercicios';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types/api';

const router = express.Router();

// ============================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================
// Aplicar autenticación a todas las rutas excepto las públicas
router.use((req, res, next) => {
  // Rutas públicas que no requieren autenticación
  const isPublicRoute = 
    (req.method === 'GET' && req.path.match(/^\/lesson\/\d+$/)) || // GET /lesson/:leccionId
    (req.method === 'GET' && req.path.match(/^\/\d+$/)) || // GET /:id
    (req.method === 'GET' && req.path.match(/^\/\d+\/options$/)) || // GET /:id/options
    (req.method === 'GET' && req.path.match(/^\/\d+\/statistics$/)) || // GET /:id/statistics
    (req.method === 'GET' && req.path === '/popular'); // GET /popular
  
  if (isPublicRoute) {
    console.log(`🔓 Ruta pública accedida: ${req.method} ${req.path}`);
    return next();
  }
  
  console.log(`🔒 Ruta protegida: ${req.method} ${req.path}`);
  // Para todas las demás rutas, requerir autenticación
  return authenticateToken(req as unknown as AuthRequest, res, next);
});

// ============================================
// RUTAS ESPECÍFICAS (deben estar ANTES de las rutas con parámetros)
// ============================================

/**
 * GET /api/exercises
 * Obtener todos los ejercicios
 * Público
 */
router.get('/', exerciseController.getAllExercises.bind(exerciseController));

/**
 * GET /api/exercises/recommendations
 * Obtener recomendaciones de ejercicios para el usuario
 * Requiere autenticación
 */
router.get('/recommendations', exerciseController.getExerciseRecommendations.bind(exerciseController));

/**
 * GET /api/exercises/popular
 * Obtener ejercicios más populares
 * Público
 */
router.get('/popular', exerciseController.getPopularExercises.bind(exerciseController));

/**
 * GET /api/exercises/failed
 * Obtener ejercicios que el usuario ha fallado
 * Requiere autenticación
 */
router.get('/failed', exerciseController.getFailedExercises.bind(exerciseController));

/**
 * GET /api/exercises/recent
 * Obtener ejercicios recientemente intentados por el usuario
 * Requiere autenticación
 */
router.get('/recent', exerciseController.getRecentExercises.bind(exerciseController));

/**
 * GET /api/exercises/progress
 * Obtener ejercicios con progreso detallado del usuario
 * Requiere autenticación
 */
router.get('/progress', exerciseController.getExercisesWithUserProgress.bind(exerciseController));

/**
 * GET /api/exercises/attempts
 * Obtener intentos de ejercicios del usuario
 * Requiere autenticación
 */
router.get('/attempts', exerciseController.getUserExerciseAttempts.bind(exerciseController));

/**
 * GET /api/exercises/summary
 * Obtener resumen de intentos de ejercicios del usuario
 * Requiere autenticación
 */
router.get('/summary', exerciseController.getUserExerciseSummary.bind(exerciseController));

// ============================================
// RUTAS DE LECCIONES
// ============================================

/**
 * GET /api/exercises/lesson/:leccionId
 * Obtener ejercicios de una lección
 * Público (para estudiantes)
 */
router.get('/lesson/:leccionId', exerciseController.getExercisesByLesson.bind(exerciseController));

/**
 * POST /api/exercises/lesson/:leccionId/reorder
 * Reordenar ejercicios de una lección
 * Requiere autenticación
 */
router.post('/lesson/:leccionId/reorder', exerciseController.reorderExercises.bind(exerciseController));

/**
 * POST /api/exercises/lesson/:leccionId/bulk
 * Crear múltiples ejercicios para una lección
 * Requiere autenticación
 */
router.post('/lesson/:leccionId/bulk', exerciseController.createExercises.bind(exerciseController));

// ============================================
// RUTAS CRUD BÁSICAS (con parámetros :id)
// ============================================

/**
 * POST /api/exercises
 * Crear nuevo ejercicio
 * Requiere autenticación
 */
router.post('/', exerciseController.createExercise.bind(exerciseController));

/**
 * GET /api/exercises/:id
 * Obtener ejercicio por ID
 * Público (para estudiantes)
 */
router.get('/:id', exerciseController.getExerciseById.bind(exerciseController));

/**
 * PUT /api/exercises/:id
 * Actualizar ejercicio
 * Requiere autenticación
 */
router.put('/:id', exerciseController.updateExercise.bind(exerciseController));

/**
 * DELETE /api/exercises/:id
 * Eliminar ejercicio
 * Requiere autenticación
 */
router.delete('/:id', exerciseController.deleteExercise.bind(exerciseController));

// ============================================
// RUTAS DE OPCIONES Y RESPUESTAS
// ============================================

/**
 * GET /api/exercises/:id/options
 * Obtener ejercicio con opciones (para opción múltiple)
 * Público (para estudiantes)
 */
router.get('/:id/options', exerciseController.getExerciseWithOptions.bind(exerciseController));

/**
 * POST /api/exercises/:id/submit
 * Enviar respuesta de ejercicio
 * Requiere autenticación
 */
router.post('/:id/submit', exerciseController.submitExercise.bind(exerciseController));

// ============================================
// RUTAS DE ESTADÍSTICAS Y ANÁLISIS
// ============================================

/**
 * GET /api/exercises/:id/statistics
 * Obtener estadísticas de un ejercicio
 * Público
 */
router.get('/:id/statistics', exerciseController.getExerciseStatistics.bind(exerciseController));

/**
 * GET /api/exercises/:id/best-attempt
 * Obtener el mejor intento del usuario en un ejercicio
 * Requiere autenticación
 */
router.get('/:id/best-attempt', exerciseController.getBestAttempt.bind(exerciseController));

// ============================================
// MANEJO DE ERRORES
// ============================================

// Middleware para manejar rutas no encontradas
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`
  });
});

// Middleware para manejar errores
router.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error en rutas de ejercicios:', error);
  
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

export default router;
