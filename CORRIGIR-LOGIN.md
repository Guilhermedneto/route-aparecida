# ⚠️ Corrigir Problema de Login

## Problema
Aparece "Credenciais inválidas" ao tentar fazer login com `viagem` / `aparecida2025`

## Causa
O hash da senha no SQL estava incorreto.

## ✅ Solução

### Se você AINDA NÃO executou o SQL:

1. Use o arquivo atualizado: [database/create_tables.sql](database/create_tables.sql)
2. O hash já foi corrigido!
3. Execute no Portal Azure Query Editor

### Se você JÁ executou o SQL antigo:

**Opção A - Corrigir a senha (RECOMENDADO):**

1. Acesse Portal Azure > SQL databases > sistemahorariodb
2. Abra Query editor
3. Login: `adminuser` / `SenhaForte!2025`
4. Execute este comando:

```sql
UPDATE auth
SET password_hash = '$2b$10$jYc2G2n6tKPu3Kr7jzoLTejIXb/GNwFJ/iUu06k2XC0sHL/X1SlX6'
WHERE username = 'viagem';
```

5. Pronto! Agora tente fazer login novamente.

**Opção B - Usar o script pronto:**

1. Abra o arquivo: [database/fix_password.sql](database/fix_password.sql)
2. Copie todo o conteúdo
3. Cole no Query Editor do Portal Azure
4. Execute

## Credenciais Corretas

- **Usuário:** `viagem`
- **Senha:** `aparecida2025`
- **Apelido:** Digite seu nome (ex: João, Maria)

## Verificar se funcionou

Depois de corrigir, execute no Query Editor:

```sql
SELECT username, created_at FROM auth WHERE username = 'viagem';
```

Deve retornar 1 linha com o usuário 'viagem'.

## Hash Correto

O hash bcrypt correto para a senha `aparecida2025` é:

```
$2b$10$jYc2G2n6tKPu3Kr7jzoLTejIXb/GNwFJ/iUu06k2XC0sHL/X1SlX6
```

## Ainda com problemas?

1. Verifique se as tabelas foram criadas:
   ```sql
   SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'auth';
   ```

2. Verifique se o usuário existe:
   ```sql
   SELECT * FROM auth;
   ```

3. Se não existir nada, execute o [create_tables.sql](database/create_tables.sql) completo novamente.

---

Depois de corrigir, você poderá fazer login normalmente! 🎉
