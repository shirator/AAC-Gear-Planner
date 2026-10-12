# Links curtos no Render + Neon Free

1. Crie uma conta em https://console.neon.tech e um projeto no plano Free. Use a região US East mais próxima do serviço Render.
2. No projeto Neon, clique em Connect. Selecione a branch de produção, database neondb e role padrão. Ative Connection pooling e copie a connection string PostgreSQL.
3. No Render, abra seu Web Service > Environment > Add Environment Variable. Nome: DATABASE_URL. Valor: a connection string copiada do Neon. Nunca coloque esse valor no GitHub nem envie pelo chat.
4. Atualize os arquivos para esta versão, incluindo package.json, package-lock.json, build-store.cjs e share-api.cjs. Faça commit e push. Build Command: npm ci. Start Command: npm start. Use Node 22.13 ou superior (Node 24 recomendado).
5. Salve as variáveis e conclua o deploy. A tabela shared_builds é criada automaticamente na primeira solicitação. Clique Save / share code: o site salva uma fotografia da build e gera https://seu-site/?s=Ab3xY7. Abra o link em outra janela para confirmar.

No computador, sem DATABASE_URL, o servidor usa SQLite em .local/builds.sqlite. Essa pasta guarda builds locais e não deve ser enviada ao GitHub. O servidor no Render exige DATABASE_URL para salvar links: nunca usa SQLite temporário como armazenamento de produção.

Os links do banco local funcionam apenas no seu servidor local. Para testar o mesmo banco do site no computador, configure DATABASE_URL no ambiente do terminal sem compartilhar o segredo.

Links são públicos para quem os recebe e não têm senha. Novas edições geram outro ID; o conteúdo dos links anteriores permanece. Salvar exatamente a mesma build reutiliza seu ID. AAC1/AAC2 continuam funcionando para importar, comparar e guardar backups.

O plano Free do Neon possui limites de armazenamento e computação; acompanhe o painel. https://neon.com/pricing
