// ============================================
// TIPOS PARA EJERCICIOS
// Aplicación de Aprendizaje de C#
// ============================================

import { AuthRequest } from './auth';

// ============================================
// Tipos de Ejercicio
// ============================================
export interface Ejercicio {
  EjercicioId: number;
  LeccionId: number;
  TipoEjercicioId: number;
  Titulo: string;
  Instrucciones: string;
  CodigoInicial?: string;
  CodigoSolucion?: string;
  RespuestaCorrecta?: string;
  PuntosXP: number;
  NivelDificultad: number;
  Orden: number;
  EstaActivo: boolean;
  FechaCreacion: string;
  FechaActualizacion?: string;
}

// ============================================
// Tipos de Opciones de Ejercicio
// ============================================
export interface OpcionEjercicio {
  OpcionId: number;
  EjercicioId: number;
  TextoOpcion: string;
  EsCorrecta: boolean;
  Orden: number;
}

// ============================================
// Tipos de Intentos de Ejercicio
// ============================================
export interface IntentoEjercicio {
  IntentoId: number;
  EjercicioId: number;
  UsuarioId: number;
  RespuestaUsuario: string;
  EsCorrecto: boolean;
  PuntosObtenidos: number;
  TiempoResolucion: number;
  FechaIntento: string;
}

// ============================================
// Tipos de Solicitudes
// ============================================
export interface CreateExerciseRequest {
  leccionId: number;
  tipoEjercicioId: number;
  titulo: string;
  instrucciones: string;
  codigoInicial?: string;
  codigoSolucion?: string;
  respuestaCorrecta?: string;
  puntosXP?: number;
  nivelDificultad?: number;
  orden?: number;
}

export interface CreateExerciseAuthRequest extends CreateExerciseRequest {
  // Campos adicionales para autenticación si es necesario
}

export interface UpdateExerciseRequest {
  titulo?: string;
  instrucciones?: string;
  codigoInicial?: string;
  codigoSolucion?: string;
  respuestaCorrecta?: string;
  puntosXP?: number;
  nivelDificultad?: number;
  orden?: number;
  estaActivo?: boolean;
}

export interface SubmitExerciseRequest {
  respuestaUsuario: string;
  tiempoResolucion?: number;
}

export interface SubmitExerciseAuthRequest extends SubmitExerciseRequest {
  // Campos adicionales para autenticación si es necesario
}

export interface ReorderExercisesRequest {
  ejercicios: Array<{
    ejercicioId: number;
    nuevoOrden: number;
  }>;
}

export interface CreateExercisesRequest {
  ejercicios: CreateExerciseRequest[];
}

export interface CreateExercisesAuthRequest extends CreateExercisesRequest {
  // Campos adicionales para autenticación si es necesario
}

// ============================================
// Tipos de Respuestas
// ============================================
export interface ExerciseResponse {
  success: boolean;
  message: string;
  data?: Ejercicio | Ejercicio[];
  error?: string;
}

export interface ExerciseWithOptionsResponse extends ExerciseResponse {
  data?: Ejercicio & {
    opciones: OpcionEjercicio[];
  };
}

export interface ExerciseStatisticsResponse {
  success: boolean;
  message: string;
  data?: {
    totalIntentos: number;
    intentosCorrectos: number;
    porcentajeExito: number;
    tiempoPromedio: number;
    puntosPromedio: number;
  };
  error?: string;
}

export interface ExerciseAttemptResponse {
  success: boolean;
  message: string;
  data?: {
    esCorrecto: boolean;
    puntosObtenidos: number;
    mensaje: string;
    respuestaCorrecta?: string;
    explicacion?: string;
  };
  error?: string;
}

// ============================================
// Tipos para Filtros y Búsquedas
// ============================================
export interface ExerciseFilters {
  leccionId?: number;
  cursoId?: number;
  tipoEjercicioId?: number;
  nivelDificultad?: number;
  soloCompletados?: boolean;
  soloNoCompletados?: boolean;
  limite?: number;
  offset?: number;
}

export interface ExerciseRecommendationsRequest {
  usuarioId: number;
  limite?: number;
  nivelDificultad?: number;
  periodoDias?: number;
}

// ============================================
// Tipos para Estadísticas
// ============================================
export interface ExerciseStats {
  ejercicioId: number;
  titulo: string;
  totalIntentos: number;
  intentosCorrectos: number;
  porcentajeExito: number;
  tiempoPromedio: number;
  puntosPromedio: number;
  ultimoIntento?: string;
}

export interface UserExerciseProgress {
  ejercicioId: number;
  titulo: string;
  completado: boolean;
  mejorIntento?: IntentoEjercicio;
  totalIntentos: number;
  ultimoIntento?: string;
}

// ============================================
// Tipos para Request con Autenticación
// ============================================
export interface ExerciseAuthRequest extends AuthRequest {
  // Hereda user y userId de AuthRequest
}
