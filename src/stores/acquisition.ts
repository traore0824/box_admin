import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth, handleApiResponse } from './fetchwithtoken'

export type CacPeriodKey = 'month' | 'quarter' | 'year'

export interface LtvCacInterpretation {
  code: 'unavailable' | 'unprofitable' | 'fragile' | 'healthy' | string
  label: string
  detail: string
}

export interface CacPeriodStats {
  start: string
  end: string
  previous_start: string
  previous_end: string
  months_in_period?: number
  new_users: number
  new_activated_users: number
  marketing_spend: number
  commercial_spend: number
  acquisition_spend: number
  cac: number | null
  previous_cac: number | null
  cac_evolution_pct: number | null
  revenue_total?: number
  paying_clients?: number
  avg_revenue_per_client?: number | null
  monthly_arpu?: number | null
  customers_at_start?: number
  churned_customers?: number
  period_churn_rate?: number | null
  monthly_churn_rate?: number | null
  gross_margin_percent?: number
  ltv?: number | null
  ltv_cac_ratio?: number | null
  ltv_cac_interpretation?: LtvCacInterpretation
  payback_months?: number | null
}

export interface CacSummary {
  reference_date: string
  formula: string
  formulas?: {
    cac: string
    ltv: string
    ltv_cac: string
    payback: string
  }
  gross_margin_percent?: number
  month: CacPeriodStats
  quarter: CacPeriodStats
  year: CacPeriodStats
}

export const useAcquisitionStore = defineStore('acquisition', () => {
  const cacSummary = ref<CacSummary | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const selectedPeriod = ref<CacPeriodKey>('month')

  async function fetchCacSummary() {
    try {
      isLoading.value = true
      error.value = null
      const response = await fetchWithAuth('/box/acquisition/cac/', {
        method: 'GET',
      })
      cacSummary.value = await handleApiResponse<CacSummary>(
        response,
        'Erreur récupération indicateurs acquisition'
      )
      return cacSummary.value
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    cacSummary,
    isLoading,
    error,
    selectedPeriod,
    fetchCacSummary,
  }
})
