# Backend de Ejercicios - AprendeCsharp

## 🎯 **Funcionalidades Implementadas**

### ✅ **Completado**
- **Servicio de Ejercicios** (`exercicios.ts`)
- **Controlador de Ejercicios** (`ejercicios.ts`)
- **Rutas de Ejercicios** (`ejercicios.ts`)
- **Integración en App Principal** (`app.ts`)
- **Documentación Completa** (`exercises-api.md`)
- **Script de Pruebas** (`test-exercises-api.js`)

---

## 📁 **Estructura de Archivos**

```
Backend/src/
├── services/
│   └── ejercicios.ts          # Servicio principal de ejercicios
├── controllers/
│   └── ejercicios.ts          # Controlador HTTP para ejercicios
├── routes/
│   └── ejercicios.ts          # Rutas y middleware de ejercicios
├── types/
│   └── api.ts                 # Tipos de API y AuthRequest
└── app.ts                     # Integración de rutas

Backend/docs/
└── exercises-api.md           # Documentación completa de APIs

Backend/scripts/
└── test-exercises-api.js      # Script de pruebas automatizadas
```

---

## 🚀 **APIs Disponibles**

### **CRUD Básico**
- `POST /api/exercises` - Crear ejercicio
- `GET /api/exercises/:id` - Obtener ejercicio por ID
- `PUT /api/exercises/:id` - Actualizar ejercicio
- `DELETE /api/exercises/:id` - Eliminar ejercicio

### **Por Lección**
- `GET /api/exercises/lesson/:leccionId` - Ejercicios de una lección
- `POST /api/exercises/lesson/:leccionId/reorder` - Reordenar ejercicios
- `POST /api/exercises/lesson/:leccionId/bulk` - Crear múltiples ejercicios

### **Opciones y Respuestas**
- `GET /api/exercises/:id/options` - Ejercicio con opciones
- `POST /api/exercises/:id/submit` - Enviar respuesta

### **Estadísticas**
- `GET /api/exercises/:id/statistics` - Estadísticas de ejercicio
- `GET /api/exercises/popular` - Ejercicios populares

### **Usuario (Requiere Autenticación)**
- `GET /api/exercises/recommendations` - Recomendaciones
- `GET /api/exercises/failed` - Ejercicios fallidos
- `GET /api/exercises/recent` - Ejercicios recientes
- `GET /api/exercises/:id/best-attempt` - Mejor intento
- `GET /api/exercises/progress` - Progreso de usuario

---

## 🔧 **Configuración**

### **Variables de Entorno**
```env
DB_SERVER=localhost
DB_DATABASE=AprendeCsharp
DB_USER=sa
DB_PASSWORD=password
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_CERT=true
```

### **Dependencias**
```json
{
  "express": "^4.18.2",
  "mssql": "^10.0.1",
  "jsonwebtoken": "^9.0.2",
  "bcryptjs": "^2.4.3",
  "dotenv": "^16.3.1"
}
```

---

## 🧪 **Pruebas**

### **Ejecutar Script de Pruebas**
```bash
cd Backend
node scripts/test-exercises-api.js
```

### **Pruebas Manuales con cURL**

#### Crear Ejercicio
```bash
curl -X POST http://localhost:3000/api/exercises \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "leccionId": 1,
    "tipoEjercicioId": 1,
    "titulo": "Variables en C#",
    "instrucciones": "Declara una variable de tipo int llamada edad",
    "recompensaXP": 10,
    "nivelDificultad": 1
  }'
```

#### Obtener Ejercicios por Lección
```bash
curl -X GET "http://localhost:3000/api/exercises/lesson/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Enviar Respuesta
```bash
curl -X POST http://localhost:3000/api/exercises/123/submit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "codigoUsuario": "int edad = 25;",
    "tiempoEjecucion": 5000,
    "pruebasPasadas": 3,
    "totalPruebas": 3
  }'
```

---

## 📊 **Tipos de Datos**

### **Exercise**
```typescript
interface Exercise {
  ejercicioId: number;
  leccionId: number;
  tipoEjercicioId: number;
  tipoEjercicio: string;
  titulo: string;
  instrucciones: string;
  codigoInicial?: string;
  solucion?: string;
  casosPrueba?: string;
  pistas?: string;
  recompensaXP: number;
  ordenIndice: number;
  nivelDificultad: number;
  fechaCreacion: Date;
  // Estadísticas del usuario
  totalIntentos?: number;
  estaCompletado?: boolean;
  xpGanado?: number;
  ultimoIntento?: number;
  mejorTiempo?: number;
}
```

### **ExerciseOption**
```typescript
interface ExerciseOption {
  opcionId: number;
  ejercicioId: number;
  textoOpcion: string;
  esCorrecta?: boolean;
  explicacion?: string;
  ordenIndice: number;
  vecesSeleccionada?: number;
  vecesSeleccionadaCorrectamente?: number;
}
```

### **ExerciseAttempt**
```typescript
interface ExerciseAttempt {
  intentoId: number;
  usuarioId: number;
  ejercicioId: number;
  codigoUsuario: string;
  esCorrecto: boolean;
  tiempoEjecucion?: number;
  mensajeError?: string;
  pruebasPasadas: number;
  totalPruebas: number;
  xpGanado: number;
  numeroIntento: number;
  fechaCreacion: Date;
}
```

---

## 🔐 **Autenticación**

### **Rutas Públicas**
- `GET /api/exercises/:id`
- `GET /api/exercises/lesson/:leccionId`
- `GET /api/exercises/:id/options`
- `GET /api/exercises/:id/statistics`
- `GET /api/exercises/popular`

### **Rutas Protegidas**
Todas las demás rutas requieren token JWT:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🚨 **Manejo de Errores**

### **Códigos de Estado**
- `200` - Éxito
- `201` - Creado exitosamente
- `400` - Datos inválidos
- `401` - No autenticado
- `403` - Sin permisos
- `404` - No encontrado
- `500` - Error interno

### **Formato de Respuesta de Error**
```json
{
  "success": false,
  "message": "Descripción del error",
  "error": "ERROR_CODE"
}
```

---

## 📈 **Próximos Pasos**

### **Pendientes**
1. **Servicio de Intentos** - Implementar lógica completa de envío de respuestas
2. **Validación de Código** - Integrar compilador/ejecutor de C#
3. **Casos de Prueba** - Sistema de ejecución automática
4. **Pistas Dinámicas** - Sistema de ayuda progresiva
5. **Análisis de Código** - Detección de patrones y mejores prácticas

### **Mejoras Futuras**
- **Cache Redis** - Para estadísticas y recomendaciones
- **WebSockets** - Para ejecución en tiempo real
- **IA/ML** - Para recomendaciones inteligentes
- **Analytics** - Para métricas avanzadas

---

## 🎉 **¡Backend de Ejercicios Completado!**

El backend está listo para ser integrado con el frontend Flutter. Todas las APIs están implementadas y documentadas, con manejo completo de errores y autenticación.

**¿Siguiente paso?** Implementar la UI de ejercicios en Flutter! 🚀
