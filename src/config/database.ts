// ============================================
// CONFIG/DATABASE.TS - Conexión SQL Server
// ============================================

import sql from 'mssql';
import dotenv from 'dotenv';

dotenv.config();

const config: sql.config = {
  user: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  server: process.env.DB_SERVER!,
  port: parseInt(process.env.DB_PORT || '1433'),
  database: process.env.DB_DATABASE!,
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
    cryptoCredentialsDetails: {
      minVersion: 'TLSv1'
    }
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

let pool: sql.ConnectionPool;

export const connectDB = async (): Promise<void> => {
  try {
    pool = await sql.connect(config);
    console.log('✅ Connected to SQL Server');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

export const getPool = (): sql.ConnectionPool => {
  if (!pool) {
    throw new Error('Database not initialized');
  }
  return pool;
};

export { sql };