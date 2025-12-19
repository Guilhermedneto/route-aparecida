const bcrypt = require('bcrypt');

const password = 'aparecida2025';

bcrypt.hash(password, 10, (err, hash) => {
    if (err) {
        console.error('Erro ao gerar hash:', err);
        return;
    }
    console.log('\n========================================');
    console.log('Hash gerado para senha: aparecida2025');
    console.log('========================================');
    console.log(hash);
    console.log('========================================\n');
    console.log('Use este SQL para inserir no banco:\n');
    console.log(`INSERT INTO auth (username, password_hash)`);
    console.log(`VALUES ('viagem', '${hash}');`);
    console.log('\n========================================');
});
