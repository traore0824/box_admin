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
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard 
        title="Total Utilisateurs" 
        :value="stats.all_users?.toLocaleString() || '0'" 
        icon="fas fa-users"
        color="primary" 
        :subtitle="`${stats.active_users || 0} actifs`"
        :evolution="stats.evolution?.all_users"
      />
      <StatCard 
        title="Utilisateurs Actifs" 
        :value="stats.active_users?.toLocaleString() || '0'"
        icon="fas fa-user-check"
        color="success"
        :subtitle="`${stats.agent_users || 0} agents`"
        :evolution="stats.evolution?.active_users"
      />
      <StatCard 
        title="Total Caisses" 
        :value="stats.total_caisses?.toLocaleString() || '0'"
        icon="fas fa-piggy-bank"
        color="warning"
        :subtitle="`${stats.caisse_pending || 0} en cours`"
        :evolution="stats.evolution?.total_caisses"
      />
      <StatCard 
        title="Total Transactions" 
        :value="stats.total_transactions?.toLocaleString() || '0'"
        icon="fas fa-exchange-alt"
        color="info"
        :subtitle="`${stats.caisse_active_amount?.toLocaleString() || 0} actif`"
        :evolution="stats.evolution?.total_transactions"
      />
    </div>

    <!-- Statistiques Utilisateurs -->
    <div class="stat-container">
      <h2>Statistiques Utilisateurs</h2>
      <div class="stat-list">
        <div class="stat-item">
          <span class="stat-label">Utilisateurs agents</span>
          <span class="stat-value">{{ stats.agent_users }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Utilisateurs inactifs</span>
          <span class="stat-value">{{ stats.inactive_users }}</span>
        </div>
      </div>
    </div>

    <!-- Statistiques Caisse -->
    <div class="stat-container">
      <h2>Statistiques Caisse</h2>
      <div class="stat-list">
        <div class="stat-item">
          <span class="stat-label">Caisse terminées</span>
          <span class="stat-value">{{ stats.caisse_done }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Caisse annulées</span>
          <span class="stat-value">{{ stats.caisse_cancel }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Caisse en attente</span>
          <span class="stat-value">{{ stats.caisse_pending }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Caisse désactivées</span>
          <span class="stat-value">{{ stats.caisse_disabled }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Caisse de la semaine</span>
          <span class="stat-value">{{ stats.all_week_caisse }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Caisse personnalisées</span>
          <span class="stat-value">{{ stats.custom_caisse }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Caisse du mois</span>
          <span class="stat-value">{{ stats.all_month_caisse }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Caisse du jour</span>
          <span class="stat-value">{{ stats.all_days_caisse }}</span>
        </div>
      </div>
    </div>

    <!-- Statistiques Transactions -->
    <div class="stat-container">
      <h2>Statistiques Transactions</h2>
      <div class="stat-list">
        <div class="stat-item">
          <span class="stat-label">Dépôts</span>
          <span class="stat-value">{{ stats.deposit_transactions }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Retraits</span>
          <span class="stat-value">{{ stats.withdrawal_transactions }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Montant actif</span>
          <span class="stat-value">{{ stats.caisse_active_amount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useStatisticsStore } from '../stores/statistics'
import StatCard from '../components/StatCard.vue'

const statisticsStore = useStatisticsStore()
const stats = statisticsStore.stats

onMounted(() => {
  statisticsStore.fetchStatistics()
})
</script>

<style scoped>
.statistics-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.filter-container {
  margin-bottom: 20px;
}

.stat-container {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-container h2 {
  color: #333;
  margin-bottom: 15px;
  font-size: 1.5rem;
}

.stat-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.stat-label {
  color: #666;
  font-size: 0.9rem;
}

.stat-value {
  font-size: 1rem;
  font-weight: bold;
  color: #333;
}

select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
}

select:focus {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.2);
}

.grid {
  display: grid;
  gap: 1.5rem;
}

.grid-cols-1 {
  grid-template-columns: 1fr;
}

.grid-cols-2 {
  grid-template-columns: repeat(2, 1fr);
}

.grid-cols-4 {
  grid-template-columns: repeat(4, 1fr);
}

@media (max-width: 768px) {
  .grid-cols-2 {
    grid-template-columns: 1fr;
  }
  
  .grid-cols-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
