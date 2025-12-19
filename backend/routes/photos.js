const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

router.use(authenticateToken);

// Adicionar foto a uma atividade
router.post('/', async (req, res) => {
    try {
        const { activity_id, photo_data, caption } = req.body;
        const { nickname } = req.user;

        if (!activity_id || !photo_data) {
            return res.status(400).json({ error: 'ID da atividade e foto são obrigatórios' });
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('activity_id', sql.Int, activity_id)
            .input('photo_data', sql.NVarChar(sql.MAX), photo_data)
            .input('caption', sql.NVarChar, caption || null)
            .input('uploaded_by', sql.NVarChar, nickname)
            .query(`
                INSERT INTO photos (activity_id, photo_data, caption, uploaded_by)
                OUTPUT INSERTED.*
                VALUES (@activity_id, @photo_data, @caption, @uploaded_by)
            `);

        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error('Erro ao adicionar foto:', error);
        res.status(500).json({ error: 'Erro ao adicionar foto' });
    }
});

// Listar todas as fotos (galeria)
router.get('/gallery', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT
                    p.*,
                    a.title as activity_title,
                    a.activity_date
                FROM photos p
                INNER JOIN activities a ON p.activity_id = a.id
                ORDER BY p.created_at DESC
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error('Erro ao buscar galeria:', error);
        res.status(500).json({ error: 'Erro ao buscar galeria' });
    }
});

// Deletar foto
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();

        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM photos WHERE id = @id');

        res.json({ message: 'Foto deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar foto:', error);
        res.status(500).json({ error: 'Erro ao deletar foto' });
    }
});

module.exports = router;
