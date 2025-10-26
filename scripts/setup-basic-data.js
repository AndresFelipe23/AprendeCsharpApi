// ============================================
// SCRIPT PARA CREAR DATOS BÁSICOS
// Aplicación de Aprendizaje de C#
// ============================================

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// ============================================
// FUNCIONES AUXILIARES
// ============================================

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function makeRequest(method, endpoint, data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    console.error(`❌ Error en ${method} ${endpoint}:`, error.response?.data || error.message);
    throw error;
  }
}

// ============================================
// CREAR TIPOS DE EJERCICIO
// ============================================

async function createExerciseTypes() {
  console.log('🔧 Creando tipos de ejercicio...');
  
  const exerciseTypes = [
    {
      nombreTipo: 'OpcionMultiple',
      descripcion: 'Preguntas de opción múltiple con una respuesta correcta'
    },
    {
      nombreTipo: 'CompletarCodigo',
      descripcion: 'Completar código faltante en espacios específicos'
    },
    {
      nombreTipo: 'CorregirError',
      descripcion: 'Identificar y corregir errores en el código'
    },
    {
      nombreTipo: 'SalidaCodigo',
      descripcion: 'Predecir la salida o resultado del código'
    },
    {
      nombreTipo: 'LlenarEspacios',
      descripcion: 'Llenar espacios en blanco con palabras clave'
    },
    {
      nombreTipo: 'Codigo',
      descripcion: 'Escribir código completo desde cero'
    }
  ];

  const createdTypes = [];
  
  for (const type of exerciseTypes) {
    try {
      console.log(`  📝 Creando tipo: ${type.nombreTipo}`);
      const result = await makeRequest('POST', '/exercise-types', type);
      
      if (result.success) {
        createdTypes.push({
          id: result.data.tipoEjercicioId,
          nombre: type.nombreTipo
        });
        console.log(`  ✅ Tipo creado: ${type.nombreTipo} (ID: ${result.data.tipoEjercicioId})`);
      } else {
        console.log(`  ⚠️ Tipo ya existe: ${type.nombreTipo}`);
      }
    } catch (error) {
      console.log(`  ❌ Error creando tipo ${type.nombreTipo}:`, error.message);
    }
    
    await delay(500); // Pausa entre requests
  }
  
  return createdTypes;
}

// ============================================
// CREAR CURSO
// ============================================

async function createCourse() {
  console.log('📚 Creando curso...');
  
  const courseData = {
    titulo: 'Introducción a C#',
    descripcion: 'Curso completo para aprender los fundamentos de C# desde cero. Incluye variables, estructuras de control, funciones y más.',
    nivelDificultad: 'Principiante',
    imagenUrl: 'https://via.placeholder.com/300x200/007ACC/FFFFFF?text=C%23+Basics',
    ordenIndice: 1
  };

  try {
    console.log('  📝 Creando curso: Introducción a C#');
    const result = await makeRequest('POST', '/courses', courseData);
    
    if (result.success) {
      console.log(`  ✅ Curso creado: ${courseData.titulo} (ID: ${result.data.cursoId})`);
      return result.data.cursoId;
    } else {
      console.log(`  ⚠️ Curso ya existe: ${courseData.titulo}`);
      // Intentar obtener el curso existente
      const courses = await makeRequest('GET', '/courses');
      const existingCourse = courses.data?.find(c => c.titulo === courseData.titulo);
      return existingCourse?.cursoId;
    }
  } catch (error) {
    console.log(`  ❌ Error creando curso:`, error.message);
    throw error;
  }
}

// ============================================
// CREAR LECCIONES
// ============================================

