# Nenos Finance — Especificação de Produto

> App de controle financeiro doméstico para o casal **Vilker & Isadora** (e o cachorro **Estojo** 🐶).
> Idioma: português brasileiro. Moeda: BRL. Uso: mobile-first, 2 usuários fixos.

---

## 1. Visão do produto

Um app leve e divertido para o casal registrar as contas da casa, enxergar o futuro financeiro
(quanto da renda já está comprometida nos próximos meses) e acompanhar as reservas — com uma
camada de gamificação que transforma a disciplina financeira em um jogo amistoso entre os dois.

**Princípios:**
1. **Registrar tem que levar < 10 segundos** — a gamificação só funciona se lançar for fácil.
2. **O futuro é a tela mais valiosa** — a pergunta central é "quanto sobra mês que vem?".
3. **Dois jogadores, um time** — o ranking é competitivo, mas as metas são do casal.

---

## 2. Personas

### Vilker
- Perfil "engenheiro das finanças": gosta de gráficos, projeções e de ver números batendo.
- Dor: planilhas que ninguém mais atualiza; quer visão consolidada de parcelamentos e recorrências.
- Motivação de uso: a tela **Futuro** e as estatísticas. Vai competir pelo topo do ranking.

### Isadora
- Perfil prático: quer registrar rápido e saber "estamos bem esse mês?".
- Dor: apps de banco fragmentados; não quer categorizar 40 coisas por dia.
- Motivação de uso: registro em 3 toques, stickers colecionáveis, conquistas do Estojo.

### Estojo (persona secundária / mascote)
- Cachorro do casal. Gera despesas reais (ração, banho/tosa, veterinário, petshop) — categoria
  própria — e protagoniza conquistas e stickers temáticos. É o rosto emocional do app.

---

## 3. Modelo de dados sugerido

Convenção: `snake_case`, valores monetários em **centavos (integer)** para evitar float,
datas em ISO 8601, `id` UUID. Soft delete via `deleted_at` onde indicado.

### 3.1 `users`
| campo | tipo | notas |
|---|---|---|
| id | uuid | |
| name | text | "Vilker", "Isadora" |
| email | text | login |
| avatar_url | text | |
| monthly_income_cents | int | renda mensal declarada (usada na projeção) |
| points | int | pontuação acumulada de gamificação (denormalizado; fonte da verdade em `point_events`) |
| created_at | timestamptz | |

> App é de 2 usuários fixos; ainda assim modelar como tabela permite convidados no futuro.
> Se as rendas variarem, evoluir para tabela `incomes (user_id, month, amount_cents)` na v2.

### 3.2 `categories`
| campo | tipo | notas |
|---|---|---|
| id | uuid | |
| name | text | "Moradia", "Estojo 🐶", "Mercado"… |
| icon | text | nome do ícone/emoji |
| color | text | hex |
| kind | enum | `expense` \| `income` |
| is_archived | bool | configurável: arquivar em vez de deletar |

**Seed inicial:** Moradia (aluguel, condomínio), Impostos (IPTU, IPVA), Cartão de crédito,
Casa & Serviços (empregada doméstica, internet, luz, água), Estojo 🐶, Mercado, Transporte,
Saúde, Lazer, Viagens, Outros.

### 3.3 `recurring_bills` (contas recorrentes)
| campo | tipo | notas |
|---|---|---|
| id | uuid | |
| description | text | "Aluguel", "IPTU 2026", "Diarista" |
| category_id | uuid → categories | |
| amount_cents | int | valor previsto (pode ser ajustado no lançamento real) |
| frequency | enum | `monthly` \| `yearly` |
| due_day | int | dia do vencimento (1–31; para `yearly`, combinar com `due_month`) |
| due_month | int? | apenas para anuais (ex.: IPTU em março) |
| start_date / end_date | date / date? | `end_date` null = sem fim |
| auto_launch | bool | se true, gera lançamento pendente no vencimento |
| paid_by_default | uuid → users? | quem costuma pagar (pré-preenche o lançamento) |
| is_active | bool | |

