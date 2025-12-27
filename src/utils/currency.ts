// import { useSettingsStore } from '../stores/settings' // Non utilisé pour l'instant

/**
 * Helper pour formater les montants en XOF
 * Utilise XOF par défaut, mais peut être étendu pour utiliser les settings
 */
export function formatCurrency(amount: number | string, xof: string = 'XOF'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount)) {
    return '0 XOF'
  }

  // Format avec Intl.NumberFormat pour une meilleure localisation
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: xof,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount)
}

/**
 * Récupère le XOF depuis les settings ou utilise la valeur par défaut
 */
export function getCurrency(): string {
  // Pour l'instant, on utilise XOF par défaut
  // Si les settings contiennent un XOF plus tard, on pourra l'utiliser ici
  // const settingsStore = useSettingsStore() // Non utilisé pour l'instant
  // TODO: Ajouter XOF dans les settings si nécessaire
  // if (settingsStore.settings?.xof) {
  //   return settingsStore.settings.xof
  // }
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
    maximumFractionDigits: 0
  }).format(numAmount)

  return showCurrency ? `${formatted} XOF` : formatted
}

