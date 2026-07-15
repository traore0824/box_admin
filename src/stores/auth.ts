import { defineStore } from 'pinia'
import { ref, computed, onUnmounted } from 'vue'
import { ApiRequestError } from '../utils/apiError'
import { fetchWithAuth, getUserDetails, handleApiResponse } from './fetchwithtoken'

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
  agent_client?: boolean
  is_block: boolean
  reason_block: string
  pin_define: boolean
  pin_incorrect_count: number
  is_staff: boolean
  double_auth?: boolean
  name?: string
  avatar?: string
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
  const requires2FA = ref(false)

  // Vérifier si le token est expiré (fonction gardée pour usage futur)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    requires2FA.value = false
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  async function login(email: string, password: string) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth('/auth/login-v2/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      })

      let data: LoginResponse
      try {
        data = await handleApiResponse<LoginResponse>(response, 'Erreur de connexion')
      } catch (err) {
        if (err instanceof ApiRequestError && err.status === 400) {
          const body = err.body as Record<string, unknown>
          if (body.message === 'INCORRECT_EMAIL_OR_PASSWORD') {
            throw new Error('Email ou mot de passe incorrect')
          }
          if (body.message === 'USER_ACCOUNT_BLOCKED') {
            throw new Error(
              (body.details as string) ||
                "Votre compte a été bloqué. Veuillez contacter l'équipe Box."
            )
          }
        }
        throw err
      }
      setTokens({ access: data.access, refresh: data.refresh })
      
      // Utiliser les données utilisateur de la réponse de login si disponibles
      if (data.user) {
        setUser(data.user)
      } else {
        // Sinon, récupérer les infos utilisateur avec le token fraichement reçu
        try {
          const userDetails = await getUserDetails()
          setUser(userDetails)
        } catch (err) {
          console.error('Erreur lors de la récupération des infos utilisateur:', err)
        }
      }

      // Toujours exiger le 2FA pour les admins (is_staff)
      requires2FA.value = !!data.user?.is_staff
      
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
  // Vérifier le code 2FA
  async function verify2FA(code: string) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth('/auth/verify-2fa-session/', {
        method: 'POST',
        body: { code }
      })

      try {
        await handleApiResponse(response, 'Erreur de vérification')
      } catch (err) {
        if (err instanceof ApiRequestError) {
          const body = err.body as Record<string, unknown>
          const messages: Record<string, string> = {
            CODE_REQUIRED: 'Le code est requis',
            INVALID_CODE: 'Code incorrect, veuillez réessayer',
            '2FA_NOT_CONFIGURED': 'Le 2FA n\'est pas configuré sur ce compte',
            NOT_ADMIN: 'Accès non autorisé'
          }
          throw new Error(
            messages[body.code as string] || (body.message as string) || 'Erreur de vérification'
          )
        }
        throw err
      }

      requires2FA.value = false
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur de vérification'
      throw err
    } finally {
      isLoading.value = false
    }
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

  // Envoyer un OTP de déblocage de compte PIN (API publique)
  async function changePassword(
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) {
    try {
      isLoading.value = true
      error.value = null

      const response = await fetchWithAuth('/auth/change_password/', {
        method: 'POST',
        body: {
          old_password: oldPassword,
          new_password: newPassword,
          confirm_password: confirmPassword
        }
      })

      try {
        await handleApiResponse(response, 'Erreur lors du changement de mot de passe')
      } catch (err) {
        if (err instanceof ApiRequestError) {
          const data = err.body as Record<string, unknown>
          if (data.INVALID_CURRENT_PASSWORD) {
            throw new Error('Mot de passe actuel incorrect')
          }
          if (data.PASSWORD_NO_MATCH) {
            throw new Error('Les mots de passe ne correspondent pas')
          }
          if (data.PASSWORD_NOT_STRONG) {
            throw new Error(
              'Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule et un chiffre'
            )
          }
          if (data.CANT_USE_PHONE) {
            throw new Error('Vous ne pouvez pas utiliser votre téléphone comme mot de passe')
          }
          if (data.CANT_USE_EMAIL) {
            throw new Error('Vous ne pouvez pas utiliser votre email comme mot de passe')
          }
        }
        throw err
      }

      clearAuth()
      return true
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors du changement de mot de passe'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function sendOtp(email: string) {
    try {
      isLoading.value = true
      error.value = null

      const { API_BASE_URL } = await import('../config/api')
      const response = await fetch(`${API_BASE_URL}/auth/send-opt`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      return await handleApiResponse(response, 'Erreur lors de l\'envoi de l\'OTP')
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur lors de l\'envoi de l\'OTP'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  return {
    user,
    accessToken,
    refreshToken,
    isLoading,
    error,
    isAuthenticated,
    requires2FA,
    setUser,
    setTokens,
    clearAuth,
    login,
    logout,
    verify2FA,
    autoLogin,
    changePassword,
    sendOtp
  }
})
