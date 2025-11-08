<template>
  <div class="space-y-6">
    <!-- Header avec filtres -->
    <div class="bg-white rounded-lg shadow-sm p-6">
      <DashboardHeader 
        v-model:dateFrom="dateFrom" 
        v-model:dateTo="dateTo" 
        :activePeriod="activePeriod"
        @update:period="handlePeriodChange"
        @clear-dates="clearDateFilter" 
      />
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else class="space-y-6">
      <!-- Indicateurs de filtre actif -->
      <div v-if="hasActiveFilters" class="bg-white rounded-lg shadow-sm p-4">
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <i class="fas fa-filter"></i>
          <span>Filtres actifs :</span>
          <div class="flex flex-wrap gap-2">
            <span v-if="dateFrom || dateTo" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {{ formatDateRange }}
              <button @click="clearDateFilter" class="ml-2 text-blue-600 hover:text-blue-800">
                <i class="fas fa-times"></i>
              </button>
            </span>
            <span v-if="activePeriod !== 'Tous'" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              {{ activePeriod }}
              <button @click="activePeriod = 'Tous'" class="ml-2 text-green-600 hover:text-green-800">
                <i class="fas fa-times"></i>
              </button>
            </span>
          </div>
        </div>
      </div>

      <!-- Cartes principales -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard 
          title="Total Utilisateurs" 
          :value="stats.all_users" 
          icon="users"
          color="primary" 
          :subtitle="`${stats.active_users} actifs`"
          :growth="stats.evolution?.all_users || 0"
        />
        <StatCard 
          title="Utilisateurs Actifs" 
          :value="stats.active_users"
          icon="user-check"
          color="success"
          :subtitle="`${stats.agent_users} agents`"
          :growth="stats.evolution?.active_users || 0"
        />
        <StatCard 
          title="Total Caisses" 
          :value="stats.total_caisses"
          icon="piggy-bank"
          color="warning"
          :subtitle="`${stats.caisse_pending} en cours`"
          :growth="stats.evolution?.total_caisses || 0"
        />
        <StatCard 
          title="Total Transactions" 
          :value="stats.total_transactions"
          icon="exchange-alt"
          color="info"
          :subtitle="`${formatCurrency(stats.caisse_active_amount)} actif`"
          :growth="stats.evolution?.total_transactions || 0"
        />
      </div>

      <!-- Grille de statistiques -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Utilisateurs -->
        <DashboardSection title="Statistiques des Utilisateurs">
          <MetricGrid>
            <MetricItem 
              :value="stats.all_users" 
              label="Total Utilisateurs" 
              color="primary" 
            />
            <MetricItem 
              :value="stats.active_users" 
              label="Utilisateurs Actifs" 
              color="success" 
            />
            <MetricItem 
              :value="stats.agent_users" 
              label="Agents" 
              color="info" 
            />
            <MetricItem 
              :value="stats.inactive_users" 
              label="Utilisateurs Inactifs" 
              color="danger" 
            />
          </MetricGrid>
        </DashboardSection>

        <!-- Transactions -->
        <DashboardSection title="Statistiques des Transactions">
          <MetricGrid>
            <MetricItem 
              :value="stats.deposit_transactions" 
              :label="`Dépôts (${getPercentage(stats.deposit_transactions, stats.total_transactions)}%)`"
              color="success" 
            />
            <MetricItem 
              :value="stats.withdrawal_transactions" 
              :label="`Retraits (${getPercentage(stats.withdrawal_transactions, stats.total_transactions)}%)`"
              color="warning" 
            />
          </MetricGrid>
          <div class="mt-4 space-y-4">
            <AmountDisplay 
              :value="stats.caisse_active_amount" 
              label="Montant Actif des Caisses" 
            />
            <AmountDisplay 
              :value="stats.total_deposit" 
              label="Total des Dépôts" 
            />
            <AmountDisplay 
              :value="stats.total_withdra_amount" 
              label="Total des Retraits" 
            />
          </div>
        </DashboardSection>

        <!-- Caisses -->
        <DashboardSection title="Statistiques des Caisses">
          <MetricGrid>
            <MetricItem 
              :value="stats.caisse_pending" 
              label="En Cours" 
              color="warning" 
              border 
            />
            <MetricItem 
              :value="stats.caisse_done" 
              label="Terminées" 
              color="success" 
              border 
            />
            <MetricItem 
              :value="stats.caisse_cancel" 
              label="Annulées" 
              color="danger" 
              border 
            />
            <MetricItem 
              :value="stats.caisse_disabled" 
              label="Désactivées" 
              color="secondary" 
              border 
            />
          </MetricGrid>

          <h4 class="font-medium text-gray-600 mt-6 mb-4">Répartition par Fréquence</h4>
          <MetricGrid>
            <MetricItem 
              :value="stats.all_days_caisse" 
              label="Quotidienne" 
              color="primary" 
            />
            <MetricItem 
              :value="stats.all_week_caisse" 
              label="Hebdomadaire" 
              color="success" 
            />
            <MetricItem 
              :value="stats.all_month_caisse" 
              label="Mensuelle" 
              color="info" 
            />
            <MetricItem 
              :value="stats.custom_caisse" 
              label="Personnalisée" 
              color="warning" 
            />
          </MetricGrid>
        </DashboardSection>
      </div>

      <!-- Nouvelles statistiques - Wallet, Commissions, Bonus -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Wallet -->
        <DashboardSection title="Statistiques Wallet">
          <MetricGrid>
            <MetricItem 
              :value="stats.total_wallets || 0" 
              label="Total Wallets" 
              color="primary" 
            />
            <MetricItem 
              :value="stats.active_wallets || 0" 
              label="Wallets Actifs" 
              color="success" 
            />
            <MetricItem 
              :value="formatCurrency(stats.total_wallets_balance || 0)" 
              label="Solde Total" 
              color="info" 
            />
            <MetricItem 
              :value="formatCurrency(stats.avg_wallet_balance || 0)" 
              label="Solde Moyen" 
              color="warning" 
            />
          </MetricGrid>
          <div class="mt-4 space-y-4">
            <AmountDisplay 
              :value="stats.total_wallet_deposits || 0" 
              label="Total Dépôts Wallet" 
            />
            <AmountDisplay 
              :value="stats.total_wallet_withdrawals || 0" 
              label="Total Retraits Wallet" 
            />
          </div>
        </DashboardSection>

        <!-- Commissions -->
        <DashboardSection title="Statistiques Commissions">
          <MetricGrid>
            <MetricItem 
              :value="formatCurrency(stats.commission_available || 0)" 
              label="Commission Disponible" 
              color="success" 
            />
            <MetricItem 
              :value="formatCurrency(stats.commission_total || 0)" 
              label="Commission Totale" 
              color="primary" 
            />
          </MetricGrid>
          <div class="mt-4 space-y-4">
            <AmountDisplay 
              :value="stats.total_commissions_generated || 0" 
              label="Commissions Générées (Période)" 
            />
            <AmountDisplay 
              :value="stats.total_commissions_withdrawn || 0" 
              label="Commissions Retirées (Période)" 
            />
          </div>
        </DashboardSection>

        <!-- Bonus de Parrainage -->
        <DashboardSection title="Bonus de Parrainage">
          <MetricGrid>
            <MetricItem 
              :value="formatCurrency(stats.total_referral_bonus_available || 0)" 
              label="Bonus Disponibles" 
              color="success" 
            />
          </MetricGrid>
          <div class="mt-4 space-y-4">
            <AmountDisplay 
              :value="stats.total_referral_bonus_attributed || 0" 
              label="Bonus Attribués (Période)" 
            />
            <AmountDisplay 
              :value="stats.total_referral_bonus_withdrawn || 0" 
              label="Bonus Retirés (Période)" 
            />
          </div>
        </DashboardSection>
      </div>

      <!-- Statistiques Transactions Avancées et KYC -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Transactions Avancées -->
        <DashboardSection title="Transactions Avancées">
          <MetricGrid>
            <MetricItem 
              :value="stats.successful_transactions || 0" 
              label="Transactions Réussies" 
              color="success" 
            />
            <MetricItem 
              :value="stats.failed_transactions || 0" 
              label="Transactions Échouées" 
              color="danger" 
            />
            <MetricItem 
              :value="stats.pending_transactions || 0" 
              label="Transactions En Attente" 
              color="warning" 
            />
            <MetricItem 
              :value="`${stats.success_rate || 0}%`" 
              label="Taux de Succès" 
              color="info" 
            />
            <MetricItem 
              :value="`${stats.failure_rate || 0}%`" 
              label="Taux d'Échec" 
              color="danger" 
            />
            <MetricItem 
              :value="stats.failed_withdrawal_attempts || 0" 
              label="Tentatives Retrait Échouées" 
              color="danger" 
            />
          </MetricGrid>
          <div class="mt-4 space-y-4">
            <AmountDisplay 
              :value="stats.avg_transaction_amount || 0" 
              label="Montant Moyen Transaction" 
            />
            <AmountDisplay 
              :value="stats.avg_deposit_amount || 0" 
              label="Montant Moyen Dépôt" 
            />
            <AmountDisplay 
              :value="stats.avg_withdrawal_amount || 0" 
              label="Montant Moyen Retrait" 
            />
          </div>
          <div v-if="stats.network_stats" class="mt-6">
            <h4 class="font-medium text-gray-600 mb-4">Par Réseau</h4>
            <div class="space-y-3">
              <div v-if="stats.network_stats.MOOV" class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span class="font-medium">MOOV</span>
                <div class="text-right">
                  <div class="font-semibold">{{ stats.network_stats.MOOV.count }} transactions</div>
                  <div class="text-sm text-gray-600">{{ formatCurrency(stats.network_stats.MOOV.total_amount) }}</div>
                </div>
              </div>
              <div v-if="stats.network_stats.MTN" class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span class="font-medium">MTN</span>
                <div class="text-right">
                  <div class="font-semibold">{{ stats.network_stats.MTN.count }} transactions</div>
                  <div class="text-sm text-gray-600">{{ formatCurrency(stats.network_stats.MTN.total_amount) }}</div>
                </div>
              </div>
              <div v-if="stats.network_stats.Celtis" class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <span class="font-medium">Celtis</span>
                <div class="text-right">
                  <div class="font-semibold">{{ stats.network_stats.Celtis.count }} transactions</div>
                  <div class="text-sm text-gray-600">{{ formatCurrency(stats.network_stats.Celtis.total_amount) }}</div>
                </div>
              </div>
            </div>
          </div>
        </DashboardSection>

        <!-- KYC et Sécurité -->
        <DashboardSection title="KYC et Sécurité">
          <MetricGrid>
            <MetricItem 
              :value="stats.kyc_verified || 0" 
              label="KYC Vérifiés" 
              color="success" 
            />
            <MetricItem 
              :value="stats.kyc_pending || 0" 
              label="KYC En Attente" 
              color="warning" 
            />
            <MetricItem 
              :value="stats.kyc_rejected || 0" 
              label="KYC Rejetés" 
              color="danger" 
            />
            <MetricItem 
              :value="stats.kyc_not_submitted || 0" 
              label="KYC Non Soumis" 
              color="secondary" 
            />
            <MetricItem 
              :value="stats.blocked_accounts || 0" 
              label="Comptes Bloqués" 
              color="danger" 
            />
          </MetricGrid>
        </DashboardSection>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useDashboardStore } from '../stores/dashboard'
