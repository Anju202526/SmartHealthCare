// DATABASE CONFIGURATION — SmartCare Healthcare System
const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 1433,
  options: {
    encrypt: true,
    trustServerCertificate: false,
    enableArithAbort: true,
    connectTimeout: 30000,
    requestTimeout: 30000,
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
    acquireTimeoutMillis: 30000,
    evictionRunIntervalMillis: 10000,
  },
};

let pool = null;
let connectionAttempts = 0;
const MAX_RETRY_ATTEMPTS = 3;

async function connectDB() {
  try {
    console.log('========================================');
    console.log('🚀 Connecting to Azure SQL Database...');
    console.log(`📡 Server: ${dbConfig.server}`);
    console.log(`🗄️  Database: ${dbConfig.database}`);
    console.log(`👤 User: ${dbConfig.user}`);
    console.log('========================================');

    pool = await sql.connect(dbConfig);

    console.log('✅ Connected to Azure SQL Database successfully!');

    connectionAttempts = 0;

    const testResult = await pool
      .request()
      .query('SELECT GETUTCDATE() AS ServerTime');
    console.log(`🕐 Server time: ${testResult.recordset[0].ServerTime}`);
    console.log('========================================');

    return pool;
  } catch (err) {
    connectionAttempts++;
    console.error('❌ Database connection failed!');
    console.error(`   Attempt: ${connectionAttempts} of ${MAX_RETRY_ATTEMPTS}`);
    console.error(`   Error: ${err.message}`);

    if (connectionAttempts < MAX_RETRY_ATTEMPTS) {
      console.log(`🔄 Retrying in 5 seconds...`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      return connectDB();
    }

    throw new Error(
      `Unable to connect to database after ${MAX_RETRY_ATTEMPTS} attempts: ${err.message}`
    );
  }
}

function getPool() {
  if (!pool) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return pool;
}

function isConnected() {
  return pool !== null && pool.connected;
}

async function closeDB() {
  if (pool) {
    try {
      await pool.close();
      console.log('📴 Database connection closed');
      pool = null;
    } catch (err) {
      console.error('Error closing database connection:', err);
    }
  }
}

async function healthCheck() {
  if (!pool) {
    return {
      status: 'disconnected',
      message: 'Database connection pool not initialized',
    };
  }
  try {
    const result = await pool
      .request()
      .query('SELECT GETUTCDATE() AS current_time, 1 AS test');
    return {
      status: 'healthy',
      serverTime: result.recordset[0].current_time,
      timestamp: new Date().toISOString(),
    };
  } catch (err) {
    return {
      status: 'unhealthy',
      error: err.message,
      timestamp: new Date().toISOString(),
    };
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 SIGINT received. Closing DB...');
  await closeDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received. Closing DB...');
  await closeDB();
  process.exit(0);
});

module.exports = {
  connectDB,
  getPool,
  closeDB,
  isConnected,
  healthCheck,
  sql,
  dbConfig,
};
