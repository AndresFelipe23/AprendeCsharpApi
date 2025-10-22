# 📊 API de Progreso de Usuarios

Esta documentación describe los endpoints disponibles para gestionar el progreso de los usuarios en las lecciones y cursos.

## 🔐 Autenticación

La mayoría de endpoints requieren autenticación JWT. Incluye el token en el header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📋 Endpoints Disponibles

### 1. **Crear Progreso**
**POST** `/api/progress`

Crear nuevo progreso de usuario en una lección.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body:**
```json
{
  "leccionId": 1,
  "porcentajeCompletado": 25
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Progreso creado exitosamente",
  "data": {
    "progresoId": 123,
    "usuarioId": 1,
    "leccionId": 1,
    "porcentajeCompletado": 25
  }
}
```

---

### 2. **Obtener Progreso del Usuario**
**GET** `/api/progress`

Obtener progreso del usuario autenticado.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `cursoId` (opcional): Filtrar por curso específico
- `soloCompletadas` (opcional): `true`/`false` para filtrar solo lecciones completadas

**Ejemplo:**
```
GET /api/progress?cursoId=1&soloCompletadas=true
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Progreso obtenido exitosamente",
  "data": [
    {
      "progresoId": 123,
      "usuarioId": 1,
      "leccionId": 1,
      "estaCompletada": true,
      "porcentajeCompletado": 100,
      "xpGanado": 50,
      "fechaInicio": "2024-01-15T10:00:00Z",
      "fechaCompletado": "2024-01-15T11:30:00Z",
      "ultimoAcceso": "2024-01-15T11:30:00Z",
      "leccionTitulo": "Introducción a C#",
      "cursoTitulo": "Fundamentos de C#",
      "totalEjercicios": 5,
      "ejerciciosCompletados": 5
    }
  ]
}
```

---

### 3. **Obtener Progreso por Lección**
**GET** `/api/progress/lesson/:leccionId`

Obtener progreso de todos los usuarios en una lección específica.

**Query Parameters:**
- `soloCompletadas` (opcional): `true`/`false` para filtrar solo lecciones completadas
- `limite` (opcional): número máximo de resultados (default: 50)

**Ejemplo:**
```
GET /api/progress/lesson/1?soloCompletadas=true&limite=20
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Progreso por lección obtenido exitosamente",
  "data": [
    {
      "progresoId": 123,
      "usuarioId": 1,
      "leccionId": 1,
      "estaCompletada": true,
      "porcentajeCompletado": 100,
      "xpGanado": 50,
      "fechaInicio": "2024-01-15T10:00:00Z",
      "fechaCompletado": "2024-01-15T11:30:00Z",
      "ultimoAcceso": "2024-01-15T11:30:00Z",
      "leccionTitulo": "Introducción a C#"
    }
  ]
}
```

---

### 4. **Actualizar Progreso**
**PUT** `/api/progress/:leccionId`

Actualizar progreso de usuario en una lección específica.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body:**
```json
{
  "porcentajeCompletado": 75,
  "xpGanado": 25
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Progreso actualizado exitosamente",
  "data": {
    "usuarioId": 1,
    "leccionId": 1,
    "porcentajeCompletado": 75,
    "xpGanado": 25
  }
}
```

---

### 5. **Marcar Lección como Completada**
**POST** `/api/progress/:leccionId/complete`

Marcar lección como completada por el usuario.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body:**
```json
{
  "xpGanado": 50
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Lección marcada como completada",
  "data": {
    "usuarioId": 1,
    "leccionId": 1,
    "xpGanado": 50,
    "completada": true
  }
}
```

---

### 6. **Obtener Estadísticas**
**GET** `/api/progress/stats`

Obtener estadísticas de progreso del usuario.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Estadísticas obtenidas exitosamente",
  "data": {
    "totalLeccionesIniciadas": 15,
    "leccionesCompletadas": 8,
    "leccionesEnProgreso": 7,
    "totalXPGanado": 400,
    "promedioProgreso": 65.5,
    "cursosIniciados": 3,
    "cursosCompletados": 1,
    "primeraLeccionIniciada": "2024-01-10T09:00:00Z",
    "ultimaLeccionCompletada": "2024-01-20T16:30:00Z",
    "ultimoAcceso": "2024-01-21T10:15:00Z",
    "totalEjerciciosDisponibles": 45,
    "ejerciciosCompletados": 28,
    "porcentajeCompletado": 53.3,
    "diasActivos": 12
  }
}
```

---

### 7. **Obtener Resumen de Cursos**
**GET** `/api/progress/courses`

Obtener resumen de progreso por curso.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `cursoId` (opcional): Filtrar por curso específico

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Resumen de cursos obtenido exitosamente",
  "data": [
    {
      "cursoId": 1,
      "cursoTitulo": "Fundamentos de C#",
      "cursoNivelDificultad": "Principiante",
      "cursoOrden": 1,
      "totalLecciones": 10,
      "leccionesIniciadas": 8,
      "leccionesCompletadas": 5,
      "xpGanadoEnCurso": 250,
      "porcentajeCompletadoCurso": 50.0,
      "primeraLeccionIniciada": "2024-01-10T09:00:00Z",
      "ultimaLeccionCompletada": "2024-01-18T14:20:00Z",
      "ultimoAccesoCurso": "2024-01-21T10:15:00Z",
      "estadoCurso": "En Progreso"
    }
  ]
}
```

