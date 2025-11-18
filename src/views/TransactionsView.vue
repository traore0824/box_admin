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
              v-model="transactionsStore.searchQuery" @input="transactionsStore.updateSearchQuery(transactionsStore.searchQuery)" />
          </div>
        </div>

        <!-- Status Filter -->
        <div>
          <label for="status-filter" class="block text-sm font-medium text-gray-700">Statut</label>
          <select id="status-filter" class="input mt-1" v-model="transactionsStore.statusFilter"
            @change="transactionsStore.applyFilters">
            <option value="all">Tous les statuts</option>
            <option value="accept">Success</option>
            <option value="error">Erreur</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="timeout">Timeout</option>
          </select>
        </div>

        <!-- Type Filter -->
        <div>
          <label for="type-filter" class="block text-sm font-medium text-gray-700">Type</label>
          <select id="type-filter" class="input mt-1" v-model="transactionsStore.typeTransFilter"
            @change="transactionsStore.applyFilters">
            <option value="all">Tous les types</option>
            <option value="deposit">Deposit</option>
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
              <th>Actions</th>
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
                  {{ transaction.type_trans === 'deposit' ? 'Deposit' : transaction.type_trans === 'withdrawal' ? 'Retrait' : transaction.type_trans }}
                </span>
              </td>
              <td>
                <span class="badge" :class="{
                  'badge-success': transaction.status === 'accept',
                  'badge-danger': transaction.status === 'error',
                  'bg-gray-100 text-gray-800': transaction.status === 'pending',
                  'bg-orange-100 text-orange-800': transaction.status === 'expired',
                  'bg-yellow-100 text-yellow-800': transaction.status === 'timeout'
                }">
                  {{ transaction.status === 'accept' ? 'Success' : transaction.status === 'error' ? 'Erreur' : transaction.status === 'pending' ? 'Pending' : transaction.status === 'expired' ? 'Expired' : transaction.status === 'timeout' ? 'Timeout' : transaction.status }}
                </span>
              </td>
              <td>{{ transaction.caisse.created_by.email }}</td>
              <td>{{ transaction.caisse.name }}</td>
              <td>
                <button
                  v-if="canApproveTransaction(transaction)"
                  @click="openApproveModal(transaction)"
                  :disabled="transactionsStore.isLoading || approvingTransactionId === transaction.id"
                  class="btn btn-sm btn-success"
                  :class="{ 'opacity-50 cursor-not-allowed': transactionsStore.isLoading || approvingTransactionId === transaction.id }"
                >
                  <i v-if="approvingTransactionId === transaction.id" class="fas fa-spinner fa-spin mr-1"></i>
                  <i v-else class="fas fa-check mr-1"></i>
                  Approuver
                </button>
              </td>
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

    <!-- Modal de confirmation d'approbation -->
    <div v-if="showApproveModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" @click.stop>
        <div class="p-6">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">Approuver la transaction</h3>
          
          <div v-if="selectedTransaction" class="space-y-3 mb-6">
            <div>
              <span class="text-sm text-gray-600">Référence:</span>
              <span class="ml-2 font-medium">{{ selectedTransaction.public_reference }}</span>
            </div>
            <div>
              <span class="text-sm text-gray-600">Type:</span>
              <span class="ml-2 font-medium">
                {{ selectedTransaction.type_trans === 'withdrawal' ? 'Retrait' : selectedTransaction.type_trans === 'cancellation' ? 'Annulation' : selectedTransaction.type_trans }}
              </span>
            </div>
            <div>
              <span class="text-sm text-gray-600">Montant:</span>
              <span class="ml-2 font-medium text-lg" :class="{
                'text-danger': selectedTransaction.type_trans === 'withdrawal' || selectedTransaction.type_trans === 'cancellation'
              }">
                -{{ selectedTransaction.amount.toLocaleString() }} XOF
              </span>
            </div>
            <div>
              <span class="text-sm text-gray-600">Caisse:</span>
              <span class="ml-2 font-medium">{{ selectedTransaction.caisse.name }}</span>
            </div>
          </div>

          <p class="text-gray-700 mb-6">
            Êtes-vous sûr de vouloir approuver cette transaction ? Cette action vérifiera la cohérence des montants et changera le statut à "accept".
          </p>

          <div class="flex justify-end space-x-3">
            <button
              @click="closeApproveModal"
              :disabled="transactionsStore.isLoading"
              class="btn btn-outline"
            >
              Annuler
            </button>
            <button
              @click="confirmApprove"
              :disabled="transactionsStore.isLoading"
              class="btn btn-success"
            >
              <i v-if="transactionsStore.isLoading" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-check mr-2"></i>
              Approuver
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useTransactionsStore } from '../stores/transactions'
import { Transaction } from '../types/transaction'

const transactionsStore = useTransactionsStore()

// État du modal d'approbation
const showApproveModal = ref(false)
const selectedTransaction = ref<Transaction | null>(null)
const approvingTransactionId = ref<number | null>(null)

onMounted(() => {
  transactionsStore.fetchTransactions()
})

const hasNextPage = computed(() => {
  const currentPage = transactionsStore.currentPage
  const perPage = 10
  const total = transactionsStore.totalTransactions
  return currentPage * perPage < total
})

// Vérifier si une transaction peut être approuvée
function canApproveTransaction(transaction: Transaction): boolean {
  return (
    (transaction.type_trans === 'withdrawal' || transaction.type_trans === 'cancellation') &&
    transaction.status === 'pending'
  )
}

// Ouvrir le modal d'approbation
function openApproveModal(transaction: Transaction) {
  selectedTransaction.value = transaction
  showApproveModal.value = true
}

// Fermer le modal d'approbation
function closeApproveModal() {
  showApproveModal.value = false
  selectedTransaction.value = null
  approvingTransactionId.value = null
}

// Confirmer l'approbation
async function confirmApprove() {
  if (!selectedTransaction.value) return

  try {
    approvingTransactionId.value = selectedTransaction.value.id
    await transactionsStore.approveWithdrawal(selectedTransaction.value.id)
    closeApproveModal()
  } catch (error) {
    // L'erreur est déjà gérée dans le store avec une notification
    console.error('Erreur lors de l\'approbation:', error)
  } finally {
    approvingTransactionId.value = null
  }
}
</script>
