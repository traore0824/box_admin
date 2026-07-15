import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth, handleApiResponse } from './fetchwithtoken'

export interface UserBonusItem {
  id: number
  user: number
  user_email: string
  bonus_type: string
  bonus_type_display: string
  status: string
  status_display: string
  reason_code: string
  reason_display: string
  label: string
  description: string
  amount: string | null
  object_label: string
  object_details: string
  coins_value: number | null
  granted_by_email: string | null
  created_at: string
}

export interface BonusMetaOption {
  value: string
  label: string
}

export const useUserBonusesStore = defineStore('userBonuses', () => {
  const items = ref<UserBonusItem[]>([])
  const bonusTypes = ref<BonusMetaOption[]>([])
  const reasonCodes = ref<BonusMetaOption[]>([])
  const loading = ref(false)
  const granting = ref(false)
  const currentPage = ref(1)
  const pagination = ref({ page: 1, page_size: 30, total: 0, has_next: false })

  async function fetchMeta() {
    const res = await fetchWithAuth('/box/admin/bonuses/meta')
    const data = await handleApiResponse<{
      data?: { bonus_types?: BonusMetaOption[]; reason_codes?: BonusMetaOption[] }
    }>(res, 'Erreur chargement meta bonus')
    bonusTypes.value = data.data?.bonus_types ?? []
    reasonCodes.value = data.data?.reason_codes ?? []
  }

  async function fetchBonuses(params: {
    email?: string
    type?: string
    page?: number
    page_size?: number
  } = {}) {
    loading.value = true
    try {
      const page = params.page ?? currentPage.value
      const queryParams: Record<string, string | number> = {
        page,
        page_size: params.page_size ?? pagination.value.page_size,
      }
      const email = params.email?.trim()
      const type = params.type?.trim()
      if (email) queryParams.email = email
      if (type) queryParams.type = type

      const res = await fetchWithAuth('/box/admin/bonuses', { queryParams })
      const data = await handleApiResponse<{
        data?: UserBonusItem[]
        pagination?: typeof pagination.value
      }>(res, 'Erreur chargement bonus')
      items.value = data.data ?? []
      pagination.value = data.pagination ?? pagination.value
      currentPage.value = pagination.value.page
    } finally {
      loading.value = false
    }
  }

  async function grantBonus(payload: Record<string, unknown>) {
    granting.value = true
    try {
      const res = await fetchWithAuth('/box/admin/bonuses/grant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await handleApiResponse<{ data: UserBonusItem[] }>(
        res,
        'Erreur attribution bonus'
      )
      return data.data
    } finally {
      granting.value = false
    }
  }

  return {
    items,
    bonusTypes,
    reasonCodes,
    loading,
    granting,
    currentPage,
    pagination,
    fetchMeta,
    fetchBonuses,
    grantBonus,
  }
})
