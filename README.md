# 🐶 Nenos Finance

Controle financeiro da casa do **Vilker & Isadora** (e do Estojo) — com projeção de futuro,
caixinhas de reserva e gamificação de verdade: conquistas, pontos e ranking entre o casal.

## Estrutura

| Pasta | O quê |
|---|---|
| `app/` | O app (React + Vite + TypeScript + Tailwind + Recharts) |
| `docs/` | Specs de produto (`PRODUTO.md`) e UX (`UX.md`) |
| `ROADMAP.md` | Documento vivo: objetivos, fases, decisões e diário de desenvolvimento |

## Rodando localmente

```bash
cd app
npm install
npm run dev
```

## Deploy

Automático: push na `main` → GitHub Actions builda e publica no GitHub Pages.
CI (typecheck + build) roda em todas as branches e PRs.