import { storeToRefs } from 'pinia'

// Composants
import DashboardHeader from '../components/dashboard/DashboardHeader.vue'
import LoadingSpinner from '../components/ui/LoadingSpinner.vue'
import StatCard from '../components/dashboard/StatCard.vue'
import DashboardSection from '../components/dashboard/DashboardSection.vue'
import MetricGrid from '../components/dashboard/MetricGrid.vue'
import MetricItem from '../components/dashboard/MetricItem.vue'
import SummaryCard from '../components/dashboard/SummaryCard.vue'
import AmountDisplay from '../components/dashboard/AmountDisplay.vue'
import { formatCurrency } from '../utils/currency'

// Store
const dashboardStore = useDashboardStore()
const { fetchStats } = dashboardStore
const { stats } = storeToRefs(dashboardStore)

// États
const loading = ref(false)
const dateFrom = ref('')
const dateTo = ref('')
const activePeriod = ref('Tous')

// Configuration
const periodMapping: Record<string, string> = {
  'Tous': 'all',
  'Aujourd\'hui': 'todays',
  'Cette semaine': 'this_week',
  'Ce mois': 'this_month'
}

// Computed properties
const hasActiveFilters = computed(() => {
  return dateFrom.value || dateTo.value || activePeriod.value !== 'Tous'
})

