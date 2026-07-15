import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/AppStore'
import { Card } from '../components/ui'

export function Viagens() {
  const { state, addReserve } = useStore()
  const navigate = useNavigate()
  const [created, setCreated] = useState(false)
  const hasTravelBox = state.reserves.some((r) => r.isTravel)

  return (
    <div className="pt-4">
      <Card className="overflow-hidden text-center">
        <div className="bg-gradient-to-b from-sky-100 to-transparent py-8 dark:from-sky-900/30">
          <p className="text-6xl">🐶🕶️</p>
          <p className="mt-1 text-4xl">🧳✈️</p>
        </div>
        <span className="inline-block rounded-full bg-caramel-500 px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-white">
          Em construção 🚧
        </span>
        <h1 className="mt-3 font-display text-2xl font-bold">Planejamento de Viagens</h1>
        <p className="mx-auto mt-1 max-w-64 text-sm text-stone-500 dark:text-stone-400">
          "Estamos preparando as malas… au!" — Estojo
        </p>

        <ul className="mx-auto mt-5 max-w-64 space-y-2 text-left text-sm">
          {[
            'Orçamento por viagem (voo, hospedagem, passeios)',
            'Caixinha conectada à meta da viagem',
            'Contagem regressiva pro embarque',
            'Checklist do que levar',
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <span className="text-stone-600 dark:text-stone-300">{item}</span>
            </li>
          ))}
        </ul>

        <div className="mt-6 pb-2">
          {hasTravelBox || created ? (
            <p className="text-sm font-bold text-green-600">
              Caixinha de viagem criada! Vão guardando que o módulo chega em breve ✈️
            </p>
          ) : (
            <button
              onClick={() => {
                addReserve({ name: 'Próxima viagem', icon: '✈️', isTravel: true })
                setCreated(true)
                setTimeout(() => navigate('/reservas'), 1600)
              }}
              className="rounded-2xl bg-caramel-500 px-5 py-3 font-display font-bold text-white shadow-soft active:scale-[0.98]"
            >
              🐷 Criar caixinha de viagem agora
            </button>
          )}
          <p className="mt-2 text-xs text-stone-400">
            (isso já funciona hoje — e destrava uma conquista 🏅)
          </p>
        </div>
      </Card>
    </div>
  )
}
