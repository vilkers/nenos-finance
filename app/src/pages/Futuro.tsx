import { useMemo, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useStore } from '../store/AppStore'
import { formatBRL, formatBRLCompact } from '../lib/money'
import { monthLabel } from '../lib/dates'
import { projectMonths, rateColor } from '../lib/projection'
import { Card, SectionTitle } from '../components/ui'
import { Link } from 'react-router-dom'

// paleta validada (light+dark) — ver docs/ROADMAP
const COLOR_RECORRENCIAS = '#B45309'
const COLOR_PARCELAS = '#7C3AED'
const COLOR_ESTIMATIVA = '#0284C7'

const HORIZONS = [3, 6, 12] as const

export function Futuro() {
  const { state } = useStore()
  const [horizon, setHorizon] = useState<(typeof HORIZONS)[number]>(6)
  const [includeEstimate, setIncludeEstimate] = useState(true)
  const [selected, setSelected] = useState(0)

  const months = useMemo(() => projectMonths(state, horizon), [state, horizon])
  const month = months[Math.min(selected, months.length - 1)]
  const income = month.incomeCents
  const semaforo = rateColor(month.rate)
  const hasEstimate = months.some((m) => m.variableEstCents > 0)

  const chartData = months.map((m, i) => ({
    index: i,
    name: monthLabel(m.key, 'short'),
    Recorrências: m.recurringCents / 100,
    Parcelas: m.installmentsCents / 100,
    ...(includeEstimate && hasEstimate
      ? { 'Avulsas (estimativa)': m.variableEstCents / 100 }
      : {}),
  }))

  const sobraGarantida = income - month.committedCents
  const sobraEstimada = sobraGarantida - month.variableEstCents

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold">🔮 Ver o futuro</h2>
        <div className="flex gap-1 rounded-full bg-stone-100 p-1 dark:bg-stone-800">
          {HORIZONS.map((h) => (
            <button
              key={h}
              onClick={() => {
                setHorizon(h)
                setSelected(0)
              }}
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                horizon === h
                  ? 'bg-white shadow-soft dark:bg-stone-700'
                  : 'text-stone-500 dark:text-stone-400'
              }`}
            >
              {h}m
            </button>
          ))}
        </div>
      </div>

      {state.recurringBills.length === 0 && state.installmentPlans.length === 0 ? (
        <Card>
          <div className="py-6 text-center">
            <span className="text-5xl">🐶🔭</span>
            <p className="mt-3 text-sm text-stone-500 dark:text-stone-400">
              Para eu enxergar o futuro, preciso conhecer os compromissos de vocês.
            </p>
            <Link
              to="/contas?aba=recorrentes"
              className="mt-2 inline-block font-bold text-caramel-600"
            >
              Cadastrar contas recorrentes →
            </Link>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 12, right: 8, left: 8, bottom: 0 }}
                  onClick={(e) => {
                    const idx = (e as { activeTooltipIndex?: number })?.activeTooltipIndex
                    if (typeof idx === 'number') setSelected(idx)
                  }}
                >
                  <CartesianGrid vertical={false} stroke="currentColor" strokeOpacity={0.08} />
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: 'currentColor', opacity: 0.6 }}
                  />
                  <YAxis hide />
                  <Tooltip
                    cursor={{ fill: 'currentColor', opacity: 0.05 }}
                    formatter={(value) => formatBRL(Math.round((value as number) * 100))}
                    contentStyle={{
                      background: 'var(--card-surface)',
                      border: 'none',
                      borderRadius: 12,
                      fontSize: 12,
                      color: 'inherit',
                      boxShadow: '0 4px 16px rgb(0 0 0 / 0.15)',
                    }}
                  />
                  <Bar
                    dataKey="Recorrências"
                    stackId="a"
                    fill={COLOR_RECORRENCIAS}
                    stroke="var(--card-surface)"
                    strokeWidth={2}
                  >
                    {chartData.map((d) => (
                      <Cell key={d.index} opacity={d.index === selected ? 1 : 0.55} />
                    ))}
                  </Bar>
                  <Bar
                    dataKey="Parcelas"
                    stackId="a"
                    fill={COLOR_PARCELAS}
                    stroke="var(--card-surface)"
                    strokeWidth={2}
                  >
                    {chartData.map((d) => (
                      <Cell key={d.index} opacity={d.index === selected ? 1 : 0.55} />
                    ))}
                  </Bar>
                  {includeEstimate && hasEstimate && (
                    <Bar
                      dataKey="Avulsas (estimativa)"
                      stackId="a"
                      fill={COLOR_ESTIMATIVA}
                      fillOpacity={0.45}
                      stroke="var(--card-surface)"
                      strokeWidth={2}
                      radius={[4, 4, 0, 0]}
                    >
                      {chartData.map((d) => (
                        <Cell key={d.index} opacity={d.index === selected ? 1 : 0.55} />
                      ))}
                    </Bar>
                  )}
                  {income > 0 && (
                    <ReferenceLine
                      y={income / 100}
                      ifOverflow="extendDomain"
                      stroke="#16a34a"
                      strokeDasharray="6 4"
                      strokeWidth={2}
                      label={{
                        value: `renda ${formatBRLCompact(income)}`,
                        position: 'insideTopRight',
                        fontSize: 11,
                        fill: '#16a34a',
                        fontWeight: 700,
                      }}
                    />
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-bold text-stone-500 dark:text-stone-400">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ background: COLOR_RECORRENCIAS }} />
                Recorrências
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full" style={{ background: COLOR_PARCELAS }} />
                Parcelas
              </span>
              {hasEstimate && (
                <label className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={includeEstimate}
                    onChange={(e) => setIncludeEstimate(e.target.checked)}
                    className="accent-sky-600"
                  />
                  <span className="size-2.5 rounded-full opacity-50" style={{ background: COLOR_ESTIMATIVA }} />
                  Avulsas (estimativa)
                </label>
              )}
            </div>
            <p className="mt-2 text-[11px] text-stone-400">
              Toque numa barra para ver o mês · estimativa = média de avulsas dos últimos 3 meses
            </p>
          </Card>

          <SectionTitle>{monthLabel(month.key)}</SectionTitle>
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-stone-500 dark:text-stone-400">Comprometido</p>
                <p className="tabular font-display text-2xl font-bold">
                  {formatBRL(month.committedCents)}
                </p>
              </div>
              <div
                className="rounded-full px-3 py-1.5 text-sm font-extrabold text-white"
                style={{ background: semaforo.color }}
              >
                {month.rate !== null ? `${Math.round(month.rate * 100)}% da renda` : 'sem renda'}{' '}
                {semaforo.emoji}
              </div>
            </div>
            {income > 0 && (
              <div className="mt-3 grid grid-cols-2 gap-3 border-t border-stone-100 pt-3 text-sm dark:border-stone-700">
                <div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Sobra garantida</p>
                  <p className="tabular font-bold text-green-600">{formatBRL(sobraGarantida)}</p>
                </div>
                <div>
                  <p className="text-xs text-stone-500 dark:text-stone-400">Sobra estimada</p>
                  <p className="tabular font-bold">
                    {formatBRL(sobraEstimada)}
                  </p>
                </div>
              </div>
            )}
          </Card>

          <SectionTitle>Compromissos do mês</SectionTitle>
          {month.items.length === 0 ? (
            <Card>
              <p className="py-2 text-center text-sm text-stone-500 dark:text-stone-400">
                Nenhum compromisso em {monthLabel(month.key)} 🎉
              </p>
            </Card>
          ) : (
            <Card className="divide-y divide-stone-100 !p-0 dark:divide-stone-700">
              {month.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5 text-sm">
                  <span
                    className="w-12 shrink-0 text-xs font-bold text-stone-400"
                  >
                    dia {item.day}
                  </span>
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{
                      background:
                        item.type === 'recorrencia' ? COLOR_RECORRENCIAS : COLOR_PARCELAS,
                    }}
                  />
                  <span className="min-w-0 flex-1 truncate font-bold">
                    {item.description}
                    {item.paid && ' ✓'}
                  </span>
                  <span className="tabular font-bold">{formatBRL(item.amountCents)}</span>
                </div>
              ))}
            </Card>
          )}
        </>
      )}
    </div>
  )
}
