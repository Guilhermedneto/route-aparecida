const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getConnection, sql } = require('../config/database');

// Login
router.post('/login', async (req, res) => {
    try {
        const { username, password, nickname } = req.body;

        console.log('[LOGIN] Tentativa de login:', { username, nickname });

        if (!username || !password || !nickname) {
            return res.status(400).json({ error: 'Usuário, senha e apelido são obrigatórios' });
        }

        const pool = await getConnection();

        // Verificar credenciais
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query('SELECT * FROM auth WHERE username = @username');

        if (result.recordset.length === 0) {
            console.log('[LOGIN] ERRO: Usuário não encontrado');
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        const user = result.recordset[0];
        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            console.log('[LOGIN] ERRO: Senha inválida');
            return res.status(401).json({ error: 'Credenciais inválidas' });
        }

        // Registrar sessão do usuário
        await pool.request()
            .input('nickname', sql.NVarChar, nickname)
            .query('INSERT INTO user_sessions (nickname) VALUES (@nickname)');

        // Gerar token
        const token = jwt.sign(
            { username: user.username, nickname: nickname },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        console.log('[LOGIN] Sucesso:', nickname);

        res.json({
            token,
            nickname,
            message: 'Login realizado com sucesso'
        });

    } catch (error) {
        console.error('[LOGIN] ERRO:', error);
        console.error('[LOGIN] Detalhes:', error.message);
        res.status(500).json({ error: 'Erro ao realizar login', details: error.message });
    }
});

module.exports = router;
