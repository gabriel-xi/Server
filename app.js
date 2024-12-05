const express = require('express');
const http = require('http');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Configura middleware
app.use(cors({
    origin: 'https://feelingss.netlify.app/login', // Modifica in produzione con l'URL del frontend
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Importa le rotte
app.use('/auth', require('./auth'));
app.use('/posts', require('./posts'));
app.use('/friends', require('./friends'));

// Rotta base per test
app.get('/', (req, res) => {
    res.send('Server backend è operativo!');
});

// Configura porta per Render
const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server in esecuzione sulla porta ${PORT}`);
});
