const express = require('express');
const http = require('http');
const cors = require('cors');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
    origin: 'https://feelingss.netlify.app', // Modifica con il tuo URL Netlify
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Importa rotte
app.use('/auth', require('./auth')); // Rotte per autenticazione
app.use('/posts', require('./posts')); // Rotte per gestione post
app.use('/friends', require('./friends')); // Rotte per amici

// Rotta base
app.get('/', (req, res) => {
    res.send('Backend operativo!');
});

// Porta per il server
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
});
