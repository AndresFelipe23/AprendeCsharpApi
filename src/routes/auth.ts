// ============================================
// RUTAS DE AUTENTICACIÓN
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
router.post('/login', authController.login.bind(authController));

// POST /auth/register - Registrar usuario
router.post('/register', authController.register.bind(authController));

// POST /auth/verify-token - Verificar token JWT
router.post('/verify-token', authController.verifyToken.bind(authController));

// POST /auth/recover-password - Solicitar recuperación de contraseña
router.post('/recover-password', authController.recoverPassword.bind(authController));

// POST /auth/reset-password - Resetear contraseña con token
router.post('/reset-password', authController.resetPassword.bind(authController));

// GET /auth/debug/users - Debug: Ver todos los usuarios (TEMPORAL)
router.get('/debug/users', authController.debugGetAllUsers.bind(authController));

// GET /auth/debug/test-token/:userId - Debug: Generar token de prueba (TEMPORAL)
router.get('/debug/test-token/:userId', authController.debugGenerateTestToken.bind(authController));

// POST /auth/validate-email - Validar email con token
router.post('/validate-email', authController.validateEmail.bind(authController));

// ============================================
// Rutas protegidas (requieren autenticación)
// ============================================

// POST /auth/logout - Cerrar sesión
router.post('/logout', authenticateToken, authController.logout.bind(authController));

// GET /auth/profile - Obtener perfil completo del usuario
router.get('/profile', authenticateToken, authController.getProfile.bind(authController));

// PUT /auth/profile - Actualizar perfil del usuario
router.put('/profile', authenticateToken, authController.updateProfile.bind(authController));

// GET /auth/me - Obtener información básica del usuario autenticado
router.get('/me', authenticateToken, authController.getMe.bind(authController));

// POST /auth/refresh-token - Renovar token JWT
router.post('/refresh-token', authenticateToken, authController.refreshToken.bind(authController));

// POST /auth/change-password - Cambiar contraseña
router.post('/change-password', authenticateToken, authController.changePassword.bind(authController));

// ============================================
// Rutas opcionales (autenticación opcional)
// ============================================

// GET /auth/status - Verificar estado de autenticación
router.get('/status', optionalAuth, (req, res) => {
  if (req.user) {
    res.json({
      success: true,
      message: 'Usuario autenticado',
      data: {
        authenticated: true,
        usuario: req.user
      }
    });
  } else {
    res.json({
      success: true,
      message: 'Usuario no autenticado',
      data: {
        authenticated: false
      }
    });
  }
});

export default router;
