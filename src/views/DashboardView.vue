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
        <StatCard 
          v-for="kpi in mainKPIs" 
          :key="kpi.title" 
          :title="kpi.title"
          :value="kpi.value"
          :icon="kpi.icon"
          :color="kpi.color"
          :growth="kpi.growth"
        />
      </section>

      <!-- Soldes liquidité (FeexPay + Réseaux) -->
      <section class="feexpay-balance" v-if="feexpayStats || reconciliationStats">
        <DashboardSection title="Soldes liquidité">
          <MetricGrid>
            <MetricItem
              :value="formatCurrency(feexpayStats?.total_balance ?? reconciliationStats?.feexpay_balance ?? 0)"
              label="Solde FeexPay"
              color="primary"
              icon="fas fa-university"
            />
            <MetricItem
              :value="formatCurrency(reconciliationStats?.devices_balance ?? 0)"
              label="Solde des réseaux"
              color="info"
              icon="fas fa-mobile-alt"
            />
            <MetricItem
              :value="formatCurrency(liquidityTotal)"
              label="Solde total"
              color="success"
              icon="fas fa-coins"
              border
            />
          </MetricGrid>
        </DashboardSection>
      </section>

      <!-- Réconciliation Financière -->
      <section class="reconciliation-stats" v-if="reconciliationStats">
        <DashboardSection title="Réconciliation Financière">
          <MetricGrid>
            <MetricItem
              :value="formatCurrency(reconciliationStats.baseline_deficit)"
              label="Déficit de Référence"
              color="secondary"
              icon="fas fa-info-circle"
            />
            <MetricItem
              :value="formatCurrency(reconciliationStats.current_deficit)"
              :label="reconciliationStats.current_deficit < 0 ? 'Surplus Actuel' : 'Déficit Actuel'"
              :color="reconciliationStats.current_deficit < 0 ? 'success' : 'danger'"
              :icon="reconciliationStats.current_deficit < 0 ? 'fas fa-arrow-up' : 'fas fa-arrow-down'"
              border
            />
            <MetricItem
              :value="formatCurrency(reconciliationStats.feexpay_balance || 0)"
              label="Solde FeexPay"
              color="primary"
              icon="fas fa-university"
            />
            <MetricItem
              :value="formatCurrency(reconciliationStats.devices_balance || 0)"
              label="Soldes Devices / Réseaux"
              color="info"
              icon="fas fa-mobile-alt"
            />
            <MetricItem
              :value="formatCurrency(reconciliationStats.liquidity || 0)"
              label="Liquidité Totale"
              color="success"
              icon="fas fa-coins"
            />
            <MetricItem
              :value="formatCurrency(reconciliationStats.float_loss_total || 0)"
              label="Pertes Float (FeexPay→Agent)"
              color="warning"
              icon="fas fa-exchange-alt"
            />
          </MetricGrid>
          <p class="text-xs text-gray-500 mt-3">
            Formule : Déficit = (FeexPay + Devices) − (Caisses actives + Commissions)
          </p>
        </DashboardSection>
      </section>

      <!-- Credit Score BOX (agrégats) -->
      <section class="credit-score-summary" v-if="creditScoreSummary">
        <DashboardSection title="Credit Score BOX">
          <MetricGrid>
            <MetricItem
              :value="creditScoreSummary.users_scored"
              label="Utilisateurs scorés"
              color="primary"
            />
            <MetricItem
              :value="creditScoreSummary.average_score"
              label="Score moyen"
              color="success"
              border
            />
            <MetricItem
              :value="`${creditScoreSummary.score_min} – ${creditScoreSummary.score_max}`"
              label="Échelle"
              color="secondary"
            />
          </MetricGrid>
          <div
            v-if="Object.keys(creditScoreSummary.by_grade || {}).length"
            class="mt-3 flex flex-wrap gap-2"
          >
            <span
              v-for="(count, grade) in creditScoreSummary.by_grade"
              :key="grade"
              class="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700"
            >
              {{ grade || '—' }} : {{ count }}
            </span>
          </div>
          <p class="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mt-3">
            {{ creditScoreSummary.disclaimer }}
          </p>
        </DashboardSection>
      </section>

      <!-- Rentabilité acquisition -->
      <section class="acquisition-cac" v-if="cacSummary">
        <DashboardSection title="Rentabilité acquisition">
          <div class="flex flex-wrap items-center gap-2 mb-4">
            <button
              v-for="opt in cacPeriodOptions"
              :key="opt.key"
              type="button"
              class="px-3 py-1.5 text-xs rounded-lg border transition-colors"
              :class="cacPeriod === opt.key
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'"
              @click="cacPeriod = opt.key"
            >
              {{ opt.label }}
            </button>
            <span class="text-xs text-gray-500 ml-auto">
              Marge brute : {{ cacSummary.gross_margin_percent ?? currentCacPeriod.gross_margin_percent ?? 70 }} %
            </span>
          </div>
          <MetricGrid>
            <MetricItem
              :value="currentCacPeriod.new_users"
              label="Nouveaux utilisateurs"
              color="primary"
            />
            <MetricItem
              :value="currentCacPeriod.new_activated_users"
              label="Nouveaux activés"
              color="success"
            />
            <MetricItem
              :value="formatCurrency(currentCacPeriod.marketing_spend)"
              label="Dépenses marketing"
              color="warning"
            />
            <MetricItem
              :value="formatCurrency(currentCacPeriod.commercial_spend)"
              label="Dépenses commerciales"
              color="info"
            />
            <MetricItem
              :value="currentCacPeriod.cac == null ? '—' : formatCurrency(currentCacPeriod.cac)"
              label="CAC"
              color="danger"
              border
            />
            <MetricItem
              :value="formatCacEvolution(currentCacPeriod.cac_evolution_pct)"
              :label="`Évolution CAC (vs ${cacPreviousLabel})`"
              :color="cacEvolutionColor(currentCacPeriod.cac_evolution_pct)"
              border
            />
            <MetricItem
              :value="currentCacPeriod.ltv == null ? '—' : formatCurrency(currentCacPeriod.ltv)"
              label="LTV moyenne"
              color="success"
              border
            />
            <MetricItem
              :value="currentCacPeriod.ltv_cac_ratio == null ? '—' : `${currentCacPeriod.ltv_cac_ratio}×`"
              :label="`LTV / CAC — ${currentCacPeriod.ltv_cac_interpretation?.label || '—'}`"
              :color="ltvCacColor(currentCacPeriod.ltv_cac_interpretation?.code)"
              border
            />
            <MetricItem
              :value="currentCacPeriod.payback_months == null ? '—' : `${currentCacPeriod.payback_months} mois`"
              label="Payback (récupération CAC)"
              color="primary"
              border
            />
          </MetricGrid>
          <div
            v-if="currentCacPeriod.ltv_cac_interpretation"
            class="mt-3 text-xs rounded-lg px-3 py-2"
            :class="ltvCacBannerClass(currentCacPeriod.ltv_cac_interpretation.code)"
          >
            <strong>{{ currentCacPeriod.ltv_cac_interpretation.label }}</strong>
            — {{ currentCacPeriod.ltv_cac_interpretation.detail }}
          </div>
          <p class="text-xs text-gray-500 mt-3">
            CAC = (marketing + commercial) ÷ nouveaux activés.
            LTV = (ARPU mensuel × marge) ÷ churn mensuel.
            Payback = CAC ÷ (ARPU mensuel × marge).
            Revenu = commissions BOX sur transactions acceptées.
            Période {{ currentCacPeriod.start }} → {{ currentCacPeriod.end }}.
            <router-link to="/charges" class="text-blue-600 hover:underline ml-1">Charges</router-link>
            ·
            <router-link to="/settings" class="text-blue-600 hover:underline">Marge brute</router-link>
          </p>
        </DashboardSection>
      </section>

      <!-- Charges entreprise -->
      <section class="charges-stats" v-if="chargesSummary">
        <DashboardSection title="Charges">
          <MetricGrid>
            <MetricItem
              :value="formatCurrency(chargesSummary.month.total)"
              :label="`Ce mois (${chargesSummary.month.count})`"
              color="primary"
              icon="fas fa-calendar-day"
            />
            <MetricItem
              :value="formatCurrency(chargesSummary.quarter.total)"
              :label="`Ce trimestre (${chargesSummary.quarter.count})`"
              color="warning"
              icon="fas fa-calendar-alt"
            />
            <MetricItem
              :value="formatCurrency(chargesSummary.year.total)"
              :label="`Cette année (${chargesSummary.year.count})`"
              color="danger"
              icon="fas fa-calendar"
              border
            />
          </MetricGrid>
          <div
            v-if="chargesSummary.year.by_category?.length"
            class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2"
          >
            <div
              v-for="cat in chargesSummary.year.by_category"
              :key="cat.category"
              class="text-xs bg-gray-50 rounded px-3 py-2"
            >
              <span class="text-gray-500">{{ cat.label }}</span>
              <div class="font-medium text-gray-800">{{ formatCurrency(cat.total) }}</div>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-3">
            Historique et saisie :
            <router-link to="/charges" class="text-blue-600 hover:underline">page Charges</router-link>
          </p>
        </DashboardSection>
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
            <AmountDisplay :value="stats.total_wallet_deposits || 0" label="Total des Dépôts" />
            <AmountDisplay :value="stats.total_wallet_withdrawals || 0" label="Total des Retraits" />
          </div>
        </DashboardSection>

        <!-- Statistiques Caisses -->
        <DashboardSection title="Statistiques des Caisses">
          <MetricGrid>
            <MetricItem :value="stats.caisse_pending" label="En Cours" color="warning" border />
            <MetricItem :value="stats.caisse_done" label="Terminées" color="success" border />
            <MetricItem :value="stats.caisse_cancel" label="Annulées" color="danger" border />
            <MetricItem :value="stats.caisse_disabled" label="Désactivées" color="secondary" border />
            <MetricItem :value="stats.avg_ongoing_caisse_duration_months || 0" label="Durée Moyenne en Cours (mois)" color="info" border />
          </MetricGrid>

          <div class="frequency-section">
            <h4 class="section-title">Caisses Libres</h4>
            <MetricGrid>
              <MetricItem :value="stats.caisse_free_pending" label="Libres en Cours" color="info" border />
              <MetricItem :value="stats.caisse_free_not_pending" label="Libres Terminées/Annulées" color="secondary" border />
            </MetricGrid>
            <div class="amounts-section mt-3">
              <AmountDisplay :value="stats.sum_amount_obj_free_pending || 0" label="Objectifs caisses libres en cours" />
            </div>
          </div>

          <div class="frequency-section">
            <h4 class="section-title">Caisses Bloquées</h4>
            <MetricGrid>
              <MetricItem :value="stats.caisse_locked_pending" label="Bloquées en Cours" color="danger" border />
              <MetricItem :value="stats.caisse_locked_not_pending" label="Bloquées Terminées/Annulées" color="secondary" border />
            </MetricGrid>
            <div class="amounts-section mt-3">
              <AmountDisplay :value="stats.sum_amount_obj_locked_pending || 0" label="Objectifs caisses bloquées en cours" />
            </div>
          </div>

          <div class="amounts-section">
            <AmountDisplay :value="stats.sum_amount_obj_pending || 0" label="Total objectifs caisses en cours" />
          </div>

          <div class="frequency-section">
            <h4 class="section-title">Répartition par Durée (Estimée)</h4>
            <MetricGrid>
              <MetricItem :value="stats.caisse_3_months || 0" label="~3 mois" color="primary" />
              <MetricItem :value="stats.caisse_6_months || 0" label="~6 mois" color="success" />
              <MetricItem :value="stats.caisse_1_year || 0" label="~1 an" color="info" />
              <MetricItem :value="stats.caisse_2_years || 0" label="~2 ans" color="warning" />
            </MetricGrid>
          </div>

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
          </MetricGrid>
          <div class="amounts-section">
            <AmountDisplay :value="stats.total_commissions_generated || 0" label="Commissions Générées (Total)" />
            <AmountDisplay :value="stats.commission_withdrawn_all_time || 0" label="Commissions Retirées (Total)" />
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
                <div class="network-data" v-if="data">
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
import { useChargesStore } from '../stores/charges'
import { useAcquisitionStore, type CacPeriodKey } from '../stores/acquisition'
import { useCreditScoreStore } from '../stores/creditScore'
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
const chargesStore = useChargesStore()
const acquisitionStore = useAcquisitionStore()
const creditScoreStore = useCreditScoreStore()
const { fetchStats, fetchFeexpayStats, fetchReconciliationStats } = dashboardStore
const { stats, feexpayStats, reconciliationStats } = storeToRefs(dashboardStore)
const { summary: chargesSummary } = storeToRefs(chargesStore)
const { cacSummary, selectedPeriod: cacPeriod } = storeToRefs(acquisitionStore)
const { summary: creditScoreSummary } = storeToRefs(creditScoreStore)

