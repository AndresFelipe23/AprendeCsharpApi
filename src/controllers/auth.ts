// ============================================
// CONTROLADOR DE AUTENTICACIÓN
// Aplicación de Aprendizaje de C#
// ============================================

import { Request, Response } from 'express';
import { authService } from '../services/auth';
import {
  LoginRequest,
  RegistroRequest,
  VerificarTokenRequest,
  CambiarPasswordRequest,
  RecuperarPasswordRequest,
  ResetPasswordRequest,
  ValidarEmailRequest,
  LogoutRequest,
  ActualizarPerfilRequest,
  AuthRequest
} from '../types/auth';
import {
  validateLoginRequest,
  validateRegisterRequest,
  validateToken,
  validateChangePasswordRequest,
  validateResetPasswordRequest,
  validateUpdateProfileRequest
} from '../utils/validation';
import {
  sendSuccess,
  sendError,
  sendValidationError,
  sendInvalidCredentialsError,
  sendUserNotFoundError,
  sendEmailExistsError,
  sendUsernameExistsError,
  sendWeakPasswordError,
  sendWrongPasswordError,
  sendInvalidTokenError,
  handleDatabaseError,
  handleValidationError,
  handleAuthError
} from '../utils/response';

class AuthController {
  // ============================================
  // POST /auth/login
  // ============================================
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { emailUsuario, password }: LoginRequest = req.body;

      // Validar entrada
      const validation = validateLoginRequest(emailUsuario, password);
      if (!validation.isValid) {
        handleValidationError(res, validation.errors);
        return;
      }

      // Ejecutar login
      const result = await authService.login({ emailUsuario, password });

