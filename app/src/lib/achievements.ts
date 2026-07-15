import type { AppState, UserId } from '../types'
import { addMonthsToKey, currentMonthKey } from './dates'
import {
  categoryTotalsForMonth,
  greenMonths,
  reserveBalanceCents,
  streakDays,
} from './selectors'

export type Tier = 'bronze' | 'silver' | 'gold'

export const TIER_POINTS: Record<Tier, number> = { bronze: 25, silver: 75, gold: 200 }
export const TIER_LABEL: Record<Tier, string> = { bronze: 'Bronze', silver: 'Prata', gold: 'Ouro' }

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  tier: Tier
  /** couple = destrava para os dois de uma vez */
  scope: 'individual' | 'couple'
  secret?: boolean
  check: (state: AppState, userId: UserId) => boolean
}

const userTxs = (s: AppState, u: UserId) => s.transactions.filter((t) => t.userId === u)

export const ACHIEVEMENTS: Achievement[] = [
  // ── Primeiros passos ──────────────────────────────────────────
  {
    id: 'primeira-conta',
    name: 'Primeira Conta',
    description: 'Registre seu primeiro lançamento.',
    icon: '🏁',
    tier: 'bronze',
    scope: 'individual',
    check: (s, u) => userTxs(s, u).length >= 1,
  },
  {
    id: 'de-novo-todo-mes',
    name: 'De Novo, Todo Mês',
    description: 'Cadastre sua primeira conta recorrente.',
    icon: '🔁',
    tier: 'bronze',
    scope: 'individual',
    check: (s, u) => s.recurringBills.some((b) => b.createdBy === u),
  },
  {
    id: 'primeira-caixinha',
    name: 'Primeira Caixinha',
    description: 'Crie sua primeira reserva.',
    icon: '🐷',
    tier: 'bronze',
    scope: 'individual',
    check: (s, u) => s.reserves.some((r) => r.createdBy === u),
  },
  {
    id: 'parcelou-anotou',
    name: 'Parcelou, Anotou',
    description: 'Cadastre seu primeiro parcelamento.',
    icon: '💳',
    tier: 'bronze',
    scope: 'individual',
    check: (s, u) => s.installmentPlans.some((p) => p.createdBy === u),
  },
  // ── Constância ────────────────────────────────────────────────
  {
    id: 'semana-em-chamas',
    name: 'Semana em Chamas',
    description: 'Streak de 7 dias registrando lançamentos.',
    icon: '🔥',
    tier: 'silver',
    scope: 'individual',
    check: (s, u) => streakDays(s, u) >= 7,
  },
  {
    id: 'mes-inteiro-ligado',
    name: 'Mês Inteiro Ligado',
    description: 'Streak de 30 dias registrando lançamentos.',
    icon: '🌙',
    tier: 'gold',
    scope: 'individual',
    check: (s, u) => streakDays(s, u) >= 30,
  },
  {
    id: 'flash',
    name: 'Flash',
    description: 'Registre uma despesa no mesmo dia em que ela ocorreu, 10 vezes.',
    icon: '⚡',
    tier: 'bronze',
    scope: 'individual',
    check: (s, u) =>
      userTxs(s, u).filter((t) => t.date === t.createdAt.slice(0, 10)).length >= 10,
  },
  {
    id: 'cinquentinha',
    name: 'Cinquentinha',
    description: '50 lançamentos registrados.',
    icon: '📮',
    tier: 'silver',
    scope: 'individual',
    check: (s, u) => userTxs(s, u).length >= 50,
  },
  {
    id: 'centuriao',
    name: 'Centurião',
    description: '100 lançamentos registrados.',
    icon: '💯',
    tier: 'gold',
    scope: 'individual',
    check: (s, u) => userTxs(s, u).length >= 100,
  },
  // ── Saúde financeira (casal) ──────────────────────────────────
  {
    id: 'mes-no-verde',
    name: 'Mês no Verde',
    description: 'Fechem um mês gastando menos do que ganham.',
    icon: '🟢',
    tier: 'silver',
    scope: 'couple',
    check: (s) => greenMonths(s).length >= 1,
  },
  {
    id: 'trimestre-verde',
    name: 'Trimestre Verde',
    description: '3 meses no verde consecutivos.',
    icon: '🌳',
    tier: 'gold',
    scope: 'couple',
    check: (s) => {
      const green = new Set(greenMonths(s))
      return [...green].some(
        (k) => green.has(addMonthsToKey(k, 1)) && green.has(addMonthsToKey(k, 2)),
      )
    },
  },
  {
    id: 'meta-batida',
    name: 'Meta Batida',
    description: 'Uma caixinha com meta atinge 100%.',
    icon: '🎯',
    tier: 'silver',
    scope: 'couple',
    check: (s) =>
      s.reserves.some(
        (r) => r.goalCents && r.goalCents > 0 && reserveBalanceCents(s, r.id) >= r.goalCents,
      ),
  },
  // ── Temáticas do Estojo 🐶 ────────────────────────────────────
  {
    id: 'primeiro-osso',
    name: 'Primeiro Osso',
    description: 'Primeiro lançamento na categoria Estojo.',
    icon: '🦴',
    tier: 'bronze',
    scope: 'individual',
    check: (s, u) => userTxs(s, u).some((t) => t.categoryId === 'estojo'),
  },
  {
    id: 'melhor-amigo',
    name: 'Melhor Amigo',
    description: '10 lançamentos cuidando do Estojo.',
    icon: '🐾',
    tier: 'silver',
    scope: 'couple',
    check: (s) => s.transactions.filter((t) => t.categoryId === 'estojo').length >= 10,
  },
  {
    id: 'estojo-rei-da-casa',
    name: 'Estojo Rei da Casa',
    description: 'O Estojo aparece no top 3 de categorias do mês.',
    icon: '👑',
    tier: 'silver',
    scope: 'couple',
    secret: true,
    check: (s) => {
      const totals = categoryTotalsForMonth(s, currentMonthKey())
      return totals.length >= 3 && totals.slice(0, 3).some((e) => e.category?.id === 'estojo')
    },
  },
  {
    id: 'caixinha-do-estojo',
    name: 'Caixinha do Estojo',
    description: 'Crie uma reserva dedicada ao Estojo.',
    icon: '🐶',
    tier: 'bronze',
    scope: 'individual',
    check: (s, u) =>
      s.reserves.some(
        (r) => r.createdBy === u && (r.icon === '🐶' || r.name.toLowerCase().includes('estojo')),
      ),
  },
  // ── Vida a dois ───────────────────────────────────────────────
  {
    id: 'dupla-dinamica',
    name: 'Dupla Dinâmica',
    description: 'Os dois registram lançamentos no mesmo dia.',
    icon: '🤝',
    tier: 'bronze',
    scope: 'couple',
    check: (s) => {
      const days = (u: UserId) => new Set(userTxs(s, u).map((t) => t.createdAt.slice(0, 10)))
      const vilker = days('vilker')
      return [...days('isadora')].some((d) => vilker.has(d))
    },
  },
  {
    id: 'sonhando-alto',
    name: 'Sonhando Alto',
    description: 'Criem uma caixinha de viagem.',
    icon: '✈️',
    tier: 'bronze',
    scope: 'couple',
    check: (s) => s.reserves.some((r) => r.isTravel),
  },
]

export function achievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}
