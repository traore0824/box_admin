export interface MenuItem {
  path: string
  name: string
  icon: string
  staffOnly?: boolean // Pages réservées aux administrateurs
}

export const menuItems: MenuItem[] = [
  {
    path: '/',
    name: 'Dashboard',
    icon: 'fas fa-home',
    staffOnly: true // Dashboard réservé aux staff
  },
  {
    path: '/users',
    name: 'Utilisateurs',
    icon: 'fas fa-users'
  },
  {
    path: '/caisses',
    name: 'Caisses',
    icon: 'fas fa-wallet'
  },
  {
    path: '/transactions',
    name: 'Transactions',
    icon: 'fas fa-exchange-alt'
  },
  {
    path: '/withdrawal-transactions',
    name: 'Retraits & Annulations',
    icon: 'fas fa-minus-circle'
  },
  {
    path: '/commissions',
    name: 'Commissions',
    icon: 'fas fa-money-bill-wave',
    staffOnly: true // Commissions réservées aux staff
  },
  {
    path: '/bonus',
    name: 'Bonus Parrainage',
    icon: 'fas fa-gift'
  },
  {
    path: '/user-bonuses',
    name: 'Bonus utilisateurs',
    icon: 'fas fa-award'
  },
  {
    path: '/user-commission-withdrawals',
    name: 'Retraits Commission Utilisateur',
    icon: 'fas fa-hand-holding-usd'
  },
  {
    path: '/user-bonus-withdrawals',
    name: 'Retraits bonus utilisateur',
    icon: 'fas fa-money-check-alt'
  },
  {
    path: '/wallets',
    name: 'Wallets',
    icon: 'fas fa-wallet',
    staffOnly: true // Wallets réservés aux staff
  },
  {
    path: '/networks',
    name: 'Réseaux de Paiement',
    icon: 'fas fa-network-wired'
  },
  {
    path: '/float-recharges',
    name: 'Recharges Float',
    icon: 'fas fa-exchange-alt',
    staffOnly: true
  },
  {
    path: '/kyc-pending',
    name: 'KYC en Attente',
    icon: 'fas fa-id-card'
  },
  {
    path: '/notifications',
    name: 'Notifications',
    icon: 'fas fa-bell'
  },
  {
    path: '/publications',
    name: 'Publications Admin',
    icon: 'fas fa-bullhorn',
    staffOnly: true // Publications réservées aux staff
  },
  {
    path: '/send-notification',
    name: 'Envoyer Notification',
    icon: 'fas fa-bell-plus'
  },
  {
    path: '/reminder-messages',
    name: 'Messages de Rappel',
    icon: 'fas fa-clock',
    staffOnly: true // Messages de rappel réservés aux staff
  },
  {
    path: '/reminder-logs',
    name: 'Rappels non envoyés',
    icon: 'fas fa-list-alt',
    staffOnly: true // Logs de rappel réservés aux staff
  },
  {
    path: '/contact-box',
    name: 'Messages de Contact',
    icon: 'fas fa-envelope',
    staffOnly: true // Messages de contact réservés aux staff
  },
  {
    path: '/weekly-sample',
    name: 'Sélection hebdomadaire',
    icon: 'fas fa-calendar-week'
  },
  {
    path: '/challenges',
    name: 'Challenges',
    icon: 'fas fa-trophy',
    staffOnly: true
  },
  {
    path: '/points-config',
    name: 'Pièces BOX',
    icon: 'fas fa-star',
    staffOnly: true
  },
  {
    path: '/settings',
    name: 'Paramètres',
    icon: 'fas fa-cog',
    staffOnly: true // Paramètres réservés aux staff
  }
];
