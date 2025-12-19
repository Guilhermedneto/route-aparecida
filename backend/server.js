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
app.use(cors({
    origin: [
        'http://localhost:3000',
        'http://localhost:5173',
        'https://thankful-river-07f9f4f0f.3.azurestaticapps.net',
        'https://viagem-aparecida.z13.web.core.windows.net',
        'https://green-field-04aba1210.5.azurestaticapps.net'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '50mb' })); // Para suportar upload de imagens em base64
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/activities', activitiesRoutes);
app.use('/api/photos', photosRoutes);
app.use('/api/comments', commentsRoutes);

// Middleware de logging
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.get('origin')}`);
    next();
});

// Rota de health check
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'API funcionando',
        timestamp: new Date().toISOString(),
        env: process.env.NODE_ENV || 'development'
    });
});

// Rota raiz
app.get('/', (req, res) => {
    res.json({ 
        message: 'API Viagem Aparecida',
        status: 'running',
        endpoints: ['/health', '/api/auth', '/api/activities', '/api/photos', '/api/comments']
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`[SERVER] Servidor rodando na porta ${PORT}`);
    console.log(`[SERVER] Ambiente: ${process.env.NODE_ENV || 'development'}`);
});