### 3.4 `transactions` (lançamentos)
| campo | tipo | notas |
|---|---|---|
| id | uuid | |
| description | text | |
| amount_cents | int | positivo; `kind` define o sinal |
| kind | enum | `expense` \| `income` |
| date | date | data da despesa/receita |
| category_id | uuid → categories | |
| user_id | uuid → users | **quem registrou** (base da gamificação) |
| paid_by | uuid → users? | quem pagou (pode diferir de quem registrou) |
| recurring_bill_id | uuid? | preenchido quando originado de recorrência |
| installment_plan_id | uuid? | preenchido quando é parcela |
| status | enum | `pending` \| `paid` — recorrências auto-lançadas nascem `pending` |
| notes | text? | |
| created_at | timestamptz | usado no cálculo de streaks |
| deleted_at | timestamptz? | soft delete (evita farmar pontos criando/apagando) |

### 3.5 `installment_plans` (parcelamentos)
| campo | tipo | notas |
|---|---|---|
| id | uuid | |
| description | text | "Sofá — Tok&Stok" |
| total_amount_cents | int | |
| installments_count | int | ex.: 10 |
| first_due_date | date | |
| category_id | uuid → categories | |
| created_by | uuid → users | |

> Ao criar o plano, o sistema **materializa as N parcelas como `transactions` futuras**
> (`status = pending`, `installment_plan_id` preenchido, descrição "Sofá (3/10)").
> Isso simplifica a projeção: futuro = query sobre `transactions` pendentes + recorrências.

### 3.6 `reserves` (caixinhas / reservas)
| campo | tipo | notas |
|---|---|---|
| id | uuid | |
| name | text | "Emergência", "Viagem Chile", "Caixinha Estojo" |
| icon / color | text | |
| goal_cents | int? | meta opcional (habilita barra de progresso) |
| institution | text? | "Nubank", "CDB Inter"… |
| is_archived | bool | |

### 3.7 `reserve_movements` (evolução das reservas)
| campo | tipo | notas |
|---|---|---|
| id | uuid | |
| reserve_id | uuid → reserves | |
| amount_cents | int | positivo = aporte, negativo = resgate |
| date | date | |
| user_id | uuid → users | quem registrou (conta pontos) |
| kind | enum | `deposit` \| `withdrawal` \| `yield` (rendimento) \| `adjustment` |

> Saldo da caixinha = soma dos movimentos. Evolução mensal = agregação por mês (gráfico de área).

### 3.8 Gamificação

**`achievements`** (catálogo, definido em código/seed)
| campo | tipo | notas |
|---|---|---|
| id | text (slug) | `primeira-conta`, `mes-no-verde`… |
| name / description | text | |
| icon | text | |
| points | int | pontos concedidos ao destravar |
| tier | enum | `bronze` \| `silver` \| `gold` |
| scope | enum | `individual` \| `couple` (conquista do casal destrava para os dois) |
| secret | bool | conquistas surpresa (mostradas como "???") |
| criteria | jsonb | parâmetros da regra (ex.: `{"streak_days": 7}`) — avaliação em código |

**`user_achievements`**: `user_id`, `achievement_id`, `unlocked_at`, `progress` (jsonb, para
conquistas progressivas ex.: 34/50 lançamentos).

**`stickers`** (catálogo): `id`, `name`, `image_url`, `rarity` (`common|rare|epic|legendary`),
`collection` ("Estojo no Dia a Dia", "Vida a Dois", "Mestres do Dinheiro").

**`user_stickers`**: `user_id`, `sticker_id`, `obtained_at`, `source` (`achievement` \| `pack`).

**`point_events`** (ledger de pontos — fonte da verdade, auditável):
`id`, `user_id`, `points`, `reason` (enum: `transaction_logged`, `achievement`, `streak_bonus`…),
`ref_id` (uuid da entidade que gerou), `created_at`.
> Regra anti-farm: apagar um lançamento gera `point_event` negativo correspondente.

**Diagrama (resumo):**
```
users 1─n transactions n─1 categories
users 1─n point_events / user_achievements / user_stickers
recurring_bills 1─n transactions
installment_plans 1─n transactions
reserves 1─n reserve_movements
```

---

## 4. Funcionalidades por fase

### Fase 1 — MVP (objetivo: casal usando no dia a dia em ~4 semanas)
1. Login simples (2 usuários pré-cadastrados; auth por e-mail/senha ou magic link).
2. CRUD de **lançamentos** (despesa/receita) com categoria, data, quem pagou — fluxo de 3 toques.
3. **Categorias configuráveis** (seed + criar/editar/arquivar).
4. **Contas recorrentes** mensais/anuais com geração automática de lançamentos `pending`
   e ação "marcar como pago".
