import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { fetchWithAuth } from './fetchwithtoken'

interface NetworkStats {
  count: number
  total_amount: number
}

interface DashboardStats {
  all_users: number
  agent_users: number
  inactive_users: number
  active_users: number
  total_caisses: number
  caisse_done: number
  caisse_cancel: number
  caisse_pending: number
  caisse_disabled: number
  all_week_caisse: number
  custom_caisse: number
  all_month_caisse: number
  all_days_caisse: number
  total_transactions: number
  deposit_transactions: number
  withdrawal_transactions: number
  caisse_active_amount: number
  evolution: {
    all_users: number
    active_users: number
    total_caisses: number
    total_transactions: number
  }
  // Nouvelles statistiques Wallet
  total_wallets?: number
  active_wallets?: number
  total_wallets_balance?: number
  avg_wallet_balance?: number
  total_wallet_deposits?: number
  total_wallet_withdrawals?: number
  // Nouvelles statistiques Commissions
  total_commissions_generated?: number
  total_commissions_withdrawn?: number
  commission_available?: number
  commission_total?: number
  // Nouvelles statistiques Bonus de Parrainage
  total_referral_bonus_attributed?: number
  total_referral_bonus_withdrawn?: number
  total_referral_bonus_available?: number
  // Nouvelles statistiques Transactions avancées
  successful_transactions?: number
  failed_transactions?: number
  pending_transactions?: number
  success_rate?: number
  failure_rate?: number
  avg_transaction_amount?: number
  avg_deposit_amount?: number
  avg_withdrawal_amount?: number
  network_stats?: {
    MOOV?: NetworkStats
    MTN?: NetworkStats
    Celtis?: NetworkStats
  }
  failed_withdrawal_attempts?: number
  // Nouvelles statistiques KYC
  kyc_verified?: number
  kyc_pending?: number
  kyc_rejected?: number
  kyc_not_submitted?: number
  // Nouvelles statistiques Sécurité
  blocked_accounts?: number
}

