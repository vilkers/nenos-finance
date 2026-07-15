import { useMemo } from 'react'
import { useStore } from '../store/AppStore'
import { TIER_LABEL, TIER_POINTS } from '../lib/achievements'

const CONFETTI_COLORS = ['#F59E0B', '#3B82F6', '#EC4899', '#22C55E', '#FCD34D', '#8B5CF6']

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        left: `${Math.random() * 100}%`,
        background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        animationDelay: `${Math.random() * 0.8}s`,
        animationDuration: `${2 + Math.random() * 1.4}s`,
      })),
    [],
  )
  return (
    <>
      {pieces.map((style, i) => (
        <span key={i} className="confetti-piece" style={style} />
      ))}
    </>
  )
}

/** Modal de conquista destravada + toasts de pontos. Renderizar uma vez no App. */
export function CelebrationLayer() {
  const { state, celebrations, dismissCelebration, pointToasts } = useStore()
  const current = celebrations[0]

  return (
    <>
      {/* toasts de pontos */}
      <div className="pointer-events-none fixed inset-x-0 top-16 z-40 flex flex-col items-center gap-2 px-4">
        {pointToasts.map((t) => (
          <div
            key={t.id}
            className="animate-toast-in rounded-full bg-ink/90 px-4 py-2 text-sm font-bold text-white shadow-soft dark:bg-white/90 dark:text-ink"
          >
            {t.points > 0 ? `+${t.points} pts · ${t.label}` : t.label}
          </div>
        ))}
      </div>

      {current && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-6">
          <Confetti />
          <div className="animate-pop-in w-full max-w-xs rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-stone-800">
            <p className="text-xs font-extrabold uppercase tracking-widest text-caramel-600">
              Conquista desbloqueada!
            </p>
            <div className="my-4 grid place-items-center">
              <span className="grid size-24 place-items-center rounded-full bg-caramel-100 text-5xl dark:bg-caramel-700/30">
                {current.achievement.icon}
              </span>
            </div>
            <h3 className="font-display text-2xl font-bold">{current.achievement.name}</h3>
            <p className="mt-1 text-sm text-stone-500 dark:text-stone-400">
              {current.achievement.description}
            </p>
            <p className="mt-3 text-sm font-bold">
              {state.users[current.userId].name} · {TIER_LABEL[current.achievement.tier]} · +
              {TIER_POINTS[current.achievement.tier]} pts
            </p>
            <button
              onClick={() => dismissCelebration(current.id)}
              className="mt-5 w-full rounded-2xl bg-caramel-500 py-3 font-display text-lg font-bold text-white active:scale-[0.98]"
            >
              Au au! 🐶
            </button>
          </div>
        </div>
      )}
    </>
  )
}
