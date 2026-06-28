export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  deposit: 'Dépôt',
  withdrawal: 'Retrait',
  cancellation: 'Annulation',
  partial_withdrawal: 'Retrait partiel',
  withdrawal_request: 'Demande de retrait',
}

export function getTransactionTypeLabel(type?: string | null): string {
  if (!type) return '-'
  return TRANSACTION_TYPE_LABELS[type] || type
}

export function isWithdrawalLikeType(type?: string | null): boolean {
  if (!type) return false
  return ['withdrawal', 'cancellation', 'partial_withdrawal', 'withdrawal_request'].includes(type)
}

export function isDebitTransactionType(type?: string | null): boolean {
  if (!type) return false
  return type !== 'deposit'
}

export function getTransactionTypeBadgeClass(type?: string | null): string {
  switch (type) {
    case 'deposit':
      return 'bg-success-light text-success-dark'
    case 'withdrawal':
    case 'withdrawal_request':
      return 'bg-warning-light text-warning-dark'
    case 'partial_withdrawal':
      return 'bg-blue-100 text-blue-800'
    case 'cancellation':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getTransactionAmountClass(type?: string | null): string {
  if (type === 'deposit') return 'text-success'
  if (isDebitTransactionType(type)) return 'text-danger'
  return 'text-gray-900'
}
