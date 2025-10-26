// ============================================
// RUTAS DE TIPOS DE EJERCICIO
// Aplicación de Aprendizaje de C#
// ============================================

import express from 'express';
import { exerciseTypeController } from '../controllers/exercise-types';
import { authenticateToken } from '../middleware/auth';
import { AuthRequest } from '../types/api';

const router = express.Router();

// ============================================
// MIDDLEWARE DE AUTENTICACIÓN
// ============================================
// Aplicar autenticación a todas las rutas excepto las públicas
router.use((req, res, next) => {
  // Rutas públicas que no requieren autenticación
  const publicRoutes = [
    'GET /api/exercise-types',
    'GET /api/exercise-types/:id',
    'GET /api/exercise-types/popular'
  ];
  
  if (publicRoutes.some(route => {
    const [method, path] = route.split(' ');
    return req.method === method && req.path.match(path.replace(':id', '\\d+'));
  })) {
    return next();
  }
  
  // Para todas las demás rutas, requerir autenticación
  return authenticateToken(req as unknown as AuthRequest, res, next);
});

// ============================================
// RUTAS CRUD BÁSICAS
// ============================================

/**
 * POST /api/exercise-types
 * Crear nuevo tipo de ejercicio
 * Requiere autenticación
 */
router.post('/', exerciseTypeController.createExerciseType.bind(exerciseTypeController));

/**
 * GET /api/exercise-types
 * Obtener todos los tipos de ejercicio
 * Público
 */
router.get('/', exerciseTypeController.getAllExerciseTypes.bind(exerciseTypeController));

/**
 * GET /api/exercise-types/:id
 * Obtener tipo de ejercicio por ID
 * Público
 */
router.get('/:id', exerciseTypeController.getExerciseTypeById.bind(exerciseTypeController));

/**
 * PUT /api/exercise-types/:id
 * Actualizar tipo de ejercicio
 * Requiere autenticación
 */
router.put('/:id', exerciseTypeController.updateExerciseType.bind(exerciseTypeController));

// ============================================
// RUTAS ESPECIALES
// ============================================

/**
 * GET /api/exercise-types/popular
 * Obtener tipos de ejercicio más populares
 * Público
 */
router.get('/popular', exerciseTypeController.getPopularExerciseTypes.bind(exerciseTypeController));

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
  console.error('Error en rutas de tipos de ejercicio:', error);
  
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

export default router;
