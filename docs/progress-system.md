# 📊 Sistema de Progreso de Usuarios

Este sistema permite gestionar y rastrear el progreso de los usuarios en las lecciones y cursos de la aplicación de aprendizaje de C#.

## 🏗️ Arquitectura

### **Servicios**
- **`ProgresoUsuarioService`**: Lógica de negocio para operaciones de progreso
- **`DatabaseService`**: Interacción con la base de datos SQL Server

### **Controladores**
- **`ProgresoUsuarioController`**: Manejo de requests HTTP y respuestas

### **Rutas**
- **`/api/progress`**: Endpoints REST para gestión de progreso

### **Base de Datos**
- **Stored Procedures**: Operaciones optimizadas en SQL Server
- **Tabla `ProgresoUsuario`**: Almacenamiento de progreso de usuarios

## 📋 Funcionalidades

### **Gestión de Progreso**
- ✅ Crear progreso inicial en lecciones
- ✅ Actualizar porcentaje de completado
- ✅ Marcar lecciones como completadas
- ✅ Ganar XP automáticamente
- ✅ Actualizar estadísticas de usuario

### **Consultas y Reportes**
- 📊 Estadísticas detalladas de progreso
- 📚 Resumen de progreso por curso
- 🎯 Progreso general del usuario
- ⏰ Lecciones recientes
- 👥 Progreso por lección (todos los usuarios)

### **Integración**
- 🔗 Actualización automática de XP del usuario
- 🏆 Actualización de tabla de clasificación
- 📈 Cálculo de niveles y rachas
- 🎮 Sistema de gamificación

## 🗄️ Stored Procedures

### **SP_ProgresoUsuario_Crear**
Crear nuevo progreso de usuario en una lección.

**Parámetros:**
- `@UsuarioId INT`
- `@LeccionId INT`
- `@PorcentajeCompletado INT = 0`

### **SP_ProgresoUsuario_ObtenerPorUsuario**
Obtener progreso de un usuario en todas las lecciones.

**Parámetros:**
- `@UsuarioId INT`
- `@CursoId INT = NULL`
- `@SoloCompletadas BIT = 0`

### **SP_ProgresoUsuario_ObtenerPorLeccion**
Obtener progreso de todos los usuarios en una lección.

**Parámetros:**
- `@LeccionId INT`
- `@SoloCompletadas BIT = 0`
- `@Limite INT = 50`

### **SP_ProgresoUsuario_ActualizarProgreso**
Actualizar progreso de usuario en una lección.

**Parámetros:**
- `@UsuarioId INT`
- `@LeccionId INT`
- `@PorcentajeCompletado INT`
- `@XPGanado INT = 0`

### **SP_ProgresoUsuario_MarcarCompletada**
Marcar lección como completada por usuario.

**Parámetros:**
- `@UsuarioId INT`
- `@LeccionId INT`
- `@XPGanado INT = NULL`

### **SP_ProgresoUsuario_ObtenerEstadisticas**
Obtener estadísticas de progreso de un usuario.

**Parámetros:**
- `@UsuarioId INT`

### **SP_ProgresoUsuario_ObtenerResumenCurso**
Obtener resumen de progreso por curso.

**Parámetros:**
- `@UsuarioId INT`
- `@CursoId INT = NULL`

### **SP_ProgresoUsuario_ObtenerProgresoGeneral**
Obtener progreso general del usuario.

**Parámetros:**
- `@UsuarioId INT`

### **SP_ProgresoUsuario_ObtenerLeccionesRecientes**
Obtener lecciones recientes del usuario.

**Parámetros:**
- `@UsuarioId INT`
- `@Limite INT = 10`

## 🚀 Endpoints Disponibles

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | `/api/progress` | Crear progreso | ✅ |
| GET | `/api/progress` | Obtener progreso del usuario | ✅ |
| GET | `/api/progress/lesson/:id` | Obtener progreso por lección | ❌ |
| PUT | `/api/progress/:id` | Actualizar progreso | ✅ |
| POST | `/api/progress/:id/complete` | Marcar como completada | ✅ |
| GET | `/api/progress/stats` | Obtener estadísticas | ✅ |
| GET | `/api/progress/courses` | Resumen por curso | ✅ |
| GET | `/api/progress/general` | Progreso general | ✅ |
| GET | `/api/progress/recent` | Lecciones recientes | ✅ |

## 📊 Modelos de Datos

