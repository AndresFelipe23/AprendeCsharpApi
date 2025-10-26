# API de Ejercicios - Documentación Completa

## 📚 Endpoints Disponibles

### 🔐 Autenticación
La mayoría de endpoints requieren autenticación JWT. Incluye el token en el header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔧 **RUTAS CRUD BÁSICAS**

### 1. **POST** `/api/exercises` - Crear Ejercicio
**Descripción**: Crear un nuevo ejercicio.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body:**
```json
{
  "leccionId": 1,
  "tipoEjercicioId": 1,
  "titulo": "Variables en C#",
  "instrucciones": "Declara una variable de tipo int llamada 'edad'",
  "codigoInicial": "// Tu código aquí\n",
  "solucion": "int edad;",
  "casosPrueba": "[{\"input\": \"\", \"expected\": \"int edad;\"}]",
  "pistas": "[\"Usa la palabra clave 'int'\", \"Termina con punto y coma\"]",
  "recompensaXP": 10,
  "ordenIndice": 1,
  "nivelDificultad": 1
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "message": "Ejercicio creado exitosamente",
  "data": {
    "ejercicioId": 123
  }
}
```

---

### 2. **GET** `/api/exercises/:id` - Obtener Ejercicio
**Descripción**: Obtener un ejercicio específico por ID.

**Query Parameters:**
- `incluirSolucion` (opcional): `true`/`false` para incluir la solución

**Ejemplo:**
```
GET /api/exercises/123?incluirSolucion=false
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Ejercicio obtenido exitosamente",
  "data": {
    "ejercicioId": 123,
    "leccionId": 1,
    "tipoEjercicioId": 1,
    "tipoEjercicio": "Código",
    "titulo": "Variables en C#",
    "instrucciones": "Declara una variable de tipo int llamada 'edad'",
    "codigoInicial": "// Tu código aquí\n",
    "recompensaXP": 10,
    "ordenIndice": 1,
    "nivelDificultad": 1,
    "fechaCreacion": "2024-01-20T18:00:00.000Z",
    "leccionTitulo": "Variables y Tipos de Datos",
    "cursoId": 1,
    "cursoTitulo": "Introducción a C#",
    "totalIntentos": 0,
    "estaCompletado": false,
    "xpGanado": 0,
    "ultimoIntento": 0
  }
}
```

---

### 3. **PUT** `/api/exercises/:id` - Actualizar Ejercicio
**Descripción**: Actualizar un ejercicio existente.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body:**
```json
{
  "titulo": "Variables en C# - Actualizado",
  "instrucciones": "Declara una variable de tipo int llamada 'edad' y asígnale el valor 25",
  "recompensaXP": 15,
  "nivelDificultad": 2
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Ejercicio actualizado exitosamente"
}
```

---

