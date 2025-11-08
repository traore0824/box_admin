import { useSettingsStore } from '../stores/settings'

/**
 * Helper pour formater les montants en currency
 * Utilise XOF (FCFA) par défaut, mais peut être étendu pour utiliser les settings
 */
export function formatCurrency(amount: number | string, currency: string = 'XOF'): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount)) {
    return '0 FCFA'
  }

  // Format avec Intl.NumberFormat pour une meilleure localisation
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount)
}

/**
 * Récupère la currency depuis les settings ou utilise la valeur par défaut
 */
export function getCurrency(): string {
  // Pour l'instant, on utilise XOF par défaut
  // Si les settings contiennent une currency plus tard, on pourra l'utiliser ici
  const settingsStore = useSettingsStore()
  // TODO: Ajouter currency dans les settings si nécessaire
  // if (settingsStore.settings?.currency) {
  //   return settingsStore.settings.currency
  // }
  return 'XOF'
}

/**
 * Format simple pour afficher juste le montant avec la devise
 */
export function formatAmount(amount: number | string, showCurrency: boolean = true): string {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount)) {
    return showCurrency ? '0 FCFA' : '0'
  }

  const formatted = new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(numAmount)

  return showCurrency ? `${formatted} FCFA` : formatted
}

