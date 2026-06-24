<template>
  <div class="statistics-container">
    <!-- Sélecteur de filtre -->
    <div class="filter-container">
      <select v-model="statisticsStore.filter" @change="statisticsStore.fetchStatistics()">
        <option value="all">Tout</option>
        <option value="todays">Aujourd'hui</option>
        <option value="this_week">Cette semaine</option>
        <option value="this_month">Ce mois</option>
      </select>
    </div>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <StatCard 
        title="Total Utilisateurs" 
        :value="stats.all_users?.toLocaleString() || '0'" 
        icon="users"
        color="primary" 
        :subtitle="`${stats.active_users || 0} actifs`"
        :growth="stats.evolution?.all_users"
      />
      <StatCard 
        title="Utilisateurs Actifs" 
        :value="stats.active_users?.toLocaleString() || '0'"
        icon="user-check"
        color="success"
        :subtitle="`${stats.agent_users || 0} agents`"
        :growth="stats.evolution?.active_users"
      />
      <StatCard 
        title="Total Caisses" 
        :value="stats.total_caisses?.toLocaleString() || '0'"
        icon="piggy-bank"
        color="warning"
        :subtitle="`${stats.caisse_pending || 0} en cours`"
        :growth="stats.evolution?.total_caisses"
      />
      <StatCard 
        title="Total Transactions" 
        :value="stats.total_transactions?.toLocaleString() || '0'"
        icon="exchange-alt"
        color="info"
        :subtitle="`${stats.caisse_active_amount?.toLocaleString() || 0} actif`"
        :growth="stats.evolution?.total_transactions"
      />
    </div>

    <!-- Statistiques Utilisateurs -->
    <div class="stat-container p-4 sm:p-5">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">Statistiques Utilisateurs</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="stat-item flex justify-between p-3 border border-gray-100 rounded-lg">
          <span class="stat-label text-gray-600 text-sm">Utilisateurs agents</span>
          <span class="stat-value font-bold text-gray-900">{{ stats.agent_users }}</span>
        </div>
        <div class="stat-item flex justify-between p-3 border border-gray-100 rounded-lg">
          <span class="stat-label text-gray-600 text-sm">Utilisateurs inactifs</span>
          <span class="stat-value font-bold text-gray-900">{{ stats.inactive_users }}</span>
        </div>
        <div class="stat-item flex justify-between p-3 border border-gray-100 rounded-lg">
          <span class="stat-label text-gray-600 text-sm">Utilisateurs qui ont parrainé</span>
          <span class="stat-value font-bold text-gray-900">{{ stats.users_who_sponsored }}</span>
        </div>
        <div class="stat-item flex justify-between p-3 border border-gray-100 rounded-lg">
          <span class="stat-label text-gray-600 text-sm">Total des parrainages</span>
          <span class="stat-value font-bold text-gray-900">{{ stats.total_referrals }}</span>
        </div>
      </div>
    </div>

    <!-- Statistiques Caisse -->
    <div class="stat-container p-4 sm:p-5">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">Statistiques Caisse</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div v-for="(val, label) in caisseStatsMap" :key="label" class="stat-item flex justify-between p-3 border border-gray-100 rounded-lg">
          <span class="stat-label text-gray-600 text-sm">{{ label }}</span>
          <span class="stat-value font-bold text-gray-900">{{ val }}</span>
        </div>
      </div>
    </div>

    <!-- Statistiques Transactions -->
    <div class="stat-container p-4 sm:p-5">
      <h2 class="text-xl font-semibold mb-4 text-gray-800">Statistiques Transactions</h2>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div class="stat-item flex justify-between p-3 border border-gray-100 rounded-lg">
          <span class="stat-label text-gray-600 text-sm">Dépôts</span>
          <span class="stat-value font-bold text-gray-900">{{ stats.deposit_transactions }}</span>
        </div>
        <div class="stat-item flex justify-between p-3 border border-gray-100 rounded-lg">
          <span class="stat-label text-gray-600 text-sm">Retraits</span>
          <span class="stat-value font-bold text-gray-900">{{ stats.withdrawal_transactions }}</span>
        </div>
        <div class="stat-item flex justify-between p-3 border border-gray-100 rounded-lg">
          <span class="stat-label text-gray-600 text-sm">Montant actif</span>
          <span class="stat-value font-bold text-gray-900">{{ stats.caisse_active_amount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useStatisticsStore } from '../stores/statistics'
import StatCard from '../components/StatCard.vue'

const statisticsStore = useStatisticsStore()
const stats = computed(() => statisticsStore.stats)

const caisseStatsMap = computed(() => ({
  "Terminées": stats.value.caisse_done,
  "Annulées": stats.value.caisse_cancel,
  "En attente": stats.value.caisse_pending,
  "Désactivées": stats.value.caisse_disabled,
  "De la semaine": stats.value.all_week_caisse,
  "Personnalisées": stats.value.custom_caisse,
  "Du mois": stats.value.all_month_caisse,
  "Du jour": stats.value.all_days_caisse,
  "Durée moy. (mois)": stats.value.avg_ongoing_caisse_duration_months || 0,
  "~3 mois": stats.value.caisse_3_months || 0,
  "~6 mois": stats.value.caisse_6_months || 0,
  "~1 an": stats.value.caisse_1_year || 0,
  "~2 ans": stats.value.caisse_2_years || 0
}))

onMounted(() => {
  statisticsStore.fetchStatistics()
})
</script>

<style scoped>
.statistics-container {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.filter-container {
  margin-bottom: 1.5rem;
}

.stat-container {
  background: #fff;
  border-radius: 0.5rem;
  margin-top: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

select {
  padding: 0.5rem 0.75rem;
  border: 1px solid #ddd;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  background-color: white;
  cursor: pointer;
}

select:focus {
  outline: none;
  border-color: #bc8a1a;
  box-shadow: 0 0 0 2px rgba(188, 138, 26, 0.2);
}
</style>