5. **Parcelamentos**: criar plano → materializa parcelas futuras.
6. **Dashboard** do mês: total gasto, saldo do mês (renda − despesas), gasto por categoria
   (donut), contas a vencer nos próximos 7 dias.
7. **Futuro (projeção)**: gráfico de barras dos próximos 6 meses com comprometimento de renda
   (ver §6) + lista de compromissos futuros por mês.
8. **Reservas**: CRUD de caixinhas, aportes/resgates, saldo total e gráfico de evolução.
9. **Gamificação núcleo**: pontos por lançamento, ~12 conquistas iniciais, ranking Vilker × Isadora,
   toast de conquista destravada.
10. **Viagens**: seção visível com placeholder "em construção" caprichado (ver UX.md).

### Fase 2 — v2 (aprofundar)
- Stickers colecionáveis com raridade + álbum de figurinhas; "pacotinho" ganho por conquista.
- Streaks com proteção ("congelar streak" 1×/mês) e bônus semanais.
- Conquistas secretas e sazonais (aniversário do Estojo, fim de ano).
- Orçamento por categoria (teto mensal) + alerta de estouro + conquista "mês dentro do orçamento".
- Fatura de cartão: agrupar lançamentos por cartão/fatura com fechamento e vencimento.
- Rendimento automático estimado nas reservas (% a.m. configurável por caixinha).
- Notificações push: conta vencendo amanhã, "você não registra há 3 dias, o Estojo sente sua falta".
- Renda variável por mês (`incomes` por competência).
- Exportação CSV.

### Fase 3 — Futuro
- **Planejamento de Viagens** completo: destino, orçamento por rubrica (voo/hospedagem/passeios),
  vínculo com uma caixinha, checklist, contagem regressiva.
- Importação OFX/open finance; leitura de comprovante por foto (OCR).
- Metas conjuntas com "aposta" de pontos entre o casal.
- Relatório anual estilo "retrospectiva" (top categorias, total investido, conquistas do ano).
- Modo widget (iOS/Android) com saldo do mês e streak.

---

## 5. Gamificação — regras

### 5.1 Pontuação (ledger `point_events`)
| ação | pontos | observações |
|---|---|---|
| Registrar lançamento | +10 | máx. 5 lançamentos pontuáveis/dia (anti-spam); apagar estorna |
| Registrar no mesmo dia da despesa | +5 bônus | `date == created_at::date` |
| Pagar conta recorrente **antes** do vencimento | +15 | |
| Aporte em reserva | +20 | 1 aporte pontuável por caixinha/dia |
| Fechar o mês no verde (casal) | +100 para cada | despesas do mês < renda do mês |
| Dia de streak | +5/dia | dobra a partir do 7º dia consecutivo (+10) |
| Conquista destravada | pontos da conquista | ver tiers: bronze 25 / prata 75 / ouro 200 |

**Ranking:** placar mensal (zera todo mês, decide "o campeão do mês") + placar geral acumulado.
O placar mensal mantém a disputa viva; o acumulado premia constância.

### 5.2 Catálogo de conquistas (seed inicial)

**Primeiros passos (bronze, individuais)**
- 🏁 **Primeira Conta** — registre seu primeiro lançamento.
- 🗂️ **Organizadinho(a)** — crie ou personalize sua primeira categoria.
- 🔁 **De Novo, Todo Mês** — cadastre sua primeira conta recorrente.
- 🐷 **Primeira Caixinha** — crie sua primeira reserva.
- 💳 **Parcelou, Anotou** — cadastre seu primeiro parcelamento.

**Constância (individuais)**
- 🔥 **Semana em Chamas** (prata) — streak de 7 dias registrando lançamentos.
- 🌙 **Mês Inteiro Ligado** (ouro) — streak de 30 dias.
- ⚡ **Flash** (bronze) — registre uma despesa no mesmo dia em que ela ocorreu, 10 vezes.
- 📮 **Cinquentinha** (prata) — 50 lançamentos registrados. 💯 **Centurião** (ouro) — 100.

