const express = require('express');
const db = require('../db');
const router = express.Router();

router.post('/', async (req, res) => {
    const { id_user, sentimento, note } = req.body;

    if (!id_user || !sentimento) {
        return res.status(400).json({ error: 'I campi id_user e sentimento sono obbligatori.' });
    }

    try {
        const result = await db.query(
            'INSERT INTO Post (id_user, sentimento, note, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id',
            [id_user, sentimento, note || null]
        );
        res.status(201).json({ success: true, postId: result.rows[0].id });
    } catch (err) {
        console.error('Errore query INSERT:', err);
        res.status(500).json({ error: 'Errore nella creazione del post.' });
    }
});

router.get('/', async (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ error: 'userId è obbligatorio.' });
    }

    try {
        const result = await db.query(
            'SELECT * FROM Post WHERE id_user = $1 ORDER BY created_at DESC',
            [userId]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Errore query SELECT:', err);
        res.status(500).json({ error: 'Errore nel recupero dei post.' });
    }
});

module.exports = router;
