import type { ReactNode } from 'react'

export function Sheet({
  title,
  onClose,
  children,
}: {
  title: string
  onClose: () => void
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        aria-label="Fechar"
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
      />
      <div className="animate-slide-up relative w-full max-w-md rounded-t-3xl bg-white p-5 pb-8 shadow-2xl dark:bg-stone-800 max-h-[88dvh] overflow-y-auto">
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-stone-300 dark:bg-stone-600" />
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-xl font-bold">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-11 place-items-center rounded-full bg-stone-100 text-stone-500 dark:bg-stone-700 dark:text-stone-300"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
