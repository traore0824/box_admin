<template>
  <div class="dashboard-container">
    <!-- En-tête avec filtres -->
    <section class="dashboard-header">
      <DashboardHeader v-model:dateFrom="filters.dateFrom" v-model:dateTo="filters.dateTo"
        :activePeriod="filters.activePeriod" @update:period="handlePeriodChange" @clear-dates="clearDateFilter" />
    </section>

    <!-- Loader -->
    <LoadingSpinner v-if="loading" />

    <!-- Contenu principal -->
    <template v-else>
      <!-- Indicateurs de filtres actifs -->
      <div v-if="hasActiveFilters" class="active-filters-container">
        <div class="active-filters">
          <div class="filters-header">
            <i class="fas fa-filter"></i>
            <span>Filtres actifs :</span>
          </div>

          <div class="filters-list">
            <!-- Filtre de date -->
            <span v-if="filters.dateFrom || filters.dateTo" class="filter-badge badge-blue">
              {{ dateRangeLabel }}
              <button @click="clearDateFilter" class="remove-btn-blue" aria-label="Supprimer le filtre">
                <i class="fas fa-times"></i>
              </button>
            </span>

            <!-- Filtre de période -->
            <span v-if="filters.activePeriod !== 'Tous'" class="filter-badge badge-green">
              {{ filters.activePeriod }}
              <button @click="filters.activePeriod = 'Tous'" class="remove-btn-green" aria-label="Supprimer le filtre">
                <i class="fas fa-times"></i>
              </button>
            </span>
          </div>
        </div>
      </div>

      <!-- Cartes KPI principales -->
      <section class="kpi-cards">
        <StatCard v-for="kpi in mainKPIs" :key="kpi.title" v-bind="kpi" />
      </section>

      <!-- Statistiques Utilisateurs -->
      <section class="stats-grid">
        <DashboardSection title="Statistiques des Utilisateurs">
          <MetricGrid>
            <MetricItem :value="stats.all_users" label="Total Utilisateurs" color="primary" />
            <MetricItem :value="stats.active_users" label="Utilisateurs Actifs" color="success" />
            <MetricItem :value="stats.agent_users" label="Agents" color="info" />
            <MetricItem :value="stats.inactive_users" label="Utilisateurs Inactifs" color="danger" />
          </MetricGrid>
        </DashboardSection>

        <!-- Statistiques Transactions -->
        <DashboardSection title="Statistiques des Transactions">
          <MetricGrid>
            <MetricItem :value="stats.deposit_transactions"
              :label="`Dépôts (${getPercentage(stats.deposit_transactions, stats.total_transactions)}%)`"
              color="success" />
            <MetricItem :value="stats.withdrawal_transactions"
              :label="`Retraits (${getPercentage(stats.withdrawal_transactions, stats.total_transactions)}%)`"
              color="warning" />
          </MetricGrid>
          <div class="amounts-section">
            <AmountDisplay :value="stats.caisse_active_amount" label="Montant Actif des Caisses" />
            <AmountDisplay :value="stats.total_deposit" label="Total des Dépôts" />
            <AmountDisplay :value="stats.total_withdra_amount" label="Total des Retraits" />
          </div>
        </DashboardSection>

        <!-- Statistiques Caisses -->
        <DashboardSection title="Statistiques des Caisses">
          <MetricGrid>
            <MetricItem :value="stats.caisse_pending" label="En Cours" color="warning" border />
            <MetricItem :value="stats.caisse_done" label="Terminées" color="success" border />
            <MetricItem :value="stats.caisse_cancel" label="Annulées" color="danger" border />
            <MetricItem :value="stats.caisse_disabled" label="Désactivées" color="secondary" border />
          </MetricGrid>

          <div class="frequency-section">
            <h4 class="section-title">Répartition par Fréquence</h4>
            <MetricGrid>
              <MetricItem :value="stats.all_days_caisse" label="Quotidienne" color="primary" />
              <MetricItem :value="stats.all_week_caisse" label="Hebdomadaire" color="success" />
              <MetricItem :value="stats.all_month_caisse" label="Mensuelle" color="info" />
              <MetricItem :value="stats.custom_caisse" label="Personnalisée" color="warning" />
            </MetricGrid>
          </div>
        </DashboardSection>

        <!-- Statistiques Wallet -->
        <DashboardSection title="Statistiques Wallet">
          <MetricGrid>
            <MetricItem :value="stats.total_wallets || 0" label="Total Wallets" color="primary" />
            <MetricItem :value="stats.active_wallets || 0" label="Wallets Actifs" color="success" />
            <MetricItem :value="formatCurrency(stats.total_wallets_balance || 0)" label="Solde Total" color="info" />
            <MetricItem :value="formatCurrency(stats.avg_wallet_balance || 0)" label="Solde Moyen" color="warning" />
          </MetricGrid>
          <div class="amounts-section">
            <AmountDisplay :value="stats.total_wallet_deposits || 0" label="Total Dépôts Wallet" />
            <AmountDisplay :value="stats.total_wallet_withdrawals || 0" label="Total Retraits Wallet" />
          </div>
        </DashboardSection>

        <!-- Statistiques Commissions -->
        <DashboardSection title="Statistiques Commissions">
          <MetricGrid>
            <MetricItem :value="formatCurrency(stats.commission_available || 0)" label="Commission Disponible"
              color="success" />
            <MetricItem :value="formatCurrency(stats.commission_total || 0)" label="Commission Totale"
              color="primary" />
          </MetricGrid>
          <div class="amounts-section">
            <AmountDisplay :value="stats.total_commissions_generated || 0" label="Commissions Générées (Période)" />
            <AmountDisplay :value="stats.total_commissions_withdrawn || 0" label="Commissions Retirées (Période)" />
          </div>
        </DashboardSection>

        <!-- Bonus de Parrainage -->
        <DashboardSection title="Bonus de Parrainage">
          <MetricGrid>
            <MetricItem :value="formatCurrency(stats.total_referral_bonus_available || 0)" label="Bonus Disponibles"
              color="success" />
          </MetricGrid>
          <div class="amounts-section">
            <AmountDisplay :value="stats.total_referral_bonus_attributed || 0" label="Bonus Attribués (Période)" />
            <AmountDisplay :value="stats.total_referral_bonus_withdrawn || 0" label="Bonus Retirés (Période)" />
          </div>
        </DashboardSection>
      </section>

      <!-- Statistiques avancées -->
      <section class="advanced-stats">
        <!-- Transactions Avancées -->
        <DashboardSection title="Transactions Avancées">
          <MetricGrid>
            <MetricItem :value="stats.successful_transactions || 0" label="Transactions Réussies" color="success" />
            <MetricItem :value="stats.failed_transactions || 0" label="Transactions Échouées" color="danger" />
            <MetricItem :value="stats.pending_transactions || 0" label="Transactions En Attente" color="warning" />
            <MetricItem :value="`${stats.success_rate || 0}%`" label="Taux de Succès" color="info" />
            <MetricItem :value="`${stats.failure_rate || 0}%`" label="Taux d'Échec" color="danger" />
            <MetricItem :value="stats.failed_withdrawal_attempts || 0" label="Tentatives Retrait Échouées"
              color="danger" />
          </MetricGrid>

          <div class="amounts-section">
            <AmountDisplay :value="stats.avg_transaction_amount || 0" label="Montant Moyen Transaction" />
            <AmountDisplay :value="stats.avg_deposit_amount || 0" label="Montant Moyen Dépôt" />
            <AmountDisplay :value="stats.avg_withdrawal_amount || 0" label="Montant Moyen Retrait" />
          </div>

          <!-- Statistiques par réseau -->
          <div v-if="stats.network_stats" class="network-stats">
            <h4 class="section-title">Par Réseau</h4>
            <div class="network-list">
              <div v-for="(data, network) in stats.network_stats" :key="network" class="network-stat-card">
                <div class="network-name">
                  <i :class="getNetworkIcon(network)" class="network-icon"></i>
                  <span>{{ network }}</span>
                </div>
                <div class="network-data">
                  <div class="transaction-count">{{ data.count }} transactions</div>
                  <div class="transaction-amount">{{ formatCurrency(data.total_amount) }}</div>
                </div>
              </div>
            </div>
          </div>
        </DashboardSection>

        <!-- KYC et Sécurité -->
        <DashboardSection title="KYC et Sécurité">
          <MetricGrid>
            <MetricItem :value="stats.kyc_verified || 0" label="KYC Vérifiés" color="success" />
            <MetricItem :value="stats.kyc_pending || 0" label="KYC En Attente" color="warning" />
            <MetricItem :value="stats.kyc_rejected || 0" label="KYC Rejetés" color="danger" />
            <MetricItem :value="stats.kyc_not_submitted || 0" label="KYC Non Soumis" color="secondary" />
            <MetricItem :value="stats.blocked_accounts || 0" label="Comptes Bloqués" color="danger" />
          </MetricGrid>
        </DashboardSection>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import { storeToRefs } from 'pinia'
