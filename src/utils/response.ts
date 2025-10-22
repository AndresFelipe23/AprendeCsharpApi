// ============================================
// UTILIDADES DE RESPUESTA
// Aplicación de Aprendizaje de C#
// ============================================

import { Response } from 'express';
import { ApiResponse, ValidationError } from '../types/auth';

// ============================================
// Respuesta Exitosa
// ============================================
export function sendSuccess<T>(res: Response, message: string, data?: T, statusCode: number = 200): void {
  const response: ApiResponse<T> = {
    success: true,
    message,
    data
  };
  
  res.status(statusCode).json(response);
}

// ============================================
// Respuesta de Error
// ============================================
export function sendError(res: Response, message: string, error?: string, statusCode: number = 400): void {
  const response: ApiResponse = {
    success: false,
    message,
    error
  };
  
  res.status(statusCode).json(response);
}

// ============================================
// Respuesta de Error de Validación
// ============================================
export function sendValidationError(res: Response, errors: ValidationError[]): void {
  const response: ApiResponse = {
    success: false,
    message: 'Errores de validación',
    error: 'VALIDATION_ERROR',
    data: { errors }
  };
  
  res.status(400).json(response);
}

// ============================================
// Respuesta de Error de Autenticación
// ============================================
export function sendAuthError(res: Response, message: string, statusCode: number = 401): void {
  const response: ApiResponse = {
    success: false,
    message,
    error: 'AUTH_ERROR'
  };
  
  res.status(statusCode).json(response);
}

// ============================================
// Respuesta de Error de Autorización
// ============================================
export function sendForbiddenError(res: Response, message: string = 'No tienes permisos para realizar esta acción'): void {
  const response: ApiResponse = {
    success: false,
    message,
    error: 'FORBIDDEN'
  };
  
  res.status(403).json(response);
}

// ============================================
// Respuesta de Error de Recurso No Encontrado
// ============================================
export function sendNotFoundError(res: Response, message: string = 'Recurso no encontrado'): void {
  const response: ApiResponse = {
    success: false,
    message,
    error: 'NOT_FOUND'
  };
  
  res.status(404).json(response);
}

// ============================================
// Respuesta de Error Interno del Servidor
// ============================================
export function sendInternalError(res: Response, message: string = 'Error interno del servidor'): void {
  const response: ApiResponse = {
    success: false,
    message,
    error: 'INTERNAL_ERROR'
  };
  
  res.status(500).json(response);
}

// ============================================
// Respuesta de Error de Base de Datos
// ============================================
export function sendDatabaseError(res: Response, message: string = 'Error en la base de datos'): void {
  const response: ApiResponse = {
    success: false,
    message,
    error: 'DATABASE_ERROR'
  };
  
  res.status(500).json(response);
}

// ============================================
// Respuesta de Error de Token Inválido
// ============================================
export function sendInvalidTokenError(res: Response, message: string = 'Token inválido o expirado'): void {
  const response: ApiResponse = {
    success: false,
    message,
    error: 'INVALID_TOKEN'
  };
  
  res.status(401).json(response);
}

// ============================================
// Respuesta de Error de Usuario No Encontrado
// ============================================
export function sendUserNotFoundError(res: Response, message: string = 'Usuario no encontrado'): void {
  const response: ApiResponse = {
    success: false,
    message,
    error: 'USER_NOT_FOUND'
  };
  
  res.status(404).json(response);
}

// ============================================
// Respuesta de Error de Credenciales Inválidas
// ============================================
export function sendInvalidCredentialsError(res: Response, message: string = 'Credenciales inválidas'): void {
  const response: ApiResponse = {
    success: false,
    message,
    error: 'INVALID_CREDENTIALS'
  };
  
  res.status(401).json(response);
}

// ============================================
// Respuesta de Error de Usuario Inactivo
// ============================================
export function sendInactiveUserError(res: Response, message: string = 'Usuario inactivo'): void {
  const response: ApiResponse = {
    success: false,
    message,
    error: 'USER_INACTIVE'
  };
  
  res.status(403).json(response);
}

