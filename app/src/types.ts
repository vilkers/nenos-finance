export type UserId = 'vilker' | 'isadora'

export interface User {
  id: UserId
  name: string
  emoji: string
  color: string
  monthlyIncomeCents: number
}

export type Kind = 'expense' | 'income'

export interface Category {
  id: string
  name: string
  icon: string
  color: string
  kind: Kind
  archived?: boolean
}

export interface RecurringBill {
  id: string
  description: string
  categoryId: string
  amountCents: number
  frequency: 'monthly' | 'yearly'
  dueDay: number
  /** 1–12, apenas para frequency = yearly */
  dueMonth?: number
  active: boolean
  createdBy: UserId
  /** mês "YYYY-MM" a partir do qual a conta vale (evita cobrar retroativo) */
  startMonth: string
  /** meses "YYYY-MM" já pagos */
  paidMonths: Record<string, { transactionId: string; paidAt: string }>
}

export interface InstallmentPlan {
  id: string
  description: string
  totalCents: number
  count: number
  firstDueDate: string
  categoryId: string
  createdBy: UserId
}

export interface Transaction {
  id: string
  description: string
  amountCents: number
  kind: Kind
  /** data da despesa/receita, YYYY-MM-DD */
  date: string
  categoryId: string
  /** quem registrou (base da gamificação) */
  userId: UserId
  paidBy?: UserId
  recurringBillId?: string
  installmentPlanId?: string
  installmentIndex?: number
  status: 'pending' | 'paid'
  createdAt: string
}

export interface Reserve {
  id: string
  name: string
  icon: string
  goalCents?: number
  institution?: string
  createdBy: UserId
  isTravel?: boolean
}

export interface ReserveMovement {
  id: string
  reserveId: string
  /** positivo = aporte, negativo = resgate */
  amountCents: number
  date: string
  userId: UserId
  createdAt: string
}

export type PointReason =
  | 'transaction_logged'
  | 'same_day_bonus'
  | 'paid_before_due'
  | 'reserve_deposit'
  | 'streak_day'
  | 'achievement'
  | 'reversal'

export interface PointEvent {
  id: string
  userId: UserId
  points: number
  reason: PointReason
  refId?: string
  label: string
  createdAt: string
}

export interface UnlockedAchievement {
  userId: UserId
  achievementId: string
  unlockedAt: string
}

export interface AppState {
  version: 1
  currentUser: UserId
  users: Record<UserId, User>
  categories: Category[]
  transactions: Transaction[]
  recurringBills: RecurringBill[]
  installmentPlans: InstallmentPlan[]
  reserves: Reserve[]
  reserveMovements: ReserveMovement[]
  pointEvents: PointEvent[]
  unlocked: UnlockedAchievement[]
}
