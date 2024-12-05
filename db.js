const { Pool } = require('pg');
require('dotenv').config();

// Configura il pool PostgreSQL
const db = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

// Testa la connessione
db.connect()
    .then(() => console.log('Connesso a PostgreSQL'))
    .catch((err) => {
        console.error('Errore connessione:', err);
        process.exit(1); // Termina il processo in caso di errore
    });

module.exports = db;