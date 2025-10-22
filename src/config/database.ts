// ============================================
// CONFIG/DATABASE.TS - Conexión SQL Server
// ============================================

import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
  user: process.env['DB_USER'] || 'sa',
  password: process.env['DB_PASSWORD'] || 'password',
  server: process.env['DB_SERVER'] || 'localhost',
  port: parseInt(process.env['DB_PORT'] || '1433'),
  database: process.env['DB_DATABASE'] || 'AprendeCsharp',
  options: {
    encrypt: process.env['NODE_ENV'] === 'production',
    trustServerCertificate: process.env['NODE_ENV'] !== 'production',
    enableArithAbort: true,
    cryptoCredentialsDetails: {
      minVersion: 'TLSv1'
    },
    // Configuración específica para Vercel/serverless
    requestTimeout: 30000,
    connectionTimeout: 30000,
  },
  pool: {
    max: 5, // Reducido para serverless
    min: 0,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool;

export const connectDB = async (): Promise<void> => {
  try {
    console.log('🔄 Attempting to connect to SQL Server...');
    console.log('📊 Config:', {
      server: config.server,
      database: config.database,
      user: config.user,
      port: config.port,
      encrypt: config.options.encrypt
    });
    
    pool = await sql.connect(config);
    console.log('✅ Connected to SQL Server successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.error('🔍 Error details:', {
      message: error.message,
      code: error.code,
      stack: error.stack
    });
    
    // En Vercel, no hacer process.exit(1) para evitar crashes
    if (process.env['NODE_ENV'] !== 'production') {
      process.exit(1);
    }
    
    throw error;
  }
};

export const getPool = (): sql.ConnectionPool => {
  if (!pool) {
    console.error('❌ Database pool not initialized');
    throw new Error('Database not initialized. Call connectDB() first.');
  }
  
  if (!pool.connected) {
    console.warn('⚠️ Database pool is not connected, attempting to reconnect...');
    return pool;
  }
  
  return pool;
};

export { sql };