# Links curtos e Login com Discord no Render + Neon Free

## 1. Banco de Dados PostgreSQL (Neon Free)
1. Crie uma conta em https://console.neon.tech e um projeto no plano Free. Use a região US East mais próxima do serviço Render.
2. No projeto Neon, clique em Connect. Selecione a branch de produção, database neondb e role padrão. Ative Connection pooling e copie a connection string PostgreSQL.
3. No Render, abra seu Web Service > Environment > Add Environment Variable:
   - `DATABASE_URL`: a connection string copiada do Neon.
4. As tabelas `shared_builds` (links curtos) e `user_builds` (builds salvas por conta do Discord) são criadas automaticamente na primeira solicitação.

## 2. Login com Discord (OAuth2)
1. Acesse https://discord.com/developers/applications e clique em **New Application**.
2. No menu lateral **OAuth2**:
   - Copie o **Client ID** e o **Client Secret**.
   - Em **Redirects**, adicione as URLs de retorno do seu site:
     - Produção: `https://SEU-DOMINIO-OU-RENDER.onrender.com/api/auth/discord/callback`
     - Localhost: `http://localhost:3000/api/auth/discord/callback`
   - Clique em **Save Changes**.
3. Configure as variáveis de ambiente (no Render em **Environment** ou localmente em um arquivo `.env` na raiz do projeto):
   - `DISCORD_CLIENT_ID`: seu Client ID do Discord
   - `DISCORD_CLIENT_SECRET`: seu Client Secret do Discord
   - `SESSION_SECRET`: uma string longa e aleatória para assinar os cookies de sessão
4. No `localhost`, caso `DISCORD_CLIENT_ID` ainda não esteja configurado no `.env`, o botão **Sign in with Discord** ativa automaticamente um modo de teste local (**Local Preview**) para que você possa testar a aba **Builds** (salvar, editar, sobrescrever, renomear e deletar no SQLite local) imediatamente.