import { formatCurrency } from '../utils/currency'

// Composants (à garder tels quels depuis ton code original)
import DashboardHeader from '../components/dashboard/DashboardHeader.vue'
import LoadingSpinner from '../components/ui/LoadingSpinner.vue'
import StatCard from '../components/dashboard/StatCard.vue'
import DashboardSection from '../components/dashboard/DashboardSection.vue'
import MetricGrid from '../components/dashboard/MetricGrid.vue'
import MetricItem from '../components/dashboard/MetricItem.vue'
import AmountDisplay from '../components/dashboard/AmountDisplay.vue'

// Types
interface Filters {
  dateFrom: string
  dateTo: string
  activePeriod: string
}

// Configuration
const PERIOD_MAPPING: Record<string, string> = {
  'Tous': 'all',
  'Aujourd\'hui': 'todays',
  'Cette semaine': 'this_week',
  'Ce mois': 'this_month'
}

const REFRESH_INTERVAL = 5 * 60 * 1000 // 5 minutes

// Store
const dashboardStore = useDashboardStore()
const { fetchStats } = dashboardStore
const { stats } = storeToRefs(dashboardStore)

// État local
const loading = ref(false)
const filters = ref<Filters>({
  dateFrom: '',
  dateTo: '',
  activePeriod: 'Tous'
})

