const mysql = require('mysql2/promise'); // ← Cambiar esta línea
require('dotenv').config();

// Configuración de conexión a la base de datos
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

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para probar la conexión
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

// Ejecutar test al cargar el módulo
testConnection();

module.exports = {
    pool,
    testConnection
};