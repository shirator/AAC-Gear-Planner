# Checkup geral — AAC Gear Planner 3.5

Versão 1.5.0 · 11/10/2026

## Resultado

35 testes passaram, sem falhas. A suíte verifica 10.217 fixtures de modificadores por item/grade e 100 builds completas reproduzíveis. O agregador usado pelos testes é agora o mesmo usado pela interface.

O catálogo possui 34.650 itens; isso inclui materiais e outros registros que não são equipamentos. Há 13.322 registros locais de efeitos, 22.169 buffs, 70 passivas e 9.329 combinações com buff explícito por grade. Isso não significa que todas as regras do jogo estão simuladas.

## Correções feitas

- Crítico melee/ranged/magic de síntese agora entra nos stats derivados.
- Ratings adicionais de parry, block e evasion entram nos cálculos correspondentes; reduções fixas incluem seus modificadores adicionais.
- Evasion, mitigação de defesa e Attack Animation Speed exibem porcentagens.
- Buff de set selecionado também na biblioteca não é contado novamente pelo mesmo ID.
- Validação de slots usa a database mesmo com catálogo sem enriquecimento de `db_slot`.
- Entrada malformada de temper, stats e síntese é rejeitada. Condições duplicadas são rejeitadas; listas normalizadas são copiadas.
- Remover uma classe também remove os buffs relacionados às passivas removidas, seguindo o comportamento de remover a própria passiva. A origem de buffs manuais e condicionais ainda não é armazenada separadamente.
- Equipment Points mostra “Not calculated”; antes mostrava zero sem uma fórmula implementada.
- Item sem registro de modificadores agora aparece como pendência, em vez de desaparecer silenciosamente do relatório.
- Healing Power, atributo 175: suspendida a contribuição automática enquanto a escala não estiver confirmada. Exemplo: Miraculous Love Lunafrost tem 3000 no dado bruto e não pode ser tratado automaticamente como +3000 Healing Power. Não foi assumida uma conversão sem certificação.

## Testes e conferência visual

- Valores base, migração balanceada de até 300 pontos e ancestral 7.
- Armas/armaduras nos 13 grades contra o calculador público arquivado.
- Grade effects do catálogo completo, incluindo todos os 136 itens com Cast Time identificado.
- Restrições, capacidade, repetição e deduplicação de gemas; lunafrosts e acessórios Enlightened.
- Inventário: swap preserva configuração, retorna o item equipado e rejeita slot incompatível sem alterar a build.
- Costumes de combate, síntese, sets atuais da database e tiers cumulativos Erenor Earth.
- 70 passivas: efeito resolvido ou pendência identificada; condições, Folding Time e buffs automáticos de equipamento.
- Código UTF-8, códigos antigos, entradas inválidas, rotas do servidor, ícones e bloqueio de caminhos indevidos.
- Browser: Oracle Epic + Perfect Life => 96,6% Cast Time / 193 Spirit; Folding Time => 92,6%; remover Witchcraft => 96,6%.
- Browser: salvar/carregar código preservou a build. Migração -150 Agility / -150 Stamina / +300 Spirit => 8 / 8 / 458. Nenhum erro JavaScript capturado nesses fluxos.

## Dados e regras ainda pendentes

1. **12 referências de itens apontam para 7 buffs ausentes na database fornecida.** A consulta SQLite confirmou que esses IDs não existem. Lista completa em `data/checkup.json`; não foram criados valores substitutos.
2. **Unidades desconhecidas e escala de Healing Power.** O relatório JSON lista 37 IDs de atributo sem metadata confirmada. Incluem atributos de habilidades e combate; não devem ser tratados automaticamente como os campos homônimos de outro calculator.
3. **188 buffs possuem fórmulas dinâmicas.** Procs, duração, cargas, stacks, interações entre buffs diferentes, exclusividade e frequência de ativação ainda exigem regras específicas.
4. **Passivas condicionais.** A seleção está disponível, mas a condição real de combate não é detectada automaticamente. Buffs relacionados por nome/descrição são candidatos manuais, não relações de trigger certificadas. Pré-requisitos de pontos/rank e requisitos de skills não são completamente validados.
5. **Gear Score / Equipment Points e bônus de grade de armadura** ainda não implementados. Percentuais de DPS da mão principal/secundária e certos modificadores dependentes de base continuam pendentes; alguns percentuais conhecidos de stats são calculados usando a referência, mas continuam classificados de forma conservadora no relatório de efeitos.
6. **Campos especiais de PvE, dano de habilidades e stats efetivos de combate** não têm cobertura completa. Zero significa ausência de contribuição suportada nesse campo, não certificação de que o total real do personagem é zero.
7. **Conflitos de equipamento e requisitos especiais** não estão todos validados, incluindo combinações de arma de duas mãos/off-hand. O planner não garante uma build jogável. Limites possíveis de rolls de síntese, expiração e valores por grade ainda requerem dados; os valores são inseridos pelo tooltip.
8. **Constantes de movimento, conversão de Attack Speed e mitigação por defesa** vêm da referência DaruGear Classic, distinguida das fórmulas presentes na database. Não há certificação contra execução do servidor Classic atual. Ícones não armazenados localmente dependem da API e podem usar placeholder em caso de indisponibilidade.

1.368 combinações item/grade têm alguma pendência após a revisão. Esse número inclui o atributo de healing suspenso e efeitos não estáticos, não apenas referências faltantes. Os testes verificam o comportamento implementado e suas limitações, sem validar dano real em combate contra o servidor.

## Reproduzir

Com Node.js 18+: `npm test` e `npm run audit`. Para abrir: `iniciar.cmd` ou `npm start`, depois http://localhost:3000/. Não é preciso instalar dependências npm. Python e a database original são necessários apenas para regenerar os dados exportados.

Fontes: database compact-3503AAClassic-20260925, APIs aa-classic.com, cliente local e referências AAEmu/DaruGear documentadas no README. A API de buff 13393 confirma que publica Healing Power bruto com multiplier 1; a referência Character.cs trabalha HDps e HDpsInc em escala de milésimos. Essa divergência permanece explícita.


## Atualização 1.5.1

Síntese de capas e cuecas ligada aos grupos da database; editor oculto onde não há rolls disponíveis no item/grade. Verificados no navegador Epherium Windsong Cloak (3 efeitos), Healing Black Cat Undergarments Epic (faixa Physical Defense 485–535, 535 aplicado nos stats) e Enlightened Ayanad Desert Cuirass Epic (editor oculto). 38 testes passaram. A divergência de escala de Healing Power foi resolvida pela comparação do guia com os valores brutos de síntese: 47500 corresponde a 47,5. As observações anteriores sobre suspensão desse atributo foram substituídas por conversão 0,001.
