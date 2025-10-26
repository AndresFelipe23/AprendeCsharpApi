// ============================================
// MIDDLEWARE DE AUTENTICACIÓN
// Aplicación de Aprendizaje de C#
// ============================================

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth';
import { AuthRequest, Usuario } from '../types/auth';
import { sendInvalidTokenError, sendAuthError } from '../utils/response';

// ============================================
// Middleware para verificar token JWT
// ============================================
export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    console.log('🔍 Headers completos recibidos:', req.headers);
    const authHeader = req.headers['authorization'];
    console.log('🔍 Auth header recibido:', authHeader);
    
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    console.log('🔑 Token extraído:', token ? `${token.substring(0, 20)}...` : 'NO');

    if (!token) {
      console.log('❌ No se encontró token');
      sendInvalidTokenError(res, 'Token de acceso requerido');
      return;
    }

    // Verificar token usando el servicio de autenticación
    console.log('🔍 Verificando token con authService...');
    const result = await authService.verifyToken({ token });
    console.log('📊 Resultado de verificación:', result.resultado);
    
    if (result.resultado === 'Exito' && result.datosUsuario) {
      req.user = result.datosUsuario;
      req.userId = result.usuarioId;
      console.log('✅ Token válido, usuario:', result.datosUsuario.NombreUsuario);
      next();
    } else {
      console.log('❌ Token inválido:', result.mensaje);
      sendInvalidTokenError(res, result.mensaje);
    }
  } catch (error) {
    console.error('💥 Error en middleware de autenticación:', error);
    sendAuthError(res, 'Error verificando token de acceso');
  }
}

// ============================================
// Middleware opcional de autenticación
// ============================================
export async function optionalAuth(req: AuthRequest, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers['authorization'];
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
    // En middleware opcional, continuamos sin autenticación
    next();
  }
}

// ============================================
// Middleware para verificar usuario activo
// ============================================
export function requireActiveUser(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    sendAuthError(res, 'Usuario no autenticado');
    return;
  }

  if (!req.user.EstaActivo) {
    sendAuthError(res, 'Usuario inactivo', 403);
    return;
  }

  next();
}

// ============================================
// Middleware para verificar nivel mínimo
// ============================================
export function requireMinimumLevel(minLevel: number) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendAuthError(res, 'Usuario no autenticado');
      return;
    }

    if (req.user.NivelActual < minLevel) {
      sendAuthError(res, `Se requiere nivel mínimo ${minLevel}`, 403);
      return;
    }

    next();
  };
}

// ============================================
// Middleware para verificar XP mínimo
// ============================================
export function requireMinimumXP(minXP: number) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendAuthError(res, 'Usuario no autenticado');
      return;
    }

    if (req.user.XPTotal < minXP) {
      sendAuthError(res, `Se requiere mínimo ${minXP} XP`, 403);
      return;
    }

    next();
  };
}

// ============================================
// Middleware para verificar propiedad del recurso
// ============================================
export function requireResourceOwnership(resourceUserIdParam: string = 'usuarioId') {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      sendAuthError(res, 'Usuario no autenticado');
      return;
    }

    const resourceUserId = parseInt(req.params[resourceUserIdParam] || '0');
    
    if (req.user.UsuarioId !== resourceUserId) {
      sendAuthError(res, 'No tienes permisos para acceder a este recurso', 403);
      return;
    }

    next();
  };
}

// ============================================
// Middleware para logging de autenticación
// ============================================
export function authLogger(req: AuthRequest, res: Response, next: NextFunction): void {
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    const userId = req.userId || 'anonymous';
    const method = req.method;
    const url = req.originalUrl;
    const statusCode = res.statusCode;
    
    console.log(`[AUTH] ${method} ${url} - User: ${userId} - Status: ${statusCode} - Duration: ${duration}ms`);
  });
  
  next();
}

// ============================================
// Middleware para rate limiting por usuario
// ============================================
const userRequestCounts = new Map<number, { count: number; resetTime: number }>();

export function userRateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userId) {
      next();
      return;
    }

    const now = Date.now();
    const userLimit = userRequestCounts.get(req.userId);

    if (!userLimit || now > userLimit.resetTime) {
      // Reset window
      userRequestCounts.set(req.userId, {
        count: 1,
        resetTime: now + windowMs
      });
      next();
      return;
    }

    if (userLimit.count >= maxRequests) {
      res.status(429).json({
        success: false,
        message: 'Demasiadas solicitudes. Intenta más tarde.',
        error: 'RATE_LIMIT_EXCEEDED'
      });
      return;
    }

    userLimit.count++;
    next();
  };
}

// ============================================
// Middleware para verificar headers de seguridad
// ============================================
export function securityHeaders(_req: Request, res: Response, next: NextFunction): void {
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
// Middleware para CORS específico para móvil
// ============================================
export function mobileCORS(req: Request, res: Response, next: NextFunction): void {
  const origin = req.headers.origin;
  const isDevelopment = process.env['NODE_ENV'] !== 'production';

  if (isDevelopment) {
    // En desarrollo, permitir todos los orígenes
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    // En producción, permitir solo orígenes específicos
    const allowedOrigins = [
      'https://tu-dominio.com', // Producción
      // Agregar más dominios según sea necesario
    ];

    if (origin && allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas

  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
}

// ============================================
// Middleware para compresión de respuestas
// ============================================
export function compressionMiddleware(req: Request, res: Response, next: NextFunction): void {
  const acceptEncoding = req.headers['accept-encoding'];
  
  if (acceptEncoding && acceptEncoding.includes('gzip')) {
    res.setHeader('Content-Encoding', 'gzip');
  }
  
  next();
}

// ============================================
// Middleware para manejo de errores de autenticación
// ============================================
export function authErrorHandler(error: any, _req: Request, res: Response, next: NextFunction): void {
  if (error.name === 'JsonWebTokenError') {
    sendInvalidTokenError(res, 'Token inválido');
  } else if (error.name === 'TokenExpiredError') {
    sendAuthError(res, 'Token expirado', 401);
  } else if (error.name === 'NotBeforeError') {
    sendAuthError(res, 'Token no válido aún', 401);
  } else {
    next(error);
  }
}

// ============================================
// Función helper para extraer usuario del token
// ============================================
export async function extractUserFromToken(token: string): Promise<Usuario | null> {
  try {
    const result = await authService.verifyToken({ token });
    return result.datosUsuario || null;
  } catch (error) {
    return null;
  }
}

// ============================================
// Función helper para verificar si el usuario es admin
// ============================================
export function isAdmin(user: Usuario): boolean {
  // Implementar lógica para determinar si es admin
  // Por ejemplo, basado en nivel o campo específico
  return user.NivelActual >= 10; // Ejemplo
}

// ============================================
// Middleware para verificar admin
// ============================================
export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    sendAuthError(res, 'Usuario no autenticado');
    return;
  }

  if (!isAdmin(req.user)) {
    sendAuthError(res, 'Se requieren permisos de administrador', 403);
    return;
  }

  next();
}

// ============================================
// Alias para compatibilidad
// ============================================
export const authMiddleware = authenticateToken;