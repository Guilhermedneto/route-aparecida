const express = require('express');
const router = express.Router();
const { getConnection, sql } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

// Todas as rotas requerem autenticação
router.use(authenticateToken);

// Listar todas as atividades
router.get('/', async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request()
            .query(`
                SELECT
                    a.id, a.title, a.location, a.activity_date, a.activity_time,
                    a.completed, a.completed_by, a.completed_at,
                    a.created_by, a.created_at, a.updated_at,
                    ISNULL(p.photo_count, 0) as photo_count,
                    ISNULL(c.comment_count, 0) as comment_count
                FROM activities a
                LEFT JOIN (
                    SELECT activity_id, COUNT(*) as photo_count
                    FROM photos
                    GROUP BY activity_id
                ) p ON a.id = p.activity_id
                LEFT JOIN (
                    SELECT activity_id, COUNT(*) as comment_count
                    FROM comments
                    GROUP BY activity_id
                ) c ON a.id = c.activity_id
                ORDER BY a.activity_date, a.activity_time
            `);

        res.json(result.recordset);
    } catch (error) {
        console.error('Erro ao buscar atividades:', error);
        res.status(500).json({ error: 'Erro ao buscar atividades' });
    }
});

// Buscar atividade específica com fotos e comentários
router.get('/:id', async (req, res) => {
    try {
        const pool = await getConnection();
        const { id } = req.params;

        // Buscar atividade
        const activity = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT * FROM activities WHERE id = @id');

        if (activity.recordset.length === 0) {
            return res.status(404).json({ error: 'Atividade não encontrada' });
        }

        // Buscar fotos
        const photos = await pool.request()
            .input('activity_id', sql.Int, id)
            .query('SELECT * FROM photos WHERE activity_id = @activity_id ORDER BY created_at DESC');

        // Buscar comentários
        const comments = await pool.request()
            .input('activity_id', sql.Int, id)
            .query('SELECT * FROM comments WHERE activity_id = @activity_id ORDER BY created_at ASC');

        res.json({
            ...activity.recordset[0],
            photos: photos.recordset,
            comments: comments.recordset
        });
    } catch (error) {
        console.error('Erro ao buscar atividade:', error);
        res.status(500).json({ error: 'Erro ao buscar atividade' });
    }
});

// Criar nova atividade
router.post('/', async (req, res) => {
    try {
        const { title, location, activity_date, activity_time } = req.body;
        const { nickname } = req.user;

        console.log('[ACTIVITY] Criando atividade:', { title, location, activity_date, activity_time, nickname });

        if (!title || !activity_date) {
            return res.status(400).json({ error: 'Título e data são obrigatórios' });
        }

        // Converter formato de hora HH:mm para HH:mm:ss
        let formattedTime = null;
        if (activity_time) {
            formattedTime = activity_time.length === 5 ? `${activity_time}:00` : activity_time;
            console.log('[ACTIVITY] Hora convertida:', activity_time, '->', formattedTime);
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('title', sql.NVarChar, title)
            .input('location', sql.NVarChar, location || null)
            .input('activity_date', sql.Date, activity_date)
            .input('activity_time', sql.VarChar, formattedTime)
            .input('created_by', sql.NVarChar, nickname)
            .query(`
                INSERT INTO activities (title, location, activity_date, activity_time, created_by)
                OUTPUT INSERTED.*
                VALUES (@title, @location, @activity_date, CAST(@activity_time AS TIME), @created_by)
            `);

        console.log('[ACTIVITY] Criada com sucesso:', result.recordset[0]);
        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error('[ACTIVITY] ERRO ao criar:', error);
        console.error('[ACTIVITY] Detalhes:', error.message);
        res.status(500).json({ error: 'Erro ao criar atividade', details: error.message });
    }
});

// Atualizar atividade
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, location, activity_date, activity_time } = req.body;

        // Converter formato de hora HH:mm para HH:mm:ss
        let formattedTime = null;
        if (activity_time) {
            formattedTime = activity_time.length === 5 ? `${activity_time}:00` : activity_time;
        }

        const pool = await getConnection();
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('title', sql.NVarChar, title)
            .input('location', sql.NVarChar, location || null)
            .input('activity_date', sql.Date, activity_date)
            .input('activity_time', sql.VarChar, formattedTime)
            .query(`
                UPDATE activities
                SET title = @title,
                    location = @location,
                    activity_date = @activity_date,
                    activity_time = CAST(@activity_time AS TIME),
                    updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        if (result.recordset.length === 0) {
            return res.status(404).json({ error: 'Atividade não encontrada' });
        }

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Erro ao atualizar atividade:', error);
        res.status(500).json({ error: 'Erro ao atualizar atividade' });
    }
});

// Marcar como realizada/não realizada
router.patch('/:id/toggle-complete', async (req, res) => {
    try {
        const { id } = req.params;
        const { nickname } = req.user;

        const pool = await getConnection();

        // Verificar estado atual
        const current = await pool.request()
            .input('id', sql.Int, id)
            .query('SELECT completed FROM activities WHERE id = @id');

        if (current.recordset.length === 0) {
            return res.status(404).json({ error: 'Atividade não encontrada' });
        }

        const isCompleted = current.recordset[0].completed;

        // Toggle
        const result = await pool.request()
            .input('id', sql.Int, id)
            .input('completed', sql.Bit, !isCompleted)
            .input('completed_by', sql.NVarChar, !isCompleted ? nickname : null)
            .query(`
                UPDATE activities
                SET completed = @completed,
                    completed_by = @completed_by,
                    completed_at = ${!isCompleted ? 'GETDATE()' : 'NULL'},
                    updated_at = GETDATE()
                OUTPUT INSERTED.*
                WHERE id = @id
            `);

        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Erro ao marcar atividade:', error);
        res.status(500).json({ error: 'Erro ao marcar atividade' });
    }
});

// Deletar atividade
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const pool = await getConnection();

        await pool.request()
            .input('id', sql.Int, id)
            .query('DELETE FROM activities WHERE id = @id');

        res.json({ message: 'Atividade deletada com sucesso' });
    } catch (error) {
        console.error('Erro ao deletar atividade:', error);
        res.status(500).json({ error: 'Erro ao deletar atividade' });
    }
});

module.exports = router;
