// ============================================
// TIPOS PARA AUTENTICACIÓN
// Aplicación de Aprendizaje de C#
// ============================================

// ============================================
// Tipos de Usuario
// ============================================
export interface Usuario {
  UsuarioId: number;
  Email: string;
  NombreUsuario: string;
  NombreCompleto?: string;
  ImagenPerfil?: string;
  NivelActual: number;
  XPTotal: number;
  Racha: number;
  UltimaFechaActivo?: string;
  FechaCreacion: string;
  EstaActivo: boolean;
}

// ============================================
// Tipos para Login
// ============================================
export interface LoginRequest {
  emailUsuario: string; // Puede ser email o nombre de usuario
  password: string;
}

export interface LoginResponse {
  resultado: 'Exito' | 'Error';
  mensaje: string;
  usuarioId?: number;
  token?: string;
  datosUsuario?: Usuario;
}

// ============================================
// Tipos para Registro
// ============================================
export interface RegistroRequest {
  email: string;
  nombreUsuario: string;
  password: string;
  nombreCompleto?: string;
}

export interface RegistroResponse {
  resultado: 'Exito' | 'Error';
  mensaje: string;
  usuarioId?: number;
  tokenVerificacion?: string;
}

// ============================================
// Tipos para Verificación de Token
// ============================================
export interface VerificarTokenRequest {
  token: string;
}

export interface VerificarTokenResponse {
  resultado: 'Exito' | 'Error';
  mensaje: string;
  usuarioId?: number;
  datosUsuario?: Usuario;
}

// ============================================
// Tipos para Cambio de Contraseña
// ============================================
export interface CambiarPasswordRequest {
  usuarioId: number;
  passwordActual: string;
  passwordNuevo: string;
}

export interface CambiarPasswordResponse {
  resultado: 'Exito' | 'Error';
  mensaje: string;
}

// ============================================
// Tipos para Recuperación de Contraseña
// ============================================
export interface RecuperarPasswordRequest {
  email: string;
}

export interface RecuperarPasswordResponse {
  resultado: 'Exito' | 'Error';
  mensaje: string;
  tokenRecuperacion?: string;
}

export interface ResetPasswordRequest {
  tokenRecuperacion: string;
  passwordNuevo: string;
}

export interface ResetPasswordResponse {
  resultado: 'Exito' | 'Error';
  mensaje: string;
}

// ============================================
// Tipos para Validación de Email
// ============================================
export interface ValidarEmailRequest {
  tokenVerificacion: string;
}

export interface ValidarEmailResponse {
  resultado: 'Exito' | 'Error';
  mensaje: string;
}

// ============================================
// Tipos para Logout
// ============================================
export interface LogoutRequest {
  usuarioId: number;
}

export interface LogoutResponse {
  resultado: 'Exito' | 'Error';
  mensaje: string;
}

// ============================================
// Tipos para Perfil de Usuario
// ============================================
export interface EstadisticasUsuario {
  totalLeccionesCompletadas: number;
  xpTotalGanado: number;
  totalEjerciciosIntentados: number;
  totalEjerciciosCorrectos: number;
  totalLogrosDesbloqueados: number;
  totalFavoritos: number;
  totalNotas: number;
  rachaMaximaXP: number;
  rachaPromedioXP: number;
  rankingSemanal?: number;
  rankingMensual?: number;
}

export interface ObtenerPerfilResponse {
  resultado: 'Exito' | 'Error';
  mensaje: string;
  datosUsuario?: Usuario;
  estadisticasUsuario?: EstadisticasUsuario;
}

export interface ActualizarPerfilRequest {
  usuarioId: number;
  nombreCompleto?: string;
  imagenPerfil?: string;
}

export interface ActualizarPerfilResponse {
  resultado: 'Exito' | 'Error';
  mensaje: string;
}

// ============================================
// Tipos de Respuesta Genérica
// ============================================
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// ============================================
// Tipos para Middleware de Autenticación
// ============================================
export interface AuthRequest extends Request {
  user?: Usuario;
  userId?: number;
}

// ============================================
// Tipos para Validación
// ============================================
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// ============================================
// Tipos para Configuración
// ============================================
export interface DatabaseConfig {
  server: string;
  database: string;
  user: string;
  password: string;
  port: number;
  options: {
    encrypt: boolean;
    trustServerCertificate: boolean;
  };
}

export interface AuthConfig {
  jwtSecret: string;
  jwtExpiresIn: string;
  bcryptRounds: number;
}

// ============================================
// Tipos para Errores
// ============================================
export enum AuthErrorCode {
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  USER_NOT_FOUND = 'USER_NOT_FOUND',
  USER_INACTIVE = 'USER_INACTIVE',
  EMAIL_ALREADY_EXISTS = 'EMAIL_ALREADY_EXISTS',
  USERNAME_ALREADY_EXISTS = 'USERNAME_ALREADY_EXISTS',
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  WEAK_PASSWORD = 'WEAK_PASSWORD',
  INVALID_EMAIL = 'INVALID_EMAIL',
  INVALID_USERNAME = 'INVALID_USERNAME',
  DATABASE_ERROR = 'DATABASE_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR'
}

export interface AuthError extends Error {
  code: AuthErrorCode;
  statusCode: number;
}