### **ProgresoUsuario**
```typescript
interface ProgresoUsuario {
  progresoId: number;
  usuarioId: number;
  leccionId: number;
  estaCompletada: boolean;
  porcentajeCompletado: number;
  xpGanado: number;
  fechaInicio: Date;
  fechaCompletado?: Date;
  ultimoAcceso: Date;
  // Información adicional
  leccionTitulo?: string;
  cursoTitulo?: string;
  totalEjercicios?: number;
  ejerciciosCompletados?: number;
}
```

### **EstadisticasProgreso**
```typescript
interface EstadisticasProgreso {
  totalLeccionesIniciadas: number;
  leccionesCompletadas: number;
  leccionesEnProgreso: number;
  totalXPGanado: number;
  promedioProgreso: number;
  cursosIniciados: number;
  cursosCompletados: number;
  porcentajeCompletado: number;
  diasActivos: number;
}
```

### **ResumenCurso**
```typescript
interface ResumenCurso {
  cursoId: number;
  cursoTitulo: string;
  cursoNivelDificultad: string;
  totalLecciones: number;
  leccionesIniciadas: number;
  leccionesCompletadas: number;
  xpGanadoEnCurso: number;
  porcentajeCompletadoCurso: number;
  estadoCurso: 'No Iniciado' | 'En Progreso' | 'Completado';
}
```

## 🔧 Configuración

### **Variables de Entorno**
```env
# Base de datos
DB_SERVER=localhost
DB_DATABASE=AprendeCsharp
DB_USER=sa
DB_PASSWORD=your_password
DB_PORT=1433

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
```

### **Dependencias**
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "mssql": "^9.0.0",
    "jsonwebtoken": "^9.0.0",
    "bcryptjs": "^2.4.3",
    "helmet": "^6.0.0",
    "compression": "^1.7.4",
    "express-rate-limit": "^6.7.0"
  }
}
```

## 🧪 Testing

### **Script de Pruebas**
```bash
# Ejecutar script de demostración
node Backend/scripts/test-progress-api.js
```

### **Ejemplos con Postman**
Ver archivo `Backend/docs/progress-api.md` para ejemplos completos.

## 📈 Casos de Uso

### **1. Usuario Inicia Lección**
```javascript
// Crear progreso inicial
await ProgresoUsuarioService.crearProgreso(usuarioId, leccionId, 0);
```

### **2. Usuario Avanza en Lección**
```javascript
// Actualizar progreso
await ProgresoUsuarioService.actualizarProgreso(usuarioId, leccionId, 75, 25);
```

### **3. Usuario Completa Lección**
```javascript
// Marcar como completada
await ProgresoUsuarioService.marcarCompletada(usuarioId, leccionId);
```

### **4. Obtener Dashboard del Usuario**
```javascript
// Obtener progreso general
const progresoGeneral = await ProgresoUsuarioService.obtenerProgresoGeneral(usuarioId);
```

## 🔒 Seguridad

- **Autenticación JWT**: Todos los endpoints requieren token válido
- **Validación de datos**: Validación estricta de parámetros de entrada
- **Rate limiting**: Protección contra abuso de endpoints
- **Sanitización**: Prevención de inyección SQL mediante stored procedures
- **Autorización**: Los usuarios solo pueden acceder a su propio progreso

## 📝 Logs y Monitoreo

- **Logs de operaciones**: Registro de todas las operaciones de progreso
- **Métricas de rendimiento**: Tiempo de respuesta de stored procedures
- **Errores**: Logging detallado de errores con contexto
- **Auditoría**: Trazabilidad de cambios en progreso

## 🚀 Despliegue

### **Desarrollo**
```bash
npm run dev
```

### **Producción**
```bash
npm run build
npm start
```

### **Docker**
```bash
docker build -t aprendecsharp-api .
docker run -p 3000:3000 aprendecsharp-api
```

## 🔄 Mantenimiento

### **Backup de Datos**
- Backup diario de tabla `ProgresoUsuario`
- Backup semanal de estadísticas calculadas

### **Optimización**
- Índices en `UsuarioId` y `LeccionId`
- Particionado por fecha para tablas grandes
- Cache de estadísticas frecuentes

### **Monitoreo**
- Alertas por tiempo de respuesta alto
- Monitoreo de uso de memoria
- Alertas por errores de base de datos

## 📚 Documentación Adicional

- [API Documentation](./progress-api.md)
- [Database Schema](../Database/)
- [Authentication Guide](./auth-api.md)
- [Courses API](./courses-api.md)
- [Lessons API](./lessons-api.md)
