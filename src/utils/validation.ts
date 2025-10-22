// ============================================
// UTILIDADES DE VALIDACIÓN
// Aplicación de Aprendizaje de C#
// ============================================

import { ValidationResult, ValidationError } from '../types/auth';

// ============================================
// Validación de Email
// ============================================
export function validateEmail(email: string): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (!email) {
    errors.push({ field: 'email', message: 'El email es requerido' });
    return { isValid: false, errors };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errors.push({ field: 'email', message: 'El formato del email no es válido' });
  }
  
  if (email.length > 255) {
    errors.push({ field: 'email', message: 'El email no puede tener más de 255 caracteres' });
  }
  
  return { isValid: errors.length === 0, errors };
}

// ============================================
// Validación de Nombre de Usuario
// ============================================
export function validateUsername(username: string): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (!username) {
    errors.push({ field: 'nombreUsuario', message: 'El nombre de usuario es requerido' });
    return { isValid: false, errors };
  }
  
  if (username.length < 3) {
    errors.push({ field: 'nombreUsuario', message: 'El nombre de usuario debe tener al menos 3 caracteres' });
  }
  
  if (username.length > 100) {
    errors.push({ field: 'nombreUsuario', message: 'El nombre de usuario no puede tener más de 100 caracteres' });
  }
  
  const usernameRegex = /^[a-zA-Z0-9_]+$/;
  if (!usernameRegex.test(username)) {
    errors.push({ field: 'nombreUsuario', message: 'El nombre de usuario solo puede contener letras, números y guiones bajos' });
  }
  
  return { isValid: errors.length === 0, errors };
}

// ============================================
// Validación de Contraseña
// ============================================
export function validatePassword(password: string): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (!password) {
    errors.push({ field: 'password', message: 'La contraseña es requerida' });
    return { isValid: false, errors };
  }
  
  if (password.length < 6) {
    errors.push({ field: 'password', message: 'La contraseña debe tener al menos 6 caracteres' });
  }
  
  if (password.length > 128) {
    errors.push({ field: 'password', message: 'La contraseña no puede tener más de 128 caracteres' });
  }
  
  // Verificar que tenga al menos una letra y un número
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  
  if (!hasLetter) {
    errors.push({ field: 'password', message: 'La contraseña debe contener al menos una letra' });
  }
  
  if (!hasNumber) {
    errors.push({ field: 'password', message: 'La contraseña debe contener al menos un número' });
  }
  
  return { isValid: errors.length === 0, errors };
}

// ============================================
// Validación de Nombre Completo
// ============================================
export function validateFullName(fullName?: string): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (fullName && fullName.length > 200) {
    errors.push({ field: 'nombreCompleto', message: 'El nombre completo no puede tener más de 200 caracteres' });
  }
  
  return { isValid: errors.length === 0, errors };
}

// ============================================
// Validación de Token
// ============================================
export function validateToken(token: string): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (!token) {
    errors.push({ field: 'token', message: 'El token es requerido' });
    return { isValid: false, errors };
  }
  
  if (token.length < 10) {
    errors.push({ field: 'token', message: 'El token no es válido' });
  }
  
  return { isValid: errors.length === 0, errors };
}

// ============================================
// Validación de Login
// ============================================
export function validateLoginRequest(emailUsuario: string, password: string): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (!emailUsuario) {
    errors.push({ field: 'emailUsuario', message: 'El email o nombre de usuario es requerido' });
  }
  
  if (!password) {
    errors.push({ field: 'password', message: 'La contraseña es requerida' });
  }
  
  return { isValid: errors.length === 0, errors };
}

// ============================================
// Validación de Registro
// ============================================
export function validateRegisterRequest(email: string, username: string, password: string, fullName?: string): ValidationResult {
  const errors: ValidationError[] = [];
  
  // Validar email
  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    errors.push(...emailValidation.errors);
  }
  
  // Validar nombre de usuario
  const usernameValidation = validateUsername(username);
  if (!usernameValidation.isValid) {
    errors.push(...usernameValidation.errors);
  }
  
  // Validar contraseña
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors);
  }
  
  // Validar nombre completo (opcional)
  const fullNameValidation = validateFullName(fullName);
  if (!fullNameValidation.isValid) {
    errors.push(...fullNameValidation.errors);
  }
  
  return { isValid: errors.length === 0, errors };
}

// ============================================
// Validación de Cambio de Contraseña
// ============================================
export function validateChangePasswordRequest(passwordActual: string, passwordNuevo: string): ValidationResult {
  const errors: ValidationError[] = [];
  
  if (!passwordActual) {
    errors.push({ field: 'passwordActual', message: 'La contraseña actual es requerida' });
  }
  
  const passwordValidation = validatePassword(passwordNuevo);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors.map(error => ({
      ...error,
      field: 'passwordNuevo'
    })));
  }
  
  if (passwordActual === passwordNuevo) {
    errors.push({ field: 'passwordNuevo', message: 'La nueva contraseña debe ser diferente a la actual' });
  }
  
  return { isValid: errors.length === 0, errors };
}

// ============================================
// Validación de Reset de Contraseña
// ============================================
export function validateResetPasswordRequest(token: string, passwordNuevo: string): ValidationResult {
  const errors: ValidationError[] = [];
  
  const tokenValidation = validateToken(token);
  if (!tokenValidation.isValid) {
    errors.push(...tokenValidation.errors.map(error => ({
      ...error,
      field: 'tokenRecuperacion'
    })));
  }
  
  const passwordValidation = validatePassword(passwordNuevo);
  if (!passwordValidation.isValid) {
    errors.push(...passwordValidation.errors.map(error => ({
      ...error,
      field: 'passwordNuevo'
    })));
  }
  
  return { isValid: errors.length === 0, errors };
}

// ============================================
// Validación de Actualización de Perfil
// ============================================
export function validateUpdateProfileRequest(nombreCompleto?: string, imagenPerfil?: string): ValidationResult {
  const errors: ValidationError[] = [];
  
  const fullNameValidation = validateFullName(nombreCompleto);
  if (!fullNameValidation.isValid) {
    errors.push(...fullNameValidation.errors);
  }
  
  if (imagenPerfil && imagenPerfil.length > 500) {
    errors.push({ field: 'imagenPerfil', message: 'La URL de la imagen no puede tener más de 500 caracteres' });
  }
  
  return { isValid: errors.length === 0, errors };
}

// ============================================
// Función Helper para Combinar Validaciones
// ============================================
export function combineValidationResults(...results: ValidationResult[]): ValidationResult {
  const allErrors: ValidationError[] = [];
  
  for (const result of results) {
    allErrors.push(...result.errors);
  }
  
  return {
    isValid: allErrors.length === 0,
    errors: allErrors
  };
}