**Saúde financeira (casal — destravam para os dois)**
- 🟢 **Mês no Verde** (prata) — fechem um mês gastando menos do que ganham.
- 🌳 **Trimestre Verde** (ouro) — 3 meses no verde consecutivos.
- ⏰ **Nada Atrasado** (prata) — fechem um mês sem nenhuma recorrência paga após o vencimento.
- 🧊 **Colchão de 3 Meses** (ouro) — reserva "Emergência" ≥ 3× a despesa média mensal.
- 📉 **Dieta do Cartão** (prata) — gasto de cartão do mês 20% menor que a média dos 3 anteriores.
- 🎯 **Meta Batida** (prata) — uma caixinha com meta atinge 100%.

**Temáticas do Estojo 🐶 (as mais divertidas)**
- 🦴 **Primeiro Osso** (bronze) — primeiro lançamento na categoria Estojo.
- 🛁 **Cheiroso** (bronze) — registre 5 banhos/tosas do Estojo.
- 🩺 **Estojo Saudável** (prata) — registre uma despesa de veterinário (vacina/consulta) no ano.
- 👑 **Estojo Rei da Casa** (prata, secreta) — Estojo aparece no top 3 de categorias do mês.
- 🎂 **Aniversário do Estojo** (ouro, secreta/sazonal) — registre um mimo pro Estojo no mês do
  aniversário dele. Destrava sticker lendário "Estojo de Chapéu de Festa".
- 🐾 **Caixinha do Estojo** (bronze) — crie uma reserva dedicada ao Estojo.

**Vida a dois (casal)**
- 🤝 **Dupla Dinâmica** (bronze) — os dois registram lançamentos no mesmo dia.
- ⚖️ **Placar Equilibrado** (prata, secreta) — mês termina com diferença ≤ 10% de pontos entre os dois.
- 🏆 **Revanche** (bronze, secreta) — vença o placar mensal após perder o mês anterior.
- ✈️ **Sonhando Alto** (bronze) — criem uma caixinha de viagem (gancho para a seção Viagens).

### 5.3 Stickers
- Cada conquista concede 1 sticker fixo; conquistas ouro concedem um "pacotinho" (3 stickers
  aleatórios, chance de raro/épico).
- Coleções: **Estojo no Dia a Dia** (12), **Vida a Dois** (8), **Mestres do Dinheiro** (10).
- Completar uma coleção = conquista ouro + moldura especial no avatar.
- Stickers são por usuário; a tela de álbum mostra os dois lado a lado ("Isadora tem 2 que você não tem!").

---

## 6. Projeção futura — fórmulas

Horizonte padrão: **6 meses** (configurável 3/6/12). Cálculo por mês-competência `M`:

```
renda(M)          = Σ monthly_income_cents dos usuários            [v2: incomes por mês]
recorrencias(M)   = Σ recurring_bills ativas cujo vencimento cai em M
                    (mensais: todo M; anuais: se due_month == M)
parcelas(M)       = Σ transactions pending com installment_plan_id e date ∈ M
avulsas_prev(M)   = média das despesas NÃO recorrentes/parceladas
                    dos últimos 3 meses fechados (estimativa; exibida como faixa hachurada)

comprometido(M)   = recorrencias(M) + parcelas(M)
taxa_comprometimento(M) = comprometido(M) / renda(M)          → exibir em %
sobra_garantida(M)      = renda(M) − comprometido(M)
sobra_estimada(M)       = renda(M) − comprometido(M) − avulsas_prev(M)
```

**Regras de exibição:**
- Semáforo da taxa de comprometimento: 🟢 < 50% · 🟡 50–75% · 🔴 > 75%.
- Gráfico principal: barras empilhadas por mês (recorrências + parcelas + estimativa de avulsas),
  linha horizontal da renda; a "sobra" é o vão entre a pilha e a linha.
- Mês corrente usa dados reais já lançados + o que falta vencer (não a média).
- Distinguir sempre **compromisso assumido** (contratos: aluguel, parcelas) de **estimativa**
  (média de avulsas) — cores/hachura diferentes e legenda explícita.
- Detalhe por mês: lista de cada compromisso (conta, valor, dia) ao tocar na barra.

**Reservas na projeção (v2):** linha secundária de patrimônio projetado =
`saldo_reservas + Σ sobra_estimada acumulada`, assumindo que a sobra vira aporte (toggle on/off).

---

## 7. Métricas de sucesso
- Nº de dias/mês com pelo menos 1 lançamento (meta: > 20).
- Os dois usuários ativos na semana (meta: 100% das semanas).
- Recorrências pagas em dia (meta: > 90%).
- % de meses fechados no verde (o app existe para aumentar isso).
