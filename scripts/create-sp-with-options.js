const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos
const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'Soypipe23@',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'AprendeCsharp',
  options: {
    encrypt: false,
    trustServerCertificate: true
  }
};

async function createStoredProcedure() {
  try {
    console.log('🔌 Conectando a la base de datos...');
    await sql.connect(config);
    console.log('✅ Conectado a la base de datos');

    // Leer el archivo SQL
    const sqlFile = path.join(__dirname, 'create-sp-with-options.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    console.log('📝 Ejecutando stored procedure...');
    
    // Ejecutar el SQL
    const result = await sql.query(sqlContent);
    
    console.log('✅ Stored procedure creado exitosamente');
    console.log('📊 Resultados:', result);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await sql.close();
    console.log('🔌 Conexión cerrada');
  }
}

// Ejecutar
createStoredProcedure();
