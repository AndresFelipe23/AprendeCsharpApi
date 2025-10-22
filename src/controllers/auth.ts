// ============================================
// CONTROLADOR DE AUTENTICACIÓN SIMPLIFICADO
// Aplicación de Aprendizaje de C#
// ============================================

import { Request, Response } from 'express';
import { authService } from '../services/auth';
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

// ============================================
// Login de usuario
// ============================================
export async function login(req: any, res: Response): Promise<void> {
  try {
    const { emailUsuario, password } = req.body;

    if (!emailUsuario || !password) {
      sendError(res, 'Email y contraseña son requeridos', 'MISSING_CREDENTIALS', 400);
      return;
    }

    const result = await authService.login({ emailUsuario, password });

    if (result.resultado === 'Exito') {
      sendSuccess(res, 'Login exitoso', result.datosUsuario);
    } else {
      sendInvalidCredentialsError(res, result.mensaje);
    }
  } catch (error) {
    handleAuthError(res, error);
  }
}

// ============================================
// Registro de usuario
// ============================================
export async function register(req: any, res: Response): Promise<void> {
  try {
    const { email, nombreUsuario, password, nombreCompleto } = req.body;

    if (!email || !nombreUsuario || !password) {
      sendError(res, 'Email, nombre de usuario y contraseña son requeridos', 'MISSING_FIELDS', 400);
      return;
    }

    const result = await authService.register({
      email,
      nombreUsuario,
      password,
      nombreCompleto: nombreCompleto || ''
    });

    if (result.resultado === 'Exito') {
      sendSuccess(res, 'Usuario registrado exitosamente', result.datosUsuario);
    } else {
      if (result.mensaje.includes('email')) {
        sendEmailExistsError(res, result.mensaje);
      } else if (result.mensaje.includes('usuario')) {
        sendUsernameExistsError(res, result.mensaje);
      } else {
        sendError(res, result.mensaje, 'REGISTRATION_ERROR', 400);
      }
    }
  } catch (error) {
    handleAuthError(res, error);
  }
}

// ============================================
// Verificar token
// ============================================
export async function verifyToken(req: any, res: Response): Promise<void> {
  try {
    const { token } = req.body;

    if (!token) {
      sendError(res, 'Token es requerido', 'MISSING_TOKEN', 400);
      return;
    }

    const result = await authService.verifyToken({ token });

    if (result.resultado === 'Exito') {
      sendSuccess(res, 'Token válido', result.datosUsuario);
    } else {
      sendInvalidTokenError(res, result.mensaje);
    }
  } catch (error) {
    handleAuthError(res, error);
  }
}

// ============================================
// Obtener perfil de usuario
// ============================================
export async function getProfile(req: any, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Usuario no autenticado', 'UNAUTHORIZED', 401);
      return;
    }

    const result = await authService.getProfile(req.user.usuarioId);

    if (result.resultado === 'Exito') {
      sendSuccess(res, 'Perfil obtenido exitosamente', result.datosUsuario);
    } else {
      sendUserNotFoundError(res, result.mensaje);
    }
  } catch (error) {
    handleAuthError(res, error);
  }
}

// ============================================
// Logout
// ============================================
export async function logout(req: any, res: Response): Promise<void> {
  try {
    // En una implementación real, podrías invalidar el token
    sendSuccess(res, 'Logout exitoso');
  } catch (error) {
    handleAuthError(res, error);
  }
}

// ============================================
// Cambiar contraseña
// ============================================
export async function changePassword(req: any, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Usuario no autenticado', 'UNAUTHORIZED', 401);
      return;
    }

    const { passwordActual, passwordNuevo } = req.body;

    if (!passwordActual || !passwordNuevo) {
      sendError(res, 'Contraseña actual y nueva son requeridas', 'MISSING_PASSWORDS', 400);
      return;
    }

    const result = await authService.changePassword({
      usuarioId: req.user.usuarioId,
      passwordActual,
      passwordNuevo
    });

    if (result.resultado === 'Exito') {
      sendSuccess(res, 'Contraseña cambiada exitosamente');
    } else {
      if (result.mensaje.includes('incorrecta')) {
        sendWrongPasswordError(res, result.mensaje);
      } else {
        sendError(res, result.mensaje, 'PASSWORD_CHANGE_ERROR', 400);
      }
    }
  } catch (error) {
    handleAuthError(res, error);
  }
}

// ============================================
// Actualizar perfil
// ============================================
export async function updateProfile(req: any, res: Response): Promise<void> {
  try {
    if (!req.user) {
      sendError(res, 'Usuario no autenticado', 'UNAUTHORIZED', 401);
      return;
    }

    const { nombreCompleto, imagenPerfil } = req.body;

    const result = await authService.updateProfile({
      usuarioId: req.user.usuarioId,
      nombreCompleto: nombreCompleto || '',
      imagenPerfil: imagenPerfil || ''
    });

    if (result.resultado === 'Exito') {
      sendSuccess(res, 'Perfil actualizado exitosamente', result.datosUsuario);
    } else {
      sendError(res, result.mensaje, 'PROFILE_UPDATE_ERROR', 400);
    }
  } catch (error) {
    handleAuthError(res, error);
  }
}

// ============================================
// Recuperar contraseña
// ============================================
export async function recoverPassword(req: any, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    if (!email) {
      sendError(res, 'Email es requerido', 'MISSING_EMAIL', 400);
      return;
    }

    const result = await authService.recoverPassword({ email });

    if (result.resultado === 'Exito') {
      sendSuccess(res, 'Email de recuperación enviado');
    } else {
      sendError(res, result.mensaje, 'RECOVERY_ERROR', 400);
    }
  } catch (error) {
    handleAuthError(res, error);
  }
}