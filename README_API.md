# 🚀 AprendeCsharp API - Backend para Aplicación Móvil

API REST completa para la aplicación móvil de aprendizaje de C#, construida con TypeScript, Express.js y SQL Server.

## 📋 Características

- ✅ **Autenticación JWT** completa
- ✅ **Registro y login** de usuarios
- ✅ **Gestión de perfiles** de usuario
- ✅ **Recuperación de contraseñas**
- ✅ **Validación de email**
- ✅ **Rate limiting** para seguridad
- ✅ **CORS** configurado para móvil
- ✅ **Compresión** de respuestas
- ✅ **Headers de seguridad**
- ✅ **Logging** detallado
- ✅ **Manejo de errores** robusto
- ✅ **Validación** de entrada
- ✅ **Stored Procedures** SQL Server

## 🛠️ Tecnologías

- **Node.js** + **TypeScript**
- **Express.js** - Framework web
- **SQL Server** - Base de datos
- **JWT** - Autenticación
- **bcryptjs** - Hash de contraseñas
- **Helmet** - Seguridad
- **CORS** - Cross-origin requests
- **Rate Limiting** - Protección contra spam

## 📁 Estructura del Proyecto

```
src/
├── types/           # Tipos TypeScript
│   └── auth.ts      # Tipos de autenticación
├── utils/           # Utilidades
│   ├── validation.ts # Validaciones
│   └── response.ts   # Respuestas HTTP
├── services/        # Servicios de negocio
│   ├── database.ts  # Servicio de BD
│   └── auth.ts      # Servicio de autenticación
├── middleware/      # Middleware de Express
│   └── auth.ts      # Middleware de autenticación
├── controllers/     # Controladores
│   └── auth.ts      # Controlador de autenticación
├── routes/          # Rutas de la API
│   └── auth.ts      # Rutas de autenticación
├── app.ts           # Configuración de Express
└── index.ts         # Punto de entrada
```

## 🚀 Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Copia `env.example` a `.env` y configura:

```env
# Servidor
NODE_ENV=development
PORT=3000

# Base de datos SQL Server
DB_SERVER=localhost
DB_DATABASE=AprendeCsharp
DB_USER=sa
DB_PASSWORD=tu_password
DB_PORT=1433

# JWT
JWT_SECRET=tu-secreto-super-seguro
JWT_EXPIRES_IN=7d

# bcrypt
BCRYPT_ROUNDS=12
```

### 3. Configurar base de datos
1. Instalar SQL Server
2. Crear la base de datos `AprendeCsharp`
3. Ejecutar los scripts SQL en la carpeta `database/`

### 4. Compilar TypeScript
```bash
npm run build
```

### 5. Iniciar servidor
```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## 📱 Endpoints de la API

### 🔐 Autenticación

#### POST `/api/auth/login`
Iniciar sesión
```json
{
  "emailUsuario": "usuario@email.com",
  "password": "password123"
}
```

#### POST `/api/auth/register`
Registrar usuario
```json
{
  "email": "usuario@email.com",
  "nombreUsuario": "usuario123",
  "password": "password123",
  "nombreCompleto": "Juan Pérez"
}
```

#### POST `/api/auth/verify-token`
Verificar token JWT
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST `/api/auth/change-password`
Cambiar contraseña (requiere autenticación)
```json
{
  "passwordActual": "password123",
  "passwordNuevo": "newpassword456"
}
```

#### POST `/api/auth/recover-password`
Solicitar recuperación de contraseña
```json
{
  "email": "usuario@email.com"
}
```

#### POST `/api/auth/reset-password`
Resetear contraseña con token
```json
{
  "tokenRecuperacion": "token_de_recuperacion",
  "passwordNuevo": "newpassword456"
}
```

#### POST `/api/auth/validate-email`
Validar email con token
```json
{
  "tokenVerificacion": "token_de_verificacion"
}
```

#### POST `/api/auth/logout`
Cerrar sesión (requiere autenticación)

#### GET `/api/auth/profile`
Obtener perfil completo (requiere autenticación)

#### PUT `/api/auth/profile`
Actualizar perfil (requiere autenticación)
```json
{
  "nombreCompleto": "Juan Carlos Pérez",
  "imagenPerfil": "https://ejemplo.com/imagen.jpg"
}
```

#### GET `/api/auth/me`
Obtener información básica del usuario autenticado

#### POST `/api/auth/refresh-token`
Renovar token JWT (requiere autenticación)

#### GET `/api/auth/status`
Verificar estado de autenticación (opcional)

### 🏥 Utilidades

#### GET `/health`
Health check del servidor

#### GET `/api/info`
Información de la API

## 🔒 Seguridad

- **JWT Tokens** con expiración configurable
- **Rate Limiting** global y específico para autenticación
- **CORS** configurado para aplicación móvil
- **Helmet** para headers de seguridad
- **Validación** de entrada en todos los endpoints
- **Hash seguro** de contraseñas con bcrypt
- **Logging** de todas las operaciones de autenticación

## 📊 Respuestas de la API

### Formato estándar de respuesta
```json
{
  "success": true,
  "message": "Operación exitosa",
  "data": {
    // Datos específicos del endpoint
  }
}
```

### Formato de error
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "CODIGO_ERROR"
}
```

## 🧪 Testing

### Usar Postman o similar

1. **Registro**:
   ```
   POST http://localhost:3000/api/auth/register
   Content-Type: application/json
   
   {
     "email": "test@ejemplo.com",
     "nombreUsuario": "testuser",
     "password": "password123",
     "nombreCompleto": "Usuario Test"
   }
   ```

2. **Login**:
   ```
   POST http://localhost:3000/api/auth/login
   Content-Type: application/json
   
   {
     "emailUsuario": "test@ejemplo.com",
     "password": "password123"
   }
   ```

3. **Acceder a perfil** (usar token del login):
   ```
   GET http://localhost:3000/api/auth/profile
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

## 🚀 Despliegue

### Variables de entorno para producción
```env
NODE_ENV=production
PORT=3000
DB_SERVER=tu-servidor-sql
DB_DATABASE=AprendeCsharp
DB_USER=usuario-prod
DB_PASSWORD=password-seguro
JWT_SECRET=secreto-super-seguro-produccion
```

### Comandos de despliegue
```bash
# Compilar
npm run build

# Iniciar en producción
npm start
```

## 📝 Scripts Disponibles

- `npm run build` - Compilar TypeScript
- `npm run start` - Iniciar en producción
- `npm run dev` - Iniciar en desarrollo con watch
- `npm run watch` - Compilar en modo watch
- `npm run clean` - Limpiar archivos compilados

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 Soporte

Si tienes problemas o preguntas:

1. Revisa la documentación
2. Verifica las variables de entorno
3. Revisa los logs del servidor
4. Abre un issue en GitHub

---

**¡Disfruta aprendiendo C#! 🎓**
