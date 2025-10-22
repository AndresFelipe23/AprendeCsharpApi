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