const cacPeriodOptions: { key: CacPeriodKey; label: string }[] = [
  { key: 'month', label: 'Mensuel' },
  { key: 'quarter', label: 'Trimestriel' },
  { key: 'year', label: 'Annuel' },
]

const currentCacPeriod = computed(() => {
  const summary = cacSummary.value
  if (!summary) {
    return {
      new_users: 0,
      new_activated_users: 0,
      marketing_spend: 0,
      commercial_spend: 0,
      acquisition_spend: 0,
      cac: null as number | null,
      previous_cac: null as number | null,
      cac_evolution_pct: null as number | null,
      start: '',
      end: '',
    }
  }
  return summary[cacPeriod.value]
})

const cacPreviousLabel = computed(() => {
  if (cacPeriod.value === 'quarter') return 'trim. préc.'
  if (cacPeriod.value === 'year') return 'année préc.'
  return 'mois préc.'
})

function formatCacEvolution(pct: number | null | undefined) {
  if (pct == null) return '—'
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct.toLocaleString('fr-FR')} %`
}

function cacEvolutionColor(pct: number | null | undefined): 'success' | 'danger' | 'secondary' {
  if (pct == null) return 'secondary'
  // CAC en baisse = meilleure acquisition
  return pct <= 0 ? 'success' : 'danger'
}

function ltvCacColor(code?: string): 'success' | 'danger' | 'warning' | 'secondary' {
  if (code === 'healthy') return 'success'
  if (code === 'fragile') return 'warning'
  if (code === 'unprofitable') return 'danger'
  return 'secondary'
}

function ltvCacBannerClass(code?: string) {
  if (code === 'healthy') return 'bg-green-50 text-green-800 border border-green-200'
  if (code === 'fragile') return 'bg-amber-50 text-amber-800 border border-amber-200'
  if (code === 'unprofitable') return 'bg-red-50 text-red-800 border border-red-200'
  return 'bg-gray-50 text-gray-600 border border-gray-200'
}


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
    color: "primary" as const,
    growth: stats.value.evolution?.all_users || 0
  },
  {
    title: "Utilisateurs Actifs",
    value: stats.value.active_users,
    icon: "user-check",
    color: "success" as const,
    growth: stats.value.evolution?.active_users || 0
  },
  {
    title: "Total Caisses",
    value: stats.value.total_caisses,
    icon: "piggy-bank",
    color: "warning" as const,
    growth: stats.value.evolution?.total_caisses || 0
  },
  {
    title: "Total Transactions",
    value: stats.value.total_transactions,
    icon: "exchange-alt",
    color: "info" as const,
    growth: stats.value.evolution?.total_transactions || 0
  }
])

// Solde total = FeexPay + réseaux (préfère liquidity API si dispo)
const liquidityTotal = computed(() => {
  if (reconciliationStats.value?.liquidity != null) {
    return reconciliationStats.value.liquidity
  }
  const feex =
    feexpayStats.value?.total_balance ?? reconciliationStats.value?.feexpay_balance ?? 0
  const devices = reconciliationStats.value?.devices_balance ?? 0
  return feex + devices
})

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
    await fetchFeexpayStats()
    await fetchReconciliationStats()
    await Promise.all([
      chargesStore.fetchSummary(),
      acquisitionStore.fetchCacSummary(),
      creditScoreStore.fetchSummary(),
    ])
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
  .dashboard-container {
    gap: 1rem;
    padding: 0;
  }

  .dashboard-header,
  .active-filters-container {
    padding: 1rem;
  }

  .kpi-cards,
  .stats-grid,
  .advanced-stats {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>