export const useDashboardStore = defineStore('dashboard', () => {
  const stats = ref<DashboardStats>({
    all_users: 0,
    agent_users: 0,
    inactive_users: 0,
    active_users: 0,
    total_caisses: 0,
    caisse_done: 0,
    caisse_cancel: 0,
    caisse_pending: 0,
    caisse_disabled: 0,
    all_week_caisse: 0,
    custom_caisse: 0,
    all_month_caisse: 0,
    all_days_caisse: 0,
    total_transactions: 0,
    deposit_transactions: 0,
    withdrawal_transactions: 0,
    caisse_active_amount: 0,
    evolution: {
      all_users: 0,
      active_users: 0,
      total_caisses: 0,
      total_transactions: 0
    },
    // Nouvelles statistiques initialisées à 0
    total_wallets: 0,
    active_wallets: 0,
    total_wallets_balance: 0,
    avg_wallet_balance: 0,
    total_wallet_deposits: 0,
    total_wallet_withdrawals: 0,
    total_commissions_generated: 0,
    total_commissions_withdrawn: 0,
    commission_available: 0,
    commission_total: 0,
    total_referral_bonus_attributed: 0,
    total_referral_bonus_withdrawn: 0,
    total_referral_bonus_available: 0,
    successful_transactions: 0,
    failed_transactions: 0,
    pending_transactions: 0,
    success_rate: 0,
    failure_rate: 0,
    avg_transaction_amount: 0,
    avg_deposit_amount: 0,
    avg_withdrawal_amount: 0,
    failed_withdrawal_attempts: 0,
    kyc_verified: 0,
    kyc_pending: 0,
    kyc_rejected: 0,
    kyc_not_submitted: 0,
    blocked_accounts: 0
  })

  const loading = ref(false)
  const error = ref<string | null>(null)
  const period = ref<'all' | 'todays' | 'this_week' | 'this_month'>('all')

  async function fetchStats(params: string | Record<string, string> = 'all') {
    try {
      loading.value = true
      error.value = null
      
      let queryParams: Record<string, string | number | boolean>
      
      // Si c'est une string, on utilise le format ancien avec 'q'
      if (typeof params === 'string') {
        queryParams = { q: params }
      } else {
        // Si c'est un objet, on l'utilise directement
        queryParams = params
      }
      
      const response = await fetchWithAuth('/box/statistic', {
        method: 'GET',
        queryParams
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques')
      }
      
      const data = await response.json()
      if (!data.evolution) {
        data.evolution = {
          all_users: 0,
          active_users: 0,
          total_caisses: 0,
          total_transactions: 0
        }
      }
      // Fusionner avec les valeurs par défaut pour les nouvelles statistiques
      stats.value = {
        ...stats.value,
        ...data,
        // S'assurer que les nouvelles stats ont des valeurs par défaut si absentes
        total_wallets: data.total_wallets ?? 0,
        active_wallets: data.active_wallets ?? 0,
        total_wallets_balance: data.total_wallets_balance ?? 0,
        avg_wallet_balance: data.avg_wallet_balance ?? 0,
        total_wallet_deposits: data.total_wallet_deposits ?? 0,
        total_wallet_withdrawals: data.total_wallet_withdrawals ?? 0,
        total_commissions_generated: data.total_commissions_generated ?? 0,
        total_commissions_withdrawn: data.total_commissions_withdrawn ?? 0,
        commission_available: data.commission_available ?? 0,
        commission_total: data.commission_total ?? 0,
        total_referral_bonus_attributed: data.total_referral_bonus_attributed ?? 0,
        total_referral_bonus_withdrawn: data.total_referral_bonus_withdrawn ?? 0,
        total_referral_bonus_available: data.total_referral_bonus_available ?? 0,
        successful_transactions: data.successful_transactions ?? 0,
        failed_transactions: data.failed_transactions ?? 0,
        pending_transactions: data.pending_transactions ?? 0,
        success_rate: data.success_rate ?? 0,
        failure_rate: data.failure_rate ?? 0,
        avg_transaction_amount: data.avg_transaction_amount ?? 0,
        avg_deposit_amount: data.avg_deposit_amount ?? 0,
        avg_withdrawal_amount: data.avg_withdrawal_amount ?? 0,
        failed_withdrawal_attempts: data.failed_withdrawal_attempts ?? 0,
        kyc_verified: data.kyc_verified ?? 0,
        kyc_pending: data.kyc_pending ?? 0,
        kyc_rejected: data.kyc_rejected ?? 0,
        kyc_not_submitted: data.kyc_not_submitted ?? 0,
        blocked_accounts: data.blocked_accounts ?? 0
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors du chargement des statistiques'
      console.error('Erreur API:', err)
    } finally {
      loading.value = false
    }
  }

  function setPeriod(newPeriod: 'all' | 'todays' | 'this_week' | 'this_month') {
    period.value = newPeriod
    fetchStats(newPeriod)
  }

  const userGrowthRate = computed(() => {
    if (!stats.value.all_users) return 0
    return Math.round((stats.value.active_users / stats.value.all_users) * 100)
  })
// Ajoutez ces computed properties dans votre store (gardées pour usage futur)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const userStats = computed(() => ({
  total: stats.value.all_users,
  active: stats.value.active_users,
  agents: stats.value.agent_users,
  inactive: stats.value.inactive_users,
  growth: stats.value.evolution?.all_users || 0
}))

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const transactionStats = computed(() => ({
  total: stats.value.total_transactions,
  deposits: stats.value.deposit_transactions,
  withdrawals: stats.value.withdrawal_transactions,
  activeAmount: stats.value.caisse_active_amount,
  depositPercentage: getPercentage(stats.value.deposit_transactions, stats.value.total_transactions)
}))
  const caisseCompletionRate = computed(() => {
    if (!stats.value.total_caisses) return 0
    return Math.round((stats.value.caisse_done / stats.value.total_caisses) * 100)
  })

  const transactionSuccessRate = computed(() => {
    if (!stats.value.total_transactions) return 0
    return Math.round((stats.value.deposit_transactions / stats.value.total_transactions) * 100)
  })

  function resetStats() {
    stats.value = {
      all_users: 0,
      agent_users: 0,
      inactive_users: 0,
      active_users: 0,
      total_caisses: 0,
      caisse_done: 0,
      caisse_cancel: 0,
      caisse_pending: 0,
      caisse_disabled: 0,
      all_week_caisse: 0,
      custom_caisse: 0,
      all_month_caisse: 0,
      all_days_caisse: 0,
      total_transactions: 0,
      deposit_transactions: 0,
      withdrawal_transactions: 0,
      caisse_active_amount: 0,
      evolution: {
        all_users: 0,
        active_users: 0,
        total_caisses: 0,
        total_transactions: 0
      },
      total_wallets: 0,
      active_wallets: 0,
      total_wallets_balance: 0,
      avg_wallet_balance: 0,
      total_wallet_deposits: 0,
      total_wallet_withdrawals: 0,
      total_commissions_generated: 0,
      total_commissions_withdrawn: 0,
      commission_available: 0,
      commission_total: 0,
      total_referral_bonus_attributed: 0,
      total_referral_bonus_withdrawn: 0,
      total_referral_bonus_available: 0,
      successful_transactions: 0,
      failed_transactions: 0,
      pending_transactions: 0,
      success_rate: 0,
      failure_rate: 0,
      avg_transaction_amount: 0,
      avg_deposit_amount: 0,
      avg_withdrawal_amount: 0,
      failed_withdrawal_attempts: 0,
      kyc_verified: 0,
      kyc_pending: 0,
      kyc_rejected: 0,
      kyc_not_submitted: 0,
      blocked_accounts: 0
    }
    error.value = null
  }

  return {
    stats: readonly(stats),
    loading: readonly(loading),
    error: readonly(error),
    period: readonly(period),

    userGrowthRate,
    caisseCompletionRate,
    transactionSuccessRate,

    fetchStats,
    setPeriod,
    resetStats
  }
})
function getPercentage(part: number, total: number): number {
  if (!total || total === 0) return 0
  return Math.round((part / total) * 100)
}

