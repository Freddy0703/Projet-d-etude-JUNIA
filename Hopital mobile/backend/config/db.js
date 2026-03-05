const mysql = require('mysql2/promise');
require('dotenv').config();

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hopital_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connexion
db.getConnection()
  .then(connection => {
    console.log('✅ Connexion MySQL établie');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Erreur connexion MySQL:', err.message);
  });

module.exports = db;