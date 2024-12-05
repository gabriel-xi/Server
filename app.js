const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: 'https://feelingss.netlify.app', // URL del frontend su Netlify
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rotte
app.use('/auth', require('./auth')); // Rotte per autenticazione
app.use('/posts', require('./posts')); // Rotte per i post
app.use('/friends', require('./friends')); // Rotte per gestione amici
app.use('/profile', require('./profile')); // Rotte per gestione profili

// Reindirizzamento alla homepage del frontend
app.get('/', (req, res) => {
    res.redirect('https://feelingss.netlify.app/login');
});

// Porta per il server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
});

module.exports = app;
