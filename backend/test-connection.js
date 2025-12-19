require('dotenv').config();
const { getConnection, sql } = require('./config/database');

async function testConnection() {
    console.log('\n========================================');
    console.log('Testando conexão com Azure SQL Database');
    console.log('========================================\n');

    try {
        console.log('1. Conectando ao banco...');
        const pool = await getConnection();
        console.log('✓ Conexão estabelecida!\n');

        console.log('2. Verificando se as tabelas existem...');
        const tables = await pool.request()
            .query(`
                SELECT TABLE_NAME
                FROM INFORMATION_SCHEMA.TABLES
                WHERE TABLE_TYPE = 'BASE TABLE'
                ORDER BY TABLE_NAME
            `);

        if (tables.recordset.length === 0) {
            console.log('✗ ERRO: Nenhuma tabela encontrada!');
            console.log('\nVocê precisa executar o script: database/create_tables.sql');
            console.log('no Portal Azure Query Editor!\n');
            process.exit(1);
        }

        console.log('✓ Tabelas encontradas:');
        tables.recordset.forEach(t => {
            console.log('  -', t.TABLE_NAME);
        });

        console.log('\n3. Verificando tabelas necessárias...');
        const requiredTables = ['auth', 'user_sessions', 'activities', 'photos', 'comments'];
        const existingTables = tables.recordset.map(t => t.TABLE_NAME);

        let allTablesExist = true;
        requiredTables.forEach(table => {
            const exists = existingTables.includes(table);
            console.log(`  ${exists ? '✓' : '✗'} ${table}`);
            if (!exists) allTablesExist = false;
        });

        if (!allTablesExist) {
            console.log('\n✗ ERRO: Algumas tabelas estão faltando!');
            console.log('Execute o script: database/create_tables.sql\n');
            process.exit(1);
        }

        console.log('\n4. Verificando usuário de login...');
        const authUser = await pool.request()
            .query("SELECT username FROM auth WHERE username = 'viagem'");

        if (authUser.recordset.length === 0) {
            console.log('✗ ERRO: Usuário "viagem" não existe!');
            console.log('Execute o script: database/create_tables.sql\n');
            process.exit(1);
        }

        console.log('✓ Usuário "viagem" encontrado!');

        console.log('\n========================================');
        console.log('✓ TUDO CERTO! Banco configurado corretamente!');
        console.log('========================================\n');

        console.log('Credenciais para login:');
        console.log('  Usuário: viagem');
        console.log('  Senha: aparecida2025');
        console.log('  Apelido: [Digite seu nome]\n');

        process.exit(0);

    } catch (error) {
        console.log('\n✗ ERRO na conexão!\n');
        console.error('Detalhes:', error.message);

        if (error.message.includes('Login failed')) {
            console.log('\n⚠️  Problema de autenticação!');
            console.log('Verifique no .env:');
            console.log('  - DB_USER');
            console.log('  - DB_PASSWORD');
        } else if (error.message.includes('Cannot open server')) {
            console.log('\n⚠️  Não consegue conectar ao servidor!');
            console.log('Verifique:');
            console.log('  - Firewall do Azure SQL (permite seu IP?)');
            console.log('  - DB_SERVER no .env está correto?');
        }

        console.log('');
        process.exit(1);
    }
}

testConnection();
