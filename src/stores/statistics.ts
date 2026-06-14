import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth } from './fetchwithtoken'
interface StatisticsState {
  stats: {
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
    avg_caisse_duration_days: number
    avg_ongoing_caisse_duration_months: number
    caisse_3_months: number
    caisse_6_months: number
    caisse_1_year: number
    caisse_2_years: number
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
    user_segments?: Record<string, number>
  }
}

export const useStatisticsStore = defineStore('statistics', () => {
  const stats = ref<StatisticsState['stats']>({
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
    avg_caisse_duration_days: 0,
    avg_ongoing_caisse_duration_months: 0,
    caisse_3_months: 0,
    caisse_6_months: 0,
    caisse_1_year: 0,
    caisse_2_years: 0,
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

  const filter = ref<'all' | 'todays' | 'this_week' | 'this_month'>('all')

  const dateFrom = ref('')
  const dateTo = ref('')

  const fetchStatistics = async () => {
    try {
      const queryParams: Record<string, string> = { q: filter.value }
      if (dateFrom.value) queryParams.start_date = dateFrom.value
      if (dateTo.value) queryParams.end_date = dateTo.value

      const response = await fetchWithAuth('/box/statistic', {
        queryParams
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques')
      }

      const data = await response.json()
      stats.value = data
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques:', error)
    }
  }

  const setFilter = (newFilter: 'all' | 'todays' | 'this_week' | 'this_month') => {
    filter.value = newFilter
    fetchStatistics()
  }

  return {
    stats,
    filter,
    fetchStatistics,
    setFilter
  }
})
