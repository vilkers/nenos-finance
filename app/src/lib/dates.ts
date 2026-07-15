import { format, addMonths, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

/** YYYY-MM-DD de hoje, no fuso local */
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/** "YYYY-MM" do mês de uma data ISO */
export function monthKey(dateISO: string): string {
  return dateISO.slice(0, 7)
}

export function currentMonthKey(): string {
  return format(new Date(), 'yyyy-MM')
}

export function addMonthsToKey(key: string, months: number): string {
  return format(addMonths(parseISO(`${key}-01`), months), 'yyyy-MM')
}

/** "2026-07" → "julho de 2026" */
export function monthLabel(key: string, style: 'long' | 'short' = 'long'): string {
  const date = parseISO(`${key}-01`)
  return style === 'long'
    ? format(date, 'MMMM yyyy', { locale: ptBR })
    : format(date, 'MMM', { locale: ptBR })
}

export function formatDay(dateISO: string): string {
  return format(parseISO(dateISO), "d 'de' MMMM", { locale: ptBR })
}

/** dias entre hoje e a data (negativo = passado) */
export function daysUntil(dateISO: string): number {
  const target = parseISO(dateISO)
  const today = parseISO(todayISO())
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}
