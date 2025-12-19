-- Tabela de autenticação (login único compartilhado)
CREATE TABLE auth (
    id INT PRIMARY KEY IDENTITY(1,1),
    username NVARCHAR(50) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

-- Tabela de sessões de usuários (quem está usando)
CREATE TABLE user_sessions (
    id INT PRIMARY KEY IDENTITY(1,1),
    nickname NVARCHAR(100) NOT NULL,
    last_active DATETIME DEFAULT GETDATE(),
    created_at DATETIME DEFAULT GETDATE()
);

-- Tabela de atividades
CREATE TABLE activities (
    id INT PRIMARY KEY IDENTITY(1,1),
    title NVARCHAR(255) NOT NULL,
    location NVARCHAR(255),
    activity_date DATE NOT NULL,
    activity_time TIME,
    completed BIT DEFAULT 0,
    completed_by NVARCHAR(100),
    completed_at DATETIME,
    created_by NVARCHAR(100),
    created_at DATETIME DEFAULT GETDATE(),
    updated_at DATETIME DEFAULT GETDATE()
);

-- Tabela de fotos das atividades
CREATE TABLE photos (
    id INT PRIMARY KEY IDENTITY(1,1),
    activity_id INT NOT NULL,
    photo_data NVARCHAR(MAX), -- Base64 ou URL do Azure Blob
    caption NVARCHAR(500),
    uploaded_by NVARCHAR(100),
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

-- Tabela de comentários das atividades
CREATE TABLE comments (
    id INT PRIMARY KEY IDENTITY(1,1),
    activity_id INT NOT NULL,
    comment_text NVARCHAR(1000) NOT NULL,
    author NVARCHAR(100) NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
);

-- Inserir credencial padrão (senha: aparecida2025)
-- Hash bcrypt para 'aparecida2025'
INSERT INTO auth (username, password_hash)
VALUES ('viagem', '$2b$10$jYc2G2n6tKPu3Kr7jzoLTejIXb/GNwFJ/iUu06k2XC0sHL/X1SlX6');
