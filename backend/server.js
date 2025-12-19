const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const activitiesRoutes = require('./routes/activities');
const photosRoutes = require('./routes/photos');
const commentsRoutes = require('./routes/comments');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Para suportar upload de imagens em base64
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/photos', photosRoutes);
app.use('/api/comments', commentsRoutes);

// Rota de health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'API funcionando' });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`[SERVER] Servidor rodando na porta ${PORT}`);
});
