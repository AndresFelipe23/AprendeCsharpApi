// ============================================
// SERVICIO DE AUTENTICACIÓN
// Aplicación de Aprendizaje de C#
// ============================================

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { databaseService } from './database';
import {
  LoginRequest,
  LoginResponse,
  RegistroRequest,
  RegistroResponse,
  VerificarTokenRequest,
  VerificarTokenResponse,
  CambiarPasswordRequest,
  CambiarPasswordResponse,
  RecuperarPasswordRequest,
  RecuperarPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ValidarEmailRequest,
  ValidarEmailResponse,
  LogoutRequest,
  LogoutResponse,
  ObtenerPerfilResponse,
  ActualizarPerfilRequest,
  ActualizarPerfilResponse,
  Usuario,
  AuthErrorCode,
  AuthError
} from '../types/auth';

class AuthService {
  private jwtSecret: string;
  private bcryptRounds: number;

  constructor() {
    this.jwtSecret = process.env['JWT_SECRET'] || 'tu-secreto-super-seguro-aqui';
    this.bcryptRounds = parseInt(process.env['BCRYPT_ROUNDS'] || '12');
  }

  // ============================================
  // Generar hash de contraseña
  // ============================================
  async hashPassword(password: string): Promise<string> {
    try {
      return await bcrypt.hash(password, this.bcryptRounds);
    } catch (error) {
      throw this.createAuthError('Error hasheando contraseña', AuthErrorCode.DATABASE_ERROR, 500);
    }
  }