const formatDateRange = computed(() => {
  if (!dateFrom.value && !dateTo.value) return ''
  if (dateFrom.value && dateTo.value) {
    return `Du ${formatDate(dateFrom.value)} au ${formatDate(dateTo.value)}`
  }
  if (dateFrom.value) {
    return `À partir du ${formatDate(dateFrom.value)}`
  }
  return `Jusqu'au ${formatDate(dateTo.value)}`
})

// Helpers - formatCurrency est importé depuis utils/currency

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const getPercentage = (part: number, total: number): number => {
  return total ? Math.round((part / total) * 100) : 0
}

const clearDateFilter = () => {
  dateFrom.value = ''
  dateTo.value = ''
}

const handlePeriodChange = (newPeriod: string) => {
  console.log('Changement de période:', newPeriod)
  activePeriod.value = newPeriod
  loadData()
}

// Chargement des données
const loadData = async () => {
  loading.value = true
  try {
    const params: Record<string, string> = {}
    
    // Ajouter les dates si elles sont définies
    if (dateFrom.value) params.date_from = dateFrom.value
    if (dateTo.value) params.date_to = dateTo.value
    
    // Si aucune date n'est définie, utiliser la période
    if (!dateFrom.value && !dateTo.value) {
      params.q = periodMapping[activePeriod.value] || 'all'
    }
    
    await fetchStats(params)
  } catch (error) {
    console.error('Erreur:', error)
  } finally {
    loading.value = false
  }
}

// Watchers et lifecycle
watch([activePeriod, dateFrom, dateTo], () => {
  console.log('Filtre changé:', { activePeriod: activePeriod.value, dateFrom: dateFrom.value, dateTo: dateTo.value })
  loadData()
})

onMounted(() => {
  loadData()
  setInterval(loadData, 5 * 60 * 1000) // Rafraîchir toutes les 5 minutes
})
</script>

<style scoped>
.space-y-6 > :not([hidden]) ~ :not([hidden]) {
  margin-top: 1.5rem;
}

.grid {
  display: grid;
  gap: 1rem;
}

@media (min-width: 640px) {
  .grid {
    gap: 1.5rem;
  }
}

@media (min-width: 1024px) {
  .grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>