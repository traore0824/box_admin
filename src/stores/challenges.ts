import { defineStore } from 'pinia'
import { ref } from 'vue'
import { fetchWithAuth, handleApiResponse } from './fetchwithtoken'

export interface ChallengeAdmin {
  id: number
  name: string
  description: string
  banner_url?: string | null
  rules_text: string
  rewards_text: string
  start_date: string
  end_date: string
  registration_deadline: string
  min_participants: number
  max_participants?: number | null
  participant_count?: number
  is_public: boolean
  invite_code?: string | null
  smart_link?: string | null
  admin_status: 'draft' | 'published' | 'suspended' | 'cancelled'
  ranking_type: string
  entry_rules: Record<string, unknown>
  success_rules: Record<string, unknown>
  rewards_config: Record<string, unknown>
  caisse_config: Record<string, unknown>
  created_at?: string
  updated_at?: string
}

export interface PointsAction {
  id: number
  code: string
  label: string
  points: number
  is_active: boolean
  max_awards: number | null
  sort_order: number
}

export interface UserLevel {
  id: number
  code: string
  label: string
  min_points: number
  bonus_amount: number
  object_bonus_label: string
  object_bonus_details: string
  congrats_title: string
  congrats_message: string
  sort_order: number
  is_active: boolean
}

export interface PointsInfo {
  info_point: string
  updated_at?: string
}

