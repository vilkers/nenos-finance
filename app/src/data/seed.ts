import type { AppState, Category, User, UserId } from '../types'

export const USERS: Record<UserId, User> = {
  vilker: {
    id: 'vilker',
    name: 'Vilker',
    emoji: '🧑‍💻',
    color: 'var(--color-vilker)',
    monthlyIncomeCents: 0,
  },
  isadora: {
    id: 'isadora',
    name: 'Isadora',
    emoji: '👩',
    color: 'var(--color-isadora)',
    monthlyIncomeCents: 0,
  },
}

export const SEED_CATEGORIES: Category[] = [
  { id: 'moradia', name: 'Moradia', icon: '🏠', color: '#f59e0b', kind: 'expense' },
  { id: 'impostos', name: 'Impostos', icon: '🧾', color: '#78716c', kind: 'expense' },
  { id: 'cartao', name: 'Cartão de crédito', icon: '💳', color: '#8b5cf6', kind: 'expense' },
  { id: 'casa-servicos', name: 'Casa & Serviços', icon: '🧹', color: '#0ea5e9', kind: 'expense' },
  { id: 'estojo', name: 'Estojo', icon: '🐶', color: '#d97706', kind: 'expense' },
  { id: 'mercado', name: 'Mercado', icon: '🛒', color: '#22c55e', kind: 'expense' },
  { id: 'transporte', name: 'Transporte', icon: '🚗', color: '#64748b', kind: 'expense' },
  { id: 'saude', name: 'Saúde', icon: '💊', color: '#ef4444', kind: 'expense' },
  { id: 'lazer', name: 'Lazer', icon: '🎉', color: '#ec4899', kind: 'expense' },
  { id: 'viagens', name: 'Viagens', icon: '✈️', color: '#3b82f6', kind: 'expense' },
  { id: 'outros', name: 'Outros', icon: '📦', color: '#a8a29e', kind: 'expense' },
  { id: 'salario', name: 'Salário', icon: '💰', color: '#16a34a', kind: 'income' },
  { id: 'renda-extra', name: 'Renda extra', icon: '✨', color: '#eab308', kind: 'income' },
]

export function initialState(): AppState {
  return {
    version: 1,
    currentUser: 'vilker',
    users: structuredClone(USERS),
    categories: structuredClone(SEED_CATEGORIES),
    transactions: [],
    recurringBills: [],
    installmentPlans: [],
    reserves: [],
    reserveMovements: [],
    pointEvents: [],
    unlocked: [],
  }
}
