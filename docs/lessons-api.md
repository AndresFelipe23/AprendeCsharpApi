# API de Lecciones - Documentación Completa

## 📚 Endpoints Disponibles

### 1. **GET** `/api/lessons` - Obtener todas las lecciones
**Descripción**: Obtiene todas las lecciones con filtros opcionales.

**Query Parameters** (opcionales):
- `courseId`: Filtrar por ID de curso
- `limit`: Número de resultados por página
- `offset`: Número de resultados a omitir

**Ejemplo de solicitud**:
```
GET /api/lessons?courseId=1&limit=10&offset=0
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Lecciones obtenidas exitosamente",
  "data": [
    {
      "lessonId": 1,
      "courseId": 1,
      "courseTitle": "Introducción a C#",
      "title": "¿Qué es C#?",
      "description": "Introducción al lenguaje de programación C#",
      "content": "# ¿Qué es C#?\n\n## Historia de C#...",
      "order": 1,
      "xpReward": 50,
      "type": "theory",
      "codeExample": "",
      "expectedOutput": "",
      "hints": [],
      "isCompleted": false,
      "isLocked": false,
      "exercises": [],
      "createdAt": "2024-01-20T18:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 8,
    "limit": 10,
    "offset": 0
  }
}
```

---

### 2. **GET** `/api/lessons/:id` - Obtener lección específica
**Descripción**: Obtiene una lección específica por su ID.

**Parámetros**:
- `id` (path): ID de la lección

**Ejemplo de solicitud**:
```
GET /api/lessons/1
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Lección obtenida exitosamente",
  "data": {
    "lessonId": 1,
    "courseId": 1,
    "courseTitle": "Introducción a C#",
    "courseDifficulty": "Principiante",
    "title": "¿Qué es C#?",
    "description": "Introducción al lenguaje de programación C#",
    "content": "# ¿Qué es C#?\n\n## Historia de C#...",
    "order": 1,
    "xpReward": 50,
    "type": "theory",
    "codeExample": "",
    "expectedOutput": "",
    "hints": [],
    "isCompleted": false,
    "isLocked": false,
    "exercises": [],
    "createdAt": "2024-01-20T18:00:00.000Z"
  }
}
```

---

### 3. **POST** `/api/lessons` - Crear nueva lección
**Descripción**: Crea una nueva lección.

**Body (JSON)** - Campos obligatorios:
```json
{
  "courseId": 1,
  "title": "¿Qué es C#?",
  "description": "Introducción al lenguaje de programación C#",
  "content": "# ¿Qué es C#?\n\n## Historia de C#..."
}
```

**Body (JSON)** - Campos opcionales:
```json
{
  "courseId": 1,
  "title": "¿Qué es C#?",
  "description": "Introducción al lenguaje de programación C#",
  "content": "# ¿Qué es C#?\n\n## Historia de C#...",
  "order": 1,
  "xpReward": 50,
  "isLocked": false,
  "type": "theory",
  "codeExample": "// Tu primer programa en C#\nusing System;",
  "expectedOutput": "¡Hola, mundo!",
  "hints": ["C# es un lenguaje moderno", "Fue desarrollado por Microsoft"]
}
```

**Respuesta exitosa (201)**:
```json
{
  "success": true,
  "message": "Lección creada exitosamente",
  "data": {
    "lessonId": 1,
    "courseId": 1,
    "courseTitle": "Introducción a C#",
    "title": "¿Qué es C#?",
    "description": "Introducción al lenguaje de programación C#",
    "content": "# ¿Qué es C#?\n\n## Historia de C#...",
    "order": 1,
    "xpReward": 50,
    "type": "theory",
    "codeExample": "",
    "expectedOutput": "",
    "hints": [],
    "isCompleted": false,
    "isLocked": false,
    "exercises": [],
    "createdAt": "2024-01-20T18:00:00.000Z"
  }
}
```

---

### 4. **POST** `/api/courses/:courseId/lessons` - Crear lección en curso específico
**Descripción**: Crea una lección en un curso específico (alternativa al endpoint anterior).

**Parámetros**:
- `courseId` (path): ID del curso

**Body (JSON)**:
```json
{
  "title": "¿Qué es C#?",
  "description": "Introducción al lenguaje de programación C#",
  "content": "# ¿Qué es C#?\n\n## Historia de C#...",
  "order": 1,
  "xpReward": 50,
  "isLocked": false
}
```

---

### 5. **PUT** `/api/lessons/:id` - Actualizar lección
**Descripción**: Actualiza una lección existente.

**Parámetros**:
- `id` (path): ID de la lección

**Body (JSON)** - Todos los campos son opcionales:
```json
{
  "title": "¿Qué es C#? - Actualizado",
  "description": "Descripción actualizada",
  "content": "Contenido actualizado...",
  "order": 2,
  "xpReward": 75,
  "isLocked": true
}
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Lección actualizada exitosamente"
}
```

---

### 6. **DELETE** `/api/lessons/:id` - Eliminar lección
**Descripción**: Elimina una lección (hard delete).

