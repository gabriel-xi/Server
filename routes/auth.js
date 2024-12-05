const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');
const router = express.Router();

// Registrazione
router.post('/register', async (req, res) => {
    const { username, nome, cognome, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.query(
            'INSERT INTO Users (username, nome, cognome, email, passw) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [username, nome, cognome, email, hashedPassword]
        );
        res.status(201).json({ userId: result.rows[0].id });
    } catch (err) {
        console.error('Errore durante la registrazione:', err);
        res.status(500).json({ error: 'Errore interno del server.' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await db.query('SELECT * FROM Users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenziali non valide.' });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.passw);

        if (!isMatch) {
            return res.status(401).json({ error: 'Credenziali non valide.' });
        }

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