let refreshTimer: number | null = null

// Computed - KPIs principaux
const mainKPIs = computed(() => [
  {
    title: "Total Utilisateurs",
    value: stats.value.all_users,
    icon: "users",
    color: "primary",
    subtitle: `${stats.value.active_users} actifs`,
    growth: stats.value.evolution?.all_users || 0
  },
  {
    title: "Utilisateurs Actifs",
    value: stats.value.active_users,
    icon: "user-check",
    color: "success",
    subtitle: `${stats.value.agent_users} agents`,
    growth: stats.value.evolution?.active_users || 0
  },
  {
    title: "Total Caisses",
    value: stats.value.total_caisses,
    icon: "piggy-bank",
    color: "warning",
    subtitle: `${stats.value.caisse_pending} en cours`,
    growth: stats.value.evolution?.total_caisses || 0
  },
  {
    title: "Total Transactions",
    value: stats.value.total_transactions,
    icon: "exchange-alt",
    color: "info",
    subtitle: `${formatCurrency(stats.value.caisse_active_amount)} actif`,
    growth: stats.value.evolution?.total_transactions || 0
  }
])

// Computed - Filtres actifs
const hasActiveFilters = computed(() =>
  filters.value.dateFrom || filters.value.dateTo || filters.value.activePeriod !== 'Tous'
)

