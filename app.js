const express = require('express');
const { Server } = require('socket.io');
const http = require('http');
const cors = require('cors');
const path = require('path');
const { Pool } = require('pg');

require('dotenv').config();

const db = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    },
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', require('./routes/auth'));
app.use('/posts', require('./routes/posts'));
app.use('/friends', require('./routes/friends'));

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
