/**
 * Helper pour formater les montants en XOF (libellé littéral, pas "F CFA").
 */
export function formatCurrency(amount: number | string, currency: string = 'XOF'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numAmount)) {
    return `0 ${currency}`
  }

  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount)

  return `${formatted} ${currency}`
}

/**
 * Récupère le code devise (XOF par défaut)
 */
export function getCurrency(): string {
  return 'XOF'
}

/**
 * Format simple pour afficher juste le montant avec la devise
 */
export function formatAmount(amount: number | string, showCurrency: boolean = true): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount

  if (isNaN(numAmount)) {
    return showCurrency ? '0 XOF' : '0'
  }

  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount)

  return showCurrency ? `${formatted} XOF` : formatted
}