async function createLessons(courseId) {
  console.log('📖 Creando lecciones...');
  
  const lessons = [
    {
      titulo: 'Introducción a C#',
      descripcion: 'Conoce qué es C#, su historia y por qué es importante aprenderlo.',
      contenido: JSON.stringify({
        sections: [
          {
            title: '¿Qué es C#?',
            content: 'C# es un lenguaje de programación moderno desarrollado por Microsoft...'
          },
          {
            title: 'Características principales',
            content: 'C# es orientado a objetos, tipado estáticamente y compilado...'
          }
        ]
      }),
      recompensaXP: 10,
      ordenIndice: 1
    },
    {
      titulo: 'Variables y Tipos de Datos',
      descripcion: 'Aprende a declarar variables y usar los tipos de datos básicos en C#.',
      contenido: JSON.stringify({
        sections: [
          {
            title: 'Declaración de variables',
            content: 'En C# puedes declarar variables usando la sintaxis: tipo nombre = valor;'
          },
          {
            title: 'Tipos primitivos',
            content: 'int, double, string, bool, char son algunos de los tipos básicos...'
          }
        ]
      }),
      recompensaXP: 15,
      ordenIndice: 2
    },
    {
      titulo: 'Estructuras de Control',
      descripcion: 'Domina las estructuras if, for, while y switch para controlar el flujo de tu programa.',
      contenido: JSON.stringify({
        sections: [
          {
            title: 'Condicionales (if/else)',
            content: 'Las estructuras condicionales te permiten ejecutar código basado en condiciones...'
          },
          {
            title: 'Bucles (for, while)',
            content: 'Los bucles te permiten repetir código múltiples veces...'
          }
        ]
      }),
      recompensaXP: 20,
      ordenIndice: 3
    },
    {
      titulo: 'Funciones y Métodos',
      descripcion: 'Aprende a crear y usar funciones para organizar tu código de manera eficiente.',
      contenido: JSON.stringify({
        sections: [
          {
            title: 'Declaración de métodos',
            content: 'Los métodos en C# se declaran con la sintaxis: modificador tipoRetorno NombreMetodo(parametros)'
          },
          {
            title: 'Parámetros y valores de retorno',
            content: 'Los métodos pueden recibir parámetros y devolver valores...'
          }
        ]
      }),
      recompensaXP: 25,
      ordenIndice: 4
    }
  ];

  const createdLessons = [];
  
  for (const lesson of lessons) {
    try {
      console.log(`  📝 Creando lección: ${lesson.titulo}`);
      const result = await makeRequest('POST', '/lessons', { ...lesson, cursoId: courseId });
      
      if (result.success) {
        createdLessons.push({
          id: result.data.leccionId,
          titulo: lesson.titulo
        });
        console.log(`  ✅ Lección creada: ${lesson.titulo} (ID: ${result.data.leccionId})`);
      } else {
        console.log(`  ⚠️ Lección ya existe: ${lesson.titulo}`);
      }
    } catch (error) {
      console.log(`  ❌ Error creando lección ${lesson.titulo}:`, error.message);
    }
    
    await delay(500); // Pausa entre requests
  }
  
  return createdLessons;
}

// ============================================
// CREAR EJERCICIOS DE EJEMPLO
// ============================================

