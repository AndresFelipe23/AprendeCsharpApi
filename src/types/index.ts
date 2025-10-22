// ============================================
// TYPES/INDEX.TS - Tipos simplificados para Vercel
// ============================================

import { Request, Response, NextFunction } from 'express';

// Extender Request para incluir user
export interface AuthRequest extends Request {
  user?: {
    usuarioId: number;
    email: string;
    nombreUsuario: string;
  };
}

// Tipos de respuesta simplificados
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  statusCode?: number;
}

// Tipos de autenticación
export interface LoginRequest {
  emailUsuario: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  nombreUsuario: string;
  password: string;
  nombreCompleto?: string;
}

export interface CambiarPasswordRequest {
  passwordActual: string;
  passwordNuevo: string;
}

export interface ActualizarPerfilRequest {
  nombreCompleto?: string;
  imagenPerfil?: string;
}

// Tipos de progreso
export interface CrearProgresoRequest {
  leccionId: number;
  porcentajeCompletado: number;
  xpGanado?: number;
}

export interface ActualizarProgresoRequest {
  porcentajeCompletado: number;
  xpGanado?: number;
}

// Tipos de respuesta de servicios
export interface VerificarTokenResponse {
  success: boolean;
  message: string;
  datosUsuario?: {
    usuarioId: number;
    email: string;
    nombreUsuario: string;
  };
}

// Función helper para crear respuestas
export const createResponse = <T>(success: boolean, message: string, data?: T, error?: string): ApiResponse<T> => {
  return {
    success,
    message,
    ...(data !== undefined && { data }),
    ...(error !== undefined && { error })
  };
};
