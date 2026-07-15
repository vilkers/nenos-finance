import { Link } from 'react-router-dom'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import { useStore } from '../store/AppStore'
import { formatBRL } from '../lib/money'
import { currentMonthKey, monthLabel } from '../lib/dates'
import {
  categoryTotalsForMonth,
  householdIncomeCents,
  paidExpensesInMonth,
  pointsInMonth,
  totalCents,
  upcomingBills,
} from '../lib/selectors'
import { projectMonths } from '../lib/projection'
import { Card, EmptyState, ProgressBar, SectionTitle } from '../components/ui'

export function Dashboard() {
  const { state, markRecurringPaid } = useStore()
  const key = currentMonthKey()
  const spent = totalCents(paidExpensesInMonth(state, key))
  const income = householdIncomeCents(state)
  const pendingThisMonth = projectMonths(state, 1)[0].committedCents
  const forecastLeft = income - spent - pendingThisMonth
  const usedFraction = income > 0 ? spent / income : 0
  const upcoming = upcomingBills(state, 7)
  const topCategories = categoryTotalsForMonth(state, key)
  const vilkerPts = pointsInMonth(state, 'vilker', key)
  const isadoraPts = pointsInMonth(state, 'isadora', key)
  const totalPts = vilkerPts + isadoraPts

  return (
    <div>
      {/* resumo do mês */}
      <Card className="bg-gradient-to-br from-caramel-500 to-caramel-600 !text-white">
        <p className="text-xs font-extrabold uppercase tracking-widest text-caramel-100">
          {monthLabel(key)}
        </p>
        <div className="mt-2 flex items-end justify-between">
          <div>
            <p className="text-xs text-caramel-100">Gasto até agora</p>
            <p className="tabular font-display text-3xl font-bold">{formatBRL(spent)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-caramel-100">Sobra prevista</p>
            <p className="tabular font-display text-xl font-bold">
              {income > 0 ? `${formatBRL(forecastLeft)} ${forecastLeft >= 0 ? '🟢' : '🔴'}` : '—'}
            </p>
          </div>
        </div>
        {income > 0 ? (
          <div className="mt-3">
            <ProgressBar fraction={usedFraction} color="white" />
            <p className="mt-1 text-xs text-caramel-100">
              {Math.round(usedFraction * 100)}% da renda usada
            </p>
          </div>
        ) : (
          <Link to="/ajustes" className="mt-3 block text-xs font-bold underline">
            Configure a renda de vocês nos Ajustes para ver a sobra →
          </Link>
        )}
      </Card>

      {/* vence em breve */}
      <SectionTitle>Vence em breve</SectionTitle>
      {upcoming.length === 0 ? (
        <Card>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            Nada vencendo nos próximos 7 dias. 🐶 Zzz…
          </p>
          {state.recurringBills.length === 0 && (
            <Link to="/contas?aba=recorrentes" className="mt-1 block text-sm font-bold text-caramel-600">
              Cadastre aluguel, IPTU, empregada… →
            </Link>
          )}
        </Card>
      ) : (
        <Card className="divide-y divide-stone-100 !p-0 dark:divide-stone-700">
          {upcoming.map(({ bill, daysLeft, monthKey: mk }) => (
            <div key={`${bill.id}-${mk}`} className="flex items-center gap-3 p-3.5">
              <span className="text-xl">
                {state.categories.find((c) => c.id === bill.categoryId)?.icon ?? '📋'}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{bill.description}</p>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  {daysLeft < 0
                    ? `atrasada há ${-daysLeft}d 🔴`
                    : daysLeft === 0
                      ? 'vence hoje ⚠️'
                      : daysLeft === 1
                        ? 'vence amanhã'
                        : `em ${daysLeft} dias`}
                </p>
              </div>
              <p className="tabular text-sm font-bold">{formatBRL(bill.amountCents)}</p>
              <button
                onClick={() => markRecurringPaid(bill.id, mk)}
                className="rounded-full bg-green-100 px-3 py-1.5 text-xs font-bold text-green-700 active:scale-95 dark:bg-green-900/40 dark:text-green-300"
              >
                Pagar ✓
              </button>
            </div>
          ))}
        </Card>
      )}

      {/* gastos por categoria */}
      <SectionTitle>Gastos do mês</SectionTitle>
      <Card>
        {topCategories.length === 0 ? (
          <EmptyState emoji="🐶">
            Nada por aqui ainda… au! Registra a primeira conta no ➕ que eu te dou 10 pontos 🦴
          </EmptyState>
        ) : (
          <div className="flex items-center gap-4">
            <div className="h-32 w-32 shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topCategories.map((e) => ({ name: e.category!.name, value: e.cents }))}
                    dataKey="value"
                    innerRadius={38}
                    outerRadius={60}
                    paddingAngle={2}
                    strokeWidth={0}
                  >
                    {topCategories.map((e) => (
                      <Cell key={e.category!.id} fill={e.category!.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="min-w-0 flex-1 space-y-1.5">
              {topCategories.slice(0, 5).map((e) => (
                <li key={e.category!.id} className="flex items-center gap-2 text-sm">
                  <span
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ background: e.category!.color }}
                  />
                  <span className="min-w-0 flex-1 truncate">
                    {e.category!.icon} {e.category!.name}
                  </span>
                  <span className="tabular font-bold">
                    {spent > 0 ? Math.round((e.cents / spent) * 100) : 0}%
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* placar do mês */}
      <SectionTitle>Placar de {monthLabel(key).split(' ')[0]}</SectionTitle>
      <Link to="/conquistas">
        <Card>
          <div className="mb-2 flex items-center justify-between text-sm font-bold">
            <span style={{ color: 'var(--color-vilker)' }}>Vilker · {vilkerPts} pts</span>
            <span className="text-lg">⚔️</span>
            <span style={{ color: 'var(--color-isadora)' }}>Isadora · {isadoraPts} pts</span>
          </div>
          <div className="flex h-3 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-600">
            <div
              className="transition-all duration-500"
              style={{
                width: totalPts > 0 ? `${(vilkerPts / totalPts) * 100}%` : '50%',
                background: 'var(--color-vilker)',
              }}
            />
            <div
              className="flex-1 transition-all duration-500"
              style={{ background: 'var(--color-isadora)' }}
            />
          </div>
          <p className="mt-2 text-center text-xs font-bold text-stone-500 dark:text-stone-400">
            🏆 Ver conquistas e ranking →
          </p>
        </Card>
      </Link>

      {/* teaser viagens */}
      <Link to="/viagens" className="mt-4 block">
        <Card className="flex items-center gap-3 border-2 border-dashed border-caramel-300 !bg-caramel-50 dark:border-caramel-700 dark:!bg-caramel-700/15">
          <span className="text-3xl">🐶🕶️🧳</span>
          <div className="flex-1">
            <p className="font-display font-bold">Planejamento de Viagens</p>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Estamos preparando as malas…
            </p>
          </div>
          <span className="rounded-full bg-caramel-500 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white">
            Em breve
          </span>
        </Card>
      </Link>
    </div>
  )
}