---

### 8. **Obtener Progreso General**
**GET** `/api/progress/general`

Obtener progreso general del usuario (información completa).

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Progreso general obtenido exitosamente",
  "data": {
    "usuario": {
      "usuarioId": 1,
      "nombreUsuario": "juan_perez",
      "nombreCompleto": "Juan Pérez",
      "imagenPerfil": "https://example.com/avatar.jpg",
      "nivelActual": 3,
      "xpTotal": 1250,
      "racha": 5,
      "ultimaFechaActivo": "2024-01-21T10:15:00Z",
      "fechaCreacion": "2024-01-01T00:00:00Z"
    },
    "estadisticas": {
      "totalLeccionesIniciadas": 15,
      "leccionesCompletadas": 8,
      "totalXPGanado": 400,
      "cursosIniciados": 3,
      "cursosCompletados": 1,
      "promedioProgreso": 65.5,
      "primeraActividad": "2024-01-10T09:00:00Z",
      "ultimaActividad": "2024-01-21T10:15:00Z"
    },
    "progresoPorNivel": [
      {
        "nivelDificultad": "Principiante",
        "leccionesIniciadas": 10,
        "leccionesCompletadas": 8,
        "xpGanado": 300,
        "porcentajeCompletado": 80.0
      },
      {
        "nivelDificultad": "Intermedio",
        "leccionesIniciadas": 5,
        "leccionesCompletadas": 0,
        "xpGanado": 100,
        "porcentajeCompletado": 0.0
      }
    ]
  }
}
```

---

### 9. **Obtener Lecciones Recientes**
**GET** `/api/progress/recent`

Obtener lecciones recientes del usuario.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Query Parameters:**
- `limite` (opcional): número máximo de resultados (default: 10, max: 50)

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Lecciones recientes obtenidas exitosamente",
  "data": [
    {
      "progresoId": 123,
      "usuarioId": 1,
      "leccionId": 5,
      "estaCompletada": false,
      "porcentajeCompletado": 60,
      "xpGanado": 30,
      "fechaInicio": "2024-01-20T14:00:00Z",
      "ultimoAcceso": "2024-01-21T10:15:00Z",
      "leccionTitulo": "Arrays en C#",
      "cursoTitulo": "Fundamentos de C#",
      "cursoNivelDificultad": "Principiante"
    }
  ]
}
```

## ❌ Códigos de Error

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Faltan campos obligatorios: leccionId",
  "error": "MISSING_REQUIRED_FIELDS"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Usuario no autenticado",
  "error": "UNAUTHORIZED"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Lección no encontrada",
  "error": "LESSON_NOT_FOUND"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "message": "Error interno del servidor",
  "error": "INTERNAL_ERROR"
}
```

## 📝 Ejemplos de Uso con Postman

### 1. Crear Progreso
```
POST http://localhost:3000/api/progress
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "leccionId": 1,
  "porcentajeCompletado": 25
}
```

### 2. Actualizar Progreso
```
PUT http://localhost:3000/api/progress/1
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "porcentajeCompletado": 75,
  "xpGanado": 25
}
```

### 3. Marcar como Completada
```
POST http://localhost:3000/api/progress/1/complete
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "xpGanado": 50
}
```

### 4. Obtener Estadísticas
```
GET http://localhost:3000/api/progress/stats
Authorization: Bearer YOUR_JWT_TOKEN
```

## 🔧 Notas Importantes

- **Autenticación**: Todos los endpoints (excepto obtener progreso por lección) requieren autenticación JWT
- **Validación**: Los porcentajes deben estar entre 0 y 100
- **XP**: El XP ganado no puede ser negativo
- **Límites**: El límite para lecciones recientes está entre 1 y 50
- **Actualización automática**: Al marcar una lección como completada, se actualiza automáticamente el XP del usuario y la tabla de clasificación
- **Estadísticas**: Las estadísticas se calculan en tiempo real basándose en el progreso actual

## 🚀 Casos de Uso

1. **Seguimiento de Progreso**: Los usuarios pueden ver su progreso en tiempo real
2. **Gamificación**: Sistema de XP y niveles para motivar el aprendizaje
3. **Analytics**: Estadísticas detalladas para entender el rendimiento
4. **Clasificaciones**: Comparar progreso entre usuarios
5. **Recomendaciones**: Sugerir lecciones basadas en el progreso actual
