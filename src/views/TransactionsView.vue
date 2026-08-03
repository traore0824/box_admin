<template>
  <div class="space-y-6">
    <!-- Page Header -->
    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Historique des Transactions</h1>
      <div class="w-full sm:w-auto">
        <button class="btn btn-outline w-full sm:w-auto">
          <i class="fas fa-download mr-2"></i> Exporter
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
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
            <option value="cancellation">Annulation</option>
            <option value="partial_withdrawal">Retrait partiel</option>
            <option value="withdrawal_request">Demande de retrait</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="bg-white rounded-lg shadow-sm">
      <div class="w-full overflow-x-auto">
        <table class="table">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-2 sm:px-4 md:px-6">Référence</th>
              <th class="px-2 sm:px-4 md:px-6 hidden md:table-cell">Date et heure</th>
              <th class="px-2 sm:px-4 md:px-6">Montant</th>
              <th class="px-2 sm:px-4 md:px-6 hidden lg:table-cell">Téléphone</th>
              <th class="px-2 sm:px-4 md:px-6">Type</th>
              <th class="px-2 sm:px-4 md:px-6">Statut</th>
              <th class="px-2 sm:px-4 md:px-6 hidden lg:table-cell">API</th>
              <th class="px-2 sm:px-4 md:px-6 hidden xl:table-cell">Utilisateur</th>
              <th class="px-2 sm:px-4 md:px-6 hidden xl:table-cell">Caisse</th>
              <th class="px-2 sm:px-4 md:px-6">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="transaction in transactionsStore.getFilteredTransactions()" :key="transaction.id">
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                <div class="flex flex-col">
                  <span class="font-medium text-gray-900 text-xs sm:text-sm">{{ transaction.public_reference }}</span>
                  <span class="text-xs text-gray-500 md:hidden">{{ formatDateTime(transaction.created_at) }}</span>
                </div>
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm hidden md:table-cell">{{ formatDateTime(transaction.created_at) }}</td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm" :class="getTransactionAmountClass(transaction.type_trans)">
                {{ transaction.type_trans === 'deposit' ? '+' : '-' }}{{ transaction.amount.toLocaleString() }} XOF
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm hidden lg:table-cell">{{ transaction.phone }}</td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                <span class="badge text-xs" :class="getTransactionTypeBadgeClass(transaction.type_trans)">
                  {{ getTransactionTypeLabel(transaction.type_trans) }}
                </span>
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                <div class="flex flex-col gap-1">
                  <span class="badge text-xs" :class="{
                    'badge-success': transaction.status === 'accept',
                    'badge-danger': transaction.status === 'error',
                    'bg-gray-100 text-gray-800': transaction.status === 'pending',
                    'bg-orange-100 text-orange-800': transaction.status === 'expired',
                    'bg-yellow-100 text-yellow-800': transaction.status === 'timeout'
                  }">
                    {{ transaction.status === 'accept' ? 'Success' : transaction.status === 'error' ? 'Erreur' : transaction.status === 'pending' ? 'Pending' : transaction.status === 'expired' ? 'Expired' : transaction.status === 'timeout' ? 'Timeout' : transaction.status }}
                  </span>
                  <span v-if="transaction.is_suspect_transaction"
                    class="inline-flex items-center px-1.5 py-0.5 text-xs font-semibold rounded bg-yellow-100 text-yellow-800 border border-yellow-300 w-fit">
                    <i class="fas fa-exclamation-triangle mr-1 text-[10px]"></i>
                    SUSPECT
                  </span>
                </div>
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 hidden lg:table-cell">
                <select
                  v-if="canEditPaymentApi(transaction)"
                  class="input text-xs py-1 px-2 min-w-[7.5rem]"
                  :value="getEffectivePaymentApi(transaction)"
                  :disabled="transactionsStore.isLoading || updatingPaymentApiId === transaction.id"
                  @change="handlePaymentApiChange(transaction, ($event.target as HTMLSelectElement).value)"
                  title="Override API pour cette transaction"
                >
                  <option value="connect">Connect Pro</option>
                  <option value="manual">Manuel</option>
                  <option value="feexpay">FeexPay</option>
                </select>
                <span v-else class="text-xs sm:text-sm text-gray-800">
                  {{ getPaymentApiLabel(getEffectivePaymentApi(transaction)) }}
                </span>
              </td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm hidden xl:table-cell">{{ getTransactionUserEmail(transaction) }}</td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4 text-xs sm:text-sm hidden xl:table-cell">{{ transaction.caisse?.name || '—' }}</td>
              <td class="px-2 sm:px-4 md:px-6 py-3 sm:py-4">
                <div class="flex flex-col sm:flex-row gap-1 sm:gap-2">
                  <!-- Bouton Voir détails -->
                  <button
                    @click="viewTransactionDetails(transaction.id)"
                    class="btn btn-sm btn-outline text-xs"
                    title="Voir les détails"
                  >
                    <i class="fas fa-eye mr-1"></i>
                    <span class="hidden sm:inline">Détails</span>
                  </button>

                  <!-- Bouton Notifier (uniquement pour les transactions échouées) -->
                  <button
                    v-if="transaction.status === 'error' && transaction.type_trans === 'deposit'"
                    @click="notifyFailedDeposit(transaction)"
                    class="btn btn-sm text-xs bg-orange-500 text-white hover:bg-orange-600"
                    title="Notifier l'utilisateur du dépôt échoué"
                  >
                    <i class="fas fa-bell mr-1"></i>
                    <span class="hidden sm:inline">Notifier</span>
                  </button>

                  <!-- Bouton Modifier référence (pending / timeout) -->
                  <button
                    v-if="canUpdateReference(transaction)"
                    @click="openReferenceModal(transaction)"
                    :disabled="transactionsStore.isLoading"
                    class="btn btn-sm btn-outline text-xs"
                    title="Modifier la référence Feexpay"
                  >
                    <i class="fas fa-edit mr-1"></i>
                    <span class="hidden sm:inline">Référence</span>
                  </button>

                  <!-- Bouton Mettre à jour le statut (si status !== error && status !== accept) -->
                  <button
                    v-if="transaction.status !== 'error' && transaction.status !== 'accept'"
                    @click="handleUpdateStatus(transaction.id)"
                    :disabled="transactionsStore.isLoading"
                    class="btn btn-sm btn-outline text-xs"
                    title="Mettre à jour le statut (vérifie Feexpay)"
                  >
                    <i class="fas fa-sync-alt mr-1"></i>
                    <span class="hidden sm:inline">Mettre à jour</span>
                  </button>
                  
                  <!-- Bouton Vérifier Feexpay (pour toutes les transactions) -->
                  <button
                    @click="openFeexpayStatusModal(transaction)"
                    :disabled="transactionsStore.isLoading || checkingFeexpayId === transaction.id"
                    class="btn btn-sm btn-outline text-xs"
                    :class="{ 'opacity-50 cursor-not-allowed': transactionsStore.isLoading || checkingFeexpayId === transaction.id }"
                  >
                    <i v-if="checkingFeexpayId === transaction.id" class="fas fa-spinner fa-spin mr-1"></i>
                    <i v-else class="fas fa-search mr-1"></i>
                    <span class="hidden sm:inline">Vérifier Feexpay</span>
                  </button>

                  <!-- Bouton Vérifier la transaction (pour withdrawal/cancellation/withdrawal_request en pending) -->
                  <button
                    v-if="isWithdrawalLikeType(transaction.type_trans) && transaction.status === 'pending'"
                    @click="handleValidate(transaction.id)"
                    :disabled="transactionsStore.isLoading"
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
                    :disabled="transactionsStore.isLoading || approvingTransactionId === transaction.id"
                    class="btn btn-sm btn-success text-xs"
                    :class="{ 'opacity-50 cursor-not-allowed': transactionsStore.isLoading || approvingTransactionId === transaction.id }"
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
      <div v-if="transactionsStore.getFilteredTransactions().length === 0" class="py-8 text-center">
        <p class="text-gray-500">Aucune transaction trouvée pour les filtres sélectionnés.</p>
      </div>

      <!-- Pagination -->
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
          <button class="btn btn-sm" :class="{ 'opacity-50 cursor-not-allowed': transactionsStore.currentPage === 1 || transactionsStore.isLoading }"
            :disabled="transactionsStore.currentPage === 1 || transactionsStore.isLoading"
            @click="transactionsStore.fetchTransactions(transactionsStore.currentPage - 1)">
            <i v-if="transactionsStore.isLoading" class="fas fa-spinner fa-spin mr-1"></i>
            <i v-else class="fas fa-chevron-left mr-1"></i> Précédente
          </button>

          <button class="btn btn-sm" :class="{ 'opacity-50 cursor-not-allowed': !hasNextPage || transactionsStore.isLoading }" :disabled="!hasNextPage || transactionsStore.isLoading"
            @click="transactionsStore.fetchTransactions(transactionsStore.currentPage + 1)">
            <i v-if="transactionsStore.isLoading" class="fas fa-spinner fa-spin ml-1"></i>
            <i v-else class="fas fa-chevron-right ml-1"></i> Suivante
          </button>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation d'approbation -->
    <Teleport to="body">
      <div v-if="showApproveModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click="closeApproveModal">
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
                  {{ getTransactionTypeLabel(selectedTransaction.type_trans) }}
                </span>
              </div>
              <div>
                <span class="text-sm text-gray-600">Montant:</span>
                <span class="ml-2 font-medium text-lg" :class="{
                  'text-danger': isDebitTransactionType(selectedTransaction.type_trans)
                }">
                  -{{ selectedTransaction.amount.toLocaleString() }} XOF
                </span>
              </div>
              <div>
                <span class="text-sm text-gray-600">Caisse:</span>
                <span class="ml-2 font-medium">{{ selectedTransaction.caisse?.name || '—' }}</span>
              </div>
              <div>
                <span class="text-sm text-gray-600">Utilisateur:</span>
                <span class="ml-2 font-medium">{{ getTransactionUserEmail(selectedTransaction) }}</span>
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
    </Teleport>

    <!-- Modal de vérification du statut Feexpay -->
    <Teleport to="body">
      <div v-if="showFeexpayModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" @click="closeFeexpayModal">
        <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" @click.stop>
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-xl font-semibold text-gray-800">Statut Feexpay</h3>
              <button @click="closeFeexpayModal" class="text-gray-400 hover:text-gray-600">
                <i class="fas fa-times"></i>
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="checkingFeexpayId !== null && !feexpayStatusData" class="text-center py-8">
              <i class="fas fa-spinner fa-spin text-2xl text-primary mb-2"></i>
              <p class="text-gray-600">Vérification du statut en cours...</p>
            </div>

            <!-- Success State -->
            <div v-else-if="feexpayStatusData && feexpayStatusData.success" class="space-y-4">
              <div class="bg-success-light border border-success-dark rounded-lg p-4">
                <div class="flex items-center mb-2">
                  <i class="fas fa-check-circle text-success-dark mr-2"></i>
                  <span class="font-semibold text-success-dark">Vérification réussie</span>
                </div>
              </div>

              <div class="space-y-3">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <span class="text-sm text-gray-600">Transaction ID:</span>
                    <span class="ml-2 font-medium">{{ feexpayStatusData.transaction_id }}</span>
                  </div>
                  <div>
                    <span class="text-sm text-gray-600">Référence:</span>
                    <span class="ml-2 font-medium">{{ feexpayStatusData.reference }}</span>
                  </div>
                  <div>
                    <span class="text-sm text-gray-600">Statut Feexpay:</span>
                    <span class="ml-2 font-medium" :class="{
                      'text-success': feexpayStatusData.feexpay_status === 'SUCCESSFUL',
                      'text-danger': feexpayStatusData.feexpay_status !== 'SUCCESSFUL'
                    }">
                      {{ feexpayStatusData.feexpay_status }}
                    </span>
                  </div>
                  <div>
                    <span class="text-sm text-gray-600">Statut Local:</span>
                    <span class="ml-2 font-medium">{{ feexpayStatusData.local_status }}</span>
                  </div>
                </div>

                <div v-if="feexpayStatusData.feexpay_data" class="mt-4">
                  <h4 class="font-semibold text-gray-800 mb-2">Détails Feexpay:</h4>
                  <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                    <div v-if="feexpayStatusData.feexpay_data.amount">
                      <span class="text-gray-600">Montant:</span>
                      <span class="ml-2 font-medium">{{ feexpayStatusData.feexpay_data.amount }} XOF</span>
                    </div>
                    <div v-if="feexpayStatusData.feexpay_data.phoneNumber">
                      <span class="text-gray-600">Téléphone:</span>
                      <span class="ml-2 font-medium">{{ feexpayStatusData.feexpay_data.phoneNumber }}</span>
                    </div>
                    <div v-if="feexpayStatusData.feexpay_data.status">
                      <span class="text-gray-600">Statut:</span>
                      <span class="ml-2 font-medium" :class="{
                        'text-success': feexpayStatusData.feexpay_data.status === 'SUCCESSFUL',
                        'text-danger': feexpayStatusData.feexpay_data.status !== 'SUCCESSFUL'
                      }">
                        {{ feexpayStatusData.feexpay_data.status }}
                      </span>
                    </div>
                    <div v-if="feexpayStatusData.feexpay_data.responsecode">
                      <span class="text-gray-600">Code de réponse:</span>
                      <span class="ml-2 font-medium">{{ feexpayStatusData.feexpay_data.responsecode }}</span>
                    </div>
                    <div v-if="feexpayStatusData.feexpay_data.responsemsg">
                      <span class="text-gray-600">Message:</span>
                      <span class="ml-2 font-medium">{{ feexpayStatusData.feexpay_data.responsemsg }}</span>
                    </div>
                    <div v-if="feexpayStatusData.feexpay_data.date">
                      <span class="text-gray-600">Date:</span>
                      <span class="ml-2 font-medium">{{ new Date(feexpayStatusData.feexpay_data.date).toLocaleString() }}</span>
                    </div>
                    <div v-if="feexpayStatusData.feexpay_data.description">
                      <span class="text-gray-600">Description:</span>
                      <span class="ml-2 font-medium">{{ feexpayStatusData.feexpay_data.description }}</span>
                    </div>
                    <div v-if="feexpayStatusData.feexpay_data.type">
                      <span class="text-gray-600">Type:</span>
                      <span class="ml-2 font-medium">{{ feexpayStatusData.feexpay_data.type }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Error State -->
            <div v-else-if="feexpayStatusData && !feexpayStatusData.success" class="space-y-4">
              <div class="bg-danger-light border border-danger-dark rounded-lg p-4">
                <div class="flex items-center mb-2">
                  <i class="fas fa-exclamation-circle text-danger-dark mr-2"></i>
                  <span class="font-semibold text-danger-dark">Erreur lors de la vérification</span>
                </div>
                <p class="text-sm text-gray-700 mt-2">{{ feexpayStatusData.message || 'Une erreur est survenue' }}</p>
              </div>
            </div>

            <!-- Error from API -->
            <div v-else-if="feexpayError" class="space-y-4">
              <div class="bg-danger-light border border-danger-dark rounded-lg p-4">
                <div class="flex items-center mb-2">
                  <i class="fas fa-exclamation-circle text-danger-dark mr-2"></i>
                  <span class="font-semibold text-danger-dark">Erreur</span>
                </div>
                <p class="text-sm text-gray-700 mt-2">{{ feexpayError }}</p>
              </div>
            </div>

            <div class="flex justify-end mt-6">
              <button @click="closeFeexpayModal" class="btn btn-outline">
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Validation -->
    <Teleport to="body">
      <div v-if="showValidationModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-gray-800">Détails de Validation</h3>
            <button 
              @click="closeValidationModal"
              class="text-gray-500 hover:text-gray-700"
            >
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          
          <div v-if="validationDetails" class="space-y-4">
            <div :class="[
              'p-4 rounded-lg',
              validationDetails.valid ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
            ]">
              <div class="flex items-center mb-2">
                <i :class="[
                  'fas mr-2 text-xl',
                  validationDetails.valid ? 'fa-check-circle text-green-600' : 'fa-times-circle text-red-600'
                ]"></i>
                <span :class="[
                  'font-semibold',
                  validationDetails.valid ? 'text-green-800' : 'text-red-800'
                ]">
                  {{ validationDetails.valid ? 'Transaction Valide' : 'Transaction Invalide' }}
                </span>
              </div>
              <p :class="[
                'text-sm',
                validationDetails.valid ? 'text-green-700' : 'text-red-700'
              ]">
                {{ validationDetails.message }}
              </p>
            </div>

            <div v-if="validationDetails.details" class="bg-gray-50 rounded-lg p-4 space-y-2">
              <div v-if="validationDetails.details.transaction_id" class="flex justify-between">
                <span class="text-sm font-medium text-gray-700">ID Transaction:</span>
                <span class="text-sm text-gray-900">{{ validationDetails.details.transaction_id }}</span>
              </div>
              <div v-if="validationDetails.details.transaction_type" class="flex justify-between">
                <span class="text-sm font-medium text-gray-700">Type:</span>
                <span class="text-sm text-gray-900">{{ validationDetails.details.transaction_type }}</span>
              </div>
              <div v-if="validationDetails.details.transaction_amount" class="flex justify-between">
                <span class="text-sm font-medium text-gray-700">Montant:</span>
                <span class="text-sm text-gray-900">{{ validationDetails.details.transaction_amount }} XOF</span>
              </div>
              <div v-if="validationDetails.details.total_deposits" class="flex justify-between">
                <span class="text-sm font-medium text-gray-700">Total Dépôts:</span>
                <span class="text-sm text-gray-900">{{ validationDetails.details.total_deposits }} XOF</span>
              </div>
              <div v-if="validationDetails.details.amount_already_paid" class="flex justify-between">
                <span class="text-sm font-medium text-gray-700">Montant Déjà Payé:</span>
                <span class="text-sm text-gray-900">{{ validationDetails.details.amount_already_paid }} XOF</span>
              </div>
              <div v-if="validationDetails.details.difference" class="flex justify-between">
                <span class="text-sm font-medium text-gray-700">Différence:</span>
                <span class="text-sm text-red-600 font-semibold">{{ validationDetails.details.difference }} XOF</span>
              </div>
              <div v-if="validationDetails.details.caisse_id" class="flex justify-between">
                <span class="text-sm font-medium text-gray-700">ID Caisse:</span>
                <span class="text-sm text-gray-900">{{ validationDetails.details.caisse_id }}</span>
              </div>
              <div v-if="validationDetails.details.caisse_name" class="flex justify-between">
                <span class="text-sm font-medium text-gray-700">Nom Caisse:</span>
                <span class="text-sm text-gray-900">{{ validationDetails.details.caisse_name }}</span>
              </div>
            </div>
          </div>

          <div class="mt-6 flex justify-end">
            <button 
              @click="closeValidationModal"
              class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal modification référence -->
    <Teleport to="body">
      <div
        v-if="showReferenceModal"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
        @click="closeReferenceModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4" @click.stop>
          <div class="p-6">
            <h3 class="text-xl font-semibold text-gray-800 mb-4">Modifier la référence Feexpay</h3>

            <div v-if="referenceTransaction" class="space-y-3 mb-4 text-sm text-gray-600">
              <p>
                <span class="font-medium text-gray-800">Transaction :</span>
                {{ referenceTransaction.public_reference }}
              </p>
              <p>
                <span class="font-medium text-gray-800">Référence actuelle :</span>
                {{ referenceTransaction.reference || 'Non définie' }}
              </p>
            </div>

            <label class="block text-sm font-medium text-gray-700 mb-1">Nouvelle référence</label>
            <input
              v-model="newReferenceValue"
              type="text"
              class="input w-full"
              placeholder="Référence Feexpay"
              @keyup.enter="confirmReferenceUpdate"
            />

            <p class="text-xs text-gray-500 mt-2">
              Réservé aux administrateurs. Transactions pending ou timeout uniquement.
              La référence ne doit pas exister sur une autre transaction.
            </p>

            <div class="mt-6 flex justify-end gap-2">
              <button
                @click="closeReferenceModal"
                class="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Annuler
              </button>
              <button
                @click="confirmReferenceUpdate"
                :disabled="transactionsStore.isLoading || !newReferenceValue.trim()"
                class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
              >
                <i v-if="transactionsStore.isLoading" class="fas fa-spinner fa-spin mr-1"></i>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useTransactionsStore } from '../stores/transactions'
