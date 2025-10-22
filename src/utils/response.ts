// ============================================
// UTILIDADES DE RESPUESTA
// Aplicación de Aprendizaje de C#
// ============================================

import { Response } from 'express';
import { ApiResponse } from '../types/index';

// ============================================
// Respuesta Exitosa
// ============================================
export function sendSuccess<T>(res: Response, message: string, data?: T, statusCode: number = 200): void {
  const response: ApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data })
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
    ...(error !== undefined && { error })
  };
  
  res.status(statusCode).json(response);
}

// ============================================
// Funciones de error específicas
// ============================================
export function sendValidationError(res: Response, errors: any[]): void {
  sendError(res, 'Errores de validación', 'VALIDATION_ERROR', 400);
}

export function sendInvalidCredentialsError(res: Response, message: string = 'Credenciales inválidas'): void {
  sendError(res, message, 'INVALID_CREDENTIALS', 401);
}

export function sendUserNotFoundError(res: Response, message: string = 'Usuario no encontrado'): void {
  sendError(res, message, 'USER_NOT_FOUND', 404);
}

export function sendEmailExistsError(res: Response, message: string = 'El email ya está registrado'): void {
  sendError(res, message, 'EMAIL_ALREADY_EXISTS', 409);
}

export function sendUsernameExistsError(res: Response, message: string = 'El nombre de usuario ya está en uso'): void {
  sendError(res, message, 'USERNAME_ALREADY_EXISTS', 409);
}

export function sendWeakPasswordError(res: Response, message: string = 'La contraseña no cumple con los requisitos'): void {
  sendError(res, message, 'WEAK_PASSWORD', 400);
}

export function sendWrongPasswordError(res: Response, message: string = 'La contraseña actual es incorrecta'): void {
  sendError(res, message, 'WRONG_PASSWORD', 400);
}

export function sendInvalidTokenError(res: Response, message: string = 'Token inválido o expirado'): void {
  sendError(res, message, 'INVALID_TOKEN', 401);
}

// ============================================
// Funciones helper
// ============================================
export function handleDatabaseError(res: Response, error: any): void {
  console.error('Database error:', error);
  sendError(res, 'Error en la base de datos', 'DATABASE_ERROR', 500);
}

export function handleValidationError(res: Response, errors: any[]): void {
  sendValidationError(res, errors);
}

export function handleAuthError(res: Response, error: any): void {
  console.error('Auth error:', error);
  sendError(res, 'Error de autenticación', 'AUTH_ERROR', 500);
}

