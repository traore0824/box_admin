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
import ContactBoxView from '../views/ContactBoxView.vue'
import UserCommissionWithdrawalView from '../views/UserCommissionWithdrawalView.vue'
import WithdrawalTransactionsView from '../views/WithdrawalTransactionsView.vue'
import UserProfileView from '../views/UserProfileView.vue'
import TransactionDetailsView from '../views/TransactionDetailsView.vue'
import ReminderMessagesView from '../views/ReminderMessagesView.vue'
import ReminderLogsView from '../views/ReminderLogsView.vue'
import CaisseDetailsView from '../views/CaisseDetailsView.vue'
import PublicationsView from '../views/PublicationsView.vue'
import Verify2FAView from '../views/Verify2FAView.vue'
import WeeklySampleView from '../views/WeeklySampleView.vue'
import ChallengesView from '../views/ChallengesView.vue'
import PointsConfigView from '../views/PointsConfigView.vue'
import ChangePasswordView from '../views/ChangePasswordView.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/verify-2fa',
    name: 'verify-2fa',
    component: Verify2FAView,
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
    path: '/caisses/:id',
    name: 'caisse-details',
    component: CaisseDetailsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions',
    name: 'transactions',
    component: TransactionsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/withdrawal-transactions',
    name: 'withdrawal-transactions',
    component: WithdrawalTransactionsView,
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
  },
  {
    path: '/contact-box',
    name: 'contact-box',
    component: ContactBoxView,
    meta: { requiresAuth: true }
  },
  {
    path: '/user-commission-withdrawals',
    name: 'user-commission-withdrawals',
    component: UserCommissionWithdrawalView,
    meta: { requiresAuth: true }
  },
  {
    path: '/users/:id',
    name: 'user-profile',
    component: UserProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions/:id',
    name: 'transaction-details',
    component: TransactionDetailsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/reminder-messages',
    name: 'reminder-messages',
    component: ReminderMessagesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/reminder-logs',
    name: 'reminder-logs',
    component: ReminderLogsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/publications',
    name: 'publications',
    component: PublicationsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/weekly-sample',
    name: 'weekly-sample',
    component: WeeklySampleView,
    meta: { requiresAuth: true }
  },
  {
    path: '/challenges',
    name: 'challenges',
    component: ChallengesView,
    meta: { requiresAuth: true }
  },
  {
    path: '/change-password',
    name: 'change-password',
    component: ChangePasswordView,
    meta: { requiresAuth: true, title: 'Changer le mot de passe' }
  },
  {
    path: '/points-config',
    name: 'points-config',
    component: PointsConfigView,
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

  // Si 2FA requis et pas encore vérifié, bloquer l'accès
  if (to.meta.requiresAuth && storedAccessToken && to.name !== 'verify-2fa') {
    const authStore = useAuthStore()
    if (authStore.requires2FA) {
      if (import.meta.env.DEV) console.log('2FA required, redirecting to verify-2fa')
      next({ name: 'verify-2fa' })
      return
    }
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

    // Pages réservées aux staff uniquement
    const staffOnlyPaths = [
      '/',
      '/wallets',
      '/commissions',
      '/publications',
      '/reminder-messages',
      '/reminder-logs',
      '/contact-box',
      '/settings',
      '/challenges',
      '/points-config'
    ]

    // Bloquer l'accès aux pages staff pour les non-staff (agents/chargés de clientèle)
    if (!isStaff && staffOnlyPaths.includes(to.path)) {
      if (import.meta.env.DEV) console.log('Non-staff user cannot access staff-only page, redirecting to users')
      next({ name: 'users', replace: true })
      return
    }
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