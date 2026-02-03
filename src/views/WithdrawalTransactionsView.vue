<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Transactions de Retrait et Annulation</h1>
      <div class="w-full sm:w-auto">
        <button class="btn btn-outline w-full sm:w-auto">
          <i class="fas fa-download mr-2"></i> Exporter
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <!-- Search Filter -->
        <div>
          <label for="search" class="block text-sm font-medium text-gray-700">Rechercher</label>
          <div class="mt-1 relative rounded-md shadow-sm">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <i class="fas fa-search text-gray-400"></i>
            </div>
            <input type="text" id="search" class="input pl-10" placeholder="Référence, téléphone, caisse ou email"
              v-model="withdrawalTransactionsStore.searchQuery" @input="withdrawalTransactionsStore.updateSearchQuery(withdrawalTransactionsStore.searchQuery)" />
          </div>
        </div>

        <!-- Status Filter -->
        <div>
          <label for="status-filter" class="block text-sm font-medium text-gray-700">Statut</label>
          <select id="status-filter" class="input mt-1" v-model="withdrawalTransactionsStore.statusFilter"
            @change="withdrawalTransactionsStore.applyFilters">
            <option value="all">Tous les statuts</option>
            <option value="accept">Success</option>
            <option value="error">Erreur</option>
            <option value="pending">Pending</option>
            <option value="expired">Expired</option>
            <option value="timeout">Timeout</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="bg-white rounded-lg shadow-sm overflow-hidden">
      <div class="table-container -mx-4 sm:mx-0">
        <table class="table">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-2 sm:px-4 md:px-6">Référence</th>
              <th class="px-2 sm:px-4 md:px-6 hidden md:table-cell">Date</th>
              <th class="px-2 sm:px-4 md:px-6">Montant</th>
              <th class="px-2 sm:px-4 md:px-6 hidden lg:table-cell">Téléphone</th>
              <th class="px-2 sm:px-4 md:px-6">Type</th>
              <th class="px-2 sm:px-4 md:px-6">Statut</th>
              <th class="px-2 sm:px-4 md:px-6 hidden xl:table-cell">Utilisateur</th>
              <th class="px-2 sm:px-4 md:px-6 hidden xl:table-cell">Caisse</th>
              <th class="px-2 sm:px-4 md:px-6">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="transaction in withdrawalTransactionsStore.getFilteredTransactions()" :key="transaction.id">
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                <div class="flex flex-col">
                  <span class="font-medium text-gray-900 text-xs sm:text-sm">{{ transaction.public_reference }}</span>
                  <span class="text-xs text-gray-500 md:hidden">{{ new Date(transaction.created_at).toLocaleDateString() }}</span>
                </div>
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm hidden md:table-cell">{{ new Date(transaction.created_at).toLocaleDateString() }}</td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm" :class="{
                'text-danger': transaction.type_trans === 'withdrawal' || transaction.type_trans === 'cancellation'
              }">
                -{{ transaction.amount.toLocaleString() }} XOF
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm hidden lg:table-cell">{{ transaction.phone }}</td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                <span class="badge text-xs" :class="{
                  'bg-warning-light text-warning-dark': transaction.type_trans === 'withdrawal',
                  'bg-red-100 text-red-800': transaction.type_trans === 'cancellation'
                }">
                  {{ transaction.type_trans === 'withdrawal' ? 'Retrait' : transaction.type_trans === 'cancellation' ? 'Annulation' : transaction.type_trans }}
                </span>
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                <span class="badge text-xs" :class="{
                  'badge-success': transaction.status === 'accept',
                  'badge-danger': transaction.status === 'error',
                  'bg-gray-100 text-gray-800': transaction.status === 'pending',
                  'bg-orange-100 text-orange-800': transaction.status === 'expired',
                  'bg-yellow-100 text-yellow-800': transaction.status === 'timeout'
                }">
                  {{ transaction.status === 'accept' ? 'Success' : transaction.status === 'error' ? 'Erreur' : transaction.status === 'pending' ? 'Pending' : transaction.status === 'expired' ? 'Expired' : transaction.status === 'timeout' ? 'Timeout' : transaction.status }}
                </span>
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm hidden xl:table-cell">{{ transaction.caisse.created_by.email }}</td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm hidden xl:table-cell">{{ transaction.caisse.name }}</td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                <div class="flex flex-col sm:flex-row gap-1 sm:gap-2">
                  <!-- Bouton Mettre à jour le statut (si status !== error && status !== accept) -->
                  <button
                    v-if="transaction.status !== 'error' && transaction.status !== 'accept'"
                    @click="handleUpdateStatus(transaction.id)"
                    :disabled="withdrawalTransactionsStore.isLoading"
                    class="btn btn-sm btn-outline text-xs"
                    title="Mettre à jour le statut (vérifie Feexpay)"
                  >
                    <i class="fas fa-sync-alt mr-1"></i>
                    <span class="hidden sm:inline">Mettre à jour</span>
                  </button>

                  <!-- Bouton Vérifier Feexpay (pour toutes les transactions) -->
                  <!-- <button
                    @click="openFeexpayStatusModal(transaction)"
                    :disabled="withdrawalTransactionsStore.isLoading || checkingFeexpayId === transaction.id"
                    class="btn btn-sm btn-outline text-xs"
                    :class="{ 'opacity-50 cursor-not-allowed': withdrawalTransactionsStore.isLoading || checkingFeexpayId === transaction.id }"
                  >
                    <i v-if="checkingFeexpayId === transaction.id" class="fas fa-spinner fa-spin mr-1"></i>
                    <i v-else class="fas fa-search mr-1"></i>
                    <span class="hidden sm:inline">Vérifier Feexpay</span>
                  </button> -->

                  <!-- Bouton Vérifier la transaction (pour withdrawal/cancellation en pending) -->
                  <button
                    v-if="transaction.status === 'pending'"
                    @click="handleValidate(transaction.id)"
                    :disabled="withdrawalTransactionsStore.isLoading"
                    class="btn btn-sm text-xs"
                    :class="{
                      'bg-yellow-500 text-white hover:bg-yellow-600': true
                    }"
                    title="Vérifier la transaction"
                  >
                    <i class="fas fa-check-circle mr-1"></i>
                    <span class="hidden sm:inline">Vérifier</span>
                  </button>

                  <!-- Bouton Approuver (pour withdrawal/cancellation en pending) -->
                  <button
                    v-if="canApproveTransaction(transaction)"
                    @click="openApproveModal(transaction)"
                    :disabled="withdrawalTransactionsStore.isLoading || approvingTransactionId === transaction.id"
                    class="btn btn-sm btn-success text-xs"
                    :class="{ 'opacity-50 cursor-not-allowed': withdrawalTransactionsStore.isLoading || approvingTransactionId === transaction.id }"
                  >
                    <i v-if="approvingTransactionId === transaction.id" class="fas fa-spinner fa-spin mr-1"></i>
                    <i v-else class="fas fa-check mr-1"></i>
                    <span class="hidden sm:inline">Approuver</span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Empty State -->
      <div v-if="withdrawalTransactionsStore.getFilteredTransactions().length === 0" class="py-8 text-center">
        <p class="text-gray-500">Aucune transaction de retrait ou annulation trouvée pour les filtres sélectionnés.</p>
      </div>

      <!-- Pagination -->
      <div v-if="!withdrawalTransactionsStore.isLoading && !withdrawalTransactionsStore.error && withdrawalTransactionsStore.totalTransactions > 0"
        class="flex items-center justify-between mt-4 px-4 py-3 bg-white border rounded-lg shadow-sm">

        <!-- Infos -->
        <div class="text-sm text-gray-700">
          <span>Page {{ withdrawalTransactionsStore.currentPage }}</span>
          <span>
            sur {{ Math.ceil(withdrawalTransactionsStore.totalTransactions / 10) }}
          </span>
          <span class="ml-2">
            ({{ withdrawalTransactionsStore.totalTransactions }} transaction{{ withdrawalTransactionsStore.totalTransactions > 1 ? 's' : ''
            }} au total)
          </span>
        </div>

        <!-- Contrôles -->
        <div class="flex space-x-2">
          <button class="btn btn-sm" :class="{ 'opacity-50 cursor-not-allowed': withdrawalTransactionsStore.currentPage === 1 || withdrawalTransactionsStore.isLoading }"
            :disabled="withdrawalTransactionsStore.currentPage === 1 || withdrawalTransactionsStore.isLoading"
            @click="withdrawalTransactionsStore.fetchTransactions(withdrawalTransactionsStore.currentPage - 1)">
            <i v-if="withdrawalTransactionsStore.isLoading" class="fas fa-spinner fa-spin mr-1"></i>
            <i v-else class="fas fa-chevron-left mr-1"></i> Précédente
          </button>

          <button class="btn btn-sm" :class="{ 'opacity-50 cursor-not-allowed': withdrawalTransactionsStore.currentPage >= Math.ceil(withdrawalTransactionsStore.totalTransactions / 10) || withdrawalTransactionsStore.isLoading }"
            :disabled="withdrawalTransactionsStore.currentPage >= Math.ceil(withdrawalTransactionsStore.totalTransactions / 10) || withdrawalTransactionsStore.isLoading"
            @click="withdrawalTransactionsStore.fetchTransactions(withdrawalTransactionsStore.currentPage + 1)">
            Suivante <i v-if="withdrawalTransactionsStore.isLoading" class="fas fa-spinner fa-spin ml-1"></i>
            <i v-else class="fas fa-chevron-right ml-1"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de validation -->
    <Teleport to="body">
      <div v-if="showValidationModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeValidationModal">
        <div class="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 transition-opacity" @click="closeValidationModal">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div class="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-green-100 sm:mx-0 sm:h-10 sm:w-10">
                  <i class="fas fa-check-circle text-green-600"></i>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                  <h3 class="text-lg font-medium leading-6 text-gray-900">
                    Résultat de la validation
                  </h3>
                  <div class="mt-4">
                    <div class="text-sm text-gray-500 space-y-2">
                      <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Transaction valide:</span>
                        <span :class="validationDetails.valid ? 'text-green-600' : 'text-red-600'">
                          {{ validationDetails.valid ? 'Oui' : 'Non' }}
                        </span>
                      </div>
                      <div v-if="validationDetails.valid" class="flex justify-between">
                        <span class="font-medium text-gray-700">Message:</span>
                        <span class="text-green-600">{{ validationDetails.message }}</span>
                      </div>
                      <div v-else class="flex justify-between">
                        <span class="font-medium text-gray-700">Erreur:</span>
                        <span class="text-red-600">{{ validationDetails.message }}</span>
                      </div>

                      <div class="border-t pt-2 mt-4">
                        <h4 class="font-medium text-gray-700 mb-2">Détails:</h4>
                        <div class="space-y-1 text-xs">
                          <div class="flex justify-between">
                            <span class="text-gray-600">ID Transaction:</span>
                            <span class="font-mono">{{ validationDetails.details?.transaction_id }}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-gray-600">Type:</span>
                            <span>{{ validationDetails.details?.transaction_type }}</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-gray-600">Montant:</span>
                            <span>{{ validationDetails.details?.transaction_amount }} XOF</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-gray-600">Total dépôts:</span>
                            <span>{{ validationDetails.details?.total_deposits }} XOF</span>
                          </div>
                          <div class="flex justify-between">
                            <span class="text-gray-600">Montant déjà payé:</span>
                            <span>{{ validationDetails.details?.amount_already_paid }} XOF</span>
                          </div>
                          <div v-if="validationDetails.details?.difference" class="flex justify-between">
                            <span class="text-gray-600">Différence:</span>
                            <span class="text-red-600">{{ validationDetails.details?.difference }} XOF</span>
                          </div>
                          <div v-if="validationDetails.details?.caisse_id" class="flex justify-between">
                            <span class="text-gray-600">ID Caisse:</span>
                            <span class="font-mono">{{ validationDetails.details?.caisse_id }}</span>
                          </div>
                          <div v-if="validationDetails.details?.caisse_name" class="flex justify-between">
                            <span class="text-gray-600">Nom Caisse:</span>
                            <span>{{ validationDetails.details?.caisse_name }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button 
                @click="closeValidationModal"
                class="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal d'approbation -->
    <Teleport to="body">
      <div v-if="showApproveModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeApproveModal">
        <div class="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 transition-opacity" @click="closeApproveModal">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div class="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                  <i class="fas fa-exclamation-triangle text-red-600"></i>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                  <h3 class="text-lg font-medium leading-6 text-gray-900">
                    Approuver la transaction
                  </h3>
                  <div class="mt-2">
                    <p class="text-sm text-gray-500">
                      Êtes-vous sûr de vouloir approuver cette transaction ? Cette action est irréversible et retirera l'argent du wallet de l'utilisateur.
                    </p>
                    <div class="mt-4 space-y-2">
                      <div class="flex justify-between text-sm">
                        <span class="font-medium">Référence:</span>
                        <span>{{ selectedTransaction?.public_reference }}</span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span class="font-medium">Montant:</span>
                        <span>{{ selectedTransaction?.amount }} XOF</span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span class="font-medium">Utilisateur:</span>
                        <span>{{ selectedTransaction?.caisse.created_by.email }}</span>
                      </div>
                      <div class="flex justify-between text-sm">
                        <span class="font-medium">Caisse:</span>
                        <span>{{ selectedTransaction?.caisse.name }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button 
                @click="confirmApprove"
                :disabled="approvingTransactionId !== null"
                class="inline-flex w-full justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
              >
                <i v-if="approvingTransactionId !== null" class="fas fa-spinner fa-spin mr-2"></i>
                Approuver
              </button>
              <button 
                @click="closeApproveModal"
                class="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal de vérification Feexpay -->
    <!-- <Teleport to="body">
      <div v-if="showFeexpayModal" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeFeexpayModal">
        <div class="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div class="fixed inset-0 transition-opacity" @click="closeFeexpayModal">
            <div class="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div class="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <i class="fas fa-search text-blue-600"></i>
                </div>
                <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                  <h3 class="text-lg font-medium leading-6 text-gray-900">
                    Statut Feexpay
                  </h3>
                  <div class="mt-4">
                    <div v-if="feexpayError" class="text-sm text-red-600">
                      <i class="fas fa-exclamation-triangle mr-1"></i>
                      {{ feexpayError }}
                    </div>
                    <div v-else-if="feexpayStatusData" class="text-sm text-gray-500 space-y-2">
                      <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Référence:</span>
                        <span class="font-mono">{{ feexpayStatusData.reference }}</span>
                      </div>
                      <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Statut Feexpay:</span>
                        <span :class="feexpayStatusData.feexpay_status === 'SUCCESSFUL' ? 'text-green-600' : 'text-red-600'">
                          {{ feexpayStatusData.feexpay_status }}
                        </span>
                      </div>
                      <div class="flex justify-between">
                        <span class="font-medium text-gray-700">Statut Local:</span>
                        <span>{{ feexpayStatusData.local_status }}</span>
                      </div>
                      <div v-if="feexpayStatusData.feexpay_data" class="border-t pt-2 mt-4">
                        <h4 class="font-medium text-gray-700 mb-2">Données Feexpay:</h4>
                        <pre class="text-xs bg-gray-50 p-2 rounded overflow-x-auto">{{ JSON.stringify(feexpayStatusData.feexpay_data, null, 2) }}</pre>
                      </div>
                    </div>
                    <div v-else class="text-sm text-gray-500">
                      <i class="fas fa-spinner fa-spin mr-1"></i>
                      Vérification en cours...
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button 
                @click="closeFeexpayModal"
                class="inline-flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { useWithdrawalTransactionsStore } from '../stores/withdrawalTransactions'
import { Transaction } from '../types/transaction'
import { useNotification } from '../services/notification'

const withdrawalTransactionsStore = useWithdrawalTransactionsStore()
const notification = useNotification()

// État du modal de validation
const showValidationModal = ref(false)
const validationDetails = ref<any>(null)

// État du modal d'approbation
const showApproveModal = ref(false)
const selectedTransaction = ref<Transaction | null>(null)
const approvingTransactionId = ref<number | null>(null)

// État du modal de vérification Feexpay
/* const showFeexpayModal = ref(false)
const checkingFeexpayId = ref<number | null>(null)
const feexpayStatusData = ref<any>(null)
const feexpayError = ref<string | null>(null) */

onMounted(() => {
  withdrawalTransactionsStore.fetchTransactions()
})

const hasNextPage = computed(() => {
  const currentPage = withdrawalTransactionsStore.currentPage
  const perPage = 10
  const total = withdrawalTransactionsStore.totalTransactions
  return currentPage * perPage < total
})

// Vérifier si une transaction peut être approuvée
function canApproveTransaction(transaction: Transaction): boolean {
  return (
    (transaction.type_trans === 'withdrawal' || transaction.type_trans === 'cancellation') &&
    transaction.status === 'pending'
  )
}

// Mettre à jour le statut d'une transaction
const handleUpdateStatus = async (transactionId: number) => {
  try {
    const result = await withdrawalTransactionsStore.updateTransactionStatus(transactionId)
    notification.addNotification(
      result.message || 'Statut de la transaction mis à jour avec succès',
      'success'
    )
  } catch (error) {
    notification.addNotification(
      error instanceof Error ? error.message : 'Erreur lors de la mise à jour du statut',
      'error'
    )
  }
}

// Valider une transaction de retrait/annulation
const handleValidate = async (transactionId: number) => {
  try {
    const result = await withdrawalTransactionsStore.validateWithdrawal(transactionId)
    validationDetails.value = result
    showValidationModal.value = true
  } catch (error) {
    notification.addNotification(
      error instanceof Error ? error.message : 'Erreur lors de la validation',
      'error'
    )
  }
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
    await withdrawalTransactionsStore.approveWithdrawal(selectedTransaction.value.id)
    closeApproveModal()
  } catch (error) {
    // L'erreur est déjà gérée dans le store avec une notification
    console.error('Erreur lors de l\'approbation:', error)
  } finally {
    approvingTransactionId.value = null
  }
}

// Ouvrir le modal de vérification Feexpay
/* async function openFeexpayStatusModal(transaction: Transaction) {
  showFeexpayModal.value = true
  checkingFeexpayId.value = transaction.id
  feexpayStatusData.value = null
  feexpayError.value = null

  try {
    const result = await withdrawalTransactionsStore.checkFeexpayStatus(transaction.id)
    feexpayStatusData.value = result
  } catch (error) {
    feexpayError.value = error instanceof Error ? error.message : 'Une erreur est survenue'
    notification.addNotification(feexpayError.value, 'error')
  } finally {
    checkingFeexpayId.value = null
  }
}

// Fermer le modal de vérification Feexpay
function closeFeexpayModal() {
  showFeexpayModal.value = false
  checkingFeexpayId.value = null
  feexpayStatusData.value = null
  feexpayError.value = null
} */

// Fermer le modal de validation
const closeValidationModal = () => {
  showValidationModal.value = false
  validationDetails.value = null
}
</script>
