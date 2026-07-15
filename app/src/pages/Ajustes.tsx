import { useState } from 'react'
import { useStore } from '../store/AppStore'
import { formatBRL, parseBRL } from '../lib/money'
import { Card, Field, PrimaryButton, SectionTitle, TextInput } from '../components/ui'
import type { UserId } from '../types'

export function Ajustes() {
  const { state, setIncome, setCurrentUser, resetAll } = useStore()
  const [confirmReset, setConfirmReset] = useState(false)

  return (
    <div>
      <SectionTitle>Quem está usando</SectionTitle>
      <Card className="flex gap-2">
        {(['vilker', 'isadora'] as UserId[]).map((id) => (
          <button
            key={id}
            onClick={() => setCurrentUser(id)}
            className={`flex-1 rounded-2xl border-2 py-3 font-display font-bold transition ${
              state.currentUser === id
                ? 'border-caramel-500 bg-caramel-100 dark:bg-caramel-700/25'
                : 'border-transparent bg-stone-50 dark:bg-stone-700'
            }`}
          >
            {state.users[id].name}
          </button>
        ))}
      </Card>
      <p className="mt-1 px-1 text-xs text-stone-400">
        Os lançamentos e pontos contam para quem estiver selecionado.
      </p>

      <SectionTitle>Renda mensal (para a projeção)</SectionTitle>
      <Card>
        {(['vilker', 'isadora'] as UserId[]).map((id) => (
          <IncomeField
            key={id}
            label={state.users[id].name}
            valueCents={state.users[id].monthlyIncomeCents}
            onSave={(cents) => setIncome(id, cents)}
          />
        ))}
        <p className="text-xs text-stone-400">
          Renda da casa: {formatBRL(state.users.vilker.monthlyIncomeCents + state.users.isadora.monthlyIncomeCents)}
        </p>
      </Card>

      <SectionTitle>Dados</SectionTitle>
      <Card>
        <p className="mb-3 text-sm text-stone-500 dark:text-stone-400">
          Por enquanto os dados ficam salvos neste navegador. A sincronização entre vocês dois
          (Supabase) chega na próxima versão — já está no roadmap!
        </p>
        {confirmReset ? (
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmReset(false)}
              className="flex-1 rounded-2xl bg-stone-100 py-3 text-sm font-bold dark:bg-stone-700"
            >
              Cancelar
            </button>
            <button
              onClick={() => {
                resetAll()
                setConfirmReset(false)
              }}
              className="flex-1 rounded-2xl bg-red-500 py-3 text-sm font-bold text-white"
            >
              Apagar tudo mesmo
            </button>
          </div>
        ) : (
          <button
            onClick={() => setConfirmReset(true)}
            className="text-sm font-bold text-red-500"
          >
            Apagar todos os dados…
          </button>
        )}
      </Card>
    </div>
  )
}

function IncomeField({
  label,
  valueCents,
  onSave,
}: {
  label: string
  valueCents: number
  onSave: (cents: number) => void
}) {
  const [value, setValue] = useState(
    valueCents > 0 ? (valueCents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '',
  )
  const cents = parseBRL(value)
  const dirty = cents !== valueCents

  return (
    <Field label={label}>
      <div className="flex gap-2">
        <TextInput
          inputMode="decimal"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="0,00"
        />
        {dirty && (
          <div className="w-28 shrink-0">
            <PrimaryButton onClick={() => onSave(cents)}>Salvar</PrimaryButton>
          </div>
        )}
      </div>
    </Field>
  )
}
