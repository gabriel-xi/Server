const { Pool } = require('pg');
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');

const app = express();
const server = http.createServer(app);

// Configurazione CORS più sicura per la produzione
const corsOptions = {
    origin: 'https://feelingss.netlify.app', // Sostituisci con l'URL del tuo frontend effettivo
    methods: ["GET", "POST"], // Metodi HTTP permessi
    allowedHeaders: ["Content-Type", "Authorization"], // Headers permessi nelle richieste
    credentials: true, // Consenti l'invio di cookie e header di autenticazione
    optionsSuccessStatus: 200 // Per browser legacy
};
app.use(cors(corsOptions));

// Parsing JSON per le richieste
app.use(express.json());

// Servire file statici dalla cartella 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Socket.IO Configuration
const io = new Server(server, { cors: corsOptions });
io.on('connection', (socket) => {
    console.log(`Utente connesso: ${socket.id}`);
    socket.on('sendMessage', (data) => {
        console.log('Messaggio ricevuto:', data);
        io.emit('receiveMessage', data);
    });
    socket.on('disconnect', () => {
        console.log(`Utente disconnesso: ${socket.id}`);
    });
});

// Route per la radice, reindirizza alla pagina di login
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Definizione delle route per le API
app.use('/auth', require('./routes/auth'));
app.use('/posts', require('./routes/posts'));
app.use('/friends', require('./routes/friends'));
app.use('/profile', require('./routes/profile'));

// Avvio del server sulla porta definita
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
});

// Esporta il modulo per eventuali test o uso esterno
module.exports = { app, server };
