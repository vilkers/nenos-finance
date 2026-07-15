# Nenos Finance — Proposta de UX/UI

> Mobile-first (o casal usa no celular). Uma mão, polegar alcança tudo.
> Complementa `docs/PRODUTO.md`.

---

## 1. Arquitetura de navegação

### Estrutura: tab bar inferior com 5 itens + FAB central

```
┌──────────────────────────────────────────────┐
│                  (conteúdo)                  │
├──────────────────────────────────────────────┤
│  🏠 Início  📋 Contas   ➕   🔮 Futuro  🐷 Reservas │
└──────────────────────────────────────────────┘
```

- **➕ (FAB central, destacado):** abre o sheet de **novo lançamento** de qualquer tela.
  É a ação nº 1 do app — precisa estar sempre a um toque.
- **🏠 Início (Dashboard):** resumo do mês, próximos vencimentos, atalhos, mini-placar.
- **📋 Contas (Lançamentos):** lista/histórico de lançamentos + gestão de recorrências e parcelamentos (abas internas).
- **🔮 Futuro:** projeção com gráficos.
- **🐷 Reservas:** caixinhas.

**Fora da tab bar** (acessíveis pelo topo do Dashboard e pelo perfil):
- **🏆 Conquistas & Álbum** — avatar/placar no header do Início leva para cá. Também recebe
  badge quando há conquista nova.
- **✈️ Viagens (em construção)** — card permanente no Dashboard + item no menu do perfil.
- **⚙️ Ajustes** — perfil, renda mensal, categorias, notificações.

### Mapa de telas

```
Início ─┬─ Novo lançamento (sheet)
        ├─ Detalhe do lançamento
        ├─ Conquistas ─ Álbum de stickers ─ Ranking
        ├─ Viagens (placeholder)
        └─ Ajustes ─ Categorias ─ Renda ─ Perfis
Contas ─┬─ aba Lançamentos (histórico + filtros)
        ├─ aba Recorrentes (CRUD, marcar pago)
        └─ aba Parcelamentos (planos + progresso)
Futuro ─── Detalhe do mês (lista de compromissos)
Reservas ─ Detalhe da caixinha (evolução + aporte/resgate)
```

### Fluxo crítico: registrar despesa em 3 toques
1. Toque no **➕** → sheet sobe com teclado numérico aberto no valor.
2. Valor → grade de categorias (as 6 mais usadas primeiro, Estojo 🐶 sempre visível).
3. **Salvar** (data = hoje, pagador = usuário logado, descrição opcional).
   → confete curto + "+10 pts" + progresso de streak. Campos avançados atrás de "mais detalhes".

---

## 2. Wireframes textuais

### 2.1 Dashboard (Início)

```
┌─────────────────────────────────────┐
│ Olá, Isadora 👋        [🔥 5] [🏆 3º dia]│  ← streak + atalho conquistas (avatar c/ badge)
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ JULHO 2026                      │ │
│ │ Gasto até agora   R$ 4.230,00   │ │
│ │ Sobra prevista    R$ 1.870,00 🟢│ │  ← renda − gastos − pendências do mês
│ │ ▓▓▓▓▓▓▓▓░░░░ 69% da renda usada │ │
│ └─────────────────────────────────┘ │
│                                     │
│ VENCE EM BREVE                      │
│ ⚠️ Aluguel        R$ 2.100  amanhã  │  ← swipe → "marcar pago" (+15 pts se antes do dia)
│ 🧹 Diarista       R$ 640    em 3d   │
│                                     │
│ GASTOS DO MÊS         [ver todos →] │
│ (donut por categoria)               │
│ 🏠 Moradia 42% · 💳 Cartão 23% ·    │
│ 🐶 Estojo 9% · …                    │
│                                     │
│ PLACAR DE JULHO                     │
│ Vilker 340 pts ⚔️ Isadora 385 pts  │  ← barra de cabo de guerra
│                                     │
│ ✈️ Viagens — em construção 🚧       │  ← card teaser (ver §2.6)
└─────────────────────────────────────┘
```

### 2.2 Contas (Lançamentos)

