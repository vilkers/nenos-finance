import { useMemo, useState } from 'react'
import { useStore } from '../store/AppStore'
import { parseBRL } from '../lib/money'
import { todayISO } from '../lib/dates'
import type { Kind, UserId } from '../types'
import { Sheet } from './Sheet'
import { Field, PrimaryButton, Select, TextInput } from './ui'

export function NewTransactionSheet({ onClose }: { onClose: () => void }) {
  const { state, addTransaction } = useStore()
  const [amount, setAmount] = useState('')
  const [kind, setKind] = useState<Kind>('expense')
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [showDetails, setShowDetails] = useState(false)
  const [description, setDescription] = useState('')
  const [date, setDate] = useState(todayISO())
  const [paidBy, setPaidBy] = useState<UserId>(state.currentUser)

  // categorias mais usadas primeiro; Estojo 🐶 sempre visível
  const categories = useMemo(() => {
    const usage = new Map<string, number>()
    for (const t of state.transactions) {
      usage.set(t.categoryId, (usage.get(t.categoryId) ?? 0) + 1)
    }
    return state.categories
      .filter((c) => c.kind === kind && !c.archived)
      .sort((a, b) => {
        if (a.id === 'estojo') return -1
        if (b.id === 'estojo') return 1
        return (usage.get(b.id) ?? 0) - (usage.get(a.id) ?? 0)
      })
  }, [state.categories, state.transactions, kind])

  const cents = parseBRL(amount)
  const canSave = cents > 0 && categoryId !== null

  function save() {
    if (!canSave || !categoryId) return
    const category = state.categories.find((c) => c.id === categoryId)
    addTransaction({
      description: description.trim() || category?.name || 'Lançamento',
      amountCents: cents,
      kind,
      date,
      categoryId,
      paidBy,
    })
    onClose()
  }

  return (
    <Sheet title="Novo lançamento" onClose={onClose}>
      <div className="mb-4 flex gap-2">
        {(
          [
            ['expense', '💸 Despesa'],
            ['income', '💰 Receita'],
          ] as const
        ).map(([k, label]) => (
          <button
            key={k}
            onClick={() => {
              setKind(k)
              setCategoryId(null)
            }}
            className={`flex-1 rounded-xl py-2 text-sm font-bold transition ${
              kind === k
                ? 'bg-caramel-500 text-white'
                : 'bg-stone-100 text-stone-500 dark:bg-stone-700 dark:text-stone-300'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

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

      <div className="mb-4 grid grid-cols-4 gap-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setCategoryId(c.id)}
            className={`flex flex-col items-center gap-1 rounded-2xl border-2 px-1 py-2.5 text-[11px] font-bold transition ${
              categoryId === c.id
                ? 'border-caramel-500 bg-caramel-100 dark:bg-caramel-700/25'
                : 'border-transparent bg-stone-50 dark:bg-stone-700'
            }`}
          >
            <span className="text-2xl leading-none">{c.icon}</span>
            <span className="line-clamp-1">{c.name}</span>
          </button>
        ))}
      </div>

      {showDetails ? (
        <div className="mb-2">
          <Field label="Descrição (opcional)">
            <TextInput
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex.: ração do Estojo"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Data">
              <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Quem pagou">
              <Select value={paidBy} onChange={(e) => setPaidBy(e.target.value as UserId)}>
                <option value="vilker">Vilker</option>
                <option value="isadora">Isadora</option>
              </Select>
            </Field>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowDetails(true)}
          className="mb-4 w-full text-center text-sm font-bold text-caramel-600"
        >
          + mais detalhes (descrição, data, quem pagou)
        </button>
      )}

      <PrimaryButton onClick={save} disabled={!canSave}>
        Salvar {kind === 'expense' ? 'despesa' : 'receita'}
      </PrimaryButton>
    </Sheet>
  )
}
