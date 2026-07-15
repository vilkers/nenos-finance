import { useState, type ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useStore } from '../store/AppStore'
import { currentMonthKey } from '../lib/dates'
import { pointsInMonth, streakDays } from '../lib/selectors'
import { NewTransactionSheet } from './NewTransactionSheet'

const TABS = [
  { to: '/', icon: '🏠', label: 'Início' },
  { to: '/contas', icon: '📋', label: 'Contas' },
  { to: '/futuro', icon: '🔮', label: 'Futuro' },
  { to: '/reservas', icon: '🐷', label: 'Reservas' },
]

export function Layout({ children }: { children: ReactNode }) {
  const { state, setCurrentUser, notify } = useStore()
  const [showNew, setShowNew] = useState(false)
  const location = useLocation()
  const me = state.users[state.currentUser]
  const streak = streakDays(state, state.currentUser)
  const monthPts = pointsInMonth(state, state.currentUser, currentMonthKey())
  const isHome = location.pathname === '/'

  return (
    <div className="mx-auto flex min-h-dvh max-w-md flex-col">
      <header className="flex items-center justify-between px-5 pb-2 pt-5">
        <div>
          {isHome ? (
            <h1 className="font-display text-2xl font-bold">
              Olá, {me.name} 👋
            </h1>
          ) : (
            <h1 className="font-display text-2xl font-bold">Nenos Finance</h1>
          )}
          <p className="text-xs text-stone-500 dark:text-stone-400">
            🔥 {streak} dia{streak === 1 ? '' : 's'} de streak · ⭐ {monthPts} pts no mês
          </p>
        </div>
        <div className="flex items-center gap-2">
          <NavLink
            to="/ajustes"
            aria-label="Ajustes"
            className="grid size-11 place-items-center rounded-full bg-white text-lg shadow-soft dark:bg-stone-800"
          >
            ⚙️
          </NavLink>
          <button
            onClick={() => {
              const next = state.currentUser === 'vilker' ? 'isadora' : 'vilker'
              setCurrentUser(next)
              notify(`Agora registrando como ${state.users[next].name} ${state.users[next].emoji}`)
            }}
            aria-label={`Trocar usuário (atual: ${me.name})`}
            className="grid size-11 place-items-center rounded-full font-display text-lg font-bold shadow-soft"
            style={{ background: me.color, color: 'white' }}
          >
            {me.name[0]}
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 pb-32">{children}</main>

      {/* tab bar + FAB */}
      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md">
        <div className="relative mx-3 mb-3 flex items-end justify-between rounded-3xl bg-white/95 px-2 py-2 shadow-[0_-2px_24px_rgb(41_37_36/0.12)] backdrop-blur dark:bg-stone-800/95">
          {TABS.slice(0, 2).map((t) => (
            <Tab key={t.to} {...t} />
          ))}
          <button
            onClick={() => setShowNew(true)}
            aria-label="Novo lançamento"
            className="relative -top-5 grid size-16 shrink-0 place-items-center rounded-full bg-caramel-500 text-3xl font-bold text-white shadow-[0_6px_20px_rgb(245_158_11/0.5)] transition active:scale-95"
          >
            +
          </button>
          {TABS.slice(2).map((t) => (
            <Tab key={t.to} {...t} />
          ))}
        </div>
      </nav>

      {showNew && <NewTransactionSheet onClose={() => setShowNew(false)} />}
    </div>
  )
}

function Tab({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex w-16 flex-col items-center gap-0.5 rounded-2xl py-1.5 text-[11px] font-bold transition ${
          isActive
            ? 'bg-caramel-100 text-caramel-700 dark:bg-caramel-700/25 dark:text-caramel-300'
            : 'text-stone-500 dark:text-stone-400'
        }`
      }
    >
      <span className="text-xl leading-none">{icon}</span>
      {label}
    </NavLink>
  )
}