  // ============================================
  // Verificar contraseña
  // ============================================
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw this.createAuthError('Error verificando contraseña', AuthErrorCode.DATABASE_ERROR, 500);
    }
  }

  // ============================================
  // Generar token JWT
  // ============================================
  generateToken(user: Usuario): string {
    try {
      console.log('🔧 Generando token para usuario:', user);
      
      const payload = {
        usuarioId: user.UsuarioId,
        email: user.Email,
        nombreUsuario: user.NombreUsuario,
        nivelActual: user.NivelActual
      };
      
      console.log('📦 Payload del token:', payload);

      const token = jwt.sign(payload, this.jwtSecret, {
        expiresIn: '7d',
        issuer: 'aprende-csharp-api',
        audience: 'aprende-csharp-mobile'
      });
      
      console.log('🎫 Token generado:', token);
      
      // Verificar que el token se puede decodificar correctamente
      const decoded = jwt.decode(token);
      console.log('🔍 Token decodificado después de generar:', decoded);
      
      return token;
    } catch (error) {
      console.error('💥 Error generando token:', error);
      throw this.createAuthError('Error generando token', AuthErrorCode.DATABASE_ERROR, 500);
    }
  }

  // ============================================
  // Verificar token JWT (método interno)
  // ============================================
  private verifyJWTToken(token: string): any {
    try {
      return jwt.verify(token, this.jwtSecret, {
        issuer: 'aprende-csharp-api',
        audience: 'aprende-csharp-mobile'
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw this.createAuthError('Token expirado', AuthErrorCode.TOKEN_EXPIRED, 401);
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw this.createAuthError('Token inválido', AuthErrorCode.INVALID_TOKEN, 401);
      } else {
        throw this.createAuthError('Error verificando token', AuthErrorCode.INVALID_TOKEN, 401);
      }
    }
  }

  // ============================================
  // Generar token de prueba (TEMPORAL PARA DEBUG)
  // ============================================
  generateTestToken(usuarioId: number): string {
    try {
      console.log('🧪 Generando token de prueba para usuarioId:', usuarioId);
      
      const payload = {
        usuarioId: usuarioId,
        email: 'test@example.com',
        nombreUsuario: 'testuser',
        nivelActual: 1
      };
      
      console.log('📦 Payload del token de prueba:', payload);

      const token = jwt.sign(payload, this.jwtSecret, {
        expiresIn: '7d',
        issuer: 'aprende-csharp-api',
        audience: 'aprende-csharp-mobile'
      });
      
      console.log('🎫 Token de prueba generado:', token);
      
      // Verificar que el token se puede decodificar correctamente
      const decoded = jwt.decode(token);
      console.log('🔍 Token de prueba decodificado:', decoded);
      
      return token;
    } catch (error) {
      console.error('💥 Error generando token de prueba:', error);
      throw this.createAuthError('Error generando token de prueba', AuthErrorCode.DATABASE_ERROR, 500);
    }
  }

  // ============================================
  // Generar token de verificación
  // ============================================
  generateVerificationToken(usuarioId: number): string {
    const payload = {
      usuarioId,
      type: 'email_verification',
      timestamp: Date.now()
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: '24h',
      issuer: 'aprende-csharp-api'
    });
  }

  // ============================================
  // Generar token de recuperación
  // ============================================
  generateRecoveryToken(usuarioId: number): string {
    const payload = {
      usuarioId,
      type: 'password_recovery',
      timestamp: Date.now()
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: '1h',
      issuer: 'aprende-csharp-api'
    });
  }

  // ============================================
  // Login
  // ============================================
  async login(request: LoginRequest): Promise<LoginResponse> {
    try {
      console.log('🔐 Intentando login para:', request.emailUsuario);
      
      const result = await databaseService.login(request.emailUsuario, request.password);
      console.log('📊 Resultado del login:', result);
      
      if (result.recordset && result.recordset.length > 0) {
        const row = result.recordset[0];
        console.log('📋 Datos del usuario:', row);

        if (row.Resultado === 'Exito') {
          // El stored procedure devuelve un array JSON, extraer el primer elemento
          const userArray = JSON.parse(row.DatosUsuario);
          console.log('👤 Usuario parseado (array):', userArray);

          // Extraer el primer usuario del array
          const user: Usuario = Array.isArray(userArray) ? userArray[0] : userArray;
          console.log('👤 Usuario extraído:', user);

          const token = this.generateToken(user);
          console.log('🎫 Token generado para usuario ID:', user.UsuarioId);

          return {
            resultado: 'Exito',
            mensaje: row.Mensaje,
            usuarioId: row.UsuarioId,
            token,
            datosUsuario: user
          };
        } else {
          return {
            resultado: 'Error',
            mensaje: row.Mensaje
          };
        }
      } else {
        return {
          resultado: 'Error',
          mensaje: 'Error en el servidor'
        };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return {
        resultado: 'Error',
        mensaje: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // Registro
  // ============================================
  async register(request: RegistroRequest): Promise<RegistroResponse> {
    try {
      const passwordHash = await this.hashPassword(request.password);
      
      const result = await databaseService.register(
        request.email,
        request.nombreUsuario,
        passwordHash,
        request.nombreCompleto
      );
      
      if (result.recordset && result.recordset.length > 0) {
        const row = result.recordset[0];
        
        if (row.Resultado === 'Exito') {
          const tokenVerificacion = this.generateVerificationToken(row.UsuarioId);
          
          return {
            resultado: 'Exito',
            mensaje: row.Mensaje,
            usuarioId: row.UsuarioId,
            tokenVerificacion
          };
        } else {
          return {
            resultado: 'Error',
            mensaje: row.Mensaje
          };
        }
      } else {
        return {
          resultado: 'Error',
          mensaje: 'Error en el servidor'
        };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return {
        resultado: 'Error',
        mensaje: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // Verificar token
  // ============================================
  async verifyToken(request: VerificarTokenRequest): Promise<VerificarTokenResponse> {
    try {
      // Verificar que el token existe
      if (!request.token) {
        console.log('❌ Token no proporcionado');
        return {
          resultado: 'Error',
          mensaje: 'Token no proporcionado',
          usuarioId: 0
        };
      }

      // Verificar el token JWT directamente
      console.log('🔍 Decodificando token...');
      const decoded = this.verifyJWTToken(request.token);
      console.log('✅ Token decodificado exitosamente:', decoded);

      // Extraer usuarioId del token
      let usuarioId = decoded.usuarioId;

      if (!usuarioId) {
        console.log('❌ No hay usuarioId en el token decodificado');
        console.log('📦 Contenido completo del token:', JSON.stringify(decoded, null, 2));
        return {
          resultado: 'Error',
          mensaje: 'Token inválido: no contiene usuarioId',
          usuarioId: 0
        };
      }

      console.log(`🔍 Verificando usuario con ID: ${usuarioId}`);

      // Verificar si el usuario existe en la base de datos
      const userExists = await databaseService.checkUserExists(usuarioId);
      console.log(`Usuario ID ${usuarioId} existe:`, userExists);

      if (!userExists) {
        console.log(`❌ Usuario con ID ${usuarioId} no encontrado en la base de datos`);
        console.log('📋 Listando todos los usuarios disponibles:');
        await databaseService.getAllUsers();

        return {
          resultado: 'Error',
          mensaje: `Usuario con ID ${usuarioId} no encontrado en la base de datos`,
          usuarioId: 0
        };
      }

      // Obtener datos del usuario desde la base de datos usando el ID del token
      console.log(`📥 Obteniendo perfil del usuario ID: ${usuarioId}`);
      const result = await databaseService.getProfile(usuarioId);
      console.log('📊 Resultado de getProfile:', JSON.stringify(result.recordset, null, 2));

      if (result.recordset && result.recordset.length > 0) {
        const row = result.recordset[0];

        if (row.Resultado === 'Exito') {
          console.log('✅ Perfil obtenido exitosamente');

          // El stored procedure devuelve un array JSON, extraer el primer elemento
          const userArray = JSON.parse(row.DatosUsuario);
          const user: Usuario = Array.isArray(userArray) ? userArray[0] : userArray;

          console.log('👤 Datos del usuario:', {
            UsuarioId: user.UsuarioId,
            Email: user.Email,
            NombreUsuario: user.NombreUsuario,
            EstaActivo: user.EstaActivo
          });

          return {
            resultado: 'Exito',
            mensaje: 'Token válido',
            usuarioId: usuarioId,
            datosUsuario: user
          };
        } else {
          console.log('❌ Error del stored procedure:', row.Mensaje);
          return {
            resultado: 'Error',
            mensaje: row.Mensaje || 'Usuario no encontrado',
            usuarioId: 0
          };
        }
      } else {
        console.log('❌ No se recibieron resultados del stored procedure');
        return {
          resultado: 'Error',
          mensaje: 'Error al obtener datos del usuario',
          usuarioId: 0
        };
      }
    } catch (error: any) {
      console.error('💥 Error verificando token:', error);
      console.error('Stack trace:', error.stack);
      return {
        resultado: 'Error',
        mensaje: error.message || 'Token inválido o expirado',
        usuarioId: 0
      };
    }
  }

  // ============================================
  // Cambiar contraseña
  // ============================================
  async changePassword(request: CambiarPasswordRequest): Promise<CambiarPasswordResponse> {
    try {
      const passwordNuevoHash = await this.hashPassword(request.passwordNuevo);
      
      const result = await databaseService.changePassword(
        request.usuarioId,
        request.passwordActual,
        passwordNuevoHash
      );
      
      if (result.recordset && result.recordset.length > 0) {
        const row = result.recordset[0];
        
        return {
          resultado: row.Resultado,
          mensaje: row.Mensaje
        };
      } else {
        return {
          resultado: 'Error',
          mensaje: 'Error en el servidor'
        };
      }
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      return {
        resultado: 'Error',
        mensaje: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // Recuperar contraseña
  // ============================================
  async recoverPassword(request: RecuperarPasswordRequest): Promise<RecuperarPasswordResponse> {
    try {
      const result = await databaseService.recoverPassword(request.email);
      
      if (result.recordset && result.recordset.length > 0) {
        const row = result.recordset[0];
        
        return {
          resultado: row.Resultado,
          mensaje: row.Mensaje,
          tokenRecuperacion: row.TokenRecuperacion
        };
      } else {
        return {
          resultado: 'Error',
          mensaje: 'Error en el servidor'
        };
      }
    } catch (error) {
      console.error('Error recuperando contraseña:', error);
      return {
        resultado: 'Error',
        mensaje: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // Reset contraseña
  // ============================================
  async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    try {
      const passwordNuevoHash = await this.hashPassword(request.passwordNuevo);
      
      const result = await databaseService.resetPassword(
        request.tokenRecuperacion,
        passwordNuevoHash
      );
      
      if (result.recordset && result.recordset.length > 0) {
        const row = result.recordset[0];
        
        return {
          resultado: row.Resultado,
          mensaje: row.Mensaje
        };
      } else {
        return {
          resultado: 'Error',
          mensaje: 'Error en el servidor'
        };
      }
    } catch (error) {
      console.error('Error reseteando contraseña:', error);
      return {
        resultado: 'Error',
        mensaje: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // Validar email
  // ============================================
  async validateEmail(request: ValidarEmailRequest): Promise<ValidarEmailResponse> {
    try {
      const result = await databaseService.validateEmail(request.tokenVerificacion);
      
      if (result.recordset && result.recordset.length > 0) {
        const row = result.recordset[0];
        
        return {
          resultado: row.Resultado,
          mensaje: row.Mensaje
        };
      } else {
        return {
          resultado: 'Error',
          mensaje: 'Error en el servidor'
        };
      }
    } catch (error) {
      console.error('Error validando email:', error);
      return {
        resultado: 'Error',
        mensaje: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // Logout
  // ============================================
  async logout(request: LogoutRequest): Promise<LogoutResponse> {
    try {
      const result = await databaseService.logout(request.usuarioId);
      
      if (result.recordset && result.recordset.length > 0) {
        const row = result.recordset[0];
        
        return {
          resultado: row.Resultado,
          mensaje: row.Mensaje
        };
      } else {
        return {
          resultado: 'Error',
          mensaje: 'Error en el servidor'
        };
      }
    } catch (error) {
      console.error('Error en logout:', error);
      return {
        resultado: 'Error',
        mensaje: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // Obtener perfil
  // ============================================
  async getProfile(usuarioId: number): Promise<ObtenerPerfilResponse> {
    try {
      const result = await databaseService.getProfile(usuarioId);
      
      if (result.recordset && result.recordset.length > 0) {
        const row = result.recordset[0];

        if (row.Resultado === 'Exito') {
          // El stored procedure devuelve un array JSON, extraer el primer elemento
          const userArray = JSON.parse(row.DatosUsuario);
          const user: Usuario = Array.isArray(userArray) ? userArray[0] : userArray;

          const estadisticasArray = JSON.parse(row.EstadisticasUsuario);
          const estadisticas = Array.isArray(estadisticasArray) ? estadisticasArray[0] : estadisticasArray;

          return {
            resultado: 'Exito',
            mensaje: row.Mensaje,
            datosUsuario: user,
            estadisticasUsuario: estadisticas
          };
        } else {
          return {
            resultado: 'Error',
            mensaje: row.Mensaje
          };
        }
      } else {
        return {
          resultado: 'Error',
          mensaje: 'Error en el servidor'
        };
      }
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      return {
        resultado: 'Error',
        mensaje: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // Actualizar perfil
  // ============================================
  async updateProfile(request: ActualizarPerfilRequest): Promise<ActualizarPerfilResponse> {
    try {
      const result = await databaseService.updateProfile(
        request.usuarioId,
        request.nombreCompleto,
        request.imagenPerfil
      );
      
      if (result.recordset && result.recordset.length > 0) {
        const row = result.recordset[0];
        
        return {
          resultado: row.Resultado,
          mensaje: row.Mensaje
        };
      } else {
        return {
          resultado: 'Error',
          mensaje: 'Error en el servidor'
        };
      }
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return {
        resultado: 'Error',
        mensaje: 'Error interno del servidor'
      };
    }
  }

  // ============================================
  // Crear error de autenticación
  // ============================================
  private createAuthError(message: string, code: AuthErrorCode, statusCode: number): AuthError {
    const error = new Error(message) as AuthError;
    error.code = code;
    error.statusCode = statusCode;
    return error;
  }
}

// Instancia singleton
export const authService = new AuthService();
export default authService;
