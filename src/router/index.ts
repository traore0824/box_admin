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

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const storedAccessToken = localStorage.getItem('access_token')
  
  // Vérifier l'authentification
  if (to.meta.requiresAuth && !storedAccessToken) {
    next({ name: 'login' })
    return
  }
  
  // Si connecté, vérifier que l'utilisateur est admin (is_staff)
  if (to.meta.requiresAuth && storedAccessToken && authStore.user) {
    // Vérifier si l'utilisateur est admin
    if (!authStore.user.is_staff) {
      // Rediriger vers login avec message d'erreur
      authStore.logout()
      next({ 
        name: 'login',
        query: { message: 'Accès réservé aux administrateurs' }
      })
      return
    }
  }
  
  // Si déjà connecté et admin, rediriger du login vers dashboard
  if (to.name === 'login' && authStore.isAuthenticated && authStore.user?.is_staff) {
    next({ name: 'dashboard' })
    return
  }
  
  next()
})

export default router