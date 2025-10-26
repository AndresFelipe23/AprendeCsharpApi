// ============================================
// CREAR EJERCICIO DE CÓDIGO - VARIABLES Y TIPOS DE DATOS
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

async function createCodeExercise() {
  console.log('\n💻 Creando ejercicio de código sobre Variables y Tipos de Datos...');
  
  try {
    const exerciseData = {
      leccionId: 1, // Asumiendo que la lección 1 existe
      tipoEjercicioId: 1, // Codigo (code)
      titulo: 'Declaración de Variables - Tipos Básicos',
      instrucciones: `Escribe código C# para declarar las siguientes variables:

1. Una variable entera llamada 'edad' con valor 25
2. Una variable decimal llamada 'precio' con valor 19.99
3. Una variable string llamada 'nombre' con valor "Juan"
4. Una variable booleana llamada 'esActivo' con valor true

Usa la sintaxis correcta de C# para cada tipo de dato.`,
      codigoInicial: `// Declara las variables aquí
// 1. Variable entera 'edad' con valor 25

// 2. Variable decimal 'precio' con valor 19.99

// 3. Variable string 'nombre' con valor "Juan"

// 4. Variable booleana 'esActivo' con valor true`,
      solucion: `int edad = 25;
decimal precio = 19.99m;
string nombre = "Juan";
bool esActivo = true;`,
      casosPrueba: JSON.stringify([
        {
          "input": "int edad = 25;\ndecimal precio = 19.99m;\nstring nombre = \"Juan\";\nbool esActivo = true;",
          "expected": "int edad = 25;\ndecimal precio = 19.99m;\nstring nombre = \"Juan\";\nbool esActivo = true;",
          "description": "Todas las variables declaradas correctamente"
        },
        {
          "input": "int edad = 25;",
          "expected": "int edad = 25;",
          "description": "Variable entera declarada correctamente"
        },
        {
          "input": "decimal precio = 19.99m;",
          "expected": "decimal precio = 19.99m;",
          "description": "Variable decimal declarada correctamente"
        },
        {
          "input": "string nombre = \"Juan\";",
          "expected": "string nombre = \"Juan\";",
          "description": "Variable string declarada correctamente"
        },
        {
          "input": "bool esActivo = true;",
          "expected": "bool esActivo = true;",
          "description": "Variable booleana declarada correctamente"
        }
      ]),
      pistas: JSON.stringify([
        {
          "texto": "Para números enteros usa 'int', para decimales usa 'decimal'",
          "orden": 1,
          "tipo": "conceptual"
        },
        {
          "texto": "Los valores decimales necesitan el sufijo 'm' (ej: 19.99m)",
          "orden": 2,
          "tipo": "sintaxis"
        },
        {
          "texto": "Las cadenas de texto van entre comillas dobles: \"texto\"",
          "orden": 3,
          "tipo": "ejemplo"
        },
        {
          "texto": "Los valores booleanos son 'true' o 'false' (sin comillas)",
          "orden": 4,
          "tipo": "ejemplo"
        },
        {
          "texto": "La sintaxis es: tipo nombreVariable = valor;",
          "orden": 5,
          "tipo": "sintaxis"
        }
      ]),
      recompensaXP: 15,
      ordenIndice: 1,
      nivelDificultad: 2
    };
    
    const response = await axios.post(`${BASE_URL}/exercises`, exerciseData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Ejercicio de código creado:', response.data);
    return response.data.data.ejercicioId;
  } catch (error) {
    console.log('❌ Error creando ejercicio:', error.response?.data || error.message);
    return null;
  }
}

async function createAdvancedCodeExercise() {
  console.log('\n💻 Creando ejercicio avanzado de código...');
  
  try {
    const exerciseData = {
      leccionId: 1,
      tipoEjercicioId: 1, // Codigo
      titulo: 'Variables con Inferencia de Tipos (var)',
      instrucciones: `Usa la palabra clave 'var' para declarar variables con inferencia de tipos:

1. Declara una variable 'numero' con valor 42 (el compilador inferirá int)
2. Declara una variable 'texto' con valor "Hola Mundo" (el compilador inferirá string)
3. Declara una variable 'decimal' con valor 3.14 (el compilador inferirá double)
4. Declara una variable 'activo' con valor true (el compilador inferirá bool)

Nota: 'var' solo funciona cuando el compilador puede inferir el tipo automáticamente.`,
      codigoInicial: `// Usa 'var' para declarar variables con inferencia de tipos
// 1. Variable 'numero' con valor 42

// 2. Variable 'texto' con valor "Hola Mundo"

// 3. Variable 'decimal' con valor 3.14

// 4. Variable 'activo' con valor true`,
      solucion: `var numero = 42;
var texto = "Hola Mundo";
var decimal = 3.14;
var activo = true;`,
      casosPrueba: JSON.stringify([
        {
          "input": "var numero = 42;\nvar texto = \"Hola Mundo\";\nvar decimal = 3.14;\nvar activo = true;",
          "expected": "var numero = 42;\nvar texto = \"Hola Mundo\";\nvar decimal = 3.14;\nvar activo = true;",
          "description": "Todas las variables con 'var' declaradas correctamente"
        }
      ]),
      pistas: JSON.stringify([
        {
          "texto": "La palabra clave 'var' permite al compilador inferir el tipo automáticamente",
          "orden": 1,
          "tipo": "conceptual"
        },
        {
          "texto": "Sintaxis: var nombreVariable = valor;",
          "orden": 2,
          "tipo": "sintaxis"
        },
        {
          "texto": "El compilador determina el tipo basándose en el valor asignado",
          "orden": 3,
          "tipo": "conceptual"
        },
        {
          "texto": "Ejemplo: var edad = 25; (inferirá int), var nombre = \"Juan\"; (inferirá string)",
          "orden": 4,
          "tipo": "ejemplo"
        }
      ]),
      recompensaXP: 20,
      ordenIndice: 2,
      nivelDificultad: 3
    };
    
    const response = await axios.post(`${BASE_URL}/exercises`, exerciseData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Ejercicio avanzado de código creado:', response.data);
    return response.data.data.ejercicioId;
  } catch (error) {
    console.log('❌ Error creando ejercicio avanzado:', error.response?.data || error.message);
    return null;
  }
}

async function testExercise(exerciseId) {
  console.log(`\n🧪 Probando ejercicio ID: ${exerciseId}`);
  
  try {
    // Obtener el ejercicio
    const getResponse = await axios.get(`${BASE_URL}/exercises/${exerciseId}`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('📋 Ejercicio obtenido:', getResponse.data.data.titulo);
    
    // Probar con solución correcta
    const submitResponse = await axios.post(`${BASE_URL}/exercises/${exerciseId}/submit`, {
      respuestaUsuario: getResponse.data.data.solucion,
      tiempoEjecucion: 5000
    }, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    
    console.log('✅ Resultado de prueba:', submitResponse.data);
    return true;
  } catch (error) {
    console.log('❌ Error probando ejercicio:', error.response?.data || error.message);
    return false;
  }
}

// ============================================
// FUNCIÓN PRINCIPAL
// ============================================

async function main() {
  console.log('🚀 Creando ejercicios de código sobre Variables y Tipos de Datos...\n');
  
  // 1. Autenticación
  const authSuccess = await loginUser();
  if (!authSuccess) {
    console.log('❌ No se pudo autenticar. Abortando.');
    return;
  }
  
  // 2. Crear ejercicio básico de código
  const basicExerciseId = await createCodeExercise();
  
  // 3. Crear ejercicio avanzado de código
  const advancedExerciseId = await createAdvancedCodeExercise();
  
  // 4. Probar los ejercicios creados
  if (basicExerciseId) {
    await testExercise(basicExerciseId);
  }
  
  if (advancedExerciseId) {
    await testExercise(advancedExerciseId);
  }
  
  console.log('\n✅ Ejercicios de código creados exitosamente!');
  console.log(`💻 Ejercicio básico ID: ${basicExerciseId}`);
  console.log(`💻 Ejercicio avanzado ID: ${advancedExerciseId}`);
  
  console.log('\n📚 RESUMEN DE EJERCICIOS CREADOS:');
  console.log('==================================');
  console.log('1. Declaración de Variables - Tipos Básicos');
  console.log('   - Variables int, decimal, string, bool');
  console.log('   - Sintaxis correcta de C#');
  console.log('   - XP: 15, Dificultad: 2/5');
  console.log('');
  console.log('2. Variables con Inferencia de Tipos (var)');
  console.log('   - Uso de la palabra clave var');
  console.log('   - Inferencia automática de tipos');
  console.log('   - XP: 20, Dificultad: 3/5');
}

// ============================================
// EJECUTAR
// ============================================

if (require.main === module) {
  main().catch(console.error);
}
