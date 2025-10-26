// ============================================
// RUTAS DE LOGROS
// Aplicación de Aprendizaje de C#
// ============================================

import express from 'express';
import { LogrosController } from '../controllers/logros';
import { authMiddleware } from '../middleware/auth';

const router = express.Router();

// ============================================
// ENDPOINTS DE LOGROS
// ============================================

/**
 * GET /api/achievements
 * Obtener todos los logros disponibles
 * Ruta pública
 */
router.get('/', LogrosController.obtenerTodos);

/**
 * GET /api/achievements/user
 * Obtener logros del usuario autenticado
 * Query params:
 * - soloDesbloqueados (opcional): true/false (default: false)
 * Requiere autenticación
 */
router.get('/user', authMiddleware, LogrosController.obtenerLogrosUsuario);

/**
 * GET /api/achievements/available
 * Obtener logros disponibles para el usuario (no desbloqueados)
 * Requiere autenticación
 */
router.get('/available', authMiddleware, LogrosController.obtenerLogrosDisponibles);

/**
 * GET /api/achievements/recent
 * Obtener logros recientemente desbloqueados
 * Query params:
 * - limite (opcional): Número máximo de resultados (default: 10)
 * - periodoDias (opcional): Período en días (default: 7)
 * - usuarioId (opcional): ID de usuario específico
 * Ruta pública
 */
router.get('/recent', LogrosController.obtenerLogrosRecientes);

/**
 * GET /api/achievements/stats
 * Obtener estadísticas de logros
 * Query params:
 * - usuarioId (opcional): ID de usuario específico
 * Ruta pública
 */
router.get('/stats', LogrosController.obtenerEstadisticas);

/**
 * POST /api/achievements/check
 * Verificar y desbloquear logros automáticamente
 * Body:
 * - tiposLogros (opcional): Array de tipos de logros a verificar
 * Requiere autenticación
 */
router.post('/check', authMiddleware, LogrosController.verificarYDesbloquear);

/**
 * POST /api/achievements/:logroId/unlock
 * Desbloquear logro para el usuario autenticado
 * Requiere autenticación
 */
router.post('/:logroId/unlock', authMiddleware, LogrosController.desbloquearLogro);

/**
 * GET /api/achievements/:logroId/verify
 * Verificar si un logro puede ser desbloqueado
 * Requiere autenticación
 */
router.get('/:logroId/verify', authMiddleware, LogrosController.verificarDesbloqueo);

export default router;

