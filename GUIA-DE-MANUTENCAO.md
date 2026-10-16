# Guia de manutenção do AAC Gear Planner

Este guia descreve a estrutura verificada em 16/10/2026. O código e o package.json têm prioridade sobre instruções antigas do README.

## 1. Qual pasta editar

O repositório que você usa e envia ao GitHub está em:

`C:\Users\cmesq\OneDrive\Documents\scripts\AAC Gear Planner\AAC-Gear-Planner-3.5`

A cópia dentro do projeto do Codex é uma pasta de trabalho auxiliar; editar essa cópia não atualiza automaticamente o repositório acima. Confira a pasta antes de rodar Git ou editar arquivos.

Não altere os arquivos sincronizados de `sources/`. A database original do jogo também deve ser consultada em modo somente leitura.

## 2. Preparar e abrir localmente

1. Instale Node.js 22.13 ou superior; use uma versão LTS compatível.
2. Abra um terminal na pasta do repositório.
3. Confira `node --version` e rode `npm ci` para instalar as versões registradas no package-lock.json.
4. Rode `npm start` ou abra `iniciar.cmd`.
5. Abra o endereço mostrado no terminal. Geralmente é http://localhost:3000; o servidor tenta outra porta se ela estiver ocupada.
6. Mantenha o terminal aberto. Para parar, pressione Ctrl+C.

Não abra index.html diretamente: o site depende das rotas do servidor.

Após mudar arquivos do navegador, atualize com Ctrl+F5. Após mudar servidor, API ou código carregado pelo servidor, pare e inicie novamente. Na dúvida, reinicie e atualize.

O catálogo e os cálculos principais estão nos arquivos locais. Detalhes e ícones que ainda não foram armazenados podem precisar de internet.

## 3. Mapa dos arquivos principais

| Arquivo | Responsabilidade | Exemplos de alteração |
|---|---|---|
| index.html | Estrutura da página, botões, abas, diálogos e carregamento dos scripts. | Mover buffs; criar botão ou diálogo. |
| style.css | Cores, espaçamento, fontes, tamanhos, colunas e comportamento em telas pequenas. | Trocar cor de Effective Health; compactar formulário. |
| app.js | Liga a interface aos dados e ao estado da build. Renderiza listas, tooltips, stats e editores; chama a API. | Ordem dos itens, texto das gemas, stat clicável, grupos de passivas. |
| class-points.js | Pontos de skills/passivas, requisitos e ordem da árvore. | Ajustar limites ou requisitos da janela Class. |
| core.js | Estrutura e validação da build, slots, compatibilidade, troca de equipamento/inventário e códigos AAC1/AAC2. | Bloquear club na offhand; resolver arma de duas mãos. |
| calculator.js | Cálculos do item: DPS, defesa, atributos, temper e Equipment Points. Inclui interpretação das fórmulas. | Corrigir fator de grade do gearscore. |
| character.js | Regras de migration, nomes/chaves de atributos e validação de temper, enchant e efeitos manuais. | Limites da migration; validar valores digitados. |
| character-model.js | Agrega equipamento e efeitos e calcula o personagem: HP, ataques, críticos, reduções, Effective Power/Health e comparação. | Corrigir fórmula de HP; incluir um stat na comparação. |
| effects.js | Resolve modificadores, unidades, buffs, passivas e bônus de set; identifica efeitos pendentes. | Corrigir aplicação de bônus 7/7; interpretar modificador. |
| sockets.js | Quantidade de sockets, compatibilidade de gemas/frosts e opções oferecidas. | Corrigir gemas que entram em belt ou sleeves. |
| synthesis.js | Pools, opções, limites e validação das rolls de synthesis. | Ajustar opções permitidas em uma capa. |
| armor-sets.js | Identifica conjuntos completos e equipa suas sete peças com grade e temper escolhidos. | Alterar o seletor de set completo. |
| gear-import.js | Interpreta e converte o TXT do addon Darugear para o formato do planner. | Corrigir importação de grade, slot ou gema. |
| server.cjs | Servidor HTTP: serve arquivos, dados e ícones e encaminha rotas de builds. | Adicionar um módulo público; mudar comportamento de uma rota. |
| share-api.cjs | Endpoints para salvar, carregar e listar builds; validação e limites de requisição. | Paginação das builds recentes. |
| build-store.cjs | Persistência: SQLite local ou PostgreSQL quando DATABASE_URL está configurada. | Consulta ou estrutura de armazenamento. |
| tests.cjs | Testes de regras, fórmulas, validação e servidor. | Registrar um caso confirmado no jogo. |
| share-tests.cjs | Testes de compartilhamento e outras regressões, incluindo importação e atribuição de stats. | Garantir que links sobrevivam a reinícios. |
| package.json | Scripts npm, versão mínima do Node e dependências diretas. | Adicionar dependência; conferir comandos. |
| package-lock.json | Versões exatas das dependências instaladas. | Atualizado pelo npm, normalmente não à mão. |
| iniciar.cmd | Abre o servidor local na pasta correta. | Conveniência para rodar no Windows. |
| iniciar-celular.cmd | Inicialização para acesso pela rede local. | Testar o site no celular na mesma rede. |

