const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración desde .env
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
};

// Crear el pool
const pool = mysql.createPool(dbConfig);

// Probar conexión al cargar
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión a base de datos exitosa');
    connection.release();
    return true;
  } catch (err) {
    console.error('❌ Error conectando a la base de datos:', err.message);
    return false;
  }
};

testConnection();

module.exports = { pool, testConnection }; // ← Exportar como objeto
