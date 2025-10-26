// ============================================
// SCRIPT PARA CREAR EJERCICIO DE COMPLETAR
// Variables y Tipos de Datos en C#
// ============================================

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// ============================================
// FUNCIONES
// ============================================

async function loginUser() {
  console.log('🔐 Iniciando sesión...');
  
  try {
    // Intentar login primero
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    authToken = loginResponse.data.data.token;
    console.log('✅ Login exitoso, token obtenido');
    return true;
  } catch (error) {
    console.log('⚠️ Error en login:', error.response?.data || error.message);
    
    // Si falla el login, intentar registrar
    try {
      console.log('📝 Intentando registrar nuevo usuario...');
      const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
        nombreUsuario: 'testuser' + Date.now(),
        email: 'test' + Date.now() + '@example.com',
        password: 'password123',
        confirmarPassword: 'password123'
      });
      
      console.log('✅ Usuario registrado:', registerResponse.data);
      
      // Ahora hacer login
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: registerResponse.data.data.email,
        password: 'password123'
      });
      
      authToken = loginResponse.data.data.token;
      console.log('✅ Login exitoso, token obtenido');
      return true;
    } catch (registerError) {
      console.log('❌ Error en registro:', registerError.response?.data || registerError.message);
      return false;
    }
  }
}

async function createFillBlankExercise() {
  console.log('\n📝 Creando ejercicio de completar sobre Variables y Tipos de Datos...');
  
  try {
    const exerciseData = {
      leccionId: 1, // Asumiendo que la lección 1 existe
      tipoEjercicioId: 5, // LlenarEspacios (fillBlank)
      titulo: 'Variables y Tipos de Datos - Completar',
      instrucciones: 'Completa la siguiente declaración de variable en C#:\n\n___ precio = 19.99___;\n\nSelecciona el tipo de dato correcto y el sufijo apropiado para valores decimales.',
      codigoInicial: '___ precio = 19.99___;',
      solucion: 'decimal precio = 19.99m;',
      casosPrueba: JSON.stringify([
        {
          "input": "decimal precio = 19.99m;",
          "expected": "decimal precio = 19.99m;",
          "description": "Variable decimal declarada correctamente"
        }
      ]),
      pistas: JSON.stringify([
        "Para valores monetarios usa 'decimal'",
        "El sufijo 'm' indica que es decimal",
        "Los tipos de dato van antes del nombre de la variable"
      ]),
      recompensaXP: 12,
      ordenIndice: 1,
      nivelDificultad: 2
    };
    
    const response = await axios.post(`${BASE_URL}/exercises`, exerciseData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Ejercicio de completar creado:', response.data);
    return response.data.data.ejercicioId;
  } catch (error) {
    console.log('❌ Error creando ejercicio:', error.response?.data || error.message);
    return null;
  }
}

async function createMultipleChoiceExercise() {
  console.log('\n📝 Creando ejercicio de opción múltiple sobre Variables y Tipos de Datos...');
  
  try {
    const exerciseData = {
      leccionId: 1,
      tipoEjercicioId: 1, // OpcionMultiple
      titulo: 'Variables y Tipos de Datos - Opción Múltiple',
      instrucciones: '¿Cuál de las siguientes declaraciones de variables en C# es válida?',
      codigoInicial: null,
      solucion: 'bool _esValido = true;',
      casosPrueba: JSON.stringify([
        {
          "input": "bool _esValido = true;",
          "expected": "bool _esValido = true;",
          "description": "Variable bool declarada correctamente"
        }
      ]),
      pistas: JSON.stringify([
        "Los nombres de variables pueden empezar con guión bajo",
        "Los nombres de variables no pueden empezar con números",
        "Los nombres de variables no pueden contener guiones"
      ]),
      recompensaXP: 10,
      ordenIndice: 2,
      nivelDificultad: 1
    };
    
    const response = await axios.post(`${BASE_URL}/exercises`, exerciseData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Ejercicio de opción múltiple creado:', response.data);
    return response.data.data.ejercicioId;
  } catch (error) {
    console.log('❌ Error creando ejercicio:', error.response?.data || error.message);
    return null;
  }
}

async function createExerciseOptions(exerciseId) {
  console.log('\n📝 Creando opciones para el ejercicio de opción múltiple...');
  
  try {
    const options = [
      {
        ejercicioId: exerciseId,
        textoOpcion: 'string mi-nombre = "Ana";',
        esCorrecta: false,
        ordenIndice: 1,
        explicacion: 'Incorrecto. Los nombres de variables no pueden contener guiones (-).'
      },
      {
        ejercicioId: exerciseId,
        textoOpcion: 'bool _esValido = true;',
        esCorrecta: true,
        ordenIndice: 2,
        explicacion: 'Correcto. Los nombres de variables pueden empezar con guión bajo (_) y bool es un tipo válido.'
      },
      {
        ejercicioId: exerciseId,
        textoOpcion: 'const double valor Pi = 3.14;',
        esCorrecta: false,
        ordenIndice: 3,
        explicacion: 'Incorrecto. Los nombres de variables no pueden contener espacios.'
      },
      {
        ejercicioId: exerciseId,
        textoOpcion: 'int 1numero = 10;',
        esCorrecta: false,
        ordenIndice: 4,
        explicacion: 'Incorrecto. Los nombres de variables no pueden empezar con números.'
      }
    ];
    
    for (const option of options) {
      const response = await axios.post(`${BASE_URL}/exercises/${exerciseId}/options`, option, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      console.log(`✅ Opción ${option.ordenIndice} creada:`, response.data);
    }
    
    return true;
  } catch (error) {
    console.log('❌ Error creando opciones:', error.response?.data || error.message);
    return false;
  }
}

async function testExercise(exerciseId) {
  console.log('\n🧪 Probando el ejercicio creado...');
  
  try {
    const response = await axios.get(`${BASE_URL}/exercises/${exerciseId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Ejercicio obtenido:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Error obteniendo ejercicio:', error.response?.data || error.message);
    return false;
  }
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function main() {
  console.log('🚀 Iniciando creación de ejercicios de Variables y Tipos de Datos...\n');
  
  // 1. Autenticación
  const authSuccess = await loginUser();
  if (!authSuccess) {
    console.log('❌ No se pudo autenticar. Abortando.');
    return;
  }
  
  // 2. Crear ejercicio de completar
  const fillBlankExerciseId = await createFillBlankExercise();
  
  // 3. Crear ejercicio de opción múltiple
  const multipleChoiceExerciseId = await createMultipleChoiceExercise();
  
  // 4. Crear opciones para el ejercicio de opción múltiple
  if (multipleChoiceExerciseId) {
    await createExerciseOptions(multipleChoiceExerciseId);
  }
  
  // 5. Probar los ejercicios creados
  if (fillBlankExerciseId) {
    await testExercise(fillBlankExerciseId);
  }
  
  if (multipleChoiceExerciseId) {
    await testExercise(multipleChoiceExerciseId);
  }
  
  console.log('\n✅ Ejercicios creados exitosamente!');
  console.log(`📝 Ejercicio de completar ID: ${fillBlankExerciseId}`);
  console.log(`📝 Ejercicio de opción múltiple ID: ${multipleChoiceExerciseId}`);
}

// ============================================
// EJECUTAR
// ============================================

if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  main,
  loginUser,
  createFillBlankExercise,
  createMultipleChoiceExercise,
  createExerciseOptions,
  testExercise
};