Extensões: `.html` é estrutura; `.css` é aparência; `.js` é lógica JavaScript; `.cjs` é módulo CommonJS do Node; `.mjs` é módulo JavaScript no formato ESM; `.json` é dado; `.py` é script Python; `.cmd` é inicializador do Windows; `.md` é documentação.

## 4. Dados, imagens e documentação

| Caminho | Conteúdo |
|---|---|
| data/items.json | Índice de itens: IDs, nomes, categorias, níveis, ícones etc. Não contém sozinho todas as fórmulas. |
| data/buffs.json | Índice de buffs. |
| data/skills.json | Índice de skills. |
| data/rules.json | Regras exportadas: grades, armas, armaduras, acessórios, fórmulas, sockets, tags, synthesis e score. |
| data/equipment-effects.json | Modificadores numéricos, atributos, buffs, sets, passivas e fórmulas usados pelo motor de efeitos. |
| data/attribute-map.json | Mapeia IDs de atributos para nomes, unidades e escalas; usado na exportação. |
| data/gem-special-effects.json | Efeitos específicos de gemas, como duração de skills. Alimenta a exportação de efeitos. |
| data/passive-descriptions.json | Material de descrições das passivas. |
| data/items-ID.json, buffs-ID.json, skills-ID.json | Cache dos detalhes de registros obtidos da API. |
| data/icons/ | Cache e ícones locais de itens, buffs e skills. |
| assets/ | Imagens da interface e atlas de grades. |
| data/equipment-audit.json, audit-fixtures.json, checkup.json e arquivos de amostra | Auditorias, casos de referência e suporte à verificação. Confira quem lê cada um antes de alterar. |
| .local/builds.sqlite | Banco de builds criado no computador quando DATABASE_URL não está configurada. Não é o banco do site no Render. |
| .env.example | Exemplo de configuração, sem senha real. |
| .gitignore | Define arquivos que o Git ignora: dependências, banco local, segredos e temporários. |
| DATABASE-SETUP.md | Instruções do armazenamento de builds. |
| ARMOR-GRADE-RESEARCH.md, CHECKUP.md | Histórico de pesquisa e verificações. |
| README.md | Visão geral e histórico; alguns trechos estão desatualizados. |

Um `.env` não é carregado automaticamente só por existir. A inicialização atual usa as variáveis do ambiente; para um `.env`, seria necessário configurar seu carregamento. No Render, configure DATABASE_URL no painel Environment. Nunca coloque a conexão com senha em app.js, HTML ou commit.

## 5. Como o site funciona

1. O navegador pede index.html ao server.cjs.
2. HTML carrega CSS e módulos JavaScript. A ordem importa: app.js usa módulos carregados antes dele.
3. app.js carrega catálogos, rules.json e equipment-effects.json.
4. A build em edição fica em `state`: equipment, inventory, classes, passives, conditions, buffs, skills e migration.
5. Ao equipar, core.js valida a operação; sockets.js, character.js e synthesis.js verificam regras específicas.
6. calculator.js calcula cada item. effects.js agrega modificadores. character-model.js calcula os resultados do personagem.
7. app.js desenha os valores, ícones e tooltips.
8. Ao compartilhar, o navegador envia a build à share-api.cjs; build-store.cjs grava e devolve um ID curto.

O banco de builds armazena configurações de personagens. A database SQLite original do jogo fornece dados de referência. São coisas diferentes.

## 6. Onde começar para cada mudança

### Cor, tamanho ou posição

Comece em style.css; use index.html se precisar mudar a estrutura. Elementos criados dinamicamente podem estar em app.js. Procure o texto mostrado na tela ou o ID do elemento. Ao renomear um ID no HTML, atualize todas as referências no JavaScript.

### Texto de gema, tooltip e formulário de item

Procure em app.js: `gemEffectText`, `attachTooltip`, `gemEditor`, `equipmentEditors`, `itemDetail` e `canTemper`. Se o valor aparece errado apenas visualmente, corrija a apresentação. Se o total também está errado, investigue o dado e o cálculo.

### Stats e fórmulas

`renderStats` em app.js escolhe linhas, grupos e formatação. `calculate` em character-model.js calcula valores. `statValue`, `statUnit`, `comparisonLabels` e `comparisonStats` ligam valores à comparação e às unidades.

Não arredonde valores internos para tirar casas decimais da tela: arredonde somente na apresentação. Caso contrário, vários itens arredondados separadamente podem mudar o total.

### Modificador, buff ou set errado

Descubra o ID e confira equipamento, grade, gems, frost, synthesis e condições. Procure os registros em equipment-effects.json e as regras em effects.js. Se o erro estiver num arquivo gerado, preserve a correção também no exportador correspondente; uma exportação posterior pode apagar uma edição manual.

No relatório clicável de stats, itens, gemas e rolls usam diferenças calculadas com a remoção de uma fonte. Bônus de set e bônus automáticos são tratados separadamente. São contribuições sobrepostas em fórmulas com interações; não presuma que somar todas as linhas reproduz o total.