```
┌─────────────────────────────────────┐
│ Contas    [Lançamentos|Recorrentes|Parcelas]│ ← segmented control
│ 🔍 buscar   [mês: Julho ▾] [🏷 filtros]│
│                                     │
│ HOJE                                │
│ 🐶 Ração do Estojo      −R$ 189,90  │
│    Estojo · Isadora pagou           │
│ 🛒 Mercado              −R$ 312,45  │
│ ONTEM                               │
│ 💊 Farmácia             −R$ 58,00   │
│ 12 JUL                              │
│ 💰 Salário Vilker      +R$ 8.500,00 │
│ …                                   │
│ (swipe ← apagar · swipe → duplicar) │
└─────────────────────────────────────┘
Aba Recorrentes: lista com [pago ✓ | pendente ⏳ | atrasado 🔴],
valor, dia do vencimento, frequência (mensal/anual), toggle ativa.
Aba Parcelas: card por plano — "Sofá 3/10 · R$ 250/mês · termina fev/27"
com barra de progresso.
```

### 2.3 Futuro (Projeção)

```
┌─────────────────────────────────────┐
│ 🔮 Ver o futuro     [3m | 6m | 12m] │
│                                     │
│ ───────── renda R$ 14.500 ────────  │  ← linha da renda
│ █▓░  █▓░  █▓▒░  █▓░  █▓░  █▓░       │  ← barras empilhadas/mês:
│ jul  ago  set  out  nov  dez        │    █ recorrências ▓ parcelas ▒ estimativa avulsas (hachura)
│                                     │
│ AGOSTO ▾ (mês selecionado)          │
│ Comprometido: R$ 7.940 (55%) 🟡     │
│ Sobra garantida:  R$ 6.560          │
│ Sobra estimada:   R$ 3.210          │
│                                     │
│ Compromissos de agosto:             │
│ dia 05 · Aluguel          R$ 2.100  │
│ dia 07 · Diarista         R$ 640    │
│ dia 10 · Sofá (4/10)      R$ 250    │
│ dia 15 · Cartão (fatura)  R$ 3.900  │
│ …                                   │
│ ⓘ "Estimativa de avulsas = média    │
│    dos últimos 3 meses"             │
└─────────────────────────────────────┘
```
Interações: tocar na barra seleciona o mês; semáforo 🟢<50% 🟡50–75% 🔴>75%;
toggle "incluir estimativa de avulsas".

### 2.4 Reservas

```
┌─────────────────────────────────────┐
│ 🐷 Reservas                         │
│ Total guardado      R$ 23.450,00    │
│ (gráfico de área: evolução 12m)     │
│                                     │
│ 🧊 Emergência        R$ 15.000      │
│    2,1× despesa média  ▓▓▓▓▓▓▓░ 70% │  ← progresso p/ meta de 3×
│ ✈️ Viagem Chile      R$ 6.200 / 10k │
│    ▓▓▓▓▓▓░░░░ 62% · faltam R$ 3.800 │
│ 🐶 Caixinha Estojo   R$ 2.250       │
│                                     │
│ [+ Nova caixinha]                   │
└─────────────────────────────────────┘
Detalhe da caixinha: saldo grande, botões [Aportar] [Resgatar],
gráfico de evolução, extrato de movimentos, meta editável.
Aporte dá +20 pts → micro-celebração.
```

### 2.5 Conquistas & Álbum

```
┌─────────────────────────────────────┐
│ 🏆 Conquistas   [Conquistas|Álbum|Ranking]│
│                                     │
│ Isadora · 1.240 pts · nível "Poupadora"│
│ 🔥 streak atual: 5 dias (recorde: 12)│
│                                     │
│ EM PROGRESSO                        │
│ 📮 Cinquentinha      ▓▓▓▓▓▓░░ 34/50 │
│ 🌳 Trimestre Verde   ▓▓▓░░░░░  1/3  │
│                                     │
│ DESBLOQUEADAS (12)                  │
│ [🏁][🦴][🔥][🟢][🐷][⚡]…            │  ← grade; toque = data + pontos
│ BLOQUEADAS                          │
│ [🔒][🔒][???]…                      │  ← secretas viram "???"
│                                     │
│ Aba Álbum: grades por coleção       │
│ ("Estojo no Dia a Dia" 7/12) —      │
│ faltantes em silhueta cinza;        │
│ "Isadora tem 2 que você não tem!"   │
│ Aba Ranking: placar do mês (cabo de │
│ guerra) + histórico de campeões     │
│ ("mai: Vilker 🏆 · jun: Isadora 🏆")│
└─────────────────────────────────────┘
Momento de desbloqueio: modal fullscreen — sticker gira e "estala"
no lugar, confete, +pts, botão [Mostrar pro outro] (compartilha card).
```

