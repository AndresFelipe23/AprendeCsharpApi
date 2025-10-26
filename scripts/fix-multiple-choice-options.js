// ============================================
// Script para agregar opciones a ejercicios de opción múltiple
// ============================================

const sql = require('mssql');

const config = {
  user: 'andres',
  password: 'Soypipe23@',
  server: 'mssql-188335-0.cloudclusters.net',
  port: 13026,
  database: 'AprendeCsharp',
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
};

// Opciones para ejercicios de opción múltiple comunes
const exerciseOptionsData = [
  {
    // Ejercicio: ¿Qué es C#? o similar
    keywords: ['desarrolló', 'microsoft', 'quién'],
    options: [
      { texto: 'Google', esCorrecta: false, explicacion: 'Google no desarrolló C#', orden: 1 },
      { texto: 'Microsoft', esCorrecta: true, explicacion: 'C# fue desarrollado por Microsoft en 2000', orden: 2 },
      { texto: 'Apple', esCorrecta: false, explicacion: 'Apple no desarrolló C#', orden: 3 },
      { texto: 'Oracle', esCorrecta: false, explicacion: 'Oracle no desarrolló C#', orden: 4 },
    ]
  },
  {
    // Ejercicio: Tipo de dato para enteros
    keywords: ['entero', 'int', 'tipo de dato'],
    options: [
      { texto: 'int', esCorrecta: true, explicacion: 'int es el tipo de dato para números enteros en C#', orden: 1 },
      { texto: 'integer', esCorrecta: false, explicacion: 'En C# se usa "int", no "integer"', orden: 2 },
      { texto: 'number', esCorrecta: false, explicacion: 'C# no tiene un tipo "number"', orden: 3 },
      { texto: 'num', esCorrecta: false, explicacion: 'C# no tiene un tipo "num"', orden: 4 },
    ]
  },
  {
    // Ejercicio: Tipo de dato para texto
    keywords: ['texto', 'string', 'cadena'],
    options: [
      { texto: 'string', esCorrecta: true, explicacion: 'string es el tipo de dato para texto en C#', orden: 1 },
      { texto: 'text', esCorrecta: false, explicacion: 'C# no tiene un tipo "text"', orden: 2 },
      { texto: 'char', esCorrecta: false, explicacion: 'char es solo para un carácter', orden: 3 },
      { texto: 'str', esCorrecta: false, explicacion: 'C# no tiene un tipo "str"', orden: 4 },
    ]
  },
  {
    // Ejercicio: Método principal
    keywords: ['método principal', 'entry point', 'main'],
    options: [
      { texto: 'Main', esCorrecta: true, explicacion: 'Main es el punto de entrada de un programa C#', orden: 1 },
      { texto: 'Start', esCorrecta: false, explicacion: 'Start no es el método principal en C#', orden: 2 },
      { texto: 'Begin', esCorrecta: false, explicacion: 'Begin no es el método principal en C#', orden: 3 },
      { texto: 'Init', esCorrecta: false, explicacion: 'Init no es el método principal en C#', orden: 4 },
    ]
  },
  {
    // Ejercicio: Tipo de dato booleano
    keywords: ['booleano', 'bool', 'verdadero', 'falso'],
    options: [
      { texto: 'bool', esCorrecta: true, explicacion: 'bool es el tipo de dato para valores verdadero/falso', orden: 1 },
      { texto: 'boolean', esCorrecta: false, explicacion: 'En C# se usa "bool", no "boolean"', orden: 2 },
      { texto: 'bit', esCorrecta: false, explicacion: 'bit no es un tipo de dato en C#', orden: 3 },
      { texto: 'flag', esCorrecta: false, explicacion: 'flag no es un tipo de dato en C#', orden: 4 },
    ]
  }
];

