import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStore } from '../store/AppStore'
import { formatBRL, parseBRL } from '../lib/money'
import { currentMonthKey, formatDay, monthKey, todayISO } from '../lib/dates'
import type { Transaction } from '../types'
import { Card, EmptyState, Field, PrimaryButton, ProgressBar, Select, SectionTitle, TextInput } from '../components/ui'
import { Sheet } from '../components/Sheet'

type Aba = 'lancamentos' | 'recorrentes' | 'parcelas'

export function Contas() {
  const [params, setParams] = useSearchParams()
  const aba = (params.get('aba') as Aba) ?? 'lancamentos'

  return (
    <div>
      <div className="mb-4 flex gap-1 rounded-2xl bg-stone-100 p-1 dark:bg-stone-800">
        {(
          [
            ['lancamentos', 'Lançamentos'],
            ['recorrentes', 'Recorrentes'],
            ['parcelas', 'Parcelas'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setParams({ aba: id })}
            className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${
              aba === id
                ? 'bg-white shadow-soft dark:bg-stone-700'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {aba === 'lancamentos' && <Lancamentos />}
      {aba === 'recorrentes' && <Recorrentes />}
      {aba === 'parcelas' && <Parcelas />}
    </div>
  )
}

function Lancamentos() {
  const { state, deleteTransaction } = useStore()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const groups = useMemo(() => {
    const visible = state.transactions
      .filter((t) => !t.installmentPlanId || t.status === 'paid')
      .sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
    const map = new Map<string, Transaction[]>()
    for (const t of visible) {
      const list = map.get(t.date) ?? []
      list.push(t)
      map.set(t.date, list)
    }
    return [...map.entries()]
  }, [state.transactions])

  if (groups.length === 0) {
    return (
      <Card>
        <EmptyState emoji="🐶">
          Nada por aqui ainda… au! Registra a primeira conta no ➕ que eu te dou 10 pontos 🦴
        </EmptyState>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {groups.map(([date, txs]) => (
        <div key={date}>
          <SectionTitle>
            {date === todayISO() ? 'Hoje' : formatDay(date)}
          </SectionTitle>
          <Card className="divide-y divide-stone-100 !p-0 dark:divide-stone-700">
            {txs.map((t) => {
              const cat = state.categories.find((c) => c.id === t.categoryId)
              const who = t.paidBy ? state.users[t.paidBy].name : state.users[t.userId].name
              return (
                <div key={t.id} className="flex items-center gap-3 p-3.5">
                  <span className="text-xl">{cat?.icon ?? '📦'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{t.description}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">
                      {cat?.name} · {who} pagou
                    </p>
                  </div>
                  <p
                    className={`tabular text-sm font-bold ${
                      t.kind === 'income' ? 'text-green-600' : ''
                    }`}
                  >
                    {t.kind === 'income' ? '+' : '−'}
                    {formatBRL(t.amountCents)}
                  </p>
                  <button
                    onClick={() => setConfirmDelete(t.id)}
                    aria-label={`Apagar ${t.description}`}
                    className="text-stone-300 dark:text-stone-500"
                  >
                    🗑
                  </button>
                </div>
              )
            })}
          </Card>
        </div>
      ))}

      {confirmDelete && (
        <Sheet title="Apagar lançamento?" onClose={() => setConfirmDelete(null)}>
          <p className="mb-4 text-sm text-stone-500 dark:text-stone-400">
            Os pontos que ele rendeu serão estornados (nada de farmar pontos, hein 🐶).
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => setConfirmDelete(null)}
              className="flex-1 rounded-2xl bg-stone-100 py-3 font-bold dark:bg-stone-700"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                deleteTransaction(confirmDelete)
                setConfirmDelete(null)
              }}
              className="flex-1 rounded-2xl bg-red-500 py-3 font-bold text-white"
            >
              Apagar
            </button>
          </div>
        </Sheet>
      )}
    </div>
  )
}

function Recorrentes() {
  const { state, markRecurringPaid, toggleRecurringBill, deleteRecurringBill, addRecurringBill } =
    useStore()
  const [showNew, setShowNew] = useState(false)
  const key = currentMonthKey()

  return (
    <div className="space-y-3">
      {state.recurringBills.length === 0 && (
        <Card>
          <EmptyState emoji="🔁">
            Cadastre as contas fixas da casa — aluguel, IPTU, empregada, internet… O app lembra
            de tudo e ainda projeta o futuro.
          </EmptyState>
        </Card>
      )}
      {state.recurringBills.map((bill) => {
        const cat = state.categories.find((c) => c.id === bill.categoryId)
        const dueThisMonth =
          bill.frequency === 'monthly' || bill.dueMonth === Number(key.slice(5, 7))
        const paid = Boolean(bill.paidMonths[key])
        return (
          <Card key={bill.id} className={bill.active ? '' : 'opacity-50'}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{cat?.icon ?? '📋'}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{bill.description}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {formatBRL(bill.amountCents)} ·{' '}
                  {bill.frequency === 'monthly'
                    ? `todo dia ${bill.dueDay}`
                    : `anual, dia ${bill.dueDay}/${String(bill.dueMonth).padStart(2, '0')}`}
                </p>
              </div>
              {bill.active && dueThisMonth && (
                <span
                  className={`rounded-full px-2.5 py-1 text-[11px] font-extrabold ${
                    paid
                      ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300'
                      : 'bg-caramel-100 text-caramel-700 dark:bg-caramel-700/25 dark:text-caramel-300'
                  }`}
                >
                  {paid ? 'pago ✓' : 'pendente ⏳'}
                </span>
              )}
            </div>
            <div className="mt-3 flex gap-2 text-xs font-bold">
              {bill.active && dueThisMonth && !paid && (
                <button
                  onClick={() => markRecurringPaid(bill.id, key)}
                  className="rounded-full bg-green-500 px-3 py-1.5 text-white active:scale-95"
                >
                  Marcar pago este mês
                </button>
              )}
              <button
                onClick={() => toggleRecurringBill(bill.id)}
                className="rounded-full bg-stone-100 px-3 py-1.5 text-stone-600 dark:bg-stone-700 dark:text-stone-300"
              >
                {bill.active ? 'Pausar' : 'Reativar'}
              </button>
              <button
                onClick={() => deleteRecurringBill(bill.id)}
                className="rounded-full bg-stone-100 px-3 py-1.5 text-red-500 dark:bg-stone-700"
              >
                Excluir
              </button>
            </div>
          </Card>
        )
      })}
      <PrimaryButton onClick={() => setShowNew(true)}>+ Nova conta recorrente</PrimaryButton>
      {showNew && <NovaRecorrente onClose={() => setShowNew(false)} onSave={addRecurringBill} />}
    </div>
  )
}

function NovaRecorrente({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (input: {
    description: string
    categoryId: string
    amountCents: number
    frequency: 'monthly' | 'yearly'
    dueDay: number
    dueMonth?: number
  }) => void
}) {
  const { state } = useStore()
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('moradia')
  const [amount, setAmount] = useState('')
  const [frequency, setFrequency] = useState<'monthly' | 'yearly'>('monthly')
  const [dueDay, setDueDay] = useState('5')
  const [dueMonth, setDueMonth] = useState('1')
  const cents = parseBRL(amount)
  const canSave = description.trim().length > 0 && cents > 0

  return (
    <Sheet title="Nova conta recorrente" onClose={onClose}>
      <Field label="Nome">
        <TextInput
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex.: Aluguel, IPTU, Diarista…"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Valor">
          <TextInput
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0,00"
          />
        </Field>
        <Field label="Categoria">
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {state.categories
              .filter((c) => c.kind === 'expense')
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Frequência">
          <Select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as 'monthly' | 'yearly')}
          >
            <option value="monthly">Mensal</option>
            <option value="yearly">Anual</option>
          </Select>
        </Field>
        <Field label="Dia do vencimento">
          <TextInput
            type="number"
            min={1}
            max={31}
            value={dueDay}
            onChange={(e) => setDueDay(e.target.value)}
          />
        </Field>
      </div>
      {frequency === 'yearly' && (
        <Field label="Mês do vencimento">
          <Select value={dueMonth} onChange={(e) => setDueMonth(e.target.value)}>
            {[
              'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
              'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
            ].map((m, i) => (
              <option key={m} value={i + 1}>
                {m}
              </option>
            ))}
          </Select>
        </Field>
      )}
      <PrimaryButton
        disabled={!canSave}
        onClick={() => {
          onSave({
            description: description.trim(),
            categoryId,
            amountCents: cents,
            frequency,
            dueDay: Math.min(31, Math.max(1, Number(dueDay) || 1)),
            dueMonth: frequency === 'yearly' ? Number(dueMonth) : undefined,
          })
          onClose()
        }}
      >
        Salvar recorrência
      </PrimaryButton>
    </Sheet>
  )
}

function Parcelas() {
  const { state, addInstallmentPlan, payInstallment } = useStore()
  const [showNew, setShowNew] = useState(false)

  return (
    <div className="space-y-3">
      {state.installmentPlans.length === 0 && (
        <Card>
          <EmptyState emoji="💳">
            Parcelou o sofá, a passagem, o presente? Anota aqui que o app já espalha as parcelas
            no futuro.
          </EmptyState>
        </Card>
      )}
      {state.installmentPlans.map((plan) => {
        const txs = state.transactions
          .filter((t) => t.installmentPlanId === plan.id)
          .sort((a, b) => (a.installmentIndex ?? 0) - (b.installmentIndex ?? 0))
        const paidCount = txs.filter((t) => t.status === 'paid').length
        const next = txs.find((t) => t.status === 'pending')
        const cat = state.categories.find((c) => c.id === plan.categoryId)
        return (
          <Card key={plan.id}>
            <div className="flex items-center gap-3">
              <span className="text-xl">{cat?.icon ?? '💳'}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{plan.description}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {paidCount}/{plan.count} pagas · {formatBRL(Math.round(plan.totalCents / plan.count))}
                  /mês
                </p>
              </div>
              <p className="tabular text-sm font-bold">{formatBRL(plan.totalCents)}</p>
            </div>
            <div className="mt-3">
              <ProgressBar fraction={paidCount / plan.count} />
            </div>
            {next && (
              <button
                onClick={() => payInstallment(next.id)}
                className="mt-3 rounded-full bg-green-500 px-3 py-1.5 text-xs font-bold text-white active:scale-95"
              >
                Pagar parcela {next.installmentIndex}/{plan.count} ·{' '}
                {formatBRL(next.amountCents)} ({monthKey(next.date)})
              </button>
            )}
          </Card>
        )
      })}
      <PrimaryButton onClick={() => setShowNew(true)}>+ Novo parcelamento</PrimaryButton>
      {showNew && (
        <NovoParcelamento onClose={() => setShowNew(false)} onSave={addInstallmentPlan} />
      )}
    </div>
  )
}

function NovoParcelamento({
  onClose,
  onSave,
}: {
  onClose: () => void
  onSave: (input: {
    description: string
    totalCents: number
    count: number
    firstDueDate: string
    categoryId: string
  }) => void
}) {
  const { state } = useStore()
  const [description, setDescription] = useState('')
  const [total, setTotal] = useState('')
  const [count, setCount] = useState('10')
  const [firstDueDate, setFirstDueDate] = useState(todayISO())
  const [categoryId, setCategoryId] = useState('cartao')
  const totalCents = parseBRL(total)
  const n = Math.max(1, Number(count) || 1)
  const canSave = description.trim().length > 0 && totalCents > 0

  return (
    <Sheet title="Novo parcelamento" onClose={onClose}>
      <Field label="O que foi parcelado?">
        <TextInput
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex.: Sofá — Tok&Stok"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Valor total">
          <TextInput
            inputMode="decimal"
            value={total}
            onChange={(e) => setTotal(e.target.value)}
            placeholder="0,00"
          />
        </Field>
        <Field label="Nº de parcelas">
          <TextInput
            type="number"
            min={1}
            max={60}
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="1ª parcela em">
          <TextInput
            type="date"
            value={firstDueDate}
            onChange={(e) => setFirstDueDate(e.target.value)}
          />
        </Field>
        <Field label="Categoria">
          <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            {state.categories
              .filter((c) => c.kind === 'expense')
              .map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name}
                </option>
              ))}
          </Select>
        </Field>
      </div>
      {totalCents > 0 && (
        <p className="mb-3 text-center text-sm text-stone-500 dark:text-stone-400">
          {n}× de <strong className="tabular">{formatBRL(Math.floor(totalCents / n))}</strong>
        </p>
      )}
      <PrimaryButton
        disabled={!canSave}
        onClick={() => {
          onSave({
            description: description.trim(),
            totalCents,
            count: n,
            firstDueDate,
            categoryId,
          })
          onClose()
        }}
      >
        Anotar parcelamento
      </PrimaryButton>
    </Sheet>
  )
}