import { useAuthStore } from '../stores/auth'
import { Transaction } from '../types/transaction'
import { useNotification } from '../services/notification'
import {
  getTransactionAmountClass,
  getTransactionTypeBadgeClass,
  getTransactionTypeLabel,
  isDebitTransactionType,
  isWithdrawalLikeType,
  canEditPaymentApi,
  getEffectivePaymentApi,
  getPaymentApiLabel,
} from '../utils/transactionType'

const router = useRouter()
const route = useRoute()
const transactionsStore = useTransactionsStore()
const authStore = useAuthStore()
const notification = useNotification()

// État du modal de validation
const showValidationModal = ref(false)
const validationDetails = ref<any>(null)

// État du modal d'approbation
const showApproveModal = ref(false)
const selectedTransaction = ref<Transaction | null>(null)
const approvingTransactionId = ref<number | null>(null)

// État du modal de vérification Feexpay
const showFeexpayModal = ref(false)
const checkingFeexpayId = ref<number | null>(null)
const feexpayStatusData = ref<any>(null)
const feexpayError = ref<string | null>(null)

const showReferenceModal = ref(false)
const referenceTransaction = ref<Transaction | null>(null)
const newReferenceValue = ref('')
const updatingPaymentApiId = ref<number | null>(null)

onMounted(() => {
  const page = parseInt(route.query.page as string) || 1
  if (route.query.q) transactionsStore.searchQuery = route.query.q as string
  if (route.query.status) transactionsStore.statusFilter = route.query.status as string
  if (route.query.type) transactionsStore.typeTransFilter = route.query.type as string
  
  transactionsStore.fetchTransactions(page)
})

