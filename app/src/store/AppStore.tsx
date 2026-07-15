/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import type {
  AppState,
  Kind,
  PointEvent,
  PointReason,
  Reserve,
  Transaction,
  UserId,
} from '../types'
import { initialState } from '../data/seed'
import { uid } from '../lib/id'
import { currentMonthKey, todayISO } from '../lib/dates'
import { dueDateInMonth, streakDays } from '../lib/selectors'
import { ACHIEVEMENTS, TIER_POINTS, type Achievement } from '../lib/achievements'

const STORAGE_KEY = 'nenos-finance-v1'

export interface Celebration {
  id: string
  achievement: Achievement
  userId: UserId
}

export interface PointToast {
  id: string
  points: number
  label: string
}

interface StoreApi {
  state: AppState
  celebrations: Celebration[]
  dismissCelebration: (id: string) => void
  pointToasts: PointToast[]
  setCurrentUser: (u: UserId) => void
  setIncome: (u: UserId, cents: number) => void
  addTransaction: (input: {
    description: string
    amountCents: number
    kind: Kind
    date: string
    categoryId: string
    paidBy?: UserId
  }) => void
  deleteTransaction: (id: string) => void
  addRecurringBill: (input: {
    description: string
    categoryId: string
    amountCents: number
    frequency: 'monthly' | 'yearly'
    dueDay: number
    dueMonth?: number
  }) => void
  toggleRecurringBill: (id: string) => void
  deleteRecurringBill: (id: string) => void
  markRecurringPaid: (billId: string, monthKey: string) => void
  addInstallmentPlan: (input: {
    description: string
    totalCents: number
    count: number
    firstDueDate: string
    categoryId: string
  }) => void
  payInstallment: (transactionId: string) => void
  addReserve: (input: {
    name: string
    icon: string
    goalCents?: number
    institution?: string
    isTravel?: boolean
  }) => void
  addReserveMovement: (reserveId: string, amountCents: number) => void
  resetAll: () => void
}

const Ctx = createContext<StoreApi | null>(null)

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppState
      if (parsed.version === 1) return parsed
    }
  } catch {
    // estado corrompido → recomeça
  }
  return initialState()
}

/** Confere conquistas ainda não destravadas; muta `state` e devolve as novas. */
function runAchievements(state: AppState): Celebration[] {
  const now = new Date().toISOString()
  const celebrations: Celebration[] = []
  const users: UserId[] = ['vilker', 'isadora']
  for (const achievement of ACHIEVEMENTS) {
    const targets = achievement.scope === 'couple' ? users : ([state.currentUser] as UserId[])
    for (const userId of targets) {
      const already = state.unlocked.some(
        (u) => u.userId === userId && u.achievementId === achievement.id,
      )
      if (already || !achievement.check(state, userId)) continue
      state.unlocked.push({ userId, achievementId: achievement.id, unlockedAt: now })
      state.pointEvents.push(
        pointEvent(userId, TIER_POINTS[achievement.tier], 'achievement', {
          refId: achievement.id,
          label: `Conquista: ${achievement.name}`,
        }),
      )
      celebrations.push({ id: uid(), achievement, userId })
    }
  }
  return celebrations
}