export const useChallengesStore = defineStore('challenges', () => {
  const challenges = ref<ChallengeAdmin[]>([])
  const pointsActions = ref<PointsAction[]>([])
  const userLevels = ref<UserLevel[]>([])
  const pointsInfo = ref<PointsInfo>({ info_point: '' })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  async function fetchChallenges() {
    isLoading.value = true
    error.value = null
    try {
      const res = await fetchWithAuth('/box/admin/challenges')
      const data = await handleApiResponse<ChallengeAdmin[] | { results?: ChallengeAdmin[] }>(
        res,
        'Erreur chargement challenges'
      )
      challenges.value = Array.isArray(data) ? data : data.results ?? []
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'Erreur'
      throw e
    } finally {
      isLoading.value = false
    }
  }

  async function createChallenge(payload: Partial<ChallengeAdmin>) {
    const res = await fetchWithAuth('/box/admin/challenges', {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'application/json' },
    })
    return handleApiResponse(res, 'Erreur création')
  }

  async function updateChallenge(id: number, payload: Partial<ChallengeAdmin>) {
    const res = await fetchWithAuth(`/box/admin/challenges/${id}`, {
      method: 'PATCH',
      body: payload,
      headers: { 'Content-Type': 'application/json' },
    })
    return handleApiResponse(res, 'Erreur mise à jour')
  }

  async function deleteChallenge(id: number) {
    const res = await fetchWithAuth(`/box/admin/challenges/${id}`, { method: 'DELETE' })
    await handleApiResponse(res, 'Erreur suppression')
  }

  async function fetchChallengeSmartLink(id: number, refresh = false) {
    const adminQs = refresh ? '?refresh=1' : ''
    const adminRes = await fetchWithAuth(`/box/admin/challenges/${id}/smart-link${adminQs}`)
    if (adminRes.ok) {
      const data = await handleApiResponse<{ data?: { smart_link?: string } }>(adminRes, 'Erreur génération du lien')
      const link = (data.data?.smart_link as string) || ''
      if (link) return link
    }

    const publicRes = await fetchWithAuth(`/box/challenge-link?challenge_id=${id}`)
    const publicData = await handleApiResponse<{ smart_link?: string; link?: string }>(
      publicRes,
      'Erreur génération du lien'
    )
    return (publicData.smart_link as string) || (publicData.link as string) || ''
  }

  async function fetchPointsConfig() {
    const [actionsRes, levelsRes, infoRes] = await Promise.all([
      fetchWithAuth('/box/admin/points/actions'),
      fetchWithAuth('/box/admin/points/levels'),
      fetchWithAuth('/box/admin/points/info'),
    ])
    const actionsData = await handleApiResponse<{ data?: PointsAction[] }>(
      actionsRes,
      'Erreur chargement config pièces BOX'
    )
    const levelsData = await handleApiResponse<{ data?: UserLevel[] }>(
      levelsRes,
      'Erreur chargement config pièces BOX'
    )
    const infoData = await handleApiResponse<{ data?: PointsInfo }>(
      infoRes,
      'Erreur chargement config pièces BOX'
    )
    pointsActions.value = actionsData.data ?? []
    userLevels.value = levelsData.data ?? []
    pointsInfo.value = infoData.data ?? { info_point: '' }
  }

  async function savePointsActions(items: PointsAction[]) {
    const res = await fetchWithAuth('/box/admin/points/actions', {
      method: 'PATCH',
      body: items as unknown as Record<string, unknown>,
      headers: { 'Content-Type': 'application/json' },
    })
    return handleApiResponse(res, 'Erreur sauvegarde actions')
  }

  async function createAction(item: Omit<PointsAction, 'id'>) {
    const res = await fetchWithAuth('/box/admin/points/actions', {
      method: 'POST',
      body: item,
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await handleApiResponse<{ data: PointsAction }>(res, 'Erreur création action')
    pointsActions.value.push(data.data)
    return data.data
  }

  async function deleteAction(id: number) {
    const res = await fetchWithAuth(`/box/admin/points/actions/${id}`, { method: 'DELETE' })
    if (res.status !== 204) {
      await handleApiResponse(res, 'Erreur suppression action')
    }
    pointsActions.value = pointsActions.value.filter(a => a.id !== id)
  }

  async function seedActions() {
    const res = await fetchWithAuth('/box/admin/points/actions', {
      method: 'POST',
      body: { seed: true },
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await handleApiResponse<{ data: PointsAction[] }>(res, 'Erreur initialisation actions')
    pointsActions.value = data.data
    return data.data
  }

  async function saveUserLevels(items: UserLevel[]) {
    const res = await fetchWithAuth('/box/admin/points/levels', {
      method: 'PATCH',
      body: items as unknown as Record<string, unknown>,
      headers: { 'Content-Type': 'application/json' },
    })
    return handleApiResponse(res, 'Erreur sauvegarde niveaux')
  }

  async function createLevel(item: Omit<UserLevel, 'id'>) {
    const res = await fetchWithAuth('/box/admin/points/levels', {
      method: 'POST',
      body: item,
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await handleApiResponse<{ data: UserLevel }>(res, 'Erreur création niveau')
    userLevels.value.push(data.data)
    return data.data
  }

  async function deleteLevel(id: number) {
    const res = await fetchWithAuth(`/box/admin/points/levels/${id}`, { method: 'DELETE' })
    if (res.status !== 204) {
      await handleApiResponse(res, 'Erreur suppression niveau')
    }
    userLevels.value = userLevels.value.filter(l => l.id !== id)
  }

  async function seedLevels() {
    const res = await fetchWithAuth('/box/admin/points/levels', {
      method: 'POST',
      body: { seed: true },
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await handleApiResponse<{ data: UserLevel[] }>(res, 'Erreur initialisation niveaux')
    userLevels.value = data.data
    return data.data
  }

  async function savePointsInfo(payload: PointsInfo) {
    const res = await fetchWithAuth('/box/admin/points/info', {
      method: 'PATCH',
      body: payload as unknown as Record<string, unknown>,
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await handleApiResponse<{ data?: PointsInfo }>(res, 'Erreur sauvegarde info pièces BOX')
    pointsInfo.value = data.data ?? payload
    return data
  }

  return {
    challenges,
    pointsActions,
    userLevels,
    pointsInfo,
    isLoading,
    error,
    fetchChallenges,
    createChallenge,
    updateChallenge,
    deleteChallenge,
    fetchChallengeSmartLink,
    fetchPointsConfig,
    savePointsActions,
    createAction,
    deleteAction,
    seedActions,
    saveUserLevels,
    createLevel,
    deleteLevel,
    seedLevels,
    savePointsInfo,
  }
})