      if (result.resultado === 'Exito') {
        // Extraer el usuario del array si es necesario
        let usuarioData = result.datosUsuario;
        if (Array.isArray(usuarioData) && usuarioData.length > 0) {
          usuarioData = usuarioData[0];
        }

        sendSuccess(res, result.mensaje, {
          usuarioId: result.usuarioId,
          token: result.token,
          usuario: usuarioData
        });
      } else {
        if (result.mensaje.includes('Credenciales inválidas')) {
          sendInvalidCredentialsError(res);
        } else if (result.mensaje.includes('Usuario inactivo')) {
          sendError(res, result.mensaje, 'USER_INACTIVE', 403);
        } else {
          sendError(res, result.mensaje);
        }
      }
    } catch (error) {
      console.error('Error en login controller:', error);
      handleAuthError(res, error);
    }
  }

  // ============================================
  // POST /auth/register
  // ============================================
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, nombreUsuario, password, nombreCompleto }: RegistroRequest = req.body;

      // Validar entrada
      const validation = validateRegisterRequest(email, nombreUsuario, password, nombreCompleto);
      if (!validation.isValid) {
        handleValidationError(res, validation.errors);
        return;
      }

      // Ejecutar registro
      const result = await authService.register({ email, nombreUsuario, password, nombreCompleto });

      if (result.resultado === 'Exito') {
        // Obtener datos completos del usuario recién registrado
        const profileResult = await authService.getProfile(result.usuarioId!);

        // Extraer el usuario del array si es necesario
        let usuarioData = profileResult.datosUsuario;
        if (Array.isArray(usuarioData) && usuarioData.length > 0) {
          usuarioData = usuarioData[0];
        }

        sendSuccess(res, result.mensaje, {
          usuarioId: result.usuarioId,
          tokenVerificacion: result.tokenVerificacion,
          usuario: usuarioData || {
            UsuarioId: result.usuarioId,
            Email: email,
            NombreUsuario: nombreUsuario,
            NombreCompleto: nombreCompleto,
            NivelActual: 1,
            XPTotal: 0,
            Racha: 0,
            EstaActivo: true
          }
        }, 201);
      } else {
        if (result.mensaje.includes('email ya está registrado')) {
          sendEmailExistsError(res);
        } else if (result.mensaje.includes('nombre de usuario ya está en uso')) {
          sendUsernameExistsError(res);
        } else {
          sendError(res, result.mensaje);
        }
      }
    } catch (error) {
      console.error('Error en register controller:', error);
      handleDatabaseError(res, error);
    }
  }

  // ============================================
  // POST /auth/verify-token
  // ============================================
  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const { token }: VerificarTokenRequest = req.body;

      // Validar entrada
      const validation = validateToken(token);
      if (!validation.isValid) {
        handleValidationError(res, validation.errors);
        return;
      }

      // Ejecutar verificación
      const result = await authService.verifyToken({ token });

      if (result.resultado === 'Exito') {
        sendSuccess(res, result.mensaje, {
          usuarioId: result.usuarioId,
          usuario: result.datosUsuario
        });
      } else {
        sendInvalidTokenError(res, result.mensaje);
      }
    } catch (error) {
      console.error('Error en verifyToken controller:', error);
      handleAuthError(res, error);
    }
  }

  // ============================================
  // POST /auth/change-password
  // ============================================
  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { passwordActual, passwordNuevo }: CambiarPasswordRequest = req.body;
      const usuarioId = req.userId!;

      // Validar entrada
      const validation = validateChangePasswordRequest(passwordActual, passwordNuevo);
      if (!validation.isValid) {
        handleValidationError(res, validation.errors);
        return;
      }

      // Ejecutar cambio de contraseña
      const result = await authService.changePassword({
        usuarioId,
        passwordActual,
        passwordNuevo
      });

      if (result.resultado === 'Exito') {
        sendSuccess(res, result.mensaje);
      } else {
        if (result.mensaje.includes('contraseña actual es incorrecta')) {
          sendWrongPasswordError(res);
        } else if (result.mensaje.includes('contraseña debe tener')) {
          sendWeakPasswordError(res);
        } else {
          sendError(res, result.mensaje);
        }
      }
    } catch (error) {
      console.error('Error en changePassword controller:', error);
      handleAuthError(res, error);
    }
  }

  // ============================================
  // POST /auth/recover-password
  // ============================================
  async recoverPassword(req: Request, res: Response): Promise<void> {
    try {
      const { email }: RecuperarPasswordRequest = req.body;

      if (!email) {
        sendError(res, 'El email es requerido');
        return;
      }

      // Ejecutar recuperación
      const result = await authService.recoverPassword({ email });

      // Siempre devolver éxito por seguridad (no revelar si el email existe)
      sendSuccess(res, result.mensaje);
    } catch (error) {
      console.error('Error en recoverPassword controller:', error);
      handleDatabaseError(res, error);
    }
  }

  // ============================================
  // POST /auth/reset-password
  // ============================================
  async resetPassword(req: Request, res: Response): Promise<void> {
    try {
      const { tokenRecuperacion, passwordNuevo }: ResetPasswordRequest = req.body;

      // Validar entrada
      const validation = validateResetPasswordRequest(tokenRecuperacion, passwordNuevo);
      if (!validation.isValid) {
        handleValidationError(res, validation.errors);
        return;
      }

      // Ejecutar reset
      const result = await authService.resetPassword({ tokenRecuperacion, passwordNuevo });

      if (result.resultado === 'Exito') {
        sendSuccess(res, result.mensaje);
      } else {
        if (result.mensaje.includes('Token de recuperación inválido')) {
          sendInvalidTokenError(res, result.mensaje);
        } else if (result.mensaje.includes('contraseña debe tener')) {
          sendWeakPasswordError(res);
        } else {
          sendError(res, result.mensaje);
        }
      }
    } catch (error) {
      console.error('Error en resetPassword controller:', error);
      handleAuthError(res, error);
    }
  }

  // ============================================
  // POST /auth/validate-email
  // ============================================
  async validateEmail(req: Request, res: Response): Promise<void> {
    try {
      const { tokenVerificacion }: ValidarEmailRequest = req.body;

      // Validar entrada
      const validation = validateToken(tokenVerificacion);
      if (!validation.isValid) {
        handleValidationError(res, validation.errors);
        return;
      }

      // Ejecutar validación
      const result = await authService.validateEmail({ tokenVerificacion });

      if (result.resultado === 'Exito') {
        sendSuccess(res, result.mensaje);
      } else {
        sendInvalidTokenError(res, result.mensaje);
      }
    } catch (error) {
      console.error('Error en validateEmail controller:', error);
      handleAuthError(res, error);
    }
  }

  // ============================================
  // POST /auth/logout
  // ============================================
  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.userId!;

      // Ejecutar logout
      const result = await authService.logout({ usuarioId });

      if (result.resultado === 'Exito') {
        sendSuccess(res, result.mensaje);
      } else {
        sendError(res, result.mensaje);
      }
    } catch (error) {
      console.error('Error en logout controller:', error);
      handleDatabaseError(res, error);
    }
  }

  // ============================================
  // GET /auth/profile
  // ============================================
  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const usuarioId = req.userId!;

      // Ejecutar obtención de perfil
      const result = await authService.getProfile(usuarioId);

      if (result.resultado === 'Exito') {
        sendSuccess(res, result.mensaje, {
          usuario: result.datosUsuario,
          estadisticas: result.estadisticasUsuario
        });
      } else {
        if (result.mensaje.includes('Usuario no encontrado')) {
          sendUserNotFoundError(res);
        } else {
          sendError(res, result.mensaje);
        }
      }
    } catch (error) {
      console.error('Error en getProfile controller:', error);
      handleDatabaseError(res, error);
    }
  }

  // ============================================
  // PUT /auth/profile
  // ============================================
  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { nombreCompleto, imagenPerfil }: ActualizarPerfilRequest = req.body;
      const usuarioId = req.userId!;

      // Validar entrada
      const validation = validateUpdateProfileRequest(nombreCompleto, imagenPerfil);
      if (!validation.isValid) {
        handleValidationError(res, validation.errors);
        return;
      }

      // Ejecutar actualización
      const result = await authService.updateProfile({
        usuarioId,
        nombreCompleto,
        imagenPerfil
      });

      if (result.resultado === 'Exito') {
        sendSuccess(res, result.mensaje);
      } else {
        sendError(res, result.mensaje);
      }
    } catch (error) {
      console.error('Error en updateProfile controller:', error);
      handleDatabaseError(res, error);
    }
  }

  // ============================================
  // GET /auth/me
  // ============================================
  async getMe(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendUserNotFoundError(res);
        return;
      }

      sendSuccess(res, 'Usuario obtenido exitosamente', {
        usuario: req.user
      });
    } catch (error) {
      console.error('Error en getMe controller:', error);
      handleAuthError(res, error);
    }
  }

  // ============================================
  // POST /auth/refresh-token
  // ============================================
  async refreshToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.user) {
        sendUserNotFoundError(res);
        return;
      }

      // Generar nuevo token
      const newToken = authService.generateToken(req.user);

      sendSuccess(res, 'Token renovado exitosamente', {
        token: newToken,
        usuario: req.user
      });
    } catch (error) {
      console.error('Error en refreshToken controller:', error);
      handleAuthError(res, error);
    }
  }

  // ============================================
  // GET /auth/debug/test-token/:userId (TEMPORAL)
  // ============================================
  async debugGenerateTestToken(req: Request, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        sendError(res, 'ID de usuario inválido', 400);
        return;
      }
      
      const token = authService.generateTestToken(userId);
      
      sendSuccess(res, 'Token de prueba generado', {
        usuarioId: userId,
        token: token
      });
    } catch (error) {
      console.error('Error en debugGenerateTestToken:', error);
      sendError(res, 'Error generando token de prueba', 500);
    }
  }

  // ============================================
  // GET /auth/debug/users (TEMPORAL)
  // ============================================
  async debugGetAllUsers(req: Request, res: Response): Promise<void> {
    try {
      const { databaseService } = await import('../services/database');
      const users = await databaseService.getAllUsers();
      
      sendSuccess(res, 'Usuarios obtenidos para debugging', {
        total: users.length,
        usuarios: users
      });
    } catch (error) {
      console.error('Error en debugGetAllUsers:', error);
      sendError(res, 'Error obteniendo usuarios', 500);
    }
  }
}

// Instancia singleton
export const authController = new AuthController();
export default authController;
