import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { API_BASE_URL } from '../config/api'
import { useRouter } from 'vue-router'

interface FetchWithAuthOptions extends RequestInit {
  queryParams?: Record<string, string | number | boolean>
}

/**
 * Fonction utilitaire pour faire une requête HTTP avec auth + gestion automatique du refresh
 */
export async function fetchWithAuth(
  endpoint: string,
  options: FetchWithAuthOptions = {},
  retry = true
): Promise<Response> {

  const authStore = useAuthStore()
  const accessToken = authStore.accessToken

  // Construire l'URL avec query params si présents
  let url = `${API_BASE_URL}${endpoint}`
  if (options.queryParams) {
    const query = new URLSearchParams()
    for (const key in options.queryParams) {
      query.append(key, String(options.queryParams[key]))
    }
    url += `?${query.toString()}`
  }

  // Initialiser les headers
  const headers = new Headers(options.headers || {})

  // Ajouter le token si présent
  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`)
  }

  // Si le body est un objet, on le stringifie automatiquement
  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json')
    options.body = JSON.stringify(options.body)
  }

  const response = await fetch(url, {
    ...options,
    headers,
  })

  // Si 401, essayer de refresh une seule fois
  if (response.status === 401 && retry) {
    console.log('Token expiré, tentative de refresh...')
    
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      console.log('Token refreshé avec succès, nouvelle tentative...')
      // Réessayer avec nouveau token (retry = false pour éviter la boucle infinie)
      return fetchWithAuth(endpoint, options, false)
    } else {
      console.log('Échec du refresh token, déconnexion...')
      authStore.logout()
      
      // Redirection vers la page de login avec message d'erreur
      window.location.href = '/login?message=Votre+session+a+expiré.+Veuillez+vous+reconnecter.'
      
      throw new Error('Session expirée, veuillez vous reconnecter')
    }
  }

  // Gestion des autres erreurs d'authentification
  if (response.status === 403) {
    console.log('Accès non autorisé')
    authStore.logout()
    window.location.href = '/login?message=Accès+non+autorisé.+Veuillez+vous+reconnecter.'
    throw new Error('Accès non autorisé')
  }

  return response
}

/**
 * Fonction pour refresher le token d'accès
 */
async function refreshAccessToken(): Promise<boolean> {
  const authStore = useAuthStore()
  const refreshToken = authStore.refreshToken

  if (!refreshToken) {
    console.log('Aucun refresh token disponible')
    return false
  }

  try {
    console.log('Tentative de refresh du token...')
    
    const response = await fetch(`${API_BASE_URL}/auth/refresh_token/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh: refreshToken })
    })

    if (response.status === 401) {
      console.log('Refresh token expiré (401)')
      return false
    }

    if (!response.ok) {
      console.log(`Erreur lors du refresh: ${response.status} ${response.statusText}`)
      return false
    }

    const data = await response.json()

    if (data.access && data.refresh) {
      authStore.setTokens({ access: data.access, refresh: data.refresh })
      console.log('Tokens mis à jour avec succès')
      return true
    } else {
      console.log('Réponse de refresh invalide:', data)
      return false
    }
  } catch (error) {
    console.error('Erreur lors du refresh token:', error)
    return false
  }
}

/**
 * Fonction helper pour faire des requêtes GET avec auth
 */
export async function get(endpoint: string, queryParams?: Record<string, string | number | boolean>): Promise<Response> {
  return fetchWithAuth(endpoint, { method: 'GET', queryParams })
}

/**
 * Fonction helper pour faire des requêtes POST avec auth
 */
export async function post(endpoint: string, body?: any, queryParams?: Record<string, string | number | boolean>): Promise<Response> {
  return fetchWithAuth(endpoint, { method: 'POST', body, queryParams })
}

/**
 * Fonction helper pour faire des requêtes PUT avec auth
 */
export async function put(endpoint: string, body?: any, queryParams?: Record<string, string | number | boolean>): Promise<Response> {
  return fetchWithAuth(endpoint, { method: 'PUT', body, queryParams })
}

/**
 * Fonction helper pour faire des requêtes DELETE avec auth
 */
export async function del(endpoint: string, queryParams?: Record<string, string | number | boolean>): Promise<Response> {
  return fetchWithAuth(endpoint, { method: 'DELETE', queryParams })
}

// Nouvelle fonction pour récupérer les détails utilisateur
export async function getUserDetails(): Promise<any> {
  const response = await fetchWithAuth('/auth/me/', { method: 'GET' })
  if (!response.ok) throw new Error('Erreur lors de la récupération des infos utilisateur')
  return response.json()
}