// ============================================
// RUTAS DE AUTENTICACIÓN SIMPLIFICADAS
// Aplicación de Aprendizaje de C#
// ============================================

import { Router } from 'express';
import { authController } from '../controllers/auth';
import { authenticateToken, optionalAuth } from '../middleware/auth';

const router = Router();

// ============================================
// Rutas públicas (no requieren autenticación)
// ============================================

// POST /auth/login - Iniciar sesión
router.post('/login', authController.login);

// POST /auth/register - Registrar usuario
router.post('/register', authController.register);

// POST /auth/verify-token - Verificar token
router.post('/verify-token', authController.verifyToken);

// POST /auth/recover-password - Recuperar contraseña
router.post('/recover-password', authController.recoverPassword);

// ============================================
// Rutas protegidas (requieren autenticación)
// ============================================

// GET /auth/profile - Obtener perfil del usuario
router.get('/profile', authenticateToken, authController.getProfile);

// POST /auth/logout - Cerrar sesión
router.post('/logout', authenticateToken, authController.logout);

// PUT /auth/change-password - Cambiar contraseña
router.put('/change-password', authenticateToken, authController.changePassword);

// PUT /auth/update-profile - Actualizar perfil
router.put('/update-profile', authenticateToken, authController.updateProfile);

export default router;