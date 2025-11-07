import { defineStore } from 'pinia'
import { ref, computed, readonly } from 'vue'
import { fetchWithAuth } from './fetchwithtoken'

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
    }
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
      stats.value = data
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
// Ajoutez ces computed properties dans votre store
const userStats = computed(() => ({
  total: stats.value.all_users,
  active: stats.value.active_users,
  agents: stats.value.agent_users,
  inactive: stats.value.inactive_users,
  growth: stats.value.evolution?.all_users || 0
}))

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
      }
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
function getPercentage(deposit_transactions: number, total_transactions: number): any {
  throw new Error('Function not implemented.')
}