// Sync store state back to URL query parameters
watch(
  () => [
    transactionsStore.currentPage,
    transactionsStore.searchQuery,
    transactionsStore.statusFilter,
    transactionsStore.typeTransFilter
  ],
  ([page, q, status, type]) => {
    const query: any = {}
    if (page && page !== 1) query.page = page.toString()
    if (q) query.q = q
    if (status && status !== 'all') query.status = status
    if (type && type !== 'all') query.type = type

    router.replace({ query })
  }
)

const hasNextPage = computed(() => {
  const currentPage = transactionsStore.currentPage
  const perPage = 10
  const total = transactionsStore.totalTransactions
  return currentPage * perPage < total
})

// Vérifier si une transaction peut être approuvée
function canApproveTransaction(transaction: Transaction): boolean {
  return isWithdrawalLikeType(transaction.type_trans) && transaction.status === 'pending'
}

async function handlePaymentApiChange(transaction: Transaction, value: string) {
  const paymentApi = (value === 'feexpay' || value === 'connect' || value === 'manual'
    ? value
    : '') as '' | 'feexpay' | 'connect' | 'manual'
  const previous = getEffectivePaymentApi(transaction)
  if (paymentApi === previous || !paymentApi) return

  try {
    updatingPaymentApiId.value = transaction.id
    await transactionsStore.updateTransactionPaymentApi(transaction.id, paymentApi)
    notification.addNotification('API de paiement mise à jour', 'success')
  } catch (err: any) {
    notification.addNotification(err?.message || 'Erreur mise à jour API', 'error')
  } finally {
    updatingPaymentApiId.value = null
  }
}

