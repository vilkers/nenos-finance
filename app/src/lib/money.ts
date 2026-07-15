const brl = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatBRL(cents: number): string {
  return brl.format(cents / 100)
}

/** Formato compacto para eixos de gráfico: R$ 2,1 mil */
export function formatBRLCompact(cents: number): string {
  const value = cents / 100
  if (Math.abs(value) >= 1000) {
    return `R$ ${(value / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })} mil`
  }
  return brl.format(value)
}

/** "1.234,56" | "1234" | "12,5" → centavos */
export function parseBRL(input: string): number {
  const cleaned = input.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  const value = Number.parseFloat(cleaned)
  if (Number.isNaN(value)) return 0
  return Math.round(value * 100)
}