### 2.6 Viagens (em construção)

Placeholder que vende o futuro em vez de pedir desculpas:

```
┌─────────────────────────────────────┐
│ ✈️ Planejamento de Viagens          │
│                                     │
│   (ilustração: Estojo de óculos     │
│    escuros numa mala, carimbos de   │
│    passaporte ao fundo)             │
│                                     │
│   EM CONSTRUÇÃO 🚧                  │
│   "Estamos preparando as malas…"    │
│                                     │
│   Em breve por aqui:                │
│   ✓ Orçamento por viagem            │
│   ✓ Caixinha conectada à meta       │
│   ✓ Contagem regressiva             │
│   ✓ Checklist do que levar          │
│                                     │
│   [🐷 Criar caixinha de viagem]     │  ← CTA real: já funciona hoje
│      → destrava "Sonhando Alto" 🏅  │
└─────────────────────────────────────┘
```
No Dashboard, o card teaser usa a mesma ilustração em miniatura com tag `EM BREVE`.

---

## 3. Três direções visuais

Regras comuns às três: dark mode desde o dia 1; valores monetários com fonte tabular
(`font-variant-numeric: tabular-nums`); verde nunca é a única codificação de "positivo"
(sempre acompanhado de sinal/ícone — acessibilidade); alvos de toque ≥ 44px; contraste AA.

---

### Direção A — "Patas & Pilas" (lúdica, Estojo como mascote)

**Conceito:** o app é um jogo cooperativo e o Estojo é o guia. Ilustrado, arredondado,
celebratório. A gamificação não é uma camada: é a linguagem.

**Paleta**
| papel | hex | uso |
|---|---|---|
| Primária "Caramelo Estojo" | `#F59E0B` | FAB, CTAs, destaques |
| Secundária "Azul Brincadeira" | `#3B82F6` | links, gráficos, Vilker no ranking |
| Rosa "Isadora" | `#EC4899` | Isadora no ranking, acentos |
| Verde "No Verde" | `#22C55E` | saldos positivos, semáforo |
| Vermelho "Xiii" | `#EF4444` | atraso, estouro |
| Fundo claro | `#FFF8EF` (creme) | superfícies quentes, não branco puro |
| Fundo escuro | `#1C1917` | dark mode marrom-quente |
| Texto | `#292524` / `#FAFAF9` | |

**Tipografia:** títulos **Baloo 2** (rechonchuda, amigável) · corpo e números **Nunito Sans**
(tabular para valores). Cantos 16–24px, sombras suaves, botões "gordinhos".

**Tom de voz:** primeira pessoa do Estojo em microtextos. Empty state de lançamentos:
"Nada por aqui ainda… au! Registra a primeira conta que eu te dou 10 pontos 🦴".
Erro: "Xiii, algo deu errado. Nem eu enterrei esse osso."

**Assinaturas visuais:** mascote com poses por contexto (Estojo dormindo = mês tranquilo,
Estojo cavando = tela Reservas, Estojo de mala = Viagens); confete em conquistas; barras de
progresso com patinha andando; streak = fileira de ossinhos.

**Risco:** pode cansar se o volume de ilustração for alto demais → concentrar a fofura em
momentos de celebração e empty states; telas de dados (Futuro) ficam limpas.

---

### Direção B — "Ledger" (fintech clean, gamificação discreta)

**Conceito:** sobriedade de banco digital premium. A gamificação existe, mas como um sistema
de "selos" elegante — mais Duolingo-para-adultos que parquinho. Confiança e legibilidade acima
de tudo.

