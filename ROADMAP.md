# 🐾 Nenos Finance — Roadmap Vivo

> Controle financeiro da casa do Vilker & Isadora (e do Estojo 🐶).
> **Este arquivo é atualizado a cada etapa do desenvolvimento.**

_Última atualização: 2026-07-15 — fase de planejamento/design._

---

## 🎯 Objetivos (o que o app precisa ser)

### Essencial
- [ ] **Contas da casa**: registrar e acompanhar aluguel, IPTU, cartão de crédito, empregada, gastos com o Estojo — com categorias e recorrências (mensal/anual).
- [ ] **Ver o futuro**: gráficos de projeção — comprometimento de renda nos próximos meses, parcelas futuras, quanto vai sobrar.
- [ ] **Reservas**: quanto temos guardado em contas separadas (caixinhas), com evolução ao longo do tempo.
- [ ] **Para dois**: Vilker e Isadora usando juntos, dados sincronizados.

### Diferencial (ousadia 😎)
- [ ] **Gamificação**: achievements/stickers que destravam ao registrar coisas no app, pontuação e ranking entre nós dois.
- [ ] **Planejamento de Viagens**: seção especial visível no app, marcada como "em construção" — vai virar o módulo de planejar viagens.

### Princípios
- Mobile-first (uso principal no celular).
- Português brasileiro, moeda BRL.
- Automatizar tudo que der: deploy automático via GitHub Actions, CI, agentes revisando usabilidade/design a cada ciclo.
- Design definido **junto com o Vilker** antes de codar cada parte grande.

---

## 🗺️ Fases

| Fase | Entrega | Status |
|------|---------|--------|
| 0. Planejamento | Spec de produto + UX (docs/), decisões de design com o Vilker | ✅ |
| 1. Fundação | Scaffold do app, deploy automático, tela inicial | ✅ |
| 2. MVP financeiro | Lançamentos, contas recorrentes, parcelas, categorias, dashboard | ✅ |
| 3. Futuro & Reservas | Gráficos de projeção, comprometimento de renda, caixinhas | ✅ |
| 4. Gamificação | 18 conquistas, pontos anti-farm, ranking Vilker × Isadora | ✅ |
| 5. Polimento | Revisão de UX/design por agentes, ajustes finos | 🔄 em andamento |
| 6. Sincronização | Supabase: login + dados compartilhados entre os dois | ⬜ aguardando chaves |
| 7. Viagens | Módulo de planejamento de viagens (hoje: "em construção") | ⬜ |
| v2 | Álbum de stickers, streak com proteção, orçamento por categoria, fatura de cartão | ⬜ |

---

## ❓ Decisões em aberto (aguardando o Vilker)

1. **Chaves do Supabase**: Vilker vai criar o projeto no supabase.com e passar URL + anon key (até lá o app roda em modo local).

## ✅ Decisões tomadas

- **2026-07-15 — Dados**: Supabase (login + banco na nuvem, sincronizado entre os dois). Enquanto as chaves não chegam, o app funciona em modo local no navegador.
- **2026-07-15 — Visual**: direção lúdica, com o Estojo 🐶 como mascote oficial (alegre, mas polido).
- **2026-07-15 — Nome**: Nenos Finance, confirmado.
- Repositório: `vilkers/nenos-finance`, desenvolvimento na branch `claude/financial-app-gamification-n4b5ik`.
- Documento vivo: este arquivo (ROADMAP.md) + specs em `docs/`.

---

## 📜 Diário de desenvolvimento

- **2026-07-15 (4)** — Deploy automático configurado: GitHub Actions publica no GitHub Pages a cada push na `main`; CI (typecheck + build) em todas as branches. Agente revisor de UX acionado.
- **2026-07-15 (3)** — MVP construído e verificado de ponta a ponta num navegador real (fluxo: renda → recorrência → lançamento → parcelamento → caixinha → aporte; 5 conquistas destravaram no caminho 🏆). Correções: recorrência não cobra retroativo, linha da renda no gráfico do Futuro, paleta do gráfico validada para daltonismo nos modos claro e escuro.
- **2026-07-15 (2)** — Decisões fechadas com o Vilker: Supabase para sync, visual lúdico com Estojo mascote, nome Nenos Finance. Specs entregues pelo agente em `docs/`.
- **2026-07-15 (1)** — Projeto iniciado. Agente de planejamento/UX acionado para gerar `docs/PRODUTO.md` e `docs/UX.md`. Perguntas de design enviadas ao Vilker.