**Parámetros**:
- `id` (path): ID de la lección

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Lección eliminada exitosamente"
}
```

---

### 7. **POST** `/api/lessons/bulk` - Crear múltiples lecciones
**Descripción**: Crea múltiples lecciones de una vez (útil para importar desde JSON).

**Body (JSON)**:
```json
{
  "courseId": 1,
  "lessons": [
    {
      "title": "¿Qué es C#?",
      "description": "Introducción al lenguaje de programación C#",
      "content": "# ¿Qué es C#?\n\n## Historia de C#...",
      "order": 1,
      "xpReward": 50,
      "isLocked": false,
      "type": "theory",
      "codeExample": "// Tu primer programa en C#\nusing System;",
      "expectedOutput": "¡Hola, mundo!",
      "hints": ["C# es un lenguaje moderno", "Fue desarrollado por Microsoft"]
    },
    {
      "title": "Instalación y Configuración",
      "description": "Aprende a instalar y configurar el entorno de desarrollo",
      "content": "# Instalación y Configuración\n\n## Requisitos del sistema...",
      "order": 2,
      "xpReward": 50,
      "isLocked": false,
      "type": "practice"
    }
  ]
}
```

**Respuesta exitosa (201)**:
```json
{
  "success": true,
  "message": "2 lecciones creadas exitosamente",
  "data": [
    {
      "lessonId": 1,
      "courseId": 1,
      "title": "¿Qué es C#?",
      "description": "Introducción al lenguaje de programación C#",
      "content": "# ¿Qué es C#?\n\n## Historia de C#...",
      "order": 1,
      "xpReward": 50,
      "type": "theory",
      "codeExample": "// Tu primer programa en C#\nusing System;",
      "expectedOutput": "¡Hola, mundo!",
      "hints": ["C# es un lenguaje moderno", "Fue desarrollado por Microsoft"],
      "isCompleted": false,
      "isLocked": false,
      "exercises": []
    },
    {
      "lessonId": 2,
      "courseId": 1,
      "title": "Instalación y Configuración",
      "description": "Aprende a instalar y configurar el entorno de desarrollo",
      "content": "# Instalación y Configuración\n\n## Requisitos del sistema...",
      "order": 2,
      "xpReward": 50,
      "type": "practice",
      "codeExample": "",
      "expectedOutput": "",
      "hints": [],
      "isCompleted": false,
      "isLocked": false,
      "exercises": []
    }
  ]
}
```

---

## 🔧 Códigos de Error

### Errores de Validación (400)
- `INVALID_LESSON_ID`: ID de lección inválido
- `INVALID_COURSE_ID`: ID de curso inválido
- `MISSING_REQUIRED_FIELDS`: Faltan campos obligatorios
- `INVALID_ORDER`: Orden inválido (debe ser > 0)
- `INVALID_XP_REWARD`: Recompensa XP inválida (debe ser >= 0)
- `NO_FIELDS_TO_UPDATE`: No hay campos para actualizar

### Errores de Recurso No Encontrado (404)
- `LESSON_NOT_FOUND`: Lección no encontrada
- `COURSE_NOT_FOUND`: Curso no encontrado

### Errores del Servidor (500)
- `INTERNAL_ERROR`: Error interno del servidor

---

## 📝 Ejemplos de Uso con Postman

### Crear una lección individual:
```http
POST http://localhost:3000/api/lessons
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "courseId": 1,
  "title": "¿Qué es C#?",
  "description": "Introducción al lenguaje de programación C#",
  "content": "# ¿Qué es C#?\n\n## Historia de C#\n\nC# (pronunciado \"C Sharp\") fue desarrollado por Microsoft en el año 2000...",
  "order": 1,
  "xpReward": 50,
  "isLocked": false,
  "type": "theory",
  "codeExample": "// Tu primer programa en C#\nusing System;\n\nclass Program\n{\n    static void Main()\n    {\n        Console.WriteLine(\"¡Hola, mundo!\");\n    }\n}",
  "expectedOutput": "¡Hola, mundo!",
  "hints": [
    "C# es un lenguaje de programación moderno y poderoso",
    "Fue desarrollado por Microsoft como parte de .NET",
    "Es completamente orientado a objetos",
    "Tiene una sintaxis clara y fácil de aprender"
  ]
}
```

### Crear múltiples lecciones desde JSON:
```http
POST http://localhost:3000/api/lessons/bulk
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "courseId": 1,
  "lessons": [
    {
      "title": "¿Qué es C#?",
      "description": "Introducción al lenguaje de programación C#",
      "content": "# ¿Qué es C#?\n\n## Historia de C#...",
      "order": 1,
      "xpReward": 50,
      "isLocked": false,
      "type": "theory"
    },
    {
      "title": "Instalación y Configuración",
      "description": "Aprende a instalar y configurar el entorno de desarrollo",
      "content": "# Instalación y Configuración\n\n## Requisitos del sistema...",
      "order": 2,
      "xpReward": 50,
      "isLocked": false,
      "type": "practice"
    }
  ]
}
```

---

## 🚀 Funcionalidades Implementadas

✅ **CRUD Completo**: Crear, leer, actualizar y eliminar lecciones
✅ **Filtros**: Por curso, paginación
✅ **Validaciones**: Campos obligatorios, tipos de datos
✅ **Bulk Operations**: Crear múltiples lecciones de una vez
✅ **Autenticación**: Integrado con JWT
✅ **Manejo de Errores**: Códigos de error específicos
✅ **Documentación**: Completa y con ejemplos

¡Ahora puedes crear y gestionar todas las lecciones de tus cursos desde Postman! 🎉
