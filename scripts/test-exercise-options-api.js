// ============================================
// Script para probar el endpoint de ejercicios con opciones
// ============================================

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Función para hacer login
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'andresfelipeespitiasanchez@gmail.com',
      contrasena: 'Soypipe23@'
    });
    
    if (response.data.success && response.data.token) {
      return response.data.token;
    }
    
    // Si no existe, intentar registrarse
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: 'test@test.com',
      nombreUsuario: 'testuser',
      contrasena: 'Test123',
      nombreCompleto: 'Test User'
    });
    
    return registerResponse.data.token;
  } catch (error) {
    throw new Error('No se pudo autenticar: ' + error.message);
  }
}

async function testExercisesWithOptions() {
  try {
    console.log('🧪 Probando endpoint de ejercicios con opciones...\n');

    // Obtener token
    console.log('🔐 Autenticando...');
    const token = await login();
    console.log('✅ Autenticado\n');

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    };

    // Primero, obtener una lección con ejercicios
    console.log('📚 Obteniendo lecciones...');
    const lessonsResponse = await axios.get(`${BASE_URL}/lessons`, { headers });
    
    if (!lessonsResponse.data.success || lessonsResponse.data.data.length === 0) {
      console.log('❌ No se encontraron lecciones');
      return;
    }

    const firstLesson = lessonsResponse.data.data[0];
    console.log(`✅ Usando lección: "${firstLesson.titulo}" (ID: ${firstLesson.leccionId})\n`);

    // Obtener ejercicios de la lección con opciones
    console.log('🎯 Obteniendo ejercicios con opciones...');
    const exercisesResponse = await axios.get(
      `${BASE_URL}/exercises/lesson/${firstLesson.leccionId}?incluirOpciones=true`,
      { headers }
    );

    if (!exercisesResponse.data.success) {
      console.log('❌ Error:', exercisesResponse.data.message);
      return;
    }

    const exercises = exercisesResponse.data.data;
    console.log(`✅ Encontrados ${exercises.length} ejercicios\n`);

    // Analizar cada ejercicio
    for (const exercise of exercises) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`📝 Ejercicio ID: ${exercise.ejercicioId}`);
      console.log(`   Título: ${exercise.titulo}`);
      console.log(`   Tipo: ${exercise.tipoEjercicio}`);
      console.log(`   Type (Flutter): ${exercise.type}`);
      console.log(`   Instrucciones: ${exercise.instrucciones.substring(0, 60)}...`);

      // Verificar si tiene opciones
      if (exercise.opciones && exercise.opciones.length > 0) {
        console.log(`   ✅ Opciones: ${exercise.opciones.length}`);
        exercise.opciones.forEach((opcion, index) => {
          console.log(`      ${index + 1}. "${opcion.textoOpcion}"`);
          console.log(`         - EsCorrecta: ${opcion.esCorrecta}`);
          console.log(`         - Orden: ${opcion.ordenIndice}`);
        });
      } else {
        console.log(`   ⚠️ Sin opciones (${exercise.tipoEjercicio})`);
      }
      console.log('');
    }

    // Resumen
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 RESUMEN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    const multipleChoice = exercises.filter(e => e.tipoEjercicio === 'OpcionMultiple');
    const withOptions = exercises.filter(e => e.opciones && e.opciones.length > 0);
    
    console.log(`Total de ejercicios: ${exercises.length}`);
    console.log(`Ejercicios de opción múltiple: ${multipleChoice.length}`);
    console.log(`Ejercicios con opciones: ${withOptions.length}`);
    
    if (multipleChoice.length > 0 && withOptions.length === 0) {
      console.log('\n❌ PROBLEMA: Hay ejercicios de opción múltiple pero ninguno tiene opciones');
    } else if (multipleChoice.length > 0 && withOptions.length > 0) {
      console.log('\n✅ Las opciones se están cargando correctamente');
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testExercisesWithOptions();

