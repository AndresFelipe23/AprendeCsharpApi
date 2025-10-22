// ============================================
// RUTAS DE PROGRESO SIMPLIFICADAS
// Aplicación de Aprendizaje de C#
// ============================================

import { Router } from 'express';
import { ProgresoUsuarioController } from '../controllers/progreso-usuario';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// ============================================
// Rutas protegidas (requieren autenticación)
// ============================================

// GET /progress - Obtener progreso del usuario
router.get('/', authenticateToken, ProgresoUsuarioController.getProgressByUser);

// GET /progress/recent - Obtener lecciones recientes
router.get('/recent', authenticateToken, ProgresoUsuarioController.getRecentLessons);

// GET /progress/stats - Obtener estadísticas del usuario
router.get('/stats', authenticateToken, ProgresoUsuarioController.getUserStats);

// GET /progress/lesson/:leccionId - Obtener progreso de una lección específica
router.get('/lesson/:leccionId', authenticateToken, ProgresoUsuarioController.getProgressByLesson);

// GET /progress/course/:cursoId/summary - Obtener resumen de curso
router.get('/course/:cursoId/summary', authenticateToken, ProgresoUsuarioController.getCourseSummary);

// POST /progress - Crear nuevo progreso
router.post('/', authenticateToken, ProgresoUsuarioController.createProgress);

// PUT /progress/:leccionId - Actualizar progreso de lección
router.put('/:leccionId', authenticateToken, ProgresoUsuarioController.updateProgress);

// POST /progress/:leccionId/complete - Marcar lección como completada
router.post('/:leccionId/complete', authenticateToken, ProgresoUsuarioController.markLessonCompleted);

export default router;