function pointEvent(
  userId: UserId,
  points: number,
  reason: PointReason,
  opts: { refId?: string; label: string },
): PointEvent {
  return {
    id: uid(),
    userId,
    points,
    reason,
    refId: opts.refId,
    label: opts.label,
    createdAt: new Date().toISOString(),
  }
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState)
  const [celebrations, setCelebrations] = useState<Celebration[]>([])
  const [pointToasts, setPointToasts] = useState<PointToast[]>([])
  const toastTimers = useRef<number[]>([])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  }, [state])

  useEffect(() => {
    const timers = toastTimers.current
    return () => timers.forEach(clearTimeout)
  }, [])

  const pushToast = useCallback((points: number, label: string) => {
    const toast: PointToast = { id: uid(), points, label }
    setPointToasts((prev) => [...prev, toast])
    toastTimers.current.push(
      window.setTimeout(
        () => setPointToasts((prev) => prev.filter((t) => t.id !== toast.id)),
        2600,
      ),
    )
  }, [])

  /** aplica uma mutação, roda o motor de conquistas e agenda celebrações */
  const mutate = useCallback((fn: (draft: AppState) => PointEvent[]) => {
    setState((prev) => {
      const draft: AppState = structuredClone(prev)
      const earned = fn(draft)
      draft.pointEvents.push(...earned)
      const newCelebrations = runAchievements(draft)
      if (newCelebrations.length > 0) {
        setCelebrations((prevC) => [...prevC, ...newCelebrations])
      }
      const gained = earned.reduce((s, e) => s + e.points, 0)
      if (gained > 0) {
        setTimeout(() => pushToast(gained, earned.map((e) => e.label).join(' · ')), 0)
      }
      return draft
    })
  }, [pushToast])

  const api = useMemo<StoreApi>(
    () => ({
      state,
      celebrations,
      pointToasts,
      dismissCelebration: (id) =>
        setCelebrations((prev) => prev.filter((c) => c.id !== id)),

      setCurrentUser: (u) => setState((prev) => ({ ...prev, currentUser: u })),

      setIncome: (u, cents) =>
        setState((prev) => ({
          ...prev,
          users: {
            ...prev.users,
            [u]: { ...prev.users[u], monthlyIncomeCents: cents },
          },
        })),

      addTransaction: (input) =>
        mutate((draft) => {
          const me = draft.currentUser
          const now = new Date().toISOString()
          const tx: Transaction = {
            id: uid(),
            description: input.description,
            amountCents: input.amountCents,
            kind: input.kind,
            date: input.date,
            categoryId: input.categoryId,
            userId: me,
            paidBy: input.paidBy ?? me,
            status: 'paid',
            createdAt: now,
          }
          draft.transactions.push(tx)

          const earned: PointEvent[] = []
          const today = todayISO()
          const pointableToday = draft.pointEvents.filter(
            (e) =>
              e.userId === me &&
              e.reason === 'transaction_logged' &&
              e.createdAt.slice(0, 10) === today,
          ).length
          if (pointableToday < 5) {
            earned.push(
              pointEvent(me, 10, 'transaction_logged', { refId: tx.id, label: 'Lançamento' }),
            )
            if (input.date === today) {
              earned.push(
                pointEvent(me, 5, 'same_day_bonus', { refId: tx.id, label: 'No mesmo dia' }),
              )
            }
          }
          const firstOfDay = !draft.transactions.some(
            (t) => t.id !== tx.id && t.userId === me && t.createdAt.slice(0, 10) === today,
          )
          if (firstOfDay) {
            const streak = streakDays(draft, me)
            earned.push(
              pointEvent(me, streak >= 7 ? 10 : 5, 'streak_day', {
                refId: tx.id,
                label: `Streak ${streak} dia${streak > 1 ? 's' : ''} 🔥`,
              }),
            )
          }
          return earned
        }),

      deleteTransaction: (id) =>
        mutate((draft) => {
          const tx = draft.transactions.find((t) => t.id === id)
          if (!tx) return []
          draft.transactions = draft.transactions.filter((t) => t.id !== id)
          if (tx.recurringBillId) {
            const bill = draft.recurringBills.find((b) => b.id === tx.recurringBillId)
            if (bill) {
              for (const [key, info] of Object.entries(bill.paidMonths)) {
                if (info.transactionId === id) delete bill.paidMonths[key]
              }
            }
          }
          // anti-farm: estorna os pontos que o lançamento rendeu
          const gained = draft.pointEvents
            .filter((e) => e.refId === id && e.points > 0)
            .reduce((s, e) => s + e.points, 0)
          if (gained > 0) {
            return [
              pointEvent(tx.userId, -gained, 'reversal', {
                refId: id,
                label: 'Lançamento apagado',
              }),
            ]
          }
          return []
        }),

      addRecurringBill: (input) =>
        mutate((draft) => {
          draft.recurringBills.push({
            id: uid(),
            description: input.description,
            categoryId: input.categoryId,
            amountCents: input.amountCents,
            frequency: input.frequency,
            dueDay: input.dueDay,
            dueMonth: input.dueMonth,
            active: true,
            createdBy: draft.currentUser,
            startMonth: currentMonthKey(),
            paidMonths: {},
          })
          return []
        }),

      toggleRecurringBill: (id) =>
        setState((prev) => ({
          ...prev,
          recurringBills: prev.recurringBills.map((b) =>
            b.id === id ? { ...b, active: !b.active } : b,
          ),
        })),

      deleteRecurringBill: (id) =>
        setState((prev) => ({
          ...prev,
          recurringBills: prev.recurringBills.filter((b) => b.id !== id),
        })),

      markRecurringPaid: (billId, key) =>
        mutate((draft) => {
          const bill = draft.recurringBills.find((b) => b.id === billId)
          if (!bill || bill.paidMonths[key]) return []
          const me = draft.currentUser
          const now = new Date().toISOString()
          const dueDate = dueDateInMonth(bill, key)
          const tx: Transaction = {
            id: uid(),
            description: bill.description,
            amountCents: bill.amountCents,
            kind: 'expense',
            date: todayISO(),
            categoryId: bill.categoryId,
            userId: me,
            paidBy: me,
            recurringBillId: billId,
            status: 'paid',
            createdAt: now,
          }
          draft.transactions.push(tx)
          bill.paidMonths[key] = { transactionId: tx.id, paidAt: now }

          const earned: PointEvent[] = [
            pointEvent(me, 10, 'transaction_logged', {
              refId: tx.id,
              label: `${bill.description} paga`,
            }),
          ]
          if (todayISO() < dueDate) {
            earned.push(
              pointEvent(me, 15, 'paid_before_due', {
                refId: tx.id,
                label: 'Antes do vencimento',
              }),
            )
          }
          return earned
        }),

      addInstallmentPlan: (input) =>
        mutate((draft) => {
          const me = draft.currentUser
          const planId = uid()
          draft.installmentPlans.push({
            id: planId,
            description: input.description,
            totalCents: input.totalCents,
            count: input.count,
            firstDueDate: input.firstDueDate,
            categoryId: input.categoryId,
            createdBy: me,
          })
          const base = Math.floor(input.totalCents / input.count)
          const first = new Date(`${input.firstDueDate}T12:00:00`)
          const now = new Date().toISOString()
          for (let i = 0; i < input.count; i++) {
            const due = new Date(first)
            due.setMonth(due.getMonth() + i)
            // última parcela absorve o resto da divisão
            const amount =
              i === input.count - 1 ? input.totalCents - base * (input.count - 1) : base
            draft.transactions.push({
              id: uid(),
              description: `${input.description} (${i + 1}/${input.count})`,
              amountCents: amount,
              kind: 'expense',
              date: due.toISOString().slice(0, 10),
              categoryId: input.categoryId,
              userId: me,
              installmentPlanId: planId,
              installmentIndex: i + 1,
              status: 'pending',
              createdAt: now,
            })
          }
          return [
            pointEvent(me, 10, 'transaction_logged', {
              refId: planId,
              label: 'Parcelamento anotado',
            }),
          ]
        }),

      payInstallment: (transactionId) =>
        mutate((draft) => {
          const tx = draft.transactions.find((t) => t.id === transactionId)
          if (!tx || tx.status === 'paid') return []
          tx.status = 'paid'
          return []
        }),

      addReserve: (input) =>
        mutate((draft) => {
          const reserve: Reserve = {
            id: uid(),
            name: input.name,
            icon: input.icon,
            goalCents: input.goalCents,
            institution: input.institution,
            createdBy: draft.currentUser,
            isTravel: input.isTravel,
          }
          draft.reserves.push(reserve)
          return []
        }),

      addReserveMovement: (reserveId, amountCents) =>
        mutate((draft) => {
          const me = draft.currentUser
          draft.reserveMovements.push({
            id: uid(),
            reserveId,
            amountCents,
            date: todayISO(),
            userId: me,
            createdAt: new Date().toISOString(),
          })
          const today = todayISO()
          const alreadyToday = draft.pointEvents.some(
            (e) =>
              e.userId === me &&
              e.reason === 'reserve_deposit' &&
              e.refId === reserveId &&
              e.createdAt.slice(0, 10) === today,
          )
          if (amountCents > 0 && !alreadyToday) {
            return [
              pointEvent(me, 20, 'reserve_deposit', {
                refId: reserveId,
                label: 'Aporte na caixinha',
              }),
            ]
          }
          return []
        }),

      resetAll: () => setState(initialState()),
    }),
    [state, celebrations, pointToasts, mutate],
  )

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>
}

export function useStore(): StoreApi {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore precisa estar dentro de <AppStoreProvider>')
  return ctx
}
