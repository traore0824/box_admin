import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth, handleApiResponse } from './fetchwithtoken'
import { useNotification } from '../services/notification'

interface UserBonusWithdrawal {
  id: number
  user: number
  user_email: string
  withdraw_types: string[]
  status: 'pending' | 'completed' | 'rejected' | 'cancelled'
  total_money: string
  payment_mode?: string
  phone?: string
  object_count: number
  voucher_count: number
  items_count: number
  notes: string | null
  processed_by: number | null
  processed_by_email: string | null
  rejection_reason: string | null
  created_at: string
  processed_at: string | null
}

export const useUserBonusWithdrawalStore = defineStore('userBonusWithdrawal', () => {
  const withdrawals = ref<UserBonusWithdrawal[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const totalWithdrawals = ref(0)
  const statusFilter = ref<string>('all')

  async function fetchWithdrawals(page = 1, status?: string) {
    try {
      isLoading.value = true
      error.value = null

      const params: Record<string, string> = {
        page: page.toString(),
        page_size: '10'
      }

      if (status && status !== 'all') {
        params.status = status
      }

      const response = await fetchWithAuth('/box/admin/bonuses/withdrawals', {
        method: 'GET',
        queryParams: params
      })

      const body = await handleApiResponse<{
        data?: UserBonusWithdrawal[]
        pagination?: { total?: number }
      }>(response, 'Erreur lors de la récupération des demandes de retrait')
      withdrawals.value = body.data ?? []
      totalWithdrawals.value = body.pagination?.total ?? withdrawals.value.length
      currentPage.value = page
      if (status) statusFilter.value = status
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      console.error('Error fetching user bonus withdrawals:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function processWithdrawal(
    id: number,
    status: 'completed' | 'rejected',
    rejectionReason?: string
  ) {
    try {
      isLoading.value = true
      error.value = null

      const body: { status: string; rejection_reason?: string } = { status }

      if (status === 'rejected' && rejectionReason) {
        body.rejection_reason = rejectionReason
      }

      const response = await fetchWithAuth(
        `/box/admin/bonuses/withdrawals/${id}/process`,
        {
          method: 'PATCH',
          body
        }
      )

      await handleApiResponse(
        response,
        'Erreur lors du traitement de la demande'
      )

      const notification = useNotification()

      if (status === 'completed') {
        notification.addNotification('Demande de retrait approuvée avec succès', 'success')
      } else {
        notification.addNotification('Demande de retrait rejetée', 'info')
      }

      await fetchWithdrawals(
        currentPage.value,
        statusFilter.value === 'all' ? undefined : statusFilter.value
      )
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
      const notification = useNotification()
      notification.addNotification(error.value, 'error')
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    withdrawals,
    isLoading,
    error,
    currentPage,
    totalWithdrawals,
    statusFilter,
    fetchWithdrawals,
    processWithdrawal
  }
})
