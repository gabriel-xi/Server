// Login
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const router = express.Router();

// Registrazione
router.post('/register', async (req, res) => {
    const { username, nome, cognome, email, password, user_type } = req.body;

    try {
        const checkUser = await db.query(
            'SELECT * FROM Users WHERE email = $1 OR username = $2',
            [email, username]
        );

        if (checkUser.rows.length > 0) {
            return res.status(400).json({ error: 'Email o username già registrati.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const userType = user_type || 1;

        await db.query(
            'INSERT INTO Users (username, nome, cognome, email, passw, user_type) VALUES ($1, $2, $3, $4, $5, $6)',
            [username, nome, cognome, email, hashedPassword, userType]
        );

        res.status(201).json({ success: 'Utente creato!' });
    } catch (err) {
        console.error('Errore durante la registrazione:', err);
        res.status(500).json({ error: 'Errore durante la registrazione.' });
    }
});


// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Email o password non validi.' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.passw);

        if (!isMatch) {
            return res.status(401).json({ error: 'Email o password non validi.' });
        }

        // Genera un token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.status(200).json({ user, token });
    } catch (err) {
        console.error('Errore durante il login:', err);
        res.status(500).json({ error: 'Errore interno del server.' });
    }
});

module.exports = router;
