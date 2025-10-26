// ============================================
// SCRIPT DE PRUEBA PARA APIs DE EJERCICIOS
// Aplicación de Aprendizaje de C#
// ============================================

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// ============================================
// FUNCIONES DE PRUEBA
// ============================================

async function testAuth() {
  console.log('🔐 Probando autenticación...');
  
  try {
    // Registrar usuario de prueba
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      nombreUsuario: 'testuser',
      email: 'test@example.com',
      password: 'password123',
      confirmarPassword: 'password123'
    });
    
    console.log('✅ Usuario registrado:', registerResponse.data);
    
    // Login
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    authToken = loginResponse.data.data.token;
    console.log('✅ Login exitoso, token obtenido');
    
    return true;
  } catch (error) {
    console.log('⚠️ Error en autenticación:', error.response?.data || error.message);
    return false;
  }
}

async function testCreateExercise() {
  console.log('\n📝 Probando creación de ejercicio...');
  
  try {
    const exerciseData = {
      leccionId: 1,
      tipoEjercicioId: 1,
      titulo: 'Variables en C# - Prueba',
      instrucciones: 'Declara una variable de tipo int llamada "edad"',
      codigoInicial: '// Tu código aquí\n',
      solucion: 'int edad;',
      casosPrueba: JSON.stringify([{"input": "", "expected": "int edad;"}]),
      pistas: JSON.stringify(["Usa la palabra clave 'int'", "Termina con punto y coma"]),
      recompensaXP: 10,
      ordenIndice: 1,
      nivelDificultad: 1
    };
    
    const response = await axios.post(`${BASE_URL}/exercises`, exerciseData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Ejercicio creado:', response.data);
    return response.data.data.ejercicioId;
  } catch (error) {
    console.log('❌ Error creando ejercicio:', error.response?.data || error.message);
    return null;
  }
}

async function testGetExercise(exerciseId) {
  console.log('\n📖 Probando obtención de ejercicio...');
  
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

async function testGetExercisesByLesson() {
  console.log('\n📚 Probando obtención de ejercicios por lección...');
  
  try {
    const response = await axios.get(`${BASE_URL}/exercises/lesson/1`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Ejercicios por lección obtenidos:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Error obteniendo ejercicios por lección:', error.response?.data || error.message);
    return false;
  }
}

async function testUpdateExercise(exerciseId) {
  console.log('\n✏️ Probando actualización de ejercicio...');
  
  try {
    const updateData = {
      titulo: 'Variables en C# - Actualizado',
      instrucciones: 'Declara una variable de tipo int llamada "edad" y asígnale el valor 25',
      recompensaXP: 15,
      nivelDificultad: 2
    };
    
    const response = await axios.put(`${BASE_URL}/exercises/${exerciseId}`, updateData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Ejercicio actualizado:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Error actualizando ejercicio:', error.response?.data || error.message);
    return false;
  }
}

async function testSubmitExercise(exerciseId) {
  console.log('\n📤 Probando envío de respuesta de ejercicio...');
  
  try {
    const submitData = {
      codigoUsuario: 'int edad = 25;',
      tiempoEjecucion: 5000,
      pruebasPasadas: 3,
      totalPruebas: 3,
      evaluacionManual: false
    };
    
    const response = await axios.post(`${BASE_URL}/exercises/${exerciseId}/submit`, submitData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Respuesta enviada:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Error enviando respuesta:', error.response?.data || error.message);
    return false;
  }
}

async function testGetExerciseStatistics(exerciseId) {
  console.log('\n📊 Probando obtención de estadísticas...');
  
  try {
    const response = await axios.get(`${BASE_URL}/exercises/${exerciseId}/statistics?periodoDias=7`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Estadísticas obtenidas:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Error obteniendo estadísticas:', error.response?.data || error.message);
    return false;
  }
}

async function testGetPopularExercises() {
  console.log('\n🔥 Probando obtención de ejercicios populares...');
  
  try {
    const response = await axios.get(`${BASE_URL}/exercises/popular?limite=5&periodoDias=7`);
    
    console.log('✅ Ejercicios populares obtenidos:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Error obteniendo ejercicios populares:', error.response?.data || error.message);
    return false;
  }
}

async function testGetRecommendations() {
  console.log('\n🎯 Probando obtención de recomendaciones...');
  
  try {
    const response = await axios.get(`${BASE_URL}/exercises/recommendations?limite=3&nivelDificultad=1`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Recomendaciones obtenidas:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Error obteniendo recomendaciones:', error.response?.data || error.message);
    return false;
  }
}

async function testGetUserProgress() {
  console.log('\n📈 Probando obtención de progreso de usuario...');
  
  try {
    const response = await axios.get(`${BASE_URL}/exercises/progress?cursoId=1&soloCompletados=false`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Progreso de usuario obtenido:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Error obteniendo progreso de usuario:', error.response?.data || error.message);
    return false;
  }
}

async function testDeleteExercise(exerciseId) {
  console.log('\n🗑️ Probando eliminación de ejercicio...');
  
  try {
    const response = await axios.delete(`${BASE_URL}/exercises/${exerciseId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Ejercicio eliminado:', response.data);
    return true;
  } catch (error) {
    console.log('❌ Error eliminando ejercicio:', error.response?.data || error.message);
    return false;
  }
}

// ============================================
// FUNCIÓN PRINCIPAL DE PRUEBAS
// ============================================

async function runTests() {
  console.log('🚀 Iniciando pruebas de APIs de ejercicios...\n');
  
  // 1. Autenticación
  const authSuccess = await testAuth();
  if (!authSuccess) {
    console.log('❌ No se pudo autenticar. Abortando pruebas.');
    return;
  }
  
  // 2. Crear ejercicio
  const exerciseId = await testCreateExercise();
  if (!exerciseId) {
    console.log('❌ No se pudo crear ejercicio. Continuando con otras pruebas...');
  }
  
  // 3. Obtener ejercicio
  if (exerciseId) {
    await testGetExercise(exerciseId);
  }
  
  // 4. Obtener ejercicios por lección
  await testGetExercisesByLesson();
  
  // 5. Actualizar ejercicio
  if (exerciseId) {
    await testUpdateExercise(exerciseId);
  }
  
  // 6. Enviar respuesta de ejercicio
  if (exerciseId) {
    await testSubmitExercise(exerciseId);
  }
  
  // 7. Obtener estadísticas
  if (exerciseId) {
    await testGetExerciseStatistics(exerciseId);
  }
  
  // 8. Obtener ejercicios populares
  await testGetPopularExercises();
  
  // 9. Obtener recomendaciones
  await testGetRecommendations();
  
  // 10. Obtener progreso de usuario
  await testGetUserProgress();
  
  // 11. Eliminar ejercicio
  if (exerciseId) {
    await testDeleteExercise(exerciseId);
  }
  
  console.log('\n✅ Pruebas completadas!');
}

// ============================================
// EJECUTAR PRUEBAS
// ============================================

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  runTests,
  testAuth,
  testCreateExercise,
  testGetExercise,
  testGetExercisesByLesson,
  testUpdateExercise,
  testSubmitExercise,
  testGetExerciseStatistics,
  testGetPopularExercises,
  testGetRecommendations,
  testGetUserProgress,
  testDeleteExercise
};
