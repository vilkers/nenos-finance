import { useMemo, useState } from 'react'
import { useStore } from '../store/AppStore'
import { ACHIEVEMENTS, TIER_LABEL, TIER_POINTS } from '../lib/achievements'
import { currentMonthKey, monthLabel } from '../lib/dates'
import { pointsInMonth, pointsTotal, streakDays } from '../lib/selectors'
import { Card, SectionTitle } from '../components/ui'
import type { UserId } from '../types'

export function Conquistas() {
  const { state } = useStore()
  const [aba, setAba] = useState<'conquistas' | 'ranking'>('conquistas')
  const me = state.currentUser

  return (
    <div>
      <div className="mb-4 flex gap-1 rounded-2xl bg-stone-100 p-1 dark:bg-stone-800">
        {(
          [
            ['conquistas', '🏆 Conquistas'],
            ['ranking', '⚔️ Ranking'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setAba(id)}
            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition ${
              aba === id
                ? 'bg-white shadow-soft dark:bg-stone-700'
                : 'text-stone-500 dark:text-stone-400'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {aba === 'conquistas' ? <ListaConquistas userId={me} /> : <Ranking />}
    </div>
  )
}

function ListaConquistas({ userId }: { userId: UserId }) {
  const { state } = useStore()
  const total = pointsTotal(state, userId)
  const streak = streakDays(state, userId)
  const unlockedIds = new Set(
    state.unlocked.filter((u) => u.userId === userId).map((u) => u.achievementId),
  )
  const unlocked = ACHIEVEMENTS.filter((a) => unlockedIds.has(a.id))
  const locked = ACHIEVEMENTS.filter((a) => !unlockedIds.has(a.id))

  return (
    <div>
      <Card className="text-center">
        <p className="font-display text-lg font-bold">
          {state.users[userId].name} · {total} pts
        </p>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          🔥 streak atual: {streak} dia{streak === 1 ? '' : 's'} · 🏆 {unlocked.length}/
          {ACHIEVEMENTS.length} conquistas
        </p>
      </Card>

      {unlocked.length > 0 && (
        <>
          <SectionTitle>Desbloqueadas ({unlocked.length})</SectionTitle>
          <div className="grid grid-cols-1 gap-2">
            {unlocked.map((a) => {
              const info = state.unlocked.find(
                (u) => u.userId === userId && u.achievementId === a.id,
              )
              return (
                <Card key={a.id} className="flex items-center gap-3 !py-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-caramel-100 text-2xl dark:bg-caramel-700/25">
                    {a.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold">{a.name}</p>
                    <p className="text-xs text-stone-500 dark:text-stone-400">{a.description}</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-extrabold text-caramel-600">+{TIER_POINTS[a.tier]}</p>
                    <p className="text-stone-400">
                      {info ? new Date(info.unlockedAt).toLocaleDateString('pt-BR') : ''}
                    </p>
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      <SectionTitle>Bloqueadas ({locked.length})</SectionTitle>
      <div className="grid grid-cols-1 gap-2">
        {locked.map((a) => (
          <Card key={a.id} className="flex items-center gap-3 !py-3 opacity-70">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-stone-100 text-2xl grayscale dark:bg-stone-700">
              {a.secret ? '❓' : '🔒'}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{a.secret ? '???' : a.name}</p>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                {a.secret ? 'Conquista secreta… continue jogando 🐶' : a.description}
              </p>
            </div>
            <p className="text-xs font-bold text-stone-400">
              {TIER_LABEL[a.tier]} · +{TIER_POINTS[a.tier]}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}

function Ranking() {
  const { state } = useStore()
  const key = currentMonthKey()

  const monthly = useMemo(() => {
    const keys = [...new Set(state.pointEvents.map((e) => e.createdAt.slice(0, 7)))]
      .filter((k) => k < key)
      .sort()
      .reverse()
    return keys.map((k) => ({
      key: k,
      vilker: pointsInMonth(state, 'vilker', k),
      isadora: pointsInMonth(state, 'isadora', k),
    }))
  }, [state, key])

  const vNow = pointsInMonth(state, 'vilker', key)
  const iNow = pointsInMonth(state, 'isadora', key)
  const vTotal = pointsTotal(state, 'vilker')
  const iTotal = pointsTotal(state, 'isadora')

  return (
    <div>
      <SectionTitle>Placar de {monthLabel(key)}</SectionTitle>
      <Card>
        <div className="flex items-center justify-around text-center">
          <Placar nome="Vilker" pts={vNow} cor="text-blue-600 dark:text-blue-400" lider={vNow > iNow} />
          <span className="text-2xl">⚔️</span>
          <Placar nome="Isadora" pts={iNow} cor="text-pink-600 dark:text-pink-400" lider={iNow > vNow} />
        </div>
        <div className="mt-3 flex h-3 overflow-hidden rounded-full bg-stone-200 dark:bg-stone-600">
          <div
            style={{
              width: vNow + iNow > 0 ? `${(vNow / (vNow + iNow)) * 100}%` : '50%',
              background: 'var(--color-vilker)',
            }}
          />
          <div className="flex-1" style={{ background: 'var(--color-isadora)' }} />
        </div>
        <p className="mt-2 text-center text-xs text-stone-500 dark:text-stone-400">
          O placar mensal zera todo dia 1º — que vença o melhor 🐶
        </p>
      </Card>

      <SectionTitle>Acumulado geral</SectionTitle>
      <Card className="flex items-center justify-around text-center">
        <Placar nome="Vilker" pts={vTotal} cor="text-blue-600 dark:text-blue-400" lider={vTotal > iTotal} />
        <span className="text-2xl">🏅</span>
        <Placar nome="Isadora" pts={iTotal} cor="text-pink-600 dark:text-pink-400" lider={iTotal > vTotal} />
      </Card>

      {monthly.length > 0 && (
        <>
          <SectionTitle>Campeões dos meses</SectionTitle>
          <Card className="divide-y divide-stone-100 !p-0 dark:divide-stone-700">
            {monthly.map((m) => (
              <div key={m.key} className="flex items-center justify-between p-3.5 text-sm">
                <span className="font-bold capitalize">{monthLabel(m.key)}</span>
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  {m.vilker} × {m.isadora}
                </span>
                <span className="font-bold">
                  {m.vilker === m.isadora
                    ? 'Empate 🤝'
                    : m.vilker > m.isadora
                      ? 'Vilker 🏆'
                      : 'Isadora 🏆'}
                </span>
              </div>
            ))}
          </Card>
        </>
      )}
    </div>
  )
}

function Placar({
  nome,
  pts,
  cor,
  lider,
}: {
  nome: string
  pts: number
  cor: string
  lider: boolean
}) {
  return (
    <div>
      <p className={`text-sm font-bold ${cor}`}>
        {nome} {lider && '👑'}
      </p>
      <p className="tabular font-display text-2xl font-bold">{pts}</p>
      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">pts</p>
    </div>
  )
}