**Paleta**
| papel | hex | uso |
|---|---|---|
| Primária "Índigo" | `#4F46E5` | ações, seleção, marca |
| Tinta | `#0F172A` | texto principal / fundo dark |
| Cinza superfície | `#F8FAFC` claro · `#1E293B` dark | cards |
| Verde discreto | `#059669` | receitas, "no verde" |
| Âmbar | `#D97706` | avisos, comprometimento 🟡 |
| Vermelho | `#DC2626` | negativo |
| Acento gamificação "Dourado" | `#CA8A04` | único ponto de brilho: conquistas, pontos |

**Tipografia:** **Inter** para tudo (pesos 400/600/800), números sempre tabulares;
valores grandes em 700 com `letter-spacing: -0.02em`. Cantos 8–12px, bordas hairline
(`#E2E8F0`), quase sem sombra. Densidade de informação maior que na direção A.

**Tom de voz:** direto e adulto. "Aluguel vence amanhã." · "Você fechou junho no verde: +100 pts."
Sem exclamações em cascata. O Estojo aparece só onde é dado (categoria 🐶) e em 2–3 conquistas.

**Gamificação discreta:** pontos como contador pequeno no header; conquistas = medalhas
monocromáticas douradas em grade minimalista; celebração = banner slide-in de 2s, sem confete;
ranking = tabela sóbria com sparkline.

**Risco:** perde o "uau" do diferencial pedido pelo dono → mitigar caprichando na medalha
dourada (microanimação de brilho) e no álbum como "coleção de selos" tipo passaporte.

---

### Direção C — "Fita Cassete" (ousada: retrô-arcade anos 90 / Game Boy household)

**Conceito:** finanças da casa como um jogo de fliperama dos anos 90 — a estética da infância
do casal. Pixel art, tela "CRT", placar de arcade. Abraça a competição Vilker × Isadora como
um versus de videogame. O Estojo vira sprite pixelado (companion de RPG).

**Paleta** (escuro por padrão; modo claro = "papel de manual de videogame" `#F4F1E8`)
| papel | hex | uso |
|---|---|---|
| Fundo "CRT" | `#0D1117` | base |
| Verde fósforo | `#39FF88` | números positivos, terminal vibes |
| Magenta neon | `#FF3E9D` | Isadora, acentos |
| Ciano elétrico | `#22D3EE` | Vilker, links |
| Amarelo moeda | `#FFD644` | pontos, moedas, conquistas |
| Vermelho alerta | `#FF4757` | "GAME OVER" (atraso/estouro) |
| Superfície | `#161B26` | cards com borda pixelada 2px |

**Tipografia:** títulos e números de placar em **Press Start 2P** ou **Silkscreen**
(usar com parcimônia: só headers e pontuações) · corpo em **Space Grotesk** ou **IBM Plex Mono**
para legibilidade real. Valores monetários no corpo, nunca em pixel font.

**Tom de voz:** vocabulário de jogo. Registrar = "SALVAR PROGRESSO"; conquista = "ACHIEVEMENT
UNLOCKED" com jingle 8-bit opcional; mês no verde = "STAGE CLEAR!"; ranking = "1P vs 2P";
streak = combo ("COMBO x7!"). Estouro de orçamento = barra de HP descendo.

**Assinaturas visuais:** transições com scanlines sutis; gráfico do Futuro como "fases" de um
mapa de jogo; moedas pixeladas saltando ao ganhar pontos; stickers = sprites colecionáveis com
raridade por cor de borda (como cards holográficos).

**Risco:** legibilidade e cansaço estético → pixel font restrita a títulos/placar, dados em
fonte limpa; oferecer "modo sóbrio" nos ajustes que troca o tema mantendo o layout.

---

## 4. Recomendação

**Direção A ("Patas & Pilas")** como base, importando da B a disciplina das telas densas
(Futuro e listas de lançamentos usam layout limpo, hairlines e números tabulares).
Justificativa: o dono pediu ousadia e gamificação de verdade; o mascote Estojo é um ativo
emocional único do casal que a direção B desperdiça e a C caricaturiza. A implementação é
viável com uma lib de componentes + 8–10 ilustrações do mascote (encomendadas ou geradas).

**Próximos passos de design:** (1) definir tokens (cores/spacing/tipografia) da direção
escolhida; (2) prototipar o fluxo de 3 toques do novo lançamento; (3) desenhar o momento de
desbloqueio de conquista — é o coração do diferencial.
