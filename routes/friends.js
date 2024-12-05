const express = require('express');
const db = require('../db'); // Importa la connessione al database

const router = express.Router();

// Invia una richiesta di amicizia
router.post('/request', async (req, res) => {
    const { sender_id, recipientUsername } = req.body;

    if (!sender_id || !recipientUsername) {
        return res.status(400).json({ error: 'I campi sender_id e recipientUsername sono obbligatori.' });
    }

    try {
        const userResult = await db.query('SELECT id FROM Users WHERE username = $1', [recipientUsername]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'Utente destinatario non trovato.' });
        }

        const receiver_id = userResult.rows[0].id;

        const duplicateCheck = await db.query(
            `SELECT * FROM FriendRequests 
            WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)`,
            [sender_id, receiver_id]
        );

        if (duplicateCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Richiesta già esistente o utenti già amici.' });
        }

        await db.query(
            'INSERT INTO FriendRequests (sender_id, receiver_id, status) VALUES ($1, $2, $3)',
            [sender_id, receiver_id, 'pending']
        );
        res.status(201).json({ success: 'Richiesta di amicizia inviata.' });
    } catch (err) {
        console.error('Errore nella creazione della richiesta:', err);
        res.status(500).json({ error: 'Errore nella creazione della richiesta.' });
    }
});

// Ottieni la lista degli amici
router.get('/list/:userId', async (req, res) => {
    const { userId } = req.params;

    const query = `
        SELECT u.id, u.username, f.created_at AS friendSince
        FROM Friends f
        JOIN Users u ON f.friend_id = u.id
        WHERE f.user_id = $1
        UNION
        SELECT u.id, u.username, f.created_at AS friendSince
        FROM Friends f
        JOIN Users u ON f.user_id = u.id
        WHERE f.friend_id = $1
    `;

    try {
        const result = await db.query(query, [userId]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Errore query SELECT amici:', err);
        res.status(500).json({ error: 'Errore nel caricamento degli amici.' });
    }
});

module.exports = router;
