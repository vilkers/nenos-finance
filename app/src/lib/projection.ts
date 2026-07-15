import type { AppState } from '../types'
import { addMonthsToKey, currentMonthKey, monthKey } from './dates'
import {
  billDueInMonth,
  dueDateInMonth,
  householdIncomeCents,
  paidExpensesInMonth,
  totalCents,
} from './selectors'

export interface CommitmentItem {
  description: string
  amountCents: number
  day: number
  type: 'recorrencia' | 'parcela'
  paid?: boolean
}

export interface MonthProjection {
  key: string
  incomeCents: number
  recurringCents: number
  installmentsCents: number
  /** média de avulsas dos últimos 3 meses fechados (estimativa) */
  variableEstCents: number
  committedCents: number
  /** comprometido / renda (0–1+); null quando renda não configurada */
  rate: number | null
  items: CommitmentItem[]
}

/** média mensal de despesas avulsas (sem recorrência/parcela) dos últimos 3 meses fechados */
export function variableAverageCents(state: AppState): number {
  const current = currentMonthKey()
  const closedKeys = [1, 2, 3].map((n) => addMonthsToKey(current, -n))
  const withData = closedKeys.filter((k) =>
    state.transactions.some((t) => monthKey(t.date) === k && t.status === 'paid'),
  )
  if (withData.length === 0) return 0
  const total = withData.reduce(
    (sum, k) =>
      sum +
      totalCents(
        paidExpensesInMonth(state, k).filter(
          (t) => !t.recurringBillId && !t.installmentPlanId,
        ),
      ),
    0,
  )
  return Math.round(total / withData.length)
}

export function projectMonths(state: AppState, horizon: number): MonthProjection[] {
  const income = householdIncomeCents(state)
  const variableEst = variableAverageCents(state)
  const current = currentMonthKey()

  return Array.from({ length: horizon }, (_, i) => {
    const key = addMonthsToKey(current, i)
    const items: CommitmentItem[] = []

    for (const bill of state.recurringBills) {
      if (!billDueInMonth(bill, key)) continue
      const paid = Boolean(bill.paidMonths[key])
      // mês corrente mostra só o que falta pagar; meses futuros mostram tudo
      if (key === current && paid) continue
      items.push({
        description: bill.description,
        amountCents: bill.amountCents,
        day: Number(dueDateInMonth(bill, key).slice(8, 10)),
        type: 'recorrencia',
        paid,
      })
    }

    for (const t of state.transactions) {
      if (t.installmentPlanId && t.status === 'pending' && monthKey(t.date) === key) {
        items.push({
          description: t.description,
          amountCents: t.amountCents,
          day: Number(t.date.slice(8, 10)),
          type: 'parcela',
        })
      }
    }

    items.sort((a, b) => a.day - b.day)
    const recurringCents = totalCents0(items.filter((i) => i.type === 'recorrencia'))
    const installmentsCents = totalCents0(items.filter((i) => i.type === 'parcela'))
    const committedCents = recurringCents + installmentsCents

    return {
      key,
      incomeCents: income,
      recurringCents,
      installmentsCents,
      variableEstCents: variableEst,
      committedCents,
      rate: income > 0 ? committedCents / income : null,
      items,
    }
  })
}

function totalCents0(items: CommitmentItem[]): number {
  return items.reduce((sum, i) => sum + i.amountCents, 0)
}

export function rateColor(rate: number | null): {
  label: string
  bg: string
  text: string
  emoji: string
} {
  if (rate === null) return { label: 'configure a renda', bg: '#e7e5e4', text: '#44403c', emoji: '⚙️' }
  if (rate < 0.5) return { label: 'tranquilo', bg: '#dcfce7', text: '#166534', emoji: '🟢' }
  if (rate <= 0.75) return { label: 'atenção', bg: '#fef9c3', text: '#713f12', emoji: '🟡' }
  return { label: 'apertado', bg: '#fee2e2', text: '#991b1b', emoji: '🔴' }
}
