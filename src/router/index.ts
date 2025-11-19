import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Views
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'
import UsersView from '../views/UsersView.vue'
import CaissesView from '../views/CaissesView.vue'
import TransactionsView from '../views/TransactionsView.vue'
import CommissionsView from '../views/CommissionsView.vue'
import BonusView from '../views/BonusView.vue'
import WalletsView from '../views/WalletsView.vue'
import NetworksView from '../views/NetworksView.vue'
import KYCPendingView from '../views/KYCPendingView.vue'
import NotificationsView from '../views/NotificationsView.vue'
import SendNotificationView from '../views/SendNotificationView.vue'
import SettingsView from '../views/SettingsView.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/users',
    name: 'users',
    component: UsersView,
    meta: { requiresAuth: true }
  },
  {
    path: '/caisses',
    name: 'caisses',
    component: CaissesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions',
    name: 'transactions',
    component: TransactionsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/commissions',
    name: 'commissions',
    component: CommissionsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/bonus',
    name: 'bonus',
    component: BonusView,
    meta: { requiresAuth: true }
  },
  {
    path: '/wallets',
    name: 'wallets',
    component: WalletsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/networks',
    name: 'networks',
    component: NetworksView,
    meta: { requiresAuth: true }
  },
  {
    path: '/kyc-pending',
    name: 'kyc-pending',
    component: KYCPendingView,
    meta: { requiresAuth: true }
  },
  {
    path: '/notifications',
    name: 'notifications',
    component: NotificationsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/send-notification',
    name: 'send-notification',
    component: SendNotificationView,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'settings',
    component: SettingsView,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  const storedAccessToken = localStorage.getItem('access_token')
  
  // Debug logs
  if (import.meta.env.DEV) {
    console.log('Router guard:', {
      to: to.name,
      hasToken: !!storedAccessToken,
      hasUser: !!authStore.user,
      isStaff: authStore.user?.is_staff,
      isAuthenticated: authStore.isAuthenticated
    })
  }
  
  // Vérifier l'authentification
  if (to.meta.requiresAuth && !storedAccessToken) {
    if (import.meta.env.DEV) console.log('No token, redirecting to login')
    next({ name: 'login' })
    return
  }
  
  // Si on a un token mais pas d'utilisateur chargé, essayer de charger les infos utilisateur
  if (to.meta.requiresAuth && storedAccessToken && !authStore.user) {
    if (import.meta.env.DEV) console.log('Token exists but no user, loading user details...')
    try {
      // Essayer de charger les infos utilisateur
      const { getUserDetails } = await import('../stores/fetchwithtoken')
      const userDetails = await getUserDetails()
      if (import.meta.env.DEV) console.log('User details loaded:', { is_staff: userDetails.is_staff })
      authStore.setUser(userDetails)
    } catch (err) {
      // Si échec, déconnecter et rediriger vers login
      console.error('Erreur lors du chargement des infos utilisateur:', err)
      authStore.logout()
      next({ name: 'login' })
      return
    }
  }
  
  // Si connecté, vérifier les permissions selon le rôle
  if (to.meta.requiresAuth && storedAccessToken && authStore.user) {
    const isStaff = authStore.user.is_staff === true
    
    // Bloquer l'accès au dashboard pour les non-staff (CustomerService)
    // Rediriger automatiquement vers /users
    if (to.path === '/' && !isStaff) {
      if (import.meta.env.DEV) console.log('CustomerService cannot access dashboard, redirecting to users')
      next({ name: 'users', replace: true })
      return
    }
    
    // Note: Les permissions backend gèrent les accès aux autres pages
    // Si un CustomerService essaie d'accéder à une page non autorisée, le backend retournera une erreur
  }
  
  // Redirection après login selon le rôle
  if (to.name === 'login' && authStore.isAuthenticated && authStore.user) {
    const isStaff = authStore.user.is_staff === true
    if (import.meta.env.DEV) console.log('Already authenticated, redirecting based on role')
    // Staff -> dashboard, CustomerService -> users
    next({ name: isStaff ? 'dashboard' : 'users' })
    return
  }
  
  if (import.meta.env.DEV) console.log('Navigation allowed')
  next()
})

export default router