### 4. **DELETE** `/api/exercises/:id` - Eliminar Ejercicio
**Descripción**: Eliminar un ejercicio.

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Ejercicio eliminado exitosamente"
}
```

---

## 📖 **RUTAS DE LECCIONES**

### 5. **GET** `/api/exercises/lesson/:leccionId` - Ejercicios por Lección
**Descripción**: Obtener todos los ejercicios de una lección.

**Query Parameters:**
- `incluirSolucion` (opcional): `true`/`false`
- `soloCompletados` (opcional): `true`/`false`

**Ejemplo:**
```
GET /api/exercises/lesson/1?soloCompletados=false
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Ejercicios obtenidos exitosamente",
  "data": [
    {
      "ejercicioId": 123,
      "titulo": "Variables en C#",
      "tipoEjercicio": "Código",
      "nivelDificultad": 1,
      "recompensaXP": 10,
      "estaCompletado": false,
      "totalIntentos": 0
    }
  ]
}
```

---

### 6. **POST** `/api/exercises/lesson/:leccionId/reorder` - Reordenar Ejercicios
**Descripción**: Reordenar ejercicios de una lección.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body:**
```json
{
  "ejerciciosOrdenados": [
    {"ejercicioId": 123, "ordenIndice": 1},
    {"ejercicioId": 124, "ordenIndice": 2},
    {"ejercicioId": 125, "ordenIndice": 3}
  ]
}
```

---

### 7. **POST** `/api/exercises/lesson/:leccionId/bulk` - Crear Múltiples Ejercicios
**Descripción**: Crear múltiples ejercicios para una lección.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body:**
```json
{
  "ejercicios": [
    {
      "titulo": "Ejercicio 1",
      "tipoEjercicioId": 1,
      "instrucciones": "Instrucciones del ejercicio 1",
      "recompensaXP": 10,
      "nivelDificultad": 1
    },
    {
      "titulo": "Ejercicio 2",
      "tipoEjercicioId": 2,
      "instrucciones": "Instrucciones del ejercicio 2",
      "recompensaXP": 15,
      "nivelDificultad": 2
    }
  ]
}
```

---

## 🎯 **RUTAS DE OPCIONES Y RESPUESTAS**

### 8. **GET** `/api/exercises/:id/options` - Ejercicio con Opciones
**Descripción**: Obtener ejercicio con opciones (para opción múltiple).

**Query Parameters:**
- `incluirRespuestas` (opcional): `true`/`false`

**Ejemplo:**
```
GET /api/exercises/123/options?incluirRespuestas=false
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Ejercicio con opciones obtenido exitosamente",
  "data": {
    "ejercicioId": 123,
    "titulo": "¿Qué es C#?",
    "instrucciones": "Selecciona la respuesta correcta",
    "opciones": [
      {
        "opcionId": 1,
        "textoOpcion": "Un lenguaje de programación",
        "ordenIndice": 1,
        "vecesSeleccionada": 15
      },
      {
        "opcionId": 2,
        "textoOpcion": "Un sistema operativo",
        "ordenIndice": 2,
        "vecesSeleccionada": 3
      }
    ]
  }
}
```

---

### 9. **POST** `/api/exercises/:id/submit` - Enviar Respuesta
**Descripción**: Enviar respuesta de ejercicio.

**Headers:**
```
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN
```

**Body:**
```json
{
  "codigoUsuario": "int edad = 25;",
  "tiempoEjecucion": 5000,
  "pruebasPasadas": 3,
  "totalPruebas": 3,
  "evaluacionManual": false
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Respuesta enviada exitosamente",
  "data": {
    "intentoId": 456,
    "esCorrecto": true,
    "xpGanado": 10,
    "numeroIntento": 1
  }
}
```

---

## 📊 **RUTAS DE ESTADÍSTICAS**

### 10. **GET** `/api/exercises/:id/statistics` - Estadísticas de Ejercicio
**Descripción**: Obtener estadísticas detalladas de un ejercicio.

**Query Parameters:**
- `periodoDias` (opcional): Número de días para el período (default: 30)

**Ejemplo:**
```
GET /api/exercises/123/statistics?periodoDias=7
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Estadísticas obtenidas exitosamente",
  "data": {
    "ejercicioId": 123,
    "ejercicioTitulo": "Variables en C#",
    "tipoEjercicio": "Código",
    "nivelDificultad": 1,
    "totalIntentos": 45,
    "totalUsuarios": 23,
    "intentosCorrectos": 38,
    "tasaExitoPorcentaje": 84.4,
    "tiempoPromedioEjecucion": 12000,
    "tiempoMinimo": 3000,
    "tiempoMaximo": 45000,
    "promedioIntentosPorUsuario": 1.96,
    "primerIntento": "2024-01-15T10:00:00Z",
    "ultimoIntento": "2024-01-20T18:30:00Z"
  }
}
```

---

### 11. **GET** `/api/exercises/popular` - Ejercicios Populares
**Descripción**: Obtener ejercicios más populares.

**Query Parameters:**
- `limite` (opcional): Número máximo de resultados (default: 10)
- `periodoDias` (opcional): Período en días (default: 30)
- `tipoEjercicioId` (opcional): Filtrar por tipo de ejercicio

**Ejemplo:**
```
GET /api/exercises/popular?limite=5&periodoDias=7
```

---

## 👤 **RUTAS DE USUARIO (REQUIEREN AUTENTICACIÓN)**

### 12. **GET** `/api/exercises/recommendations` - Recomendaciones
**Descripción**: Obtener recomendaciones de ejercicios para el usuario.

**Query Parameters:**
- `limite` (opcional): Número máximo de recomendaciones (default: 5)
- `nivelDificultad` (opcional): Filtrar por nivel de dificultad

**Ejemplo:**
```
GET /api/exercises/recommendations?limite=3&nivelDificultad=1
```

---

### 13. **GET** `/api/exercises/failed` - Ejercicios Fallidos
**Descripción**: Obtener ejercicios que el usuario ha fallado.

**Query Parameters:**
- `limite` (opcional): Número máximo de resultados (default: 20)

---

### 14. **GET** `/api/exercises/recent` - Ejercicios Recientes
**Descripción**: Obtener ejercicios recientemente intentados por el usuario.

**Query Parameters:**
- `limite` (opcional): Número máximo de resultados (default: 10)

---

### 15. **GET** `/api/exercises/:id/best-attempt` - Mejor Intento
**Descripción**: Obtener el mejor intento del usuario en un ejercicio.

**Ejemplo:**
```
GET /api/exercises/123/best-attempt
```

---

### 16. **GET** `/api/exercises/progress` - Progreso de Usuario
**Descripción**: Obtener ejercicios con progreso detallado del usuario.

**Query Parameters:**
- `leccionId` (opcional): Filtrar por lección
- `cursoId` (opcional): Filtrar por curso
- `soloCompletados` (opcional): `true`/`false`
- `soloNoCompletados` (opcional): `true`/`false`

**Ejemplo:**
```
GET /api/exercises/progress?cursoId=1&soloCompletados=false
```

---

## 🚨 **Códigos de Error Comunes**

| Código | Descripción |
|--------|-------------|
| 400 | Datos de entrada inválidos |
| 401 | No autenticado |
| 403 | Sin permisos |
| 404 | Ejercicio no encontrado |
| 500 | Error interno del servidor |

---

## 📝 **Ejemplos de Uso**

### Crear un ejercicio de código:
```bash
curl -X POST http://localhost:3000/api/exercises \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "leccionId": 1,
    "tipoEjercicioId": 1,
    "titulo": "Hola Mundo",
    "instrucciones": "Escribe un programa que imprima 'Hola Mundo'",
    "codigoInicial": "using System;\n\nclass Program\n{\n    static void Main()\n    {\n        // Tu código aquí\n    }\n}",
    "solucion": "Console.WriteLine(\"Hola Mundo\");",
    "recompensaXP": 10,
    "nivelDificultad": 1
  }'
```

### Obtener ejercicios de una lección:
```bash
curl -X GET "http://localhost:3000/api/exercises/lesson/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Enviar respuesta de ejercicio:
```bash
curl -X POST http://localhost:3000/api/exercises/123/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "codigoUsuario": "Console.WriteLine(\"Hola Mundo\");",
    "tiempoEjecucion": 5000,
    "pruebasPasadas": 3,
    "totalPruebas": 3
  }'
```
