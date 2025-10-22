# 📚 API de Cursos - Documentación para Postman

## 🔗 Base URL
```
http://localhost:3000/api/courses
```

## 🔐 Autenticación
Todos los endpoints requieren autenticación JWT. Incluye el token en el header:
```
Authorization: Bearer <tu_jwt_token>
```

---

## 📋 Endpoints Disponibles

### 1. **GET** `/api/courses` - Obtener todos los cursos
**Descripción**: Obtiene la lista de todos los cursos disponibles con el progreso del usuario.

**Headers**:
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Cursos obtenidos exitosamente",
  "data": [
    {
      "courseId": 1,
      "title": "Introducción a C#",
      "description": "Aprende los fundamentos del lenguaje C# desde cero",
      "imageUrl": "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400",
      "level": 1,
      "estimatedHours": 8,
      "difficulty": "Principiante",
      "totalLessons": 12,
      "completedLessons": 0,
      "progress": 0,
      "isUnlocked": true,
      "topics": [],
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

---

### 2. **GET** `/api/courses/:id` - Obtener curso específico
**Descripción**: Obtiene un curso específico por su ID.

**Parámetros**:
- `id` (path): ID del curso

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Curso obtenido exitosamente",
  "data": {
    "courseId": 1,
    "title": "Introducción a C#",
    "description": "Aprende los fundamentos del lenguaje C# desde cero",
    "imageUrl": "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400",
    "level": 1,
    "estimatedHours": 8,
    "difficulty": "Principiante",
    "totalLessons": 12,
    "completedLessons": 0,
    "progress": 0,
    "isUnlocked": true,
    "topics": [],
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

---

### 3. **POST** `/api/courses` - Crear nuevo curso
**Descripción**: Crea un nuevo curso en el sistema.

**Body (JSON)**:
```json
{
  "title": "Programación Avanzada en C#",
  "description": "Curso avanzado de C# con patrones de diseño y arquitectura",
  "level": 3,
  "estimatedHours": 20,
  "difficulty": "Avanzado",
  "imageUrl": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
  "topics": [
    "Patrones de diseño",
    "Arquitectura limpia",
    "Testing avanzado",
    "Microservicios"
  ]
}
```

**Campos requeridos**:
- `title`: Título del curso
- `description`: Descripción del curso
- `level`: Nivel del curso (1-3)
- `estimatedHours`: Horas estimadas
- `difficulty`: Dificultad ("Principiante", "Intermedio", "Avanzado")

**Campos opcionales**:
- `imageUrl`: URL de la imagen del curso
- `topics`: Array de temas del curso

**Respuesta exitosa (201)**:
```json
{
  "success": true,
  "message": "Curso creado exitosamente",
  "data": {
    "courseId": 3,
    "title": "Programación Avanzada en C#",
    "description": "Curso avanzado de C# con patrones de diseño y arquitectura",
    "imageUrl": "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400",
    "level": 3,
    "estimatedHours": 20,
    "difficulty": "Avanzado",
    "totalLessons": 0,
    "completedLessons": 0,
    "progress": 0,
    "isUnlocked": false,
    "topics": [
      "Patrones de diseño",
      "Arquitectura limpia",
      "Testing avanzado",
      "Microservicios"
    ],
    "isActive": true,
    "createdAt": "2024-01-20T18:00:00.000Z"
  }
}
```

---

### 4. **PUT** `/api/courses/:id` - Actualizar curso
**Descripción**: Actualiza un curso existente.

**Parámetros**:
- `id` (path): ID del curso

**Body (JSON)** - Todos los campos son opcionales:
```json
{
  "title": "C# Avanzado - Actualizado",
  "description": "Descripción actualizada del curso",
  "level": 3,
  "estimatedHours": 25,
  "difficulty": "Avanzado",
  "imageUrl": "https://nueva-imagen.com/image.jpg",
  "isActive": true
}
```

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Curso actualizado exitosamente"
}
```

---

### 5. **DELETE** `/api/courses/:id` - Eliminar curso
**Descripción**: Elimina un curso (soft delete - lo marca como inactivo).

**Parámetros**:
- `id` (path): ID del curso

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Curso eliminado exitosamente"
}
```

---

### 6. **GET** `/api/courses/:id/lessons` - Obtener lecciones del curso
**Descripción**: Obtiene todas las lecciones de un curso específico.

**Parámetros**:
- `id` (path): ID del curso

**Respuesta exitosa (200)**:
```json
{
  "success": true,
  "message": "Lecciones obtenidas exitosamente",
  "data": [
    {
      "lessonId": 1,
      "courseId": 1,
      "title": "¿Qué es C#?",
      "description": "Introducción al lenguaje C# y su ecosistema",
      "content": "# ¿Qué es C#?\n\nC# es un lenguaje de programación...",
      "codeExample": "using System;\n\nclass Program\n{\n    static void Main()\n    {\n        Console.WriteLine(\"¡Hola Mundo!\");\n    }\n}",
      "expectedOutput": "¡Hola Mundo!",
      "hints": [
        "Recuerda usar Console.WriteLine() para imprimir texto",
        "No olvides el punto y coma al final de cada línea"
      ],
      "order": 1,
      "isCompleted": false,
      "xpReward": 10,
      "type": "theory",
      "exercises": []
    }
  ]
}
```

---

## 🚨 Códigos de Error Comunes

### 400 - Bad Request
```json
{
  "success": false,
  "message": "Faltan campos requeridos",
  "error": "MISSING_REQUIRED_FIELDS",
  "required": ["title", "description", "level", "estimatedHours", "difficulty"]
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Token de autenticación inválido",
  "error": "INVALID_TOKEN"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "message": "Curso no encontrado",
  "error": "COURSE_NOT_FOUND"
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

---

## 📝 Ejemplos de Uso en Postman

### 1. Crear un curso básico
```bash
POST http://localhost:3000/api/courses
Authorization: Bearer <tu_token>
Content-Type: application/json

{
  "title": "C# para Principiantes",
  "description": "Aprende C# desde cero",
  "level": 1,
  "estimatedHours": 10,
  "difficulty": "Principiante"
}
```

### 2. Crear un curso completo
```bash
POST http://localhost:3000/api/courses
Authorization: Bearer <tu_token>
Content-Type: application/json

{
  "title": "Desarrollo Web con ASP.NET Core",
  "description": "Aprende a crear aplicaciones web modernas con ASP.NET Core",
  "level": 2,
  "estimatedHours": 30,
  "difficulty": "Intermedio",
  "imageUrl": "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400",
  "topics": [
    "ASP.NET Core MVC",
    "Entity Framework",
    "Autenticación y autorización",
    "APIs REST",
    "Deployment"
  ]
}
```

### 3. Actualizar un curso
```bash
PUT http://localhost:3000/api/courses/1
Authorization: Bearer <tu_token>
Content-Type: application/json

{
  "title": "C# para Principiantes - Actualizado",
  "estimatedHours": 12
}
```

---

## 🔧 Configuración de Postman

### Variables de Entorno
Crea las siguientes variables en Postman:

- `base_url`: `http://localhost:3000/api`
- `auth_token`: `<tu_jwt_token>`

### Headers Predefinidos
Configura estos headers en tu colección:

- `Authorization`: `Bearer {{auth_token}}`
- `Content-Type`: `application/json`

---

## ✅ Pruebas Recomendadas

1. **Crear un curso** con todos los campos
2. **Obtener todos los cursos** para verificar que aparece
3. **Obtener el curso específico** por ID
4. **Actualizar el curso** con algunos campos
5. **Obtener lecciones** del curso
6. **Eliminar el curso** (soft delete)

¡Ahora puedes crear y gestionar cursos desde Postman y verlos reflejados en la aplicación Flutter! 🚀
