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
| 0. Planejamento | Spec de produto + UX (docs/), decisões de design com o Vilker | 🔄 em andamento |
| 1. Fundação | Scaffold do app, deploy automático, tela inicial | ⬜ |
| 2. MVP financeiro | Lançamentos, contas recorrentes, categorias, dashboard | ⬜ |
| 3. Futuro & Reservas | Gráficos de projeção, comprometimento de renda, caixinhas | ⬜ |
| 4. Gamificação | Conquistas, stickers, pontos, ranking Vilker × Isadora | ⬜ |
| 5. Polimento | Revisão de UX/design por agentes, ajustes finos | ⬜ |
| 6. Viagens | Módulo de planejamento de viagens (hoje: "em construção") | ⬜ |

---

## ❓ Decisões em aberto (aguardando o Vilker)

1. **Stack/sincronização**: app com backend (dados sincronizados entre os dois) vs. local no aparelho.
2. **Direção visual**: lúdica com o Estojo de mascote? Fintech clean? Outra?
3. **Nome/identidade**: "Nenos Finance" fica? Estojo vira mascote oficial?

## ✅ Decisões tomadas

- Repositório: `vilkers/nenos-finance`, desenvolvimento na branch `claude/financial-app-gamification-n4b5ik`.
- Documento vivo: este arquivo (ROADMAP.md) + specs em `docs/`.

---

## 📜 Diário de desenvolvimento

- **2026-07-15** — Projeto iniciado. Agente de planejamento/UX acionado para gerar `docs/PRODUTO.md` e `docs/UX.md`. Perguntas de design enviadas ao Vilker.
