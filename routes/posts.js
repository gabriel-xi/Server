const express = require('express');
const db = require('./db');

const router = express.Router();

// Crea un nuovo post
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


// Ottieni tutti i post
router.get('/', async (req, res) => {
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ error: 'userId è obbligatorio.' });
    }

    const query = `
        SELECT 
            Post.id, 
            Post.id_user,
            Post.sentimento, 
            Post.note, 
            Post.reazioni,
            Post.commenti,
            Users.username, 
            Post.created_at   
        FROM Post
        JOIN Users ON Post.id_user = Users.id
        WHERE Post.id_user = $1 OR Post.id_user IN (
            SELECT friend_id FROM Friends WHERE user_id = $2
        )
        ORDER BY Post.created_at DESC
    `;

    try {
        const result = await db.query(query, [userId, userId]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Errore query SELECT:', err);
        res.status(500).json({ error: 'Errore nel recupero dei post.' });
    }
});

// Elimina un post
router.delete('/:id', async (req, res) => {
    const postId = req.params.id;
    const userId = req.query.userId;

    if (!userId) {
        return res.status(400).json({ error: 'userId è obbligatorio.' });
    }

    try {
        const result = await db.query(
            'DELETE FROM Post WHERE id = $1 AND id_user = $2 RETURNING id',
            [postId, userId]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ error: 'Post non trovato o non autorizzato.' });
        }

        res.status(200).json({ success: true });
    } catch (err) {
        console.error('Errore nella cancellazione del post:', err);
        res.status(500).json({ error: 'Errore interno del server.' });
    }
});


router.post('/:id/reazioni', async (req, res) => {
    const postId = req.params.id;
    const action = req.body.action;

    try {
        // Recupera il numero attuale di reazioni
        const result = await db.query('SELECT reazioni FROM Post WHERE id = $1', [postId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Post non trovato.' });
        }

        const currentReactions = result.rows[0].reazioni || 0;

        // Calcola il nuovo valore delle reazioni
        const newReactions = action === 'like' ? currentReactions + 1 : Math.max(currentReactions - 1, 0);

        // Aggiorna il valore delle reazioni nel database
        await db.query('UPDATE Post SET reazioni = $1 WHERE id = $2', [newReactions, postId]);

        res.status(200).json({ success: true, reazioni: newReactions });
    } catch (err) {
        console.error('Errore nell\'aggiornamento delle reazioni:', err);
        res.status(500).json({ error: 'Errore nell\'aggiornamento delle reazioni.' });
    }
});

module.exports = router;
