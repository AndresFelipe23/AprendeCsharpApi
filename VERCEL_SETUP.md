# 🔧 Configuración para Vercel Serverless Functions
# Aplicación de Aprendizaje de C#

# ============================================
# INSTRUCCIONES DE CONFIGURACIÓN EN VERCEL
# ============================================

# 1. Ve a tu proyecto en Vercel Dashboard
# 2. Ve a Settings > Environment Variables
# 3. Agrega las siguientes variables:

# ============================================
# VARIABLES OBLIGATORIAS
# ============================================

# Base de Datos SQL Server
DB_SERVER=tu-servidor-sql.database.windows.net
DB_DATABASE=aprendecsharp_db
DB_USER=tu-usuario-sql
DB_PASSWORD=tu-contraseña-super-segura
DB_PORT=1433

# Autenticación JWT
JWT_SECRET=tu-clave-secreta-jwt-super-segura-y-larga-minimo-32-caracteres
JWT_EXPIRES_IN=7d

# Configuración del Servidor
NODE_ENV=production
PORT=3000

# ============================================
# VARIABLES OPCIONALES
# ============================================

# CORS (para desarrollo)
CORS_ORIGIN=https://tu-app-flutter.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info

# ============================================
# NOTAS IMPORTANTES
# ============================================

# 1. JWT_SECRET debe ser una cadena larga y segura (mínimo 32 caracteres)
# 2. DB_PASSWORD debe ser la contraseña real de tu base de datos SQL Server
# 3. DB_SERVER debe ser la URL completa de tu servidor SQL Server
# 4. Todas las variables son sensibles, manténlas seguras
# 5. Después de agregar las variables, haz un nuevo deploy

# ============================================
# ENDPOINTS DE DIAGNÓSTICO
# ============================================

# Una vez desplegado, puedes probar estos endpoints:
# GET https://tu-api.vercel.app/health - Estado general de la API
# GET https://tu-api.vercel.app/health/database - Estado de la base de datos
# GET https://tu-api.vercel.app/health/env - Verificación de variables de entorno

# ============================================
# SOLUCIÓN DE PROBLEMAS
# ============================================

# Si obtienes error 500:
# 1. Verifica que todas las variables estén configuradas
# 2. Verifica que la base de datos sea accesible desde internet
# 3. Verifica que las credenciales sean correctas
# 4. Revisa los logs en Vercel Dashboard > Functions
