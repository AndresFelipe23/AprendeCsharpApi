// ============================================
// APLICACIÓN PRINCIPAL EXPRESS
// Aplicación de Aprendizaje de C#
// ============================================

import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

// Importar servicios y middleware
import { databaseService } from './services/database';
import { mobileCORS, securityHeaders, authLogger } from './middleware/auth';

// Importar rutas
import authRoutes from './routes/auth';
import courseRoutes from './routes/courses';
import lessonRoutes from './routes/lessons';
import progressRoutes from './routes/progress';

// Cargar variables de entorno
dotenv.config();

class App {
  public app: express.Application;
  private port: number;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env['PORT'] || '3000');
    
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  // ============================================
  // Inicializar middlewares
  // ============================================
  private initializeMiddlewares(): void {
    // Middleware de seguridad
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS para aplicación móvil
    this.app.use(mobileCORS);

    // Headers de seguridad personalizados
    this.app.use(securityHeaders);

    // Compresión de respuestas
    this.app.use(compression());

    // Rate limiting global
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 1000, // máximo 1000 requests por IP por ventana
      message: {
        success: false,
        message: 'Demasiadas solicitudes desde esta IP, intenta más tarde.',
        error: 'RATE_LIMIT_EXCEEDED'
      },
      standardHeaders: true,
      legacyHeaders: false,
    });
    this.app.use(limiter);

    // Rate limiting más estricto para autenticación
    const authLimiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutos
      max: 10, // máximo 10 intentos de login por IP por ventana
      message: {
        success: false,
        message: 'Demasiados intentos de autenticación, intenta más tarde.',
        error: 'AUTH_RATE_LIMIT_EXCEEDED'
      },
      skipSuccessfulRequests: true,
    });

    // Parser de JSON
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Logger de autenticación
    this.app.use(authLogger as any);

    // Middleware para logging de requests
    this.app.use((req, res, next) => {
      const startTime = Date.now();
      
      res.on('finish', () => {
        const duration = Date.now() - startTime;
        const method = req.method;
        const url = req.originalUrl;
        const statusCode = res.statusCode;
        const ip = req.ip || req.connection.remoteAddress;
        
        console.log(`[${new Date().toISOString()}] ${method} ${url} - ${statusCode} - ${duration}ms - IP: ${ip}`);
      });
      
      next();
    });

    // Aplicar rate limiting a rutas de autenticación
    this.app.use('/api/auth/login', authLimiter);
    this.app.use('/api/auth/register', authLimiter);
    this.app.use('/api/auth/recover-password', authLimiter);
  }

  // ============================================
  // Inicializar rutas
  // ============================================
  private initializeRoutes(): void {
    // Página principal con documentación
    this.app.get('/', (_req, res) => {
      res.send(this.getWelcomePage());
    });

    // Ruta de salud
    this.app.get('/health', (_req, res) => {
      res.json({
        success: true,
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString(),
        version: process.env['npm_package_version'] || '1.0.0',
        environment: process.env['NODE_ENV'] || 'development'
      });
    });

    // Ruta de información de la API
    this.app.get('/api/info', (_req, res) => {
      res.json({
        success: true,
        message: 'API de Aprendizaje de C#',
        data: {
          name: 'AprendeCsharp API',
          version: '1.0.0',
          description: 'API REST para aplicación móvil de aprendizaje de C#',
          endpoints: {
            auth: '/api/auth',
            courses: '/api/courses',
            lessons: '/api/lessons',
            progress: '/api/progress',
            health: '/health',
            info: '/api/info'
          },
          features: [
            'Autenticación JWT',
            'Registro de usuarios',
            'Gestión de perfiles',
            'Recuperación de contraseñas',
            'Validación de email',
            'Rate limiting',
            'CORS para móvil',
            'Compresión de respuestas',
            'Headers de seguridad'
          ]
        }
      });
    });

    // Rutas de autenticación
    this.app.use('/api/auth', authRoutes);

    // Rutas de cursos
    this.app.use('/api/courses', courseRoutes);

    // Rutas de lecciones
    this.app.use('/api/lessons', lessonRoutes);

    // Rutas de progreso de usuarios
    this.app.use('/api/progress', progressRoutes);

    // Ruta 404 para rutas no encontradas
    this.app.use((req, res) => {
      // Si es una ruta de API, devolver JSON
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
            health: '/health',
            info: '/api/info'
          },
          suggestion: 'Visita la página principal para ver la documentación completa'
        });
      }
      
      // Para otras rutas, mostrar página de error personalizada
      res.status(404).send(this.get404Page(req.originalUrl));
    });
  }

  // ============================================
  // Inicializar manejo de errores
  // ============================================
  private initializeErrorHandling(): void {
    // Middleware de manejo de errores global
    this.app.use((error: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
      console.error('Error global:', error);

      // Error de validación
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          message: 'Error de validación',
          error: 'VALIDATION_ERROR',
          details: error.details
        });
      }

      // Error de sintaxis JSON
      if (error instanceof SyntaxError && error.message.includes('JSON')) {
        return res.status(400).json({
          success: false,
          message: 'JSON inválido',
          error: 'INVALID_JSON'
        });
      }

      // Error de límite de tamaño
      if (error.code === 'LIMIT_FILE_SIZE' || error.code === 'LIMIT_PAYLOAD_TOO_LARGE') {
        return res.status(413).json({
          success: false,
          message: 'Payload demasiado grande',
          error: 'PAYLOAD_TOO_LARGE'
        });
      }

      // Error de base de datos
      if (error.code && error.code.startsWith('ER_')) {
        return res.status(500).json({
          success: false,
          message: 'Error en la base de datos',
          error: 'DATABASE_ERROR'
        });
      }

      // Error genérico
      return res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: 'INTERNAL_ERROR'
      });
    });
  }

  // ============================================
  // Conectar a la base de datos
  // ============================================
  public async connectDatabase(): Promise<void> {
    try {
      await databaseService.connect();
      console.log('✅ Base de datos conectada exitosamente');
    } catch (error) {
      console.error('❌ Error conectando a la base de datos:', error);
      throw error;
    }
  }

  // ============================================
  // Desconectar de la base de datos
  // ============================================
  public async disconnectDatabase(): Promise<void> {
    try {
      await databaseService.disconnect();
      console.log('✅ Base de datos desconectada exitosamente');
    } catch (error) {
      console.error('❌ Error desconectando de la base de datos:', error);
      throw error;
    }
  }

  // ============================================
  // Iniciar servidor
  // ============================================
  public async start(): Promise<void> {
    try {
      // Conectar a la base de datos (opcional para desarrollo)
      try {
        await this.connectDatabase();
      } catch (dbError) {
        console.warn('⚠️ Advertencia: No se pudo conectar a la base de datos');
        console.warn('📝 La API funcionará en modo limitado (sin persistencia)');
        console.warn('🔧 Para funcionalidad completa, configura SQL Server');
      }

      // Iniciar servidor en 0.0.0.0 para aceptar conexiones de red local
      this.app.listen(this.port, '0.0.0.0', () => {
        console.log('🚀 Servidor iniciado exitosamente');
        console.log(`📱 Puerto: ${this.port}`);
        console.log(`🌍 Entorno: ${process.env['NODE_ENV'] || 'development'}`);
        console.log(`🔗 URL Local: http://localhost:${this.port}`);
        console.log(`📱 Dispositivos Móviles: http://TU_IP_LOCAL:${this.port}`);
        console.log(`💡 Para obtener tu IP ejecuta: ipconfig (Windows) o ifconfig (Mac/Linux)`);
        console.log(`📋 Health Check: http://localhost:${this.port}/health`);
        console.log(`📖 API Info: http://localhost:${this.port}/api/info`);
        console.log(`🔐 Auth Endpoints: http://localhost:${this.port}/api/auth`);
      });
    } catch (error) {
      console.error('❌ Error iniciando servidor:', error);
      process.exit(1);
    }
  }

  // ============================================
  // Detener servidor
  // ============================================
  public async stop(): Promise<void> {
    try {
      await this.disconnectDatabase();
      console.log('🛑 Servidor detenido exitosamente');
    } catch (error) {
      console.error('❌ Error deteniendo servidor:', error);
    }
  }

  // ============================================
  // Generar página 404 personalizada
  // ============================================
  private get404Page(requestedPath: string): string {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Página no encontrada - AprendeCsharp API</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 40px;
            text-align: center;
        }
        
        .error-card {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        }
        
        .error-icon {
            font-size: 4rem;
            margin-bottom: 20px;
        }
        
        .error-title {
            font-size: 2.5rem;
            color: #667eea;
            margin-bottom: 20px;
        }
        
        .error-message {
            font-size: 1.2rem;
            color: #666;
            margin-bottom: 30px;
            line-height: 1.6;
        }
        
        .requested-path {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
            font-family: monospace;
            color: #e53e3e;
        }
        
        .btn {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 10px;
            margin: 10px;
            transition: all 0.3s ease;
            font-weight: bold;
        }
        
        .btn:hover {
            background: #5a67d8;
            transform: translateY(-2px);
        }
        
        .btn.secondary {
            background: #6b7280;
        }
        
        .btn.secondary:hover {
            background: #4b5563;
        }
        
        .suggestions {
            margin-top: 30px;
            text-align: left;
        }
        
        .suggestions h3 {
            color: #667eea;
            margin-bottom: 15px;
        }
        
        .suggestions ul {
            list-style: none;
            padding: 0;
        }
        
        .suggestions li {
            background: #f0f9ff;
            margin: 10px 0;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #667eea;
        }
        
        .suggestions code {
            background: #e2e8f0;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: monospace;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="error-card">
            <div class="error-icon">🔍</div>
            <h1 class="error-title">404</h1>
            <p class="error-message">
                Lo sentimos, la página que buscas no existe.
            </p>
            
            <div class="requested-path">
                ${requestedPath}
            </div>
            
            <div>
                <a href="/" class="btn">🏠 Ir al Inicio</a>
                <a href="/api/info" class="btn secondary">📖 Ver API Info</a>
            </div>
            
            <div class="suggestions">
                <h3>💡 Sugerencias:</h3>
                <ul>
                    <li>Verifica que la URL esté escrita correctamente</li>
                    <li>Visita la <a href="/">página principal</a> para ver todos los endpoints disponibles</li>
                    <li>Consulta la <a href="/api/info">información de la API</a> para más detalles</li>
                    <li>Prueba el <a href="/health">health check</a> para verificar el estado del servidor</li>
                </ul>
                
                <h3>🔗 Endpoints principales:</h3>
                <ul>
                    <li><code>/api/auth</code> - Autenticación</li>
                    <li><code>/api/courses</code> - Cursos</li>
                    <li><code>/api/lessons</code> - Lecciones</li>
                    <li><code>/api/progress</code> - Progreso</li>
                </ul>
            </div>
        </div>
    </div>
</body>
</html>
    `;
  }

  // ============================================
  // Generar página de bienvenida
  // ============================================
  private getWelcomePage(): string {
    const currentTime = new Date().toISOString();
    const environment = process.env['NODE_ENV'] || 'development';
    const version = process.env['npm_package_version'] || '1.0.0';
    
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>AprendeCsharp API</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            color: white;
            margin-bottom: 40px;
        }
        
        .header h1 {
            font-size: 3rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header p {
            font-size: 1.2rem;
            opacity: 0.9;
        }
        
        .card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease;
        }
        
        .card:hover {
            transform: translateY(-5px);
        }
        
        .card h2 {
            color: #667eea;
            margin-bottom: 20px;
            font-size: 1.8rem;
        }
        
        .status {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 20px;
        }
        
        .status-dot {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #10B981;
            animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { opacity: 1; }
            50% { opacity: 0.5; }
            100% { opacity: 1; }
        }
        
        .endpoints {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-top: 20px;
        }
        
        .endpoint {
            background: #f8fafc;
            border-left: 4px solid #667eea;
            padding: 15px;
            border-radius: 8px;
        }
        
        .endpoint h3 {
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .method {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            font-weight: bold;
            margin-right: 10px;
        }
        
        .method.get { background: #10B981; color: white; }
        .method.post { background: #3B82F6; color: white; }
        .method.put { background: #F59E0B; color: white; }
        .method.delete { background: #EF4444; color: white; }
        
        .features {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 15px;
            margin-top: 20px;
        }
        
        .feature {
            background: #f0f9ff;
            border: 1px solid #e0f2fe;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }
        
        .feature-icon {
            font-size: 2rem;
            margin-bottom: 10px;
        }
        
        .footer {
            text-align: center;
            color: white;
            margin-top: 40px;
            opacity: 0.8;
        }
        
        .btn {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 8px;
            margin: 10px 5px;
            transition: background 0.3s ease;
        }
        
        .btn:hover {
            background: #5a67d8;
        }
        
        .btn.secondary {
            background: #6b7280;
        }
        
        .btn.secondary:hover {
            background: #4b5563;
        }
        
        @media (max-width: 768px) {
            .header h1 {
                font-size: 2rem;
            }
            
            .endpoints {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 AprendeCsharp API</h1>
            <p>API REST para aplicación móvil de aprendizaje de C#</p>
        </div>
        
        <div class="card">
            <h2>📊 Estado del Servidor</h2>
            <div class="status">
                <div class="status-dot"></div>
                <span><strong>Servidor funcionando correctamente</strong></span>
            </div>
            <p><strong>Versión:</strong> ${version}</p>
            <p><strong>Entorno:</strong> ${environment}</p>
            <p><strong>Última actualización:</strong> ${currentTime}</p>
            
            <div style="margin-top: 20px;">
                <a href="/health" class="btn">🔍 Health Check</a>
                <a href="/api/info" class="btn secondary">📖 API Info</a>
            </div>
        </div>
        
        <div class="card">
            <h2>🔗 Endpoints Disponibles</h2>
            <div class="endpoints">
                <div class="endpoint">
                    <h3>🔐 Autenticación</h3>
                    <p><span class="method post">POST</span> /api/auth/login</p>
                    <p><span class="method post">POST</span> /api/auth/register</p>
                    <p><span class="method get">GET</span> /api/auth/profile</p>
                    <p><span class="method post">POST</span> /api/auth/logout</p>
                </div>
                
                <div class="endpoint">
                    <h3>📚 Cursos</h3>
                    <p><span class="method get">GET</span> /api/courses</p>
                    <p><span class="method get">GET</span> /api/courses/:id</p>
                    <p><span class="method post">POST</span> /api/courses</p>
                    <p><span class="method put">PUT</span> /api/courses/:id</p>
                </div>
                
                <div class="endpoint">
                    <h3>📖 Lecciones</h3>
                    <p><span class="method get">GET</span> /api/lessons</p>
                    <p><span class="method get">GET</span> /api/lessons/:id</p>
                    <p><span class="method get">GET</span> /api/courses/:id/lessons</p>
                </div>
                
                <div class="endpoint">
                    <h3>📈 Progreso</h3>
                    <p><span class="method get">GET</span> /api/progress</p>
                    <p><span class="method post">POST</span> /api/progress</p>
                    <p><span class="method put">PUT</span> /api/progress/:id</p>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h2>✨ Características</h2>
            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🔒</div>
                    <h3>Autenticación JWT</h3>
                    <p>Sistema seguro de autenticación</p>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">📱</div>
                    <h3>CORS Móvil</h3>
                    <p>Configurado para aplicaciones móviles</p>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">⚡</div>
                    <h3>Rate Limiting</h3>
                    <p>Protección contra abuso</p>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">🛡️</div>
                    <h3>Seguridad</h3>
                    <p>Headers de seguridad y validación</p>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">🗄️</div>
                    <h3>Base de Datos</h3>
                    <p>SQL Server con stored procedures</p>
                </div>
                
                <div class="feature">
                    <div class="feature-icon">📊</div>
                    <h3>Monitoreo</h3>
                    <p>Logs estructurados y métricas</p>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h2>🛠️ Desarrollo</h2>
            <p>Esta API está diseñada para funcionar con la aplicación móvil <strong>AprendeCsharp</strong> desarrollada en Flutter.</p>
            <p><strong>Base URL:</strong> <code>http://localhost:3000/api</code></p>
            <p><strong>Documentación:</strong> Todos los endpoints siguen el estándar REST y devuelven respuestas JSON estructuradas.</p>
            
            <div style="margin-top: 20px;">
                <a href="https://github.com/tu-usuario/aprendecsharp" class="btn" target="_blank">📁 Repositorio GitHub</a>
                <a href="mailto:tu-email@ejemplo.com" class="btn secondary">📧 Contacto</a>
            </div>
        </div>
        
        <div class="footer">
            <p>© 2024 AprendeCsharp API - Desarrollado con ❤️ usando Node.js, Express y TypeScript</p>
        </div>
    </div>
</body>
</html>
    `;
  }

  // ============================================
  // Obtener aplicación Express
  // ============================================
  public getApp(): express.Application {
    return this.app;
  }
}

// Crear instancia de la aplicación
const app = new App();

// Manejar cierre graceful
process.on('SIGINT', async () => {
  console.log('\n🛑 Recibida señal SIGINT, cerrando servidor...');
  await app.stop();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Recibida señal SIGTERM, cerrando servidor...');
  await app.stop();
  process.exit(0);
});

// Manejar errores no capturados
process.on('uncaughtException', (error) => {
  console.error('❌ Error no capturado:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, _promise) => {
  console.error('❌ Promesa rechazada no manejada:', reason);
  process.exit(1);
});

export default app;
