import { useMemo, useState } from 'react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import { useStore } from '../store/AppStore'
import { formatBRL, parseBRL } from '../lib/money'
import { addMonthsToKey, currentMonthKey, monthLabel } from '../lib/dates'
import { reserveBalanceCents, reservesTotalCents } from '../lib/selectors'
import { Card, EmptyState, Field, PrimaryButton, ProgressBar, SectionTitle, TextInput } from '../components/ui'
import { Sheet } from '../components/Sheet'
import type { Reserve } from '../types'

const ICONS = ['🧊', '✈️', '🐶', '🏖️', '🚗', '🏠', '💍', '🎓', '🛠️', '💰']

export function Reservas() {
  const { state, addReserve, addReserveMovement } = useStore()
  const [showNew, setShowNew] = useState(false)
  const [movement, setMovement] = useState<{ reserve: Reserve; kind: 'aporte' | 'resgate' } | null>(null)

  const total = reservesTotalCents(state)

  // evolução dos últimos 12 meses (saldo acumulado ao fim de cada mês)
  const evolution = useMemo(() => {
    const current = currentMonthKey()
    return Array.from({ length: 12 }, (_, i) => {
      const key = addMonthsToKey(current, i - 11)
      const cents = state.reserveMovements
        .filter((m) => m.date.slice(0, 7) <= key)
        .reduce((sum, m) => sum + m.amountCents, 0)
      return { name: monthLabel(key, 'short'), value: cents / 100 }
    })
  }, [state.reserveMovements])

  return (
    <div>
      <Card className="bg-gradient-to-br from-caramel-500 to-caramel-600 !text-white">
        <p className="text-xs font-extrabold uppercase tracking-widest text-caramel-100">
          Total guardado
        </p>
        <p className="tabular mt-1 font-display text-3xl font-bold">{formatBRL(total)}</p>
        {state.reserveMovements.length > 0 && (
          <div className="mt-2 h-20">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolution} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="reservas-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity={0.55} />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10, fill: '#ffffff', opacity: 0.7 }}
                  interval="preserveStartEnd"
                />
                <Tooltip
                  formatter={(value) => formatBRL(Math.round((value as number) * 100))}
                  contentStyle={{
                    background: 'var(--card-surface)',
                    border: 'none',
                    borderRadius: 12,
                    fontSize: 12,
                    boxShadow: '0 4px 16px rgb(0 0 0 / 0.15)',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Guardado"
                  stroke="#ffffff"
                  strokeWidth={2}
                  fill="url(#reservas-fill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      <SectionTitle>Caixinhas</SectionTitle>
      {state.reserves.length === 0 ? (
        <Card>
          <EmptyState emoji="🐶⛏️">
            Nenhuma caixinha ainda! Crie uma pra emergência, uma pra viagem… eu ajudo a cavar.
          </EmptyState>
        </Card>
      ) : (
        <div className="space-y-3">
          {state.reserves.map((r) => {
            const balance = reserveBalanceCents(state, r.id)
            return (
              <Card key={r.id}>
                <div className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-caramel-100 text-xl dark:bg-caramel-700/25">
                    {r.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">
                      {r.name}
                      {r.isTravel && ' ✈️'}
                    </p>
                    {r.institution && (
                      <p className="text-xs text-stone-500 dark:text-stone-400">{r.institution}</p>
                    )}
                  </div>
                  <p className="tabular font-display text-lg font-bold">{formatBRL(balance)}</p>
                </div>
                {r.goalCents ? (
                  <div className="mt-3">
                    <ProgressBar fraction={balance / r.goalCents} color="#22c55e" />
                    <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
                      {Math.min(100, Math.round((balance / r.goalCents) * 100))}% da meta de{' '}
                      {formatBRL(r.goalCents)}
                      {balance < r.goalCents && ` · faltam ${formatBRL(r.goalCents - balance)}`}
                    </p>
                  </div>
                ) : null}
                <div className="mt-3 flex gap-2 text-xs font-bold">
                  <button
                    onClick={() => setMovement({ reserve: r, kind: 'aporte' })}
                    className="rounded-full bg-green-500 px-3.5 py-1.5 text-white active:scale-95"
                  >
                    + Aportar
                  </button>
                  <button
                    onClick={() => setMovement({ reserve: r, kind: 'resgate' })}
                    className="rounded-full bg-stone-100 px-3.5 py-1.5 text-stone-600 dark:bg-stone-700 dark:text-stone-300"
                  >
                    − Resgatar
                  </button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <div className="mt-4">
        <PrimaryButton onClick={() => setShowNew(true)}>+ Nova caixinha</PrimaryButton>
      </div>

      {showNew && <NovaCaixinha onClose={() => setShowNew(false)} onSave={addReserve} />}
      {movement && (
        <Movimento
          reserve={movement.reserve}
          kind={movement.kind}
          onClose={() => setMovement(null)}
          onSave={(cents) =>
            addReserveMovement(movement.reserve.id, movement.kind === 'aporte' ? cents : -cents)
          }
        />
      )}
    </div>
  )
}

function NovaCaixinha({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (input: {
    name: string
    icon: string
    goalCents?: number
    institution?: string
    isTravel?: boolean
  }) => void
}) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('🧊')
  const [goal, setGoal] = useState('')
  const [institution, setInstitution] = useState('')
  const goalCents = parseBRL(goal)

  return (
    <Sheet title="Nova caixinha" onClose={onClose}>
      <Field label="Nome">
        <TextInput
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ex.: Emergência, Viagem Chile…"
        />
      </Field>
      <Field label="Ícone">
        <div className="flex flex-wrap gap-2">
          {ICONS.map((i) => (
            <button
              key={i}
              onClick={() => setIcon(i)}
              className={`grid size-11 place-items-center rounded-2xl text-xl transition ${
                icon === i
                  ? 'bg-caramel-500 shadow-soft'
                  : 'bg-stone-100 dark:bg-stone-700'
              }`}
            >
              {i}
            </button>
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Meta (opcional)">
          <TextInput
            inputMode="decimal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="0,00"
          />
        </Field>
        <Field label="Onde está (opcional)">
          <TextInput
            value={institution}
            onChange={(e) => setInstitution(e.target.value)}
            placeholder="Nubank, CDB…"
          />
        </Field>
      </div>
      <PrimaryButton
        disabled={name.trim().length === 0}
        onClick={() => {
          onSave({
            name: name.trim(),
            icon,
            goalCents: goalCents > 0 ? goalCents : undefined,
            institution: institution.trim() || undefined,
            isTravel: icon === '✈️' || icon === '🏖️' || /viage|viaja/i.test(name),
          })
          onClose()
        }}
      >
        Criar caixinha
      </PrimaryButton>
    </Sheet>
  )
}

function Movimento({
  reserve,
  kind,
  onClose,
  onSave,
}: {
  reserve: Reserve
  kind: 'aporte' | 'resgate'
  onClose: () => void
  onSave: (cents: number) => void
}) {
  const [amount, setAmount] = useState('')
  const cents = parseBRL(amount)

  return (
    <Sheet
      title={`${kind === 'aporte' ? 'Aportar em' : 'Resgatar de'} ${reserve.icon} ${reserve.name}`}
      onClose={onClose}
    >
      <div className="mb-4 flex items-baseline justify-center gap-1 rounded-2xl bg-cream py-4 dark:bg-stone-700">
        <span className="text-lg font-bold text-stone-400">R$</span>
        <input
          autoFocus
          inputMode="decimal"
          placeholder="0,00"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="tabular w-40 bg-transparent text-center font-display text-4xl font-bold outline-none placeholder:text-stone-300 dark:placeholder:text-stone-500"
        />
      </div>
      {kind === 'aporte' && (
        <p className="mb-3 text-center text-xs text-stone-500 dark:text-stone-400">
          Aporte vale +20 pts (1× por caixinha por dia) 🐶
        </p>
      )}
      <PrimaryButton
        disabled={cents <= 0}
        onClick={() => {
          onSave(cents)
          onClose()
        }}
      >
        Confirmar {kind}
      </PrimaryButton>
    </Sheet>
  )
}
