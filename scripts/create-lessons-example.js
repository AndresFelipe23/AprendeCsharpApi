// ============================================
// SCRIPT DE EJEMPLO PARA CREAR LECCIONES
// Usar con el JSON de curso1-lecciones-detalladas.json
// ============================================

const axios = require('axios');

// Configuración
const API_BASE_URL = 'http://localhost:3000/api';
const JWT_TOKEN = 'YOUR_JWT_TOKEN_HERE'; // Reemplazar con tu token JWT

// Headers para las peticiones
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${JWT_TOKEN}`
};

// Función para crear el curso primero
async function createCourse() {
  try {
    const courseData = {
      title: "Introducción a C#",
      description: "Aprende los fundamentos básicos de C# desde cero, desde la instalación hasta tu primer programa y las estructuras de control esenciales.",
      level: 1,
      estimatedHours: 20,
      difficulty: "Principiante",
      imageUrl: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400",
      topics: [
        "Fundamentos de C#",
        "Variables y tipos de datos",
        "Operadores",
        "Estructuras de control",
        "Bucles",
        "Entrada y salida",
        "Programación básica"
      ]
    };

    console.log('📚 Creando curso...');
    const response = await axios.post(`${API_BASE_URL}/courses`, courseData, { headers });
    
    if (response.data.success) {
      console.log('✅ Curso creado exitosamente:', response.data.data.title);
      return response.data.data.courseId;
    }
  } catch (error) {
    console.error('❌ Error creando curso:', error.response?.data || error.message);
    throw error;
  }
}

// Función para crear todas las lecciones
async function createLessons(courseId) {
  try {
    const lessonsData = {
      courseId: courseId,
      lessons: [
        {
          titulo: "¿Qué es C#?",
          descripcion: "Introducción al lenguaje de programación C#, su historia, características principales y por qué es una excelente opción para aprender programación.",
          contenido: `# ¿Qué es C#?

## Historia de C#

C# (pronunciado "C Sharp") fue desarrollado por Microsoft en el año 2000 como parte de la plataforma .NET. Fue creado por Anders Hejlsberg, quien también participó en el desarrollo de Turbo Pascal y Delphi.

## Características principales

- **Lenguaje orientado a objetos**: C# es completamente orientado a objetos
- **Tipado estático**: Los tipos se verifican en tiempo de compilación
- **Garbage Collection**: Gestión automática de memoria
- **Multiplataforma**: Funciona en Windows, Linux y macOS
- **Sintaxis clara**: Fácil de leer y entender

## ¿Por qué aprender C#?

1. **Demanda laboral alta**: Muchas empresas buscan desarrolladores C#
2. **Versatilidad**: Se usa para aplicaciones web, móviles, desktop y juegos
3. **Comunidad activa**: Gran comunidad de desarrolladores
4. **Documentación excelente**: Microsoft proporciona documentación completa

## Entorno de desarrollo

- **Visual Studio**: IDE completo de Microsoft
- **Visual Studio Code**: Editor ligero con extensiones
- **JetBrains Rider**: IDE profesional alternativo
- **.NET SDK**: Kit de desarrollo necesario`,
          ordenIndice: 1,
          recompensaXP: 50,
          estaBloqueada: false,
          tipoLeccion: "Teoría",
          codigoEjemplo: `// Tu primer programa en C#
using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("¡Hola, mundo!");
        Console.WriteLine("¡Bienvenido a C#!");
    }
}`,
          salidaEsperada: "¡Hola, mundo!\n¡Bienvenido a C#!",
          pistas: [
            "C# es un lenguaje de programación moderno y poderoso",
            "Fue desarrollado por Microsoft como parte de .NET",
            "Es completamente orientado a objetos",
            "Tiene una sintaxis clara y fácil de aprender"
          ]
        },
        {
          titulo: "Instalación y Configuración",
          descripcion: "Aprende a instalar y configurar el entorno de desarrollo necesario para programar en C#, incluyendo Visual Studio y el .NET SDK.",
          contenido: `# Instalación y Configuración

## Requisitos del sistema

- **Windows**: Windows 10 o superior
- **macOS**: macOS 10.15 o superior
- **Linux**: Ubuntu 18.04+ o distribuciones compatibles

## Instalación del .NET SDK

1. Ve a [dotnet.microsoft.com](https://dotnet.microsoft.com/download)
2. Descarga el SDK para tu sistema operativo
3. Ejecuta el instalador
4. Verifica la instalación con: \`dotnet --version\`

## Visual Studio Code

1. Descarga VS Code desde [code.visualstudio.com](https://code.visualstudio.com/)
2. Instala la extensión "C# Dev Kit"
3. Instala la extensión "C#"

## Visual Studio (Windows)

1. Descarga Visual Studio Community (gratuito)
2. Selecciona la carga de trabajo ".NET desktop development"
3. Instala con las opciones recomendadas

## Verificación de la instalación

\`\`\`bash
# Verificar versión de .NET
dotnet --version

# Crear un nuevo proyecto
dotnet new console -n MiPrimerProyecto

# Ejecutar el proyecto
cd MiPrimerProyecto
dotnet run
\`\`\``,
          ordenIndice: 2,
          recompensaXP: 50,
          estaBloqueada: false,
          tipoLeccion: "Práctica",
          codigoEjemplo: `using System;

namespace MiPrimerProyecto
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("¡Mi primer programa en C#!");
            Console.WriteLine("Fecha actual: " + DateTime.Now);
        }
    }
}`,
          salidaEsperada: "¡Mi primer programa en C#!\nFecha actual: [fecha y hora actual]",
          pistas: [
            "Asegúrate de tener instalado el .NET SDK",
            "Usa 'dotnet new console' para crear un proyecto",
            "Usa 'dotnet run' para ejecutar el programa",
            "DateTime.Now te da la fecha y hora actual"
          ]
        }
        // ... agregar más lecciones aquí
      ]
    };

    console.log('📖 Creando lecciones...');
    const response = await axios.post(`${API_BASE_URL}/lessons/bulk`, lessonsData, { headers });
    
    if (response.data.success) {
      console.log(`✅ ${response.data.data.length} lecciones creadas exitosamente`);
      return response.data.data;
    }
  } catch (error) {
    console.error('❌ Error creando lecciones:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal
async function main() {
  try {
    console.log('🚀 Iniciando creación de curso y lecciones...\n');
    
    // 1. Crear el curso
    const courseId = await createCourse();
    
    // 2. Crear las lecciones
    const lessons = await createLessons(courseId);
    
    console.log('\n🎉 ¡Proceso completado exitosamente!');
    console.log(`📚 Curso ID: ${courseId}`);
    console.log(`📖 Lecciones creadas: ${lessons.length}`);
    
  } catch (error) {
    console.error('\n💥 Error en el proceso:', error.message);
    process.exit(1);
  }
}

// Ejecutar el script
if (require.main === module) {
  main();
}

module.exports = { createCourse, createLessons };
