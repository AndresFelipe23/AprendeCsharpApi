// ============================================
// SCRIPT DE EJEMPLO - API DE PROGRESO
// Aplicación de Aprendizaje de C#
// ============================================

const axios = require('axios');

// Configuración
const BASE_URL = 'http://localhost:3000/api';
let authToken = '';

// Función para hacer login y obtener token
async function login() {
  try {
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    authToken = response.data.data.token;
    console.log('✅ Login exitoso');
    console.log(`Token: ${authToken.substring(0, 20)}...`);
    return authToken;
  } catch (error) {
    console.error('❌ Error en login:', error.response?.data || error.message);
    throw error;
  }
}

// Función para crear progreso
async function crearProgreso(leccionId, porcentajeCompletado = 0) {
  try {
    const response = await axios.post(`${BASE_URL}/progress`, {
      leccionId,
      porcentajeCompletado
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Progreso creado:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error creando progreso:', error.response?.data || error.message);
    throw error;
  }
}

// Función para actualizar progreso
async function actualizarProgreso(leccionId, porcentajeCompletado, xpGanado = 0) {
  try {
    const response = await axios.put(`${BASE_URL}/progress/${leccionId}`, {
      porcentajeCompletado,
      xpGanado
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Progreso actualizado:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error actualizando progreso:', error.response?.data || error.message);
    throw error;
  }
}

// Función para marcar como completada
async function marcarCompletada(leccionId, xpGanado) {
  try {
    const response = await axios.post(`${BASE_URL}/progress/${leccionId}/complete`, {
      xpGanado
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Lección marcada como completada:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error marcando como completada:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener progreso
async function obtenerProgreso(cursoId = null, soloCompletadas = false) {
  try {
    let url = `${BASE_URL}/progress`;
    const params = new URLSearchParams();
    
    if (cursoId) params.append('cursoId', cursoId);
    if (soloCompletadas) params.append('soloCompletadas', 'true');
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const response = await axios.get(url, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Progreso obtenido:', response.data.data.length, 'registros');
    return response.data.data;
  } catch (error) {
    console.error('❌ Error obteniendo progreso:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener estadísticas
async function obtenerEstadisticas() {
  try {
    const response = await axios.get(`${BASE_URL}/progress/stats`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Estadísticas obtenidas:');
    console.log(`- Lecciones iniciadas: ${response.data.data.totalLeccionesIniciadas}`);
    console.log(`- Lecciones completadas: ${response.data.data.leccionesCompletadas}`);
    console.log(`- XP total ganado: ${response.data.data.totalXPGanado}`);
    console.log(`- Promedio de progreso: ${response.data.data.promedioProgreso.toFixed(1)}%`);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener resumen de cursos
async function obtenerResumenCursos() {
  try {
    const response = await axios.get(`${BASE_URL}/progress/courses`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Resumen de cursos obtenido:');
    response.data.data.forEach(curso => {
      console.log(`- ${curso.cursoTitulo}: ${curso.estadoCurso} (${curso.porcentajeCompletadoCurso.toFixed(1)}%)`);
    });
    return response.data.data;
  } catch (error) {
    console.error('❌ Error obteniendo resumen de cursos:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener progreso general
async function obtenerProgresoGeneral() {
  try {
    const response = await axios.get(`${BASE_URL}/progress/general`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Progreso general obtenido:');
    console.log(`- Usuario: ${response.data.data.usuario.nombreCompleto}`);
    console.log(`- Nivel: ${response.data.data.usuario.nivelActual}`);
    console.log(`- XP Total: ${response.data.data.usuario.xpTotal}`);
    console.log(`- Racha: ${response.data.data.usuario.racha} días`);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error obteniendo progreso general:', error.response?.data || error.message);
    throw error;
  }
}

// Función para obtener lecciones recientes
async function obtenerLeccionesRecientes(limite = 5) {
  try {
    const response = await axios.get(`${BASE_URL}/progress/recent?limite=${limite}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    console.log('✅ Lecciones recientes obtenidas:');
    response.data.data.forEach(leccion => {
      console.log(`- ${leccion.leccionTitulo}: ${leccion.porcentajeCompletado}% ${leccion.estaCompletada ? '(Completada)' : '(En progreso)'}`);
    });
    return response.data.data;
  } catch (error) {
    console.error('❌ Error obteniendo lecciones recientes:', error.response?.data || error.message);
    throw error;
  }
}

// Función principal de demostración
async function demostracionCompleta() {
  try {
    console.log('🚀 Iniciando demostración de API de Progreso...\n');
    
    // 1. Login
    await login();
    console.log('');
    
    // 2. Crear progreso inicial
    console.log('📝 Creando progreso inicial...');
    await crearProgreso(1, 25);
    console.log('');
    
    // 3. Actualizar progreso
    console.log('📈 Actualizando progreso...');
    await actualizarProgreso(1, 75, 25);
    console.log('');
    
    // 4. Marcar como completada
    console.log('✅ Marcando lección como completada...');
    await marcarCompletada(1, 50);
    console.log('');
    
    // 5. Crear progreso en otra lección
    console.log('📝 Creando progreso en otra lección...');
    await crearProgreso(2, 50);
    console.log('');
    
    // 6. Obtener progreso
    console.log('📊 Obteniendo progreso del usuario...');
    await obtenerProgreso();
    console.log('');
    
    // 7. Obtener estadísticas
    console.log('📈 Obteniendo estadísticas...');
    await obtenerEstadisticas();
    console.log('');
    
    // 8. Obtener resumen de cursos
    console.log('📚 Obteniendo resumen de cursos...');
    await obtenerResumenCursos();
    console.log('');
    
    // 9. Obtener progreso general
    console.log('🎯 Obteniendo progreso general...');
    await obtenerProgresoGeneral();
    console.log('');
    
    // 10. Obtener lecciones recientes
    console.log('⏰ Obteniendo lecciones recientes...');
    await obtenerLeccionesRecientes();
    console.log('');
    
    console.log('🎉 Demostración completada exitosamente!');
    
  } catch (error) {
    console.error('❌ Error en la demostración:', error.message);
  }
}

// Ejecutar demostración si se llama directamente
if (require.main === module) {
  demostracionCompleta();
}

module.exports = {
  login,
  crearProgreso,
  actualizarProgreso,
  marcarCompletada,
  obtenerProgreso,
  obtenerEstadisticas,
  obtenerResumenCursos,
  obtenerProgresoGeneral,
  obtenerLeccionesRecientes,
  demostracionCompleta
};
