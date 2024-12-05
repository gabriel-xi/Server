const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

db.connect()
    .then(() => console.log('Connesso a PostgreSQL'))
    .catch(err => {
        console.error('Errore di connessione a PostgreSQL:', err);
        process.exit(1);
    });

module.exports = db; // Esporta l'istanza corretta
