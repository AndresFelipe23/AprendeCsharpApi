// ============================================
// MIDDLEWARE DE AUTENTICACIÓN
// Aplicación de Aprendizaje de C#
// ============================================

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth';
import { sendError } from '../utils/response';

// ============================================
// Middleware para verificar token JWT
// ============================================
export async function authenticateToken(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      sendError(res, 'Token de acceso requerido', 'INVALID_TOKEN', 401);
      return;
    }

    // Verificar token usando el servicio de autenticación
    const result = await authService.verifyToken({ token });
    
    if (result.resultado === 'Exito' && result.datosUsuario) {
      req.user = result.datosUsuario;
      req.userId = result.usuarioId;
      next();
    } else {
      sendError(res, result.mensaje || 'Token inválido', 'INVALID_TOKEN', 401);
    }
  } catch (error) {
    console.error('Error en middleware de autenticación:', error);
    sendError(res, 'Error verificando token de acceso', 'AUTH_ERROR', 500);
  }
}

// ============================================
// Middleware opcional de autenticación
// ============================================
export async function optionalAuth(req: any, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const result = await authService.verifyToken({ token });
      
      if (result.resultado === 'Exito' && result.datosUsuario) {
        req.user = result.datosUsuario;
        req.userId = result.usuarioId;
      }
    }
    
    next();
  } catch (error) {
    console.error('Error en middleware de autenticación opcional:', error);
    next(); // Continuar sin autenticación
  }
}

// ============================================
// Middleware CORS para aplicación móvil
// ============================================
export function mobileCORS(req: Request, res: Response, next: NextFunction): void {
  // Permitir todas las rutas de la aplicación móvil
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }

  next();
}

// ============================================
// Headers de seguridad personalizados
// ============================================
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Prevenir clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Prevenir MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Habilitar XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy básico
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  
  next();
}

// ============================================
// Logger de autenticación
// ============================================
export function authLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  const method = req.method;
  const url = req.originalUrl;
  const ip = req.ip || req.connection.remoteAddress;
  
  // Log de request
  console.log(`[${new Date().toISOString()}] ${method} ${url} - IP: ${ip}`);
  
  // Log de response
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;
    console.log(`[${new Date().toISOString()}] ${method} ${url} - ${statusCode} - ${duration}ms`);
  });
  
  next();
}

// ============================================
// Alias para compatibilidad
// ============================================
export const authMiddleware = authenticateToken;