async function findMultipleChoiceExercises() {
  try {
    console.log('🔍 Buscando ejercicios de opción múltiple...\n');

    const result = await sql.query`
      SELECT 
        e.EjercicioId,
        e.Titulo,
        e.Instrucciones,
        te.NombreTipo,
        COUNT(oe.OpcionId) as TotalOpciones
      FROM Ejercicios e
      INNER JOIN TiposEjercicio te ON e.TipoEjercicioId = te.TipoEjercicioId
      LEFT JOIN OpcionesEjercicio oe ON e.EjercicioId = oe.EjercicioId
      WHERE te.NombreTipo = 'OpcionMultiple'
      GROUP BY e.EjercicioId, e.Titulo, e.Instrucciones, te.NombreTipo
      ORDER BY e.EjercicioId
    `;

    console.log(`✅ Encontrados ${result.recordset.length} ejercicios de opción múltiple\n`);
    
    for (const ejercicio of result.recordset) {
      console.log(`📝 Ejercicio ID: ${ejercicio.EjercicioId}`);
      console.log(`   Título: ${ejercicio.Titulo}`);
      console.log(`   Instrucciones: ${ejercicio.Instrucciones.substring(0, 80)}...`);
      console.log(`   Opciones actuales: ${ejercicio.TotalOpciones}`);
      console.log('');
    }

    return result.recordset;
  } catch (err) {
    console.error('❌ Error buscando ejercicios:', err);
    throw err;
  }
}

async function addOptionsToExercise(ejercicioId, options) {
  try {
    console.log(`➕ Agregando ${options.length} opciones al ejercicio ${ejercicioId}...`);

    for (const option of options) {
      await sql.query`
        INSERT INTO OpcionesEjercicio (EjercicioId, TextoOpcion, EsCorrecta, Explicacion, OrdenIndice)
        VALUES (${ejercicioId}, ${option.texto}, ${option.esCorrecta}, ${option.explicacion}, ${option.orden})
      `;
      console.log(`   ✓ ${option.texto} ${option.esCorrecta ? '✅' : '❌'}`);
    }

    console.log(`✅ Opciones agregadas al ejercicio ${ejercicioId}\n`);
  } catch (err) {
    console.error(`❌ Error agregando opciones al ejercicio ${ejercicioId}:`, err);
    throw err;
  }
}

function findMatchingOptions(exercise) {
  const instruccionesLower = (exercise.Titulo + ' ' + exercise.Instrucciones).toLowerCase();
  
  for (const data of exerciseOptionsData) {
    if (data.keywords.some(keyword => instruccionesLower.includes(keyword.toLowerCase()))) {
      return data.options;
    }
  }
  
  // Opciones por defecto si no se encuentra coincidencia
  return [
    { texto: 'Opción A', esCorrecta: true, explicacion: 'Esta es la respuesta correcta', orden: 1 },
    { texto: 'Opción B', esCorrecta: false, explicacion: 'Esta opción es incorrecta', orden: 2 },
    { texto: 'Opción C', esCorrecta: false, explicacion: 'Esta opción es incorrecta', orden: 3 },
    { texto: 'Opción D', esCorrecta: false, explicacion: 'Esta opción es incorrecta', orden: 4 },
  ];
}

async function fixMultipleChoiceExercises() {
  try {
    console.log('🚀 Iniciando corrección de ejercicios de opción múltiple...\n');
    console.log('🔌 Conectando a la base de datos...');
    
    await sql.connect(config);
    console.log('✅ Conectado exitosamente\n');

    // Buscar ejercicios de opción múltiple
    const exercises = await findMultipleChoiceExercises();

    // Procesar cada ejercicio
    let fixed = 0;
    let skipped = 0;

    for (const exercise of exercises) {
      if (exercise.TotalOpciones === 0) {
        console.log(`🔧 Ejercicio ${exercise.EjercicioId} necesita opciones`);
        
        // Encontrar opciones apropiadas
        const options = findMatchingOptions(exercise);
        
        // Agregar opciones
        await addOptionsToExercise(exercise.EjercicioId, options);
        fixed++;
      } else {
        console.log(`✓ Ejercicio ${exercise.EjercicioId} ya tiene ${exercise.TotalOpciones} opciones\n`);
        skipped++;
      }
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✅ PROCESO COMPLETADO');
    console.log(`   Total ejercicios: ${exercises.length}`);
    console.log(`   Ejercicios corregidos: ${fixed}`);
    console.log(`   Ejercicios omitidos: ${skipped}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await sql.close();
  }
}

fixMultipleChoiceExercises();

