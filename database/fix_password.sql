-- Script para corrigir a senha do usuário 'viagem'
-- Executar este script se você já criou as tabelas com o hash errado

-- Opção 1: Atualizar o hash da senha existente
UPDATE auth
SET password_hash = '$2b$10$jYc2G2n6tKPu3Kr7jzoLTejIXb/GNwFJ/iUu06k2XC0sHL/X1SlX6'
WHERE username = 'viagem';

-- Opção 2: Deletar e inserir novamente (caso a atualização não funcione)
-- DELETE FROM auth WHERE username = 'viagem';
-- INSERT INTO auth (username, password_hash)
-- VALUES ('viagem', '$2b$10$jYc2G2n6tKPu3Kr7jzoLTejIXb/GNwFJ/iUu06k2XC0sHL/X1SlX6');

-- Verificar se foi atualizado
SELECT username, created_at FROM auth WHERE username = 'viagem';
