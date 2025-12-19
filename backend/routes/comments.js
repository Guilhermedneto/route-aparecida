const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Adicionar comentário a uma atividade
router.post('/', async (req, res) => {
    try {
        const { activity_id, comment_text } = req.body;
        const { nickname } = req.user;

        if (!activity_id || !comment_text) {
            return res.status(400).json({ error: 'ID da atividade e comentário são obrigatórios' });
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('activity_id', sql.Int, activity_id)
            .input('comment_text', sql.NVarChar, comment_text)
            .input('author', sql.NVarChar, nickname)
            .query(`
                INSERT INTO comments (activity_id, comment_text, author)
                OUTPUT INSERTED.*
                VALUES (@activity_id, @comment_text, @author)
            `);

        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        res.status(500).json({ error: 'Erro ao adicionar comentário' });
    }
});

// Deletar comentário
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();

        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM comments WHERE id = @id');

        res.json({ message: 'Comentário deletado com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar comentário:', error);
        res.status(500).json({ error: 'Erro ao deletar comentário' });
    }
});

module.exports = router;
