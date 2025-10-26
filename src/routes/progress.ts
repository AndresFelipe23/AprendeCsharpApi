// ============================================
// RUTAS DE PROGRESO DE USUARIOS
// Aplicación de Aprendizaje de C#
// ============================================

import express from 'express';
import { ProgresoUsuarioController } from '../controllers/progreso-usuario';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// ============================================
// ENDPOINTS DE PROGRESO DE USUARIOS
// ============================================

/**
 * POST /api/progress
 * Crear nuevo progreso de usuario en una lección
 * Requiere autenticación
 */
router.post('/', authMiddleware, ProgresoUsuarioController.crearProgreso);

/**
 * GET /api/progress
 * Obtener progreso del usuario autenticado
 * Query params:
 * - cursoId (opcional): Filtrar por curso específico
 * - soloCompletadas (opcional): true/false para filtrar solo lecciones completadas
 * Requiere autenticación
 */
router.get('/', authMiddleware, ProgresoUsuarioController.obtenerProgreso);

/**
 * GET /api/progress/lesson/:leccionId
 * Obtener progreso de todos los usuarios en una lección específica
 * Query params:
 * - soloCompletadas (opcional): true/false para filtrar solo lecciones completadas
 * - limite (opcional): número máximo de resultados (default: 50)
 */
router.get('/lesson/:leccionId', ProgresoUsuarioController.obtenerProgresoPorLeccion);

/**
 * PUT /api/progress/:leccionId
 * Actualizar progreso de usuario en una lección específica
 * Body:
 * - porcentajeCompletado (requerido): número entre 0 y 100
 * - xpGanado (opcional): XP ganado en esta actualización
 * Requiere autenticación
 */
router.put('/:leccionId', authMiddleware, ProgresoUsuarioController.actualizarProgreso);

/**
 * POST /api/progress/:leccionId/complete
 * Marcar lección como completada por el usuario
 * Body:
 * - xpGanado (opcional): XP específico a otorgar (si no se especifica, usa el de la lección)
 * Requiere autenticación
 */
router.post('/:leccionId/complete', authMiddleware, ProgresoUsuarioController.marcarCompletada);

/**
 * GET /api/progress/stats
 * Obtener estadísticas de progreso del usuario
 * Requiere autenticación
 */
router.get('/stats', authMiddleware, ProgresoUsuarioController.obtenerEstadisticas);

/**
 * GET /api/progress/courses
 * Obtener resumen de progreso por curso
 * Query params:
 * - cursoId (opcional): Filtrar por curso específico
 * Requiere autenticación
 */
router.get('/courses', authMiddleware, ProgresoUsuarioController.obtenerResumenCursos);

/**
 * GET /api/progress/general
 * Obtener progreso general del usuario (información completa)
 * Requiere autenticación
 */
router.get('/general', authMiddleware, ProgresoUsuarioController.obtenerProgresoGeneral);

/**
 * GET /api/progress/recent
 * Obtener lecciones recientes del usuario
 * Query params:
 * - limite (opcional): número máximo de resultados (default: 10, max: 50)
 * Requiere autenticación
 */
router.get('/recent', authMiddleware, ProgresoUsuarioController.obtenerLeccionesRecientes);

export default router;
