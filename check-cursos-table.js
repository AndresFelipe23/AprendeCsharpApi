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
    enableArithAbort: true
  }
};

(async () => {
  try {
    console.log('Conectando a la base de datos...\n');
    await sql.connect(config);

    const result = await sql.query`
      SELECT COLUMN_NAME, DATA_TYPE
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'Cursos'
      ORDER BY ORDINAL_POSITION
    `;

    console.log('====================================');
    console.log('   COLUMNAS DE LA TABLA CURSOS');
    console.log('====================================\n');

    if (result.recordset.length === 0) {
      console.log('⚠️  La tabla Cursos no existe!\n');
    } else {
      result.recordset.forEach(r => {
        console.log(`  ✓ ${r.COLUMN_NAME} (${r.DATA_TYPE})`);
      });
      console.log('\n====================================\n');
    }

    await sql.close();
  } catch (err) {
    console.error('\n❌ Error:', err.message);
  }
})();
