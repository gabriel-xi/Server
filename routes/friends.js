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

        // Controllo duplicati
        const duplicateCheck = await db.query(
            `SELECT * FROM FriendRequests 
            WHERE (sender_id = $1 AND receiver_id = $2) OR (sender_id = $2 AND receiver_id = $1)`,
            [sender_id, receiver_id]
        );

        if (duplicateCheck.rows.length > 0) {
            return res.status(400).json({ error: 'Richiesta già esistente o utenti già amici.' });
        }

        // Inserisci la richiesta di amicizia
        await db.query(
            'INSERT INTO FriendRequests (sender_id, receiver_id, status) VALUES ($1, $2, $3)',
            [sender_id, receiver_id, 'pending']
        );

        // Crea una notifica
        await db.query(
            'INSERT INTO Notifications (user_id, content) VALUES ($1, $2)',
            [receiver_id, `Hai ricevuto una richiesta di amicizia da user ${sender_id}`]
        );

        res.status(201).json({ success: 'Richiesta di amicizia inviata e notifica creata!' });
    } catch (err) {
        console.error('Errore nella creazione della richiesta:', err);
        res.status(500).json({ error: 'Errore nella creazione della richiesta.' });
    }
});

// Visualizzazione richieste di amicizia pendenti
router.get('/requests/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await db.query(
            `SELECT FriendRequests.id, Users.username AS senderUsername, FriendRequests.sent_at 
            FROM FriendRequests
            JOIN Users ON FriendRequests.sender_id = Users.id
            WHERE FriendRequests.receiver_id = $1 AND FriendRequests.status = 'pending'`,
            [userId]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Errore query SELECT (richieste):', err);
        res.status(500).json({ error: 'Errore nel recupero delle richieste.' });
    }
});

// Accetta o rifiuta una richiesta di amicizia
router.post('/respond', async (req, res) => {
    const { requestId, accept } = req.body;

    if (!requestId || typeof accept !== 'boolean') {
        return res.status(400).json({ error: 'Parametri non validi.' });
    }

    try {
        const requestResult = await db.query(
            `SELECT sender_id AS friendId, receiver_id AS userId
            FROM FriendRequests
            WHERE id = $1`,
            [requestId]
        );

        if (requestResult.rows.length === 0) {
            return res.status(404).json({ error: 'Richiesta non trovata.' });
        }

        const { userId, friendId } = requestResult.rows[0];
        const status = accept ? 'accepted' : 'declined';

        await db.query(
            'UPDATE FriendRequests SET status = $1 WHERE id = $2',
            [status, requestId]
        );

        if (accept) {
            await db.query(
                'INSERT INTO Friends (user_id, friend_id) VALUES ($1, $2)',
                [Math.min(userId, friendId), Math.max(userId, friendId)]
            );

            await db.query(
                'INSERT INTO Notifications (user_id, content) VALUES ($1, $2)',
                [friendId, 'La tua richiesta di amicizia è stata accettata!']
            );

            res.status(200).json({ success: 'Richiesta accettata, amici aggiunti e notifica inviata!' });
        } else {
            res.status(200).json({ success: 'Richiesta rifiutata.' });
        }
    } catch (err) {
        console.error('Errore nella gestione della risposta alla richiesta:', err);
        res.status(500).json({ error: 'Errore nella gestione della risposta alla richiesta.' });
    }
});

// Ottenere la lista degli amici
router.get('/list/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const result = await db.query(
            `SELECT u.id, u.username, f.created_at AS friendSince
            FROM Friends f
            JOIN Users u ON f.friend_id = u.id
            WHERE f.user_id = $1
            UNION
            SELECT u.id, u.username, f.created_at AS friendSince
            FROM Friends f
            JOIN Users u ON f.user_id = u.id
            WHERE f.friend_id = $1`,
            [userId]
        );

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Errore query SELECT amici:', err);
        res.status(500).json({ error: 'Errore nel caricamento degli amici.' });
    }
});

module.exports = router;
