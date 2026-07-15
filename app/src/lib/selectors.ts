import type { AppState, RecurringBill, Transaction, UserId } from '../types'
import { addMonthsToKey, currentMonthKey, monthKey, todayISO } from './dates'

export function paidExpensesInMonth(state: AppState, key: string): Transaction[] {
  return state.transactions.filter(
    (t) => t.kind === 'expense' && t.status === 'paid' && monthKey(t.date) === key,
  )
}

export function totalCents(txs: Transaction[]): number {
  return txs.reduce((sum, t) => sum + t.amountCents, 0)
}

export function householdIncomeCents(state: AppState): number {
  return Object.values(state.users).reduce((sum, u) => sum + u.monthlyIncomeCents, 0)
}

export function categoryTotalsForMonth(state: AppState, key: string) {
  const totals = new Map<string, number>()
  for (const t of paidExpensesInMonth(state, key)) {
    totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amountCents)
  }
  return [...totals.entries()]
    .map(([categoryId, cents]) => ({
      category: state.categories.find((c) => c.id === categoryId),
      cents,
    }))
    .filter((e) => e.category)
    .sort((a, b) => b.cents - a.cents)
}

/** dias de mês (YYYY-MM) */
function daysInMonth(key: string): number {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m, 0).getDate()
}

/** vencimento efetivo de uma recorrência num mês (clampa dia 31 → último dia) */
export function dueDateInMonth(bill: RecurringBill, key: string): string {
  const day = Math.min(bill.dueDay, daysInMonth(key))
  return `${key}-${String(day).padStart(2, '0')}`
}

export function billDueInMonth(bill: RecurringBill, key: string): boolean {
  if (!bill.active) return false
  if (bill.startMonth && key < bill.startMonth) return false
  if (bill.frequency === 'monthly') return true
  const [, m] = key.split('-').map(Number)
  return bill.dueMonth === m
}

export interface UpcomingBill {
  bill: RecurringBill
  dueDate: string
  monthKey: string
  daysLeft: number
}

/** recorrências não pagas vencendo do passado recente até `withinDays` */
export function upcomingBills(state: AppState, withinDays = 7): UpcomingBill[] {
  const today = todayISO()
  const months = [addMonthsToKey(currentMonthKey(), -1), currentMonthKey(), addMonthsToKey(currentMonthKey(), 1)]
  const result: UpcomingBill[] = []
  for (const key of months) {
    for (const bill of state.recurringBills) {
      if (!billDueInMonth(bill, key) || bill.paidMonths[key]) continue
      const dueDate = dueDateInMonth(bill, key)
      const daysLeft = Math.round(
        (new Date(dueDate).getTime() - new Date(today).getTime()) / 86_400_000,
      )
      if (daysLeft <= withinDays) result.push({ bill, dueDate, monthKey: key, daysLeft })
    }
  }
  return result.sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

/** streak de dias consecutivos (terminando hoje ou ontem) com lançamento criado pelo usuário */
export function streakDays(state: AppState, userId: UserId): number {
  const days = new Set(
    state.transactions.filter((t) => t.userId === userId).map((t) => t.createdAt.slice(0, 10)),
  )
  if (days.size === 0) return 0
  const cursor = new Date()
  const iso = () => cursor.toISOString().slice(0, 10)
  if (!days.has(iso())) cursor.setDate(cursor.getDate() - 1) // streak ainda vivo se registrou ontem
  let streak = 0
  while (days.has(iso())) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function pointsTotal(state: AppState, userId: UserId): number {
  return state.pointEvents
    .filter((e) => e.userId === userId)
    .reduce((sum, e) => sum + e.points, 0)
}

export function pointsInMonth(state: AppState, userId: UserId, key: string): number {
  return state.pointEvents
    .filter((e) => e.userId === userId && e.createdAt.slice(0, 7) === key)
    .reduce((sum, e) => sum + e.points, 0)
}

export function reserveBalanceCents(state: AppState, reserveId: string): number {
  return state.reserveMovements
    .filter((m) => m.reserveId === reserveId)
    .reduce((sum, m) => sum + m.amountCents, 0)
}

export function reservesTotalCents(state: AppState): number {
  return state.reserves.reduce((sum, r) => sum + reserveBalanceCents(state, r.id), 0)
}

/** meses fechados (antes do atual) em que o casal gastou menos que a renda declarada */
export function greenMonths(state: AppState): string[] {
  const income = householdIncomeCents(state)
  if (income <= 0) return []
  const current = currentMonthKey()
  const keys = new Set(
    state.transactions
      .filter((t) => t.kind === 'expense' && t.status === 'paid')
      .map((t) => monthKey(t.date)),
  )
  return [...keys]
    .filter((k) => k < current && totalCents(paidExpensesInMonth(state, k)) < income)
    .sort()
}
