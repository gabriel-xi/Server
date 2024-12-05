const { Pool } = require('pg');
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

// Connessione al database PostgreSQL
const db = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

db.connect()
    .then(() => console.log('Connesso a PostgreSQL'))
    .catch((err) => {
        console.error('Errore connessione:', err);
        process.exit(1); // Termina il processo in caso di errore
    });

// Configurazione del server Express
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'https://feelingss.netlify.app', // Consenti richieste da tutte le origini (modifica per sicurezza in produzione)
    },
});

// Middleware
app.use(express.json()); // Per parsing JSON
app.use(cors()); // Abilita il CORS per tutte le origini
app.use(express.static(path.join(__dirname, './public')));

// Route per la radice
// Route per la radice
app.get('/', (req, res) => {
    res.redirect('https://feelingss.netlify.app/login');
});

// Rotte API
app.use('/auth', require('./routes/auth')); // Rotte per autenticazione
app.use('/posts', require('./routes/posts')); // Rotte per i post
app.use('/friends', require('./routes/friends')); // Rotte per la gestione amici
app.use('/profile', require('./routes/profile')); // Rotte per la gestione amici

// Socket.IO per messaggi in tempo reale
io.on('connection', (socket) => {
    console.log(`Utente connesso: ${socket.id}`);

    socket.on('sendMessage', (data) => {
        console.log('Messaggio ricevuto:', data);
        io.emit('receiveMessage', data); // Trasmette il messaggio a tutti
    });

    socket.on('disconnect', () => {
        console.log(`Utente disconnesso: ${socket.id}`);
    });
});

// Porta su cui avviare il server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server in esecuzione sulla porta ${PORT}`));

// Esporta il database per l'utilizzo nelle rotte
module.exports = db;
