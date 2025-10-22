// ============================================
// ENDPOINT DE SALUD Y DIAGNÓSTICO
// Aplicación de Aprendizaje de C#
// ============================================

import { Router } from 'express';
import { getPool } from '../config/database';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

// ============================================
// GET /health - Verificar estado de la API
// ============================================
router.get('/', async (req: any, res: any) => {
  try {
    const healthCheck = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env['NODE_ENV'] || 'development',
      version: process.env['npm_package_version'] || '1.0.0',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + ' MB'
      }
    };

    sendSuccess(res, 'API is healthy', healthCheck);
  } catch (error) {
    console.error('Health check error:', error);
    sendError(res, 'Health check failed', 'HEALTH_CHECK_ERROR', 500);
  }
});

// ============================================
// GET /health/database - Verificar conexión a BD
// ============================================
router.get('/database', async (req: any, res: any) => {
  try {
    const pool = getPool();
    
    // Intentar una consulta simple
    const result = await pool.request().query('SELECT 1 as test');
    
    const dbHealth = {
      status: 'OK',
      connected: pool.connected,
      testQuery: result.recordset[0],
      timestamp: new Date().toISOString()
    };

    sendSuccess(res, 'Database connection is healthy', dbHealth);
  } catch (error) {
    console.error('Database health check error:', error);
    
    const dbHealth = {
      status: 'ERROR',
      connected: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };

    sendError(res, 'Database connection failed', 'DATABASE_HEALTH_ERROR', 500);
  }
});

// ============================================
// GET /health/env - Verificar variables de entorno
// ============================================
router.get('/env', async (req: any, res: any) => {
  try {
    const envCheck = {
      status: 'OK',
      environment: process.env['NODE_ENV'] || 'development',
      variables: {
        DB_SERVER: process.env['DB_SERVER'] ? 'SET' : 'MISSING',
        DB_DATABASE: process.env['DB_DATABASE'] ? 'SET' : 'MISSING',
        DB_USER: process.env['DB_USER'] ? 'SET' : 'MISSING',
        DB_PASSWORD: process.env['DB_PASSWORD'] ? 'SET' : 'MISSING',
        JWT_SECRET: process.env['JWT_SECRET'] ? 'SET' : 'MISSING',
        PORT: process.env['PORT'] || '3000'
      },
      timestamp: new Date().toISOString()
    };

    sendSuccess(res, 'Environment variables check', envCheck);
  } catch (error) {
    console.error('Environment check error:', error);
    sendError(res, 'Environment check failed', 'ENV_CHECK_ERROR', 500);
  }
});

export default router;