// ============================================
// Respuesta de Error de Email Ya Existe
// ============================================
export function sendEmailExistsError(res: Response, message: string = 'El email ya está registrado'): void {
  const response: ApiResponse = {
    success: false,
    message,
    error: 'EMAIL_ALREADY_EXISTS'
  };
  
  res.status(409).json(response);
}

// ============================================
// Respuesta de Error de Nombre de Usuario Ya Existe
// ============================================
export function sendUsernameExistsError(res: Response, message: string = 'El nombre de usuario ya está en uso'): void {
  const response: ApiResponse = {
    success: false,
    message,
    error: 'USERNAME_ALREADY_EXISTS'
  };
  
  res.status(409).json(response);
}

// ============================================
// Respuesta de Error de Contraseña Débil
// ============================================
export function sendWeakPasswordError(res: Response, message: string = 'La contraseña no cumple con los requisitos de seguridad'): void {
  const response: ApiResponse = {
    success: false,
    message,
    error: 'WEAK_PASSWORD'
  };
  
  res.status(400).json(response);
}

// ============================================
// Respuesta de Error de Contraseña Incorrecta
// ============================================
export function sendWrongPasswordError(res: Response, message: string = 'La contraseña actual es incorrecta'): void {
  const response: ApiResponse = {
    success: false,
    message,
    error: 'WRONG_PASSWORD'
  };
  
  res.status(400).json(response);
}

// ============================================
// Respuesta de Error de Token Expirado
// ============================================
export function sendTokenExpiredError(res: Response, message: string = 'El token ha expirado'): void {
  const response: ApiResponse = {
    success: false,
    message,
    error: 'TOKEN_EXPIRED'
  };
  
  res.status(401).json(response);
}

// ============================================
// Respuesta de Error de Rate Limiting
// ============================================
export function sendRateLimitError(res: Response, message: string = 'Demasiadas solicitudes. Intenta más tarde'): void {
  const response: ApiResponse = {
    success: false,
    message,
    error: 'RATE_LIMIT_EXCEEDED'
  };
  
  res.status(429).json(response);
}

// ============================================
// Respuesta de Error de Servicio No Disponible
// ============================================
export function sendServiceUnavailableError(res: Response, message: string = 'Servicio temporalmente no disponible'): void {
  const response: ApiResponse = {
    success: false,
    message,
    error: 'SERVICE_UNAVAILABLE'
  };
  
  res.status(503).json(response);
}

// ============================================
// Función Helper para Manejar Errores de Base de Datos
// ============================================
export function handleDatabaseError(res: Response, error: any): void {
  console.error('Database error:', error);
  
  if (error.code === 'ECONNREFUSED') {
    sendDatabaseError(res, 'No se puede conectar a la base de datos');
  } else if (error.code === 'ER_DUP_ENTRY') {
    sendError(res, 'El registro ya existe', 'DUPLICATE_ENTRY', 409);
  } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    sendError(res, 'Referencia inválida', 'INVALID_REFERENCE', 400);
  } else {
    sendDatabaseError(res, 'Error en la base de datos');
  }
}

// ============================================
// Función Helper para Manejar Errores de Validación
// ============================================
export function handleValidationError(res: Response, errors: ValidationError[]): void {
  sendValidationError(res, errors);
}

// ============================================
// Función Helper para Manejar Errores de Autenticación
// ============================================
export function handleAuthError(res: Response, error: any): void {
  console.error('Auth error:', error);
  
  if (error.message?.includes('invalid token')) {
    sendInvalidTokenError(res);
  } else if (error.message?.includes('token expired')) {
    sendTokenExpiredError(res);
  } else if (error.message?.includes('user not found')) {
    sendUserNotFoundError(res);
  } else if (error.message?.includes('invalid credentials')) {
    sendInvalidCredentialsError(res);
  } else {
    sendAuthError(res, 'Error de autenticación');
  }
}
