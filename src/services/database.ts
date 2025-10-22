// ============================================
// SERVICIO DE BASE DE DATOS
// Aplicación de Aprendizaje de C#
// ============================================

import sql from 'mssql';
import { DatabaseConfig } from '../types/auth';

class DatabaseService {
  private pool: sql.ConnectionPool | null = null;
  private config: DatabaseConfig;

  constructor() {
    this.config = {
      server: process.env['DB_SERVER'] || 'localhost',
      database: process.env['DB_DATABASE'] || 'AprendeCsharp',
      user: process.env['DB_USER'] || 'sa',
      password: process.env['DB_PASSWORD'] || 'password',
      port: parseInt(process.env['DB_PORT'] || '1433'),
      options: {
        encrypt: process.env['DB_ENCRYPT'] === 'true',
        trustServerCertificate: process.env['DB_TRUST_CERT'] === 'true'
      }
    };
  }

  // ============================================
  // Conectar a la base de datos
  // ============================================
  async connect(): Promise<void> {
    try {
      if (!this.pool) {
        this.pool = new sql.ConnectionPool(this.config);
        await this.pool.connect();
        console.log('✅ Conectado a la base de datos SQL Server');
      }
    } catch (error) {
      console.error('❌ Error conectando a la base de datos:', error);
      throw error;
    }
  }

  // ============================================
  // Desconectar de la base de datos
  // ============================================
  async disconnect(): Promise<void> {
    try {
      if (this.pool) {
        await this.pool.close();
        this.pool = null;
        console.log('✅ Desconectado de la base de datos');
      }
    } catch (error) {
      console.error('❌ Error desconectando de la base de datos:', error);
      throw error;
    }
  }

  // ============================================
  // Obtener conexión activa
  // ============================================
  private async getConnection(): Promise<sql.ConnectionPool> {
    if (!this.pool) {
      await this.connect();
    }
    return this.pool!;
  }

  // ============================================
  // Ejecutar stored procedure
  // ============================================
  async executeProcedure(
    procedureName: string, 
    parameters: { [key: string]: any } = {}
  ): Promise<sql.IResult<any>> {
    try {
      console.log(`🔍 Ejecutando stored procedure: ${procedureName}`, parameters);
      const pool = await this.getConnection();
      const request = pool.request();

      // Agregar parámetros
      Object.entries(parameters).forEach(([key, value]) => {
        request.input(key, value);
      });

      const result = await request.execute(procedureName);
      console.log(`✅ Resultado de ${procedureName}:`, result);
      return result;
    } catch (error) {
      console.error(`❌ Error ejecutando stored procedure ${procedureName}:`, error);
      throw error;
    }
  }

  // ============================================
  // Ejecutar query SQL
  // ============================================
  async executeQuery(query: string, parameters: { [key: string]: any } = {}): Promise<sql.IResult<any>> {
    try {
      const pool = await this.getConnection();
      const request = pool.request();

      // Agregar parámetros
      Object.entries(parameters).forEach(([key, value]) => {
        request.input(key, value);
      });

      const result = await request.query(query);
      return result;
    } catch (error) {
      console.error('❌ Error ejecutando query:', error);
      throw error;
    }
  }

  // ============================================
  // Ejecutar transacción
  // ============================================
  async executeTransaction(operations: (transaction: sql.Transaction) => Promise<any>): Promise<any> {
    const pool = await this.getConnection();
    const transaction = new sql.Transaction(pool);

    try {
      await transaction.begin();
      const result = await operations(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // ============================================
  // Verificar conexión
  // ============================================
  async isConnected(): Promise<boolean> {
    try {
      if (!this.pool) return false;
      
      const request = this.pool.request();
      await request.query('SELECT 1');
      return true;
    } catch (error) {
      return false;
    }
  }

  // ============================================
  // Obtener estadísticas de la conexión
  // ============================================
  async getConnectionStats(): Promise<{
    connected: boolean;
    totalConnections: number;
    activeConnections: number;
  }> {
    try {
      const connected = await this.isConnected();
      
      return {
        connected,
        totalConnections: 0, // mssql no expone estas propiedades directamente
        activeConnections: 0
      };
    } catch (error) {
      return {
        connected: false,
        totalConnections: 0,
        activeConnections: 0
      };
    }
  }

  // ============================================
  // Métodos específicos para autenticación
  // ============================================

  // Login
  async login(emailUsuario: string, password: string) {
    return this.executeProcedure('SP_Auth_Login', {
      EmailUsuario: emailUsuario,
      Password: password
    });
  }

  // Registro
  async register(email: string, username: string, passwordHash: string, fullName?: string) {
    return this.executeProcedure('SP_Auth_Registrar', {
      Email: email,
      NombreUsuario: username,
      ContrasenaHash: passwordHash,
      NombreCompleto: fullName
    });
  }

  // Verificar token
  async verifyToken(token: string) {
    return this.executeProcedure('SP_Auth_VerificarToken', {
      Token: token
    });
  }

  // Cambiar contraseña
  async changePassword(usuarioId: number, passwordActual: string, passwordNuevo: string) {
    return this.executeProcedure('SP_Auth_CambiarPassword', {
      UsuarioId: usuarioId,
      PasswordActual: passwordActual,
      PasswordNuevo: passwordNuevo
    });
  }

  // Recuperar contraseña
  async recoverPassword(email: string) {
    return this.executeProcedure('SP_Auth_RecuperarPassword', {
      Email: email
    });
  }

  // Reset contraseña
  async resetPassword(tokenRecuperacion: string, passwordNuevo: string) {
    return this.executeProcedure('SP_Auth_ResetPassword', {
      TokenRecuperacion: tokenRecuperacion,
      PasswordNuevo: passwordNuevo
    });
  }

  // Validar email
  async validateEmail(tokenVerificacion: string) {
    return this.executeProcedure('SP_Auth_ValidarEmail', {
      TokenVerificacion: tokenVerificacion
    });
  }

  // Logout
  async logout(usuarioId: number) {
    return this.executeProcedure('SP_Auth_Logout', {
      UsuarioId: usuarioId
    });
  }

  // Obtener todos los usuarios (para debugging)
  async getAllUsers(): Promise<any[]> {
    try {
      const result = await this.executeQuery('SELECT UsuarioId, Email, NombreUsuario, EstaActivo FROM Usuarios');
      console.log('👥 Todos los usuarios en la BD:', result.recordset);
      return result.recordset;
    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      return [];
    }
  }

  // Verificar si un usuario existe
  async checkUserExists(usuarioId: number): Promise<boolean> {
    try {
      const result = await this.executeQuery(
        'SELECT COUNT(*) as count FROM Usuarios WHERE UsuarioId = @usuarioId',
        { usuarioId }
      );
      
      return result.recordset[0].count > 0;
    } catch (error) {
      console.error('Error verificando existencia de usuario:', error);
      return false;
    }
  }

  // Obtener perfil
  async getProfile(usuarioId: number) {
    return this.executeProcedure('SP_Auth_ObtenerPerfil', {
      UsuarioId: usuarioId
    });
  }

  // Actualizar perfil
  async updateProfile(usuarioId: number, nombreCompleto?: string, imagenPerfil?: string) {
    return this.executeProcedure('SP_Auth_ActualizarPerfil', {
      UsuarioId: usuarioId,
      NombreCompleto: nombreCompleto,
      ImagenPerfil: imagenPerfil
    });
  }
}

// Instancia singleton
export const databaseService = new DatabaseService();
export default databaseService;
