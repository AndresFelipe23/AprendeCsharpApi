# 🚀 AprendeCsharp - Backend API

Este es el backend de la aplicación AprendeCsharp, diseñado para ejecutarse en Vercel.

## 📁 Estructura del Proyecto

```
Backend/
├── src/
│   ├── app.ts              # Configuración principal de Express
│   ├── index.ts            # Punto de entrada
│   ├── config/
│   │   └── database.ts     # Configuración de base de datos
│   ├── controllers/        # Controladores de rutas
│   ├── middleware/         # Middleware personalizado
│   ├── models/            # Modelos de datos
│   ├── routes/            # Definición de rutas
│   ├── services/          # Lógica de negocio
│   ├── types/             # Tipos TypeScript
│   └── utils/             # Utilidades
├── package.json           # Dependencias y scripts
├── tsconfig.json          # Configuración TypeScript
└── vercel.json            # Configuración de Vercel
```

## 🔧 Configuración para Vercel

### 1. Variables de Entorno Requeridas

Configura estas variables en el dashboard de Vercel:

```bash
# Base de datos
DB_SERVER=tu-servidor-sql.database.windows.net
DB_DATABASE=aprendecsharp_db
DB_USER=tu-usuario
DB_PASSWORD=tu-contraseña

# JWT
JWT_SECRET=tu-clave-secreta-super-segura

# Puerto (Vercel lo maneja automáticamente)
PORT=3000
```

### 2. Scripts de Package.json

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "ts-node src/index.ts",
    "vercel-build": "tsc"
  }
}
```

### 3. Configuración de Vercel (vercel.json)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "src/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 🚀 Despliegue

### Opción 1: Desde GitHub
1. Sube solo la carpeta `Backend/` a un repositorio de GitHub
2. Conecta el repositorio a Vercel
3. Configura las variables de entorno
4. Despliega

### Opción 2: Desde CLI de Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# En la carpeta Backend/
vercel

# Seguir las instrucciones
```

## 📱 Configuración de la App Flutter

### Para Desarrollo Local:
```dart
// En App/lib/config/app_config.dart
static const String _localIpAddress = '192.168.1.6'; // Tu IP local
```

### Para Producción:
```dart
// En App/lib/config/app_config.dart
static const String _vercelUrl = 'https://tu-api-vercel.vercel.app/api';
```

## 🔒 Seguridad

- ✅ CORS configurado
- ✅ Helmet para headers de seguridad
- ✅ Rate limiting
- ✅ Validación de entrada
- ✅ JWT para autenticación
- ✅ Variables de entorno protegidas

## 📊 Monitoreo

- Logs estructurados con Winston
- Manejo de errores centralizado
- Métricas de rendimiento

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Compilar para producción
npm run build
npm start
```

## 📝 Notas Importantes

1. **Base de Datos**: Asegúrate de que tu base de datos SQL Server esté accesible desde Vercel
2. **CORS**: Configurado para permitir requests desde tu app Flutter
3. **Variables de Entorno**: Nunca subas archivos `.env` al repositorio
4. **Logs**: Los logs se muestran en la consola de Vercel

## 🔗 URLs de la API

Una vez desplegado, tu API estará disponible en:
- `https://tu-proyecto.vercel.app/api/auth/login`
- `https://tu-proyecto.vercel.app/api/courses`
- `https://tu-proyecto.vercel.app/api/progress`
- etc.
