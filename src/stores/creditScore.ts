import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth, handleApiResponse } from './fetchwithtoken'

export interface CreditScoreSummary {
  users_scored: number
  average_score: number
  by_grade: Record<string, number>
  score_min: number
  score_max: number
  disclaimer: string
}

export const useCreditScoreStore = defineStore('creditScore', () => {
  const summary = ref<CreditScoreSummary | null>(null)
  const isLoading = ref(false)

  async function fetchSummary() {
    try {
      isLoading.value = true
      const response = await fetchWithAuth('/box/credit-score/summary/', {
        method: 'GET',
      })
      summary.value = await handleApiResponse<CreditScoreSummary>(
        response,
        'Erreur résumé Credit Score'
      )
      return summary.value
    } finally {
      isLoading.value = false
    }
  }

  return { summary, isLoading, fetchSummary }
})