async function createSampleExercises(lessons, exerciseTypes) {
  console.log('🎯 Creando ejercicios de ejemplo...');
  
  // Encontrar tipos de ejercicio por nombre
  const codigoType = exerciseTypes.find(t => t.nombre === 'Codigo');
  const opcionMultipleType = exerciseTypes.find(t => t.nombre === 'OpcionMultiple');
  const completarCodigoType = exerciseTypes.find(t => t.nombre === 'CompletarCodigo');
  
  if (!codigoType || !opcionMultipleType || !completarCodigoType) {
    console.log('❌ No se encontraron todos los tipos de ejercicio necesarios');
    return;
  }

  const exercises = [
    // Ejercicio para la primera lección (Introducción a C#)
    {
      leccionId: lessons[0].id,
      tipoEjercicioId: opcionMultipleType.id,
      titulo: '¿Qué es C#?',
      instrucciones: 'Selecciona la respuesta correcta sobre C#.',
      codigoInicial: null,
      solucion: 'C# es un lenguaje de programación desarrollado por Microsoft',
      casosPrueba: JSON.stringify([
        {
          pregunta: '¿Quién desarrolló C#?',
          opciones: [
            'Google',
            'Microsoft',
            'Apple',
            'Oracle'
          ],
          respuestaCorrecta: 1
        }
      ]),
      pistas: JSON.stringify([
        'C# fue desarrollado por una empresa muy conocida por sus sistemas operativos',
        'La empresa también desarrolló Visual Studio'
      ]),
      recompensaXP: 5,
      ordenIndice: 1,
      nivelDificultad: 1
    },
    
    // Ejercicio para la segunda lección (Variables)
    {
      leccionId: lessons[1].id,
      tipoEjercicioId: codigoType.id,
      titulo: 'Declarar una variable',
      instrucciones: 'Declara una variable de tipo int llamada "edad" y asígnale el valor 25.',
      codigoInicial: '// Tu código aquí\n',
      solucion: 'int edad = 25;',
      casosPrueba: JSON.stringify([
        {
          input: 'int edad = 25;',
          expected: 'int edad = 25;',
          description: 'Variable int declarada correctamente'
        }
      ]),
      pistas: JSON.stringify([
        'Usa la palabra clave "int" para declarar una variable entera',
        'No olvides el punto y coma al final'
      ]),
      recompensaXP: 10,
      ordenIndice: 1,
      nivelDificultad: 1
    },
    
    {
      leccionId: lessons[1].id,
      tipoEjercicioId: completarCodigoType.id,
      titulo: 'Completar declaración de variable',
      instrucciones: 'Completa el código para declarar una variable string llamada "nombre".',
      codigoInicial: 'string nombre = "Juan";',
      solucion: 'string nombre = "Juan";',
      casosPrueba: JSON.stringify([
        {
          input: 'string nombre = "Juan";',
          expected: 'string nombre = "Juan";',
          description: 'Variable string declarada correctamente'
        }
      ]),
      pistas: JSON.stringify([
        'Usa "string" para variables de texto',
        'Las cadenas de texto van entre comillas dobles'
      ]),
      recompensaXP: 8,
      ordenIndice: 2,
      nivelDificultad: 1
    },
    
    // Ejercicio para la tercera lección (Estructuras de Control)
    {
      leccionId: lessons[2].id,
      tipoEjercicioId: codigoType.id,
      titulo: 'Estructura if',
      instrucciones: 'Escribe un programa que verifique si un número es mayor que 10.',
      codigoInicial: 'int numero = 15;\n// Tu código aquí\n',
      solucion: 'int numero = 15;\nif (numero > 10)\n{\n    Console.WriteLine("El número es mayor que 10");\n}',
      casosPrueba: JSON.stringify([
        {
          input: 'int numero = 15;',
          expected: 'El número es mayor que 10',
          description: 'Número mayor que 10'
        }
      ]),
      pistas: JSON.stringify([
        'Usa la estructura "if" para condiciones',
        'La condición va entre paréntesis',
        'El código a ejecutar va entre llaves'
      ]),
      recompensaXP: 15,
      ordenIndice: 1,
      nivelDificultad: 2
    }
  ];

  const createdExercises = [];
  
  for (const exercise of exercises) {
    try {
      console.log(`  📝 Creando ejercicio: ${exercise.titulo}`);
      const result = await makeRequest('POST', '/exercises', exercise);
      
      if (result.success) {
        createdExercises.push({
          id: result.data.ejercicioId,
          titulo: exercise.titulo
        });
        console.log(`  ✅ Ejercicio creado: ${exercise.titulo} (ID: ${result.data.ejercicioId})`);
      } else {
        console.log(`  ⚠️ Ejercicio ya existe: ${exercise.titulo}`);
      }
    } catch (error) {
      console.log(`  ❌ Error creando ejercicio ${exercise.titulo}:`, error.message);
    }
    
    await delay(500); // Pausa entre requests
  }
  
  return createdExercises;
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function setupBasicData() {
  console.log('🚀 Iniciando configuración de datos básicos...\n');
  
  try {
    // 1. Crear tipos de ejercicio
    const exerciseTypes = await createExerciseTypes();
    console.log(`\n✅ Tipos de ejercicio creados: ${exerciseTypes.length}\n`);
    
    // 2. Crear curso
    const courseId = await createCourse();
    console.log(`\n✅ Curso creado con ID: ${courseId}\n`);
    
    // 3. Crear lecciones
    const lessons = await createLessons(courseId);
    console.log(`\n✅ Lecciones creadas: ${lessons.length}\n`);
    
    // 4. Crear ejercicios de ejemplo
    const exercises = await createSampleExercises(lessons, exerciseTypes);
    console.log(`\n✅ Ejercicios creados: ${exercises.length}\n`);
    
    console.log('🎉 ¡Configuración completada exitosamente!');
    console.log('\n📊 Resumen:');
    console.log(`  - Tipos de ejercicio: ${exerciseTypes.length}`);
    console.log(`  - Curso: 1 (ID: ${courseId})`);
    console.log(`  - Lecciones: ${lessons.length}`);
    console.log(`  - Ejercicios: ${exercises.length}`);
    
  } catch (error) {
    console.error('💥 Error durante la configuración:', error.message);
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  setupBasicData();
}

module.exports = {
  setupBasicData,
  createExerciseTypes,
  createCourse,
  createLessons,
  createSampleExercises
};
