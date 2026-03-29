// DATABASE CONFIGURATION — SmartCare Healthcare System
const mongoose = require('mongoose');
require('dotenv').config();

let isConnected = false;

async function connectDB() {
  try {
    console.log('========================================');
    console.log('🚀 Connecting to Cosmos DB MongoDB...');
    console.log(`📡 Server: ${process.env.DB_SERVER}`);
    console.log(`🗄️  Database: ${process.env.DB_NAME}`);
    console.log(`👤 User: ${process.env.DB_USER}`);
    console.log('========================================');

    const uri = `mongodb://${process.env.DB_USER}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.DB_SERVER}:${process.env.DB_PORT}/${process.env.DB_NAME}?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000`;

    await mongoose.connect(uri);

    isConnected = true;
    console.log('✅ Connected to Cosmos DB MongoDB successfully!');
    console.log('========================================');
    return mongoose.connection;
  } catch (err) {
    console.error('❌ Database connection failed!');
    console.error(`   Error: ${err.message}`);
    throw err;
  }
}

async function healthCheck() {
  try {
    await mongoose.connection.db.admin().ping();
    return {
      status: 'healthy',
      host: process.env.DB_SERVER,
      database: process.env.DB_NAME,
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

async function closeDB() {
  if (isConnected) {
    await mongoose.connection.close();
    isConnected = false;
    console.log('📴 Database connection closed');
  }
}

function getDB() {
  if (!isConnected) {
    throw new Error('Database not connected. Call connectDB() first.');
  }
  return mongoose.connection;
}

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
  healthCheck,
  closeDB,
  getDB,
  mongoose,
};
