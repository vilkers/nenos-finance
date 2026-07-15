import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-blob bg-white p-4 shadow-soft dark:bg-stone-800 ${className}`}
    >
      {children}
    </div>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-2 mt-5 px-1 text-xs font-extrabold uppercase tracking-widest text-stone-500 dark:text-stone-400">
      {children}
    </h2>
  )
}

export function PrimaryButton({
  children,
  onClick,
  disabled,
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-2xl bg-caramel-500 py-3.5 font-display text-lg font-bold text-white shadow-soft transition active:scale-[0.98] disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="mb-3 block">
      <span className="mb-1 block text-sm font-bold text-stone-600 dark:text-stone-300">
        {label}
      </span>
      {children}
    </label>
  )
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-stone-200 bg-cream px-3 py-2.5 text-base outline-none focus:border-caramel-500 dark:border-stone-600 dark:bg-stone-700 ${props.className ?? ''}`}
    />
  )
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-stone-200 bg-cream px-3 py-2.5 text-base outline-none focus:border-caramel-500 dark:border-stone-600 dark:bg-stone-700 ${props.className ?? ''}`}
    />
  )
}

export function EmptyState({
  emoji,
  children,
}: {
  emoji: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-2 py-10 text-center">
      <span className="animate-wiggle text-5xl">{emoji}</span>
      <p className="max-w-60 text-sm text-stone-500 dark:text-stone-400">{children}</p>
    </div>
  )
}

export function ProgressBar({
  fraction,
  color = 'var(--color-caramel-500)',
}: {
  fraction: number
  color?: string
}) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-200 dark:bg-stone-600">
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, fraction * 100))}%`, background: color }}
      />
    </div>
  )
}
