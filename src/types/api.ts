// ============================================
// TIPOS DE API
// Aplicación de Aprendizaje de C#
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    total: number;
    limit: number;
    offset: number;
  };
}

// Re-exportar AuthRequest desde auth.ts para evitar duplicación
export { AuthRequest } from './auth';
