<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Historique des Transactions</h1>
      <div class="mt-4 sm:mt-0">
        <button class="btn btn-outline">
          <i class="fas fa-download mr-2"></i> Exporter
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-3 sm:p-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <!-- Search Filter -->
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700">Rechercher</label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i class="fas fa-search text-gray-400"></i>
            </div>
            <input type="text" id="search" class="input pl-10" placeholder="Référence, téléphone, caisse ou email"
              v-model="transactionsStore.searchQuery" @input="transactionsStore.fetchTransactions(1)" />
          </div>
        </div>

        <!-- Status Filter -->
        <div>
          <label for="status-filter" class="block text-sm font-medium text-gray-700">Statut</label>
          <select id="status-filter" class="input mt-1" v-model="transactionsStore.statusFilter"
            @change="transactionsStore.fetchTransactions(1)">
            <option value="all">Tous les statuts</option>
            <option value="accept">Accepté</option>
            <option value="error">Erreur</option>
            <option value="pending">En attente</option>
          </select>
        </div>

        <!-- Type Filter -->
        <div>
          <label for="type-filter" class="block text-sm font-medium text-gray-700">Type</label>
          <select id="type-filter" class="input mt-1" v-model="transactionsStore.typeTransFilter"
            @change="transactionsStore.fetchTransactions(1)">
            <option value="all">Tous les types</option>
            <option value="deposit">Dépôt</option>
            <option value="withdrawal">Retrait</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="table-container">
        <table class="table">
          <thead class="bg-gray-50">
            <tr>
              <th>Référence</th>
              <th>Date</th>
              <th>Montant</th>
              <th>Téléphone</th>
              <th>Type</th>
              <th>Statut</th>
              <th>Utilisateur</th>
              <th>Caisse</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="transaction in transactionsStore.getFilteredTransactions()" :key="transaction.id">
              <td class="font-medium text-gray-900">{{ transaction.public_reference }}</td>
              <td>{{ new Date(transaction.created_at).toLocaleDateString() }}</td>
              <td :class="{
                'text-success': transaction.type_trans === 'deposit',
                'text-danger': transaction.type_trans === 'withdrawal'
              }">
                {{ transaction.type_trans === 'deposit' ? '+' : '-' }}{{ transaction.amount.toLocaleString() }} XOF
              </td>
              <td>{{ transaction.phone }}</td>
              <td>
                <span class="badge" :class="{
                  'bg-success-light text-success-dark': transaction.type_trans === 'deposit',
                  'bg-warning-light text-warning-dark': transaction.type_trans === 'withdrawal'
                }">
                  {{ transaction.type_trans }}
                </span>
              </td>
              <td>
                <span class="badge" :class="{
                  'badge-success': transaction.status === 'accept',
                  'badge-danger': transaction.status === 'error',
                  'bg-gray-100 text-gray-800': transaction.status === 'pending'
                }">
                  {{ transaction.status }}
                </span>
              </td>
              <td>{{ transaction.caisse.created_by.email }}</td>
              <td>{{ transaction.caisse.name }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="transactionsStore.getFilteredTransactions().length === 0" class="py-8 text-center">
        <p class="text-gray-500">Aucune transaction trouvée pour les filtres sélectionnés.</p>
      </div>

      <!-- Pagination (comme caisses) -->
      <div v-if="!transactionsStore.isLoading && !transactionsStore.error && transactionsStore.totalTransactions > 0"
        class="flex items-center justify-between mt-4 px-4 py-3 bg-white border rounded-lg shadow-sm">

        <!-- Infos -->
        <div class="text-sm text-gray-700">
          <span>Page {{ transactionsStore.currentPage }}</span>
          <span>
            sur {{ Math.ceil(transactionsStore.totalTransactions / 10) }}
          </span>
          <span class="ml-2">
            ({{ transactionsStore.totalTransactions }} transaction{{ transactionsStore.totalTransactions > 1 ? 's' : ''
            }} au total)
          </span>
        </div>

        <!-- Contrôles -->
        <div class="flex space-x-2">
          <button class="btn btn-sm" :class="{ 'opacity-50 cursor-not-allowed': transactionsStore.currentPage === 1 }"
            :disabled="transactionsStore.currentPage === 1"
            @click="transactionsStore.fetchTransactions(transactionsStore.currentPage - 1)">
            <i class="fas fa-chevron-left mr-1"></i> Précédente
          </button>

          <button class="btn btn-sm" :class="{ 'opacity-50 cursor-not-allowed': !hasNextPage }" :disabled="!hasNextPage"
            @click="transactionsStore.fetchTransactions(transactionsStore.currentPage + 1)">
            Suivante <i class="fas fa-chevron-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useTransactionsStore } from '../stores/transactions'

const transactionsStore = useTransactionsStore()

onMounted(() => {
  transactionsStore.fetchTransactions()
})

const hasNextPage = computed(() => {
  const currentPage = transactionsStore.currentPage
  const perPage = 10
  const total = transactionsStore.totalTransactions
  return currentPage * perPage < total
})
</script>
