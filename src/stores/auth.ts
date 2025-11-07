import { defineStore } from 'pinia'
import { ref, computed, onUnmounted, watch } from 'vue'
import { API_BASE_URL } from '../config/api'
import { fetchWithAuth, getUserDetails } from './fetchwithtoken'

interface User {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  created_at: string
  referral_code: string
  user_referral_code: string
  card_id: string | null
  total_funds: number
  push_notification: boolean
  email_notification: boolean
  updated_at: string | null
  commission_amount: string
  number_sponsor: number
  sexe: string | null
  total_box: number
  available_amout: string
  withdraw_amout: string
  agent_client: boolean
  is_block: boolean
  reason_block: string
  pin_define: boolean
  pin_incorrect_count: number
}

interface LoginResponse {
  refresh: string
  access: string
  exp: number
  user: User
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const tokenCheckInterval = ref<number | undefined>(undefined)

  // Vérifier si le token est expiré
  function isTokenExpired(): boolean {
    if (!accessToken.value) return true

    try {
      const decodedToken = JSON.parse(atob(accessToken.value.split('.')[1]))
      const exp = decodedToken.exp
      return exp < Math.floor(Date.now() / 1000)
    } catch (error) {
      return true
    }
  }

  // Démarrer la vérification périodique du token
  function startTokenCheck() {
    if (tokenCheckInterval.value !== undefined) clearInterval(tokenCheckInterval.value)
    
    // tokenCheckInterval.value = window.setInterval(() => {
    //   if (isTokenExpired()) {
    //     console.log('Token expiré, déconnexion automatique...')
    //     logout()
    //   }
    // }, 5000) // Vérifier toutes les 5 secondes
  }

  // Nettoyer l'intervalle quand le store est détruit
  onUnmounted(() => {
    if (tokenCheckInterval.value !== undefined) {
      clearInterval(tokenCheckInterval.value)
    }
  })

  const isAuthenticated = computed(() => !!user.value && !!accessToken.value)

  function setUser(userData: User) {
    user.value = userData
  }

  function setTokens(tokens: { access: string; refresh: string }) {
    accessToken.value = tokens.access
    refreshToken.value = tokens.refresh
    localStorage.setItem('access_token', tokens.access)
    localStorage.setItem('refresh_token', tokens.refresh)
  }

  function clearAuth() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  async function login(email: string, password: string) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth('/auth/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      if (!response.ok) {
        const data = await response.json()
        
        if (response.status === 400) {
          if (data.message === "INCORRECT_EMAIL_OR_PASSWORD") {
            throw new Error("Email ou mot de passe incorrect")
          } else if (data.message === "USER_ACCOUNT_BLOCKED") {
            throw new Error(data.details || "Votre compte a été bloqué. Veuillez contacter l'équipe Box.")
          }
        }
        throw new Error('Erreur de connexion')
      }

      const data: LoginResponse = await response.json()
      setTokens({ access: data.access, refresh: data.refresh })
      // Récupérer les infos utilisateur avec le token fraichement reçu
      const userDetails = await getUserDetails()
      setUser(userDetails)
      startTokenCheck()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur de connexion'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    clearAuth()
  }

  async function autoLogin() {
    const storedAccessToken = localStorage.getItem('access_token')
    const storedRefreshToken = localStorage.getItem('refresh_token')

    if (storedAccessToken && storedRefreshToken) {
      setTokens({ access: storedAccessToken, refresh: storedRefreshToken })
      // Récupérer les infos utilisateur après restauration des tokens
      try {
        const userDetails = await getUserDetails()
        setUser(userDetails)
        startTokenCheck()
      } catch (err) {
        console.error('Erreur lors de la récupération des infos utilisateur:', err)
        clearAuth()
      }
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,
    isAuthenticated,
    setUser,
    setTokens,
    clearAuth,
    login,
    logout,
    autoLogin
  }
})