function canUpdateReference(transaction: Transaction): boolean {
  return (
    authStore.user?.is_staff === true &&
    (transaction.status === 'pending' ||
      transaction.status === 'timeout' ||
      transaction.status === 'error')
  )
}

function openReferenceModal(transaction: Transaction) {
  referenceTransaction.value = transaction
  newReferenceValue.value = transaction.reference || ''
  showReferenceModal.value = true
}

function closeReferenceModal() {
  showReferenceModal.value = false
  referenceTransaction.value = null
  newReferenceValue.value = ''
}

async function confirmReferenceUpdate() {
  if (!referenceTransaction.value || !newReferenceValue.value.trim()) return

  try {
    const result = await transactionsStore.updateTransactionReference(
      referenceTransaction.value.id,
      newReferenceValue.value.trim()
    )
    const admin = result.updated_by?.email || 'admin'
    notification.addNotification(
      `Référence mise à jour par ${admin}`,
      'success'
    )
    closeReferenceModal()
  } catch (error) {
    notification.addNotification(
      error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
      'error'
    )
  }
}

// Mettre à jour le statut d'une transaction
const handleUpdateStatus = async (transactionId: number) => {
  try {
    const result = await transactionsStore.updateTransactionStatus(transactionId)
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
    const transaction = transactionsStore
      .getFilteredTransactions()
      .find((item) => item.id === transactionId)
    const result = await transactionsStore.validateWithdrawal(
      transactionId,
      transaction?.type_trans,
    )
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
    await transactionsStore.approveWithdrawal(
      selectedTransaction.value.id,
      selectedTransaction.value.type_trans,
    )
    closeApproveModal()
  } catch (error) {
    // L'erreur est déjà gérée dans le store avec une notification
    console.error('Erreur lors de l\'approbation:', error)
  } finally {
    approvingTransactionId.value = null
  }
}

