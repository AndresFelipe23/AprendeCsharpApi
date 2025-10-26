// ============================================
// RUTAS DE RACHA DIARIA
// Aplicación de Aprendizaje de C#
// ============================================

import express from 'express';
import { RachaDiariaController } from '../controllers/racha-diaria';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// ============================================
// ENDPOINTS DE RACHA DIARIA
// ============================================

/**
 * POST /api/streak
 * Registrar actividad diaria del usuario
 * Body:
 * - xpGanado (opcional): XP ganado
 * - ejerciciosCompletados (opcional): Número de ejercicios completados
 * Requiere autenticación
 */
router.post('/', authMiddleware, RachaDiariaController.registrarActividad);

/**
 * GET /api/streak
 * Obtener racha diaria del usuario autenticado
 * Query params:
 * - limite (opcional): Número máximo de resultados (default: 30)
 * - ordenDescendente (opcional): true/false (default: true)
 * Requiere autenticación
 */
router.get('/', authMiddleware, RachaDiariaController.obtenerRachaPorUsuario);

/**
 * GET /api/streak/current
 * Obtener racha actual del usuario autenticado
 * Requiere autenticación
 */
router.get('/current', authMiddleware, RachaDiariaController.obtenerRachaActual);

/**
 * GET /api/streak/stats
 * Obtener estadísticas de racha diaria del usuario autenticado
 * Query params:
 * - periodoDias (opcional): Período en días (default: 30)
 * Requiere autenticación
 */
router.get('/stats', authMiddleware, RachaDiariaController.obtenerEstadisticas);

/**
 * GET /api/streak/ranking
 * Obtener ranking de usuarios por racha
 * Query params:
 * - limite (opcional): Número máximo de resultados (default: 20)
 * - periodoDias (opcional): Período en días (default: 30)
 * Ruta pública
 */
router.get('/ranking', RachaDiariaController.obtenerRanking);

/**
 * PUT /api/streak/update
 * Actualizar racha del usuario autenticado
 * Requiere autenticación
 */
router.put('/update', authMiddleware, RachaDiariaController.actualizarRacha);

export default router;