### Itens que podem ser equipados ou receber gemas

core.js cuida dos slots e mãos. sockets.js cuida das gemas e enchants. A lista visual em app.js deve concordar com a validação: esconder um item da lista não impede sua entrada por importação ou código de build.

### Novo arquivo JavaScript público

Inclua o script no HTML na ordem correta e adicione o arquivo à lista permitida de server.cjs. O servidor não publica qualquer arquivo automaticamente. Nunca adicione arquivos com segredos a essa lista.

## 7. Exportadores e ferramentas de manutenção

- export-database.py: gera a base de rules.json consultando a database do jogo.
- export-score.py: acrescenta dados de score e outros vínculos auxiliares a rules.json.
- export-synthesis.py: exporta pools e regras de synthesis.
- export-effects.py: gera dados de efeitos e auditoria usando a database e os mapeamentos locais.
- audit.cjs: auditoria executada por `npm run audit`; pode gerar/atualizar relatórios.
- fetch-passives.mjs, verify-buffs.cjs, find-buffs*.py: ferramentas de pesquisa e verificação; confira entradas, saídas e acesso à rede antes de executá-las.
- Arquivos `.tmp`: materiais temporários de investigação; não são módulos do site.

Não rode todos os exportadores por tentativa. Alguns caminhos da database estão fixos nos scripts, e export-database.py reescreve rules.json. Antes de regenerar, confira as chaves produzidas por cada script, a sequência necessária e o diff depois da execução. Mantenha a database original em modo somente leitura.

## 8. Rotina segura para uma alteração

1. Salve uma build de exemplo e anote resultado atual e resultado esperado.
2. Confira a pasta e execute `git status`.
3. Opcionalmente, crie uma branch: `git switch -c ajuste-descricao-curta`.
4. Altere a menor parte necessária.
5. Verifique a sintaxe: `node --check app.js` ou o arquivo JavaScript alterado.
6. Inicie o site, atualize com Ctrl+F5 e reproduza o caso.
7. Se mudou regra, fórmula, importação ou API, rode `npm test`; acrescente um teste para um caso real quando necessário.
8. Teste equipamento adicionado/removido, mudança de grade, carregamento de build antiga e tela pequena conforme a área alterada.
9. Execute `git diff --check` e `git diff` para revisar exatamente o que mudou.

Uma mudança apenas de cor ou espaçamento normalmente pede verificação visual. Uma mudança de fórmula pede comparação numérica com um caso conhecido. Os testes não substituem conferir a tela.

## 9. Publicar no GitHub e Render

Somente depois do teste local:

```powershell
git status
git diff
git add -- app.js style.css
git commit -m "Descreva a mudança"
git push origin main
```

Troque a lista de git add pelos arquivos realmente alterados. Esses comandos pressupõem que você está na main; se criou outra branch, revise e integre à main antes de publicar. Evite `git add *` sem conferir: caches e arquivos não relacionados podem entrar no commit.

No Render, o deploy automático depende de o serviço estar conectado à branch main e com Auto-Deploy ativado. Confira o deploy do commit enviado, aguarde Live e teste a URL pública. Push concluído não confirma deploy concluído.

O servidor usa PORT e, no Render, escuta em 0.0.0.0. Não altere isso para 127.0.0.1 na hospedagem. DATABASE_URL precisa continuar configurada para os links persistirem no Neon. Atualizações de código não exigem apagar o banco.

Não é necessário mudar package.json por uma alteração visual. Se mudar dependências, mantenha package.json e package-lock.json coerentes.

## 10. Se algo der errado

| Sintoma | Onde investigar primeiro |
|---|---|
| Página vazia ou abas sem stats | Console do navegador (F12), primeiro erro e referências a IDs no app.js. |
| Arquivo novo retorna 404 | Lista permitida no server.cjs, nome e caminho do arquivo. |
| Funciona localmente, mas não no site | Commit publicado, logs do deploy, versão do Node e variáveis do Render. |
| Compartilhamento falha | DATABASE_URL, Neon, resposta de /api/builds e logs; nunca exponha a senha no navegador. |
| Ícone faltando | Nome em items.json, arquivo em data/icons e resposta de /icons/.... |
| Item aparece, mas não soma stat | rules.json, equipment-effects.json, unidade e interpretação em effects.js/modelo. |
| API ou ícone não armazenado falha | Acesso à fonte externa e cache local. |
| Site demora para responder | Status do serviço, suspensão/inatividade, logs e limites da hospedagem. |

Para desfazer um commit já publicado, prefira `git revert HASH_DO_COMMIT` seguido de push, depois de verificar que isso não conflita com alterações posteriores. Isso cria um novo commit que reverte a mudança sem reescrever o histórico.

## 11. Checklist curto

- Estou editando o repositório correto?
- A mudança é de aparência, dado, regra ou fórmula?
- Preservei validação, importação e compatibilidade de builds antigas?
- Um arquivo gerado precisa de correção também no exportador?
- Testei o caso e revisei o diff?
- Estou enviando somente os arquivos pretendidos, sem banco local ou senha?
- O deploy ficou Live e o site público foi conferido?
