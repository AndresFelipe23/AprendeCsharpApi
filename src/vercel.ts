// ============================================
// HANDLER PARA VERCEL SERVERLESS FUNCTIONS
// Aplicación de Aprendizaje de C#
// ============================================

import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Importar rutas
import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import lessonRoutes from './routes/lessons';
import progressRoutes from './routes/progress';
import healthRoutes from './routes/health';

// Crear aplicación Express
const app = express();

// Middleware básico
app.use(helmet());
app.use(compression());
app.use(cors({
  origin: process.env['CORS_ORIGIN'] || '*',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Página principal con documentación
app.get('/', (_req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>API AprendeC# - Vercel</title>
        <style>
            body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
            h1 { color: #FFA000; text-align: center; }
            .status { background: #4CAF50; color: white; padding: 10px; border-radius: 5px; text-align: center; margin: 20px 0; }
            .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-left: 4px solid #FFA000; }
            .method { font-weight: bold; color: #FFA000; }
        </style>
    </head>
    <body>
        <div class="container">
            <h1>🚀 API AprendeC#</h1>
            <div class="status">✅ API funcionando correctamente en Vercel</div>
            
            <h2>📚 Endpoints Disponibles</h2>
            
            <div class="endpoint">
                <span class="method">GET</span> /health - Estado de la API
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> /health/database - Estado de la base de datos
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> /health/env - Variables de entorno
            </div>
            
            <div class="endpoint">
                <span class="method">POST</span> /api/auth/login - Iniciar sesión
            </div>
            
            <div class="endpoint">
                <span class="method">POST</span> /api/auth/register - Registrar usuario
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> /api/courses - Obtener cursos
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> /api/lessons - Obtener lecciones
            </div>
            
            <div class="endpoint">
                <span class="method">GET</span> /api/progress - Obtener progreso
            </div>
            
            <p><strong>🔗 URL Base:</strong> ${process.env['VERCEL_URL'] ? `https://${process.env['VERCEL_URL']}` : 'https://tu-api.vercel.app'}</p>
            <p><strong>🌍 Entorno:</strong> ${process.env['NODE_ENV'] || 'development'}</p>
            <p><strong>⏰ Timestamp:</strong> ${new Date().toISOString()}</p>
        </div>
    </body>
    </html>
  `);
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/progress', progressRoutes);
app.use('/health', healthRoutes);

// Manejo de errores 404
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({
      success: false,
      message: 'Endpoint no encontrado',
      error: 'NOT_FOUND',
      path: req.originalUrl,
      availableEndpoints: {
        auth: '/api/auth',
        courses: '/api/courses',
        lessons: '/api/lessons',
        progress: '/api/progress',
        health: '/health'
      }
    });
  }
  
  res.status(404).send(`
    <!DOCTYPE html>
    <html>
    <head><title>404 - Página no encontrada</title></head>
    <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
        <h1>404 - Página no encontrada</h1>
        <p>La página que buscas no existe.</p>
        <a href="/">← Volver al inicio</a>
    </body>
    </html>
  `);
});

// Handler principal para Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    console.log(`🔄 ${req.method} ${req.url} - Handler Vercel`);
    
    // Manejar la request con Express
    app(req, res);
    
  } catch (error) {
    console.error('❌ Error en handler de Vercel:', error);
    
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString()
    });
  }
}