// Ouvrir le modal de vérification Feexpay
async function openFeexpayStatusModal(transaction: Transaction) {
  showFeexpayModal.value = true
  checkingFeexpayId.value = transaction.id
  feexpayStatusData.value = null
  feexpayError.value = null

  try {
    const result = await transactionsStore.checkFeexpayStatus(transaction.id)
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
}

// Fermer le modal de validation
const closeValidationModal = () => {
  showValidationModal.value = false
  validationDetails.value = null
}

// Voir les détails de la transaction
const viewTransactionDetails = (transactionId: number) => {
  router.push({ name: 'transaction-details', params: { id: transactionId.toString() } })
}

const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/** Email user : caisse.created_by en priorité, sinon transaction.created_by */
const getTransactionUserEmail = (transaction: Transaction): string => {
  const fromCaisse = transaction.caisse?.created_by?.email
  if (fromCaisse) return fromCaisse
  const createdBy = transaction.created_by
  if (createdBy && typeof createdBy === 'object' && 'email' in createdBy) {
    return createdBy.email || '—'
  }
  return '—'
}

// Notifier l'utilisateur d'un dépôt échoué
const notifyFailedDeposit = (transaction: Transaction) => {
  const userEmail = getTransactionUserEmail(transaction)
  if (!userEmail || userEmail === '—') {
    return
  }

  // Contenu pré-rempli pour la notification
  const title = 'Dépôt non réussi'
  const content = `Bonjour 👋

Nous avons constaté que votre dépôt n'a pas abouti. Si vous avez besoin d'aide, merci de contacter notre support directement depuis l'application BOX :

Menu Profil → Support.

📱 WhatsApp : 0192757655
🔗 Lien direct : https://wa.me/message/DJGHZABMTWZYO1

Notre équipe est disponible pour vous assister rapidement.

Merci pour votre compréhension.`

  // Rediriger vers la page de notification avec les paramètres pré-remplis
  router.push({
    name: 'send-notification',
    query: {
      type: 'single',
      channel: 'push',
      email: userEmail,
      title: title,
      content: content
    }
  })
}
</script>