const dateRangeLabel = computed(() => {
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    })

  const { dateFrom, dateTo } = filters.value

  if (!dateFrom && !dateTo) return ''
  if (dateFrom && dateTo) {
    return `Du ${formatDate(dateFrom)} au ${formatDate(dateTo)}`
  }
  if (dateFrom) {
    return `À partir du ${formatDate(dateFrom)}`
  }
  return `Jusqu'au ${formatDate(dateTo)}`
})

// Méthodes utilitaires
const getPercentage = (part: number, total: number): number => {
  return total ? Math.round((part / total) * 100) : 0
}

const getNetworkIcon = (network: string): string => {
  const icons: Record<string, string> = {
    'MOOV': 'fas fa-mobile-alt',
    'MTN': 'fas fa-phone',
    'Celtis': 'fas fa-signal'
  }
  return icons[network] || 'fas fa-network-wired'
}

// Méthodes principales
const clearDateFilter = () => {
  filters.value.dateFrom = ''
  filters.value.dateTo = ''
}

const handlePeriodChange = (newPeriod: string) => {
  filters.value.activePeriod = newPeriod
}

const loadData = async () => {
  loading.value = true
  try {
    const params: Record<string, string> = {}

    if (filters.value.dateFrom) params.date_from = filters.value.dateFrom
    if (filters.value.dateTo) params.date_to = filters.value.dateTo

    if (!filters.value.dateFrom && !filters.value.dateTo) {
      params.q = PERIOD_MAPPING[filters.value.activePeriod] || 'all'
    }

    await fetchStats(params)
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
  } finally {
    loading.value = false
  }
}

const setupAutoRefresh = () => {
  refreshTimer = window.setInterval(loadData, REFRESH_INTERVAL)
}

const cleanupAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// Watchers
watch(filters, () => loadData(), { deep: true })

// Lifecycle
onMounted(() => {
  loadData()
  setupAutoRefresh()
})

onUnmounted(() => {
  cleanupAutoRefresh()
})
</script>

<style scoped>
/* Layout principal */
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0;
}

.dashboard-header,
.active-filters-container {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

/* Filtres actifs */
.active-filters {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.filters-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4b5563;
  font-size: 0.875rem;
}

.filters-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.filter-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge-blue {
  background-color: #dbeafe;
  color: #1e40af;
}

.badge-green {
  background-color: #d1fae5;
  color: #065f46;
}

.remove-btn-blue,
.remove-btn-green {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  transition: opacity 0.2s;
}

.remove-btn-blue {
  color: #2563eb;
}

.remove-btn-green {
  color: #059669;
}

.remove-btn-blue:hover,
.remove-btn-green:hover {
  opacity: 0.7;
}

/* Cartes KPI */
.kpi-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

/* Grilles de statistiques */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 1.5rem;
}

.advanced-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 1.5rem;
}

/* Sections */
.amounts-section,
.frequency-section,
.network-stats {
  margin-top: 1.5rem;
}

.amounts-section {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.section-title {
  font-weight: 500;
  color: #4b5563;
  margin-bottom: 1rem;
  font-size: 0.95rem;
}

/* Statistiques réseau */
.network-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.network-stat-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
}

.network-stat-card:hover {
  background-color: #f3f4f6;
}

.network-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.network-icon {
  color: #6b7280;
  font-size: 1.1rem;
}

.network-data {
  text-align: right;
}

.transaction-count {
  font-weight: 600;
  color: #111827;
}

.transaction-amount {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.15rem;
}

/* Responsive */
@media (min-width: 640px) {

  .kpi-cards,
  .stats-grid,
  .advanced-stats {
    gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
  }

  .advanced-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 640px) {

  .kpi-cards,
  .stats-grid,
  .advanced-stats {
    grid-template-columns: 1fr;
  }
}
</style>