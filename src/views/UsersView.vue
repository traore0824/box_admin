<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Gestion des Utilisateurs</h1>

      <!-- Search and Filters -->
      <div class="mt-4 sm:mt-0">
        <div class="flex flex-col sm:flex-row gap-4 items-end">
          <!-- Barre de recherche -->
          <div class="relative flex-1 max-w-md">
            <label class="block text-xs font-medium text-gray-700 mb-1">Rechercher</label>
            <div class="relative">
              <input v-model="usersStore.searchQuery" @input="() => usersStore.updateSearchQuery(usersStore.searchQuery)" type="text" placeholder="Rechercher un utilisateur..."
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
              <i class="fas fa-search absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            </div>
          </div>
          
          <!-- Filtres -->
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="flex flex-col">
              <label class="block text-xs font-medium text-gray-700 mb-1">Statut de blocage</label>
              <select v-model="usersStore.blockFilter"
                class="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[160px]">
                <option value="all">Tous les statuts</option>
                <option value="blocked">Bloqués</option>
                <option value="unblocked">Non bloqués</option>
              </select>
            </div>
            <div class="flex flex-col">
              <label class="block text-xs font-medium text-gray-700 mb-1">Type d'utilisateur</label>
              <select v-model="usersStore.agentFilter"
                class="px-4 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[160px]">
                <option value="all">Tous les types</option>
                <option value="agent">Agents</option>
                <option value="client">Clients</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Users List -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto sm:-mx-4 sm:px-4">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Téléphone
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Crée le
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Solde
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Caisse total
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre de parrainage
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut Agent
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in usersStore.filteredUsers" :key="user.id">
              <td class="px-6 py-4 whitespace-nowrap">
                {{ user.first_name }} {{ user.last_name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ user.email }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ user.phone }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ new Date(user.created_at).toLocaleDateString() }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ formatAmount(user.total_funds) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ user.total_box }} 
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ user.number_sponsor }} 
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="[
                  'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                  user.agent_client ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                ]">
                  {{ user.agent_client ? 'Agent' : 'Client' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex flex-col space-y-1">
                  <span :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full w-fit',
                    user.is_block ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  ]">
                    <i :class="[
                      'fas mr-1',
                      user.is_block ? 'fa-lock' : 'fa-unlock'
                    ]"></i>
                    {{ user.is_block ? 'Bloqué' : 'Actif' }}
                  </span>
                  <div v-if="user.is_block && user.reason_block" class="relative group">
                    <span class="text-xs text-gray-600 cursor-help underline decoration-dotted">
                      Raison du blocage
                    </span>
                    <div class="absolute left-0 bottom-full mb-2 w-64 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                      <div class="relative">
                        <p class="whitespace-normal">{{ user.reason_block }}</p>
                        <div class="absolute -bottom-1 left-4 w-2 h-2 bg-gray-900 transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <!-- Dropdown Component -->
                <div class="relative inline-block text-left">
                  <button @click="toggleDropdown(user.id)" type="button"
                    class="inline-flex justify-center items-center rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 min-w-[80px]"
                    :class="{ 'ring-2 ring-indigo-500': activeDropdown === user.id }" :disabled="actionLoading[user.id]"
                    :data-dropdown-id="user.id">
                    <span v-if="!actionLoading[user.id]">Actions</span>
                    <span v-else class="flex items-center">
                      <svg class="animate-spin -ml-1 mr-1 h-3 w-3 text-gray-500" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                      </svg>
                      <span class="text-xs">...</span>
                    </span>
                    <svg v-if="!actionLoading[user.id]" class="ml-1 h-4 w-4 transition-transform duration-200"
                      :class="{ 'rotate-180': activeDropdown === user.id }" xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd"
                        d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                        clip-rule="evenodd" />
                    </svg>
                  </button>

                  <!-- Dropdown Menu avec positionnement fixe -->
                  <Teleport to="body">
                    <div v-if="activeDropdown === user.id" :style="getDropdownStyle(user.id)"
                      class="fixed w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-[9999] transform transition-all duration-100"
                      :class="dropdownAnimation" role="menu">
                      <div class="py-1" role="none">
                        <!-- Action Bloquer/Débloquer -->
                        <button @click="handleToggleBlock(user)" :disabled="actionLoading[user.id]"
                          class="group flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                          :class="user.is_block ? 'text-green-700 hover:text-green-800' : 'text-red-700 hover:text-red-800'"
                          role="menuitem">
                          <i :class="[
                            'fas mr-3 w-4 text-center',
                            user.is_block ? 'fa-unlock' : 'fa-lock'
                          ]"></i>
                          {{ user.is_block ? 'Débloquer' : 'Bloquer' }}
                        </button>

                        <!-- Separator -->
                        <div class="border-t border-gray-100 my-1"></div>

                        <!-- Action Agent -->
                        <button @click="handleToggleAgent(user)" :disabled="actionLoading[user.id]"
                          class="group flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                          :class="user.agent_client ? 'text-orange-700 hover:text-orange-800' : 'text-blue-700 hover:text-blue-800'"
                          role="menuitem">
                          <i :class="[
                            'fas mr-3 w-4 text-center',
                            user.agent_client ? 'fa-user-minus' : 'fa-user-tie'
                          ]"></i>
                          {{ user.agent_client ? 'Retirer Agent' : 'Nommer Agent' }}
                        </button>

                        <!-- Separator -->
                        <div class="border-t border-gray-100 my-1"></div>

                        <!-- Action Reset PIN -->
                        <button @click="handleResetPin(user)" :disabled="actionLoading[user.id]"
                          class="group flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-purple-700 hover:text-purple-800"
                          role="menuitem">
                          <i class="fas fa-key mr-3 w-4 text-center"></i>
                          Réinitialiser PIN
                        </button>

                        <!-- Separator -->
                        <div class="border-t border-gray-100 my-1"></div>

                        <!-- Action KYC -->
                        <button @click="openKycModal(user)" :disabled="actionLoading[user.id]"
                          class="group flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-indigo-700 hover:text-indigo-800"
                          role="menuitem">
                          <i class="fas fa-id-card mr-3 w-4 text-center"></i>
                          Mettre à jour KYC
                        </button>

                        <!-- Separator -->
                        <div class="border-t border-gray-100 my-1"></div>

                        <!-- Action Voir Wallet -->
                        <button @click="viewUserWallet(user)" :disabled="actionLoading[user.id]"
                          class="group flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed text-teal-700 hover:text-teal-800"
                          role="menuitem">
                          <i class="fas fa-wallet mr-3 w-4 text-center"></i>
                          Voir Wallet
                        </button>
                      </div>
                    </div>
                  </Teleport>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Pagination -->
    <div class="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
      <div class="flex-1 flex justify-between sm:hidden">
        <button @click="usersStore.fetchUsers(usersStore.currentPage - 1)" :disabled="usersStore.currentPage === 1"
          class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          Précédent
        </button>
        <button @click="usersStore.fetchUsers(usersStore.currentPage + 1)"
          :disabled="usersStore.currentPage * usersStore.itemsPerPage >= usersStore.totalUsers"
          class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          Suivant
        </button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm text-gray-700">
            Page {{ usersStore.currentPage }} sur
            {{ Math.ceil(usersStore.totalUsers / usersStore.itemsPerPage) }}
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
            <button @click="usersStore.fetchUsers(usersStore.currentPage - 1)" :disabled="usersStore.currentPage === 1"
              class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <i class="fas fa-chevron-left"></i>
              <span class="sr-only">Précédent</span>
            </button>
            <button @click="usersStore.fetchUsers(usersStore.currentPage + 1)"
              :disabled="usersStore.currentPage * usersStore.itemsPerPage >= usersStore.totalUsers"
              class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
              <i class="fas fa-chevron-right"></i>
              <span class="sr-only">Suivant</span>
            </button>
          </nav>
        </div>
      </div>
    </div>
  </div>
  <ConfirmationModal :is-open="isModalOpen" :title="modalTitle" :message="modalMessage" @confirm="onModalConfirm"
    @cancel="onModalCancel" />
  
        <!-- Modal KYC -->
  <Teleport to="body">
    <div v-if="showKycModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl mx-4 my-8">
        <h3 class="text-xl font-semibold text-gray-800 mb-4">Mettre à jour le statut KYC</h3>
        <div class="mb-4">
          <p class="text-sm text-gray-600 mb-2">
            Utilisateur: <span class="font-semibold">{{ selectedUserForKyc?.first_name }} {{ selectedUserForKyc?.last_name }}</span>
          </p>
          <p class="text-sm text-gray-600">
            Statut actuel: 
            <span class="font-semibold" :class="getKycStatusClass(selectedUserForKyc?.status)">
              {{ getKycStatusLabel(selectedUserForKyc?.status) }}
            </span>
          </p>
          <p v-if="selectedUserForKyc?.card_id" class="text-sm text-gray-600 mt-1">
            Numéro de carte: <span class="font-semibold">{{ selectedUserForKyc.card_id }}</span>
          </p>
        </div>

        <!-- Affichage des images KYC si disponibles -->
        <div v-if="selectedUserForKyc?.user_cards && selectedUserForKyc.user_cards.length > 0" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Documents soumis :</label>
          <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div 
              v-for="(imageUrl, index) in selectedUserForKyc.user_cards" 
              :key="index"
              class="relative group cursor-pointer"
              @click="openKycImageModal(imageUrl)"
            >
              <img 
                :src="imageUrl" 
                :alt="`Document KYC ${index + 1}`"
                class="w-full h-32 object-cover rounded-lg border border-gray-200 hover:border-blue-500 transition-colors pointer-events-none"
              />
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-opacity flex items-center justify-center pointer-events-none">
                <i class="fas fa-search-plus text-white opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </div>
            </div>
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">Nouveau statut *</label>
          <select 
            v-model="kycStatus"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="null">Aucun document</option>
            <option value="pending">En attente</option>
            <option value="accept">Approuvé</option>
            <option value="reject">Rejeté</option>
          </select>
        </div>
        <div v-if="kycStatus === 'reject'" class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">
            Raison du rejet <span class="text-red-500">*</span>
          </label>
          <textarea 
            v-model="kycRejectionReason"
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="4"
            placeholder="Expliquez la raison du rejet (ex: Photo de la carte d'identité floue, veuillez renvoyer une photo plus claire)..."
            required
          ></textarea>
          <p class="mt-1 text-xs text-gray-500">
            Cette raison sera envoyée à l'utilisateur dans une notification
          </p>
        </div>
        <div class="flex justify-end space-x-3">
          <button 
            @click="closeKycModal"
            class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Annuler
          </button>
          <button 
            @click="confirmKycUpdate"
            :disabled="!kycStatus || (kycStatus === 'reject' && !kycRejectionReason.trim()) || usersStore.isLoading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            Mettre à jour
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Modal Image KYC -->
  <Teleport to="body">
    <div v-if="selectedKycImage" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-95" @click="closeKycImageModal">
      <div class="relative w-full h-full flex items-center justify-center p-4">
        <button 
          @click="closeKycImageModal"
          class="absolute top-4 right-4 text-white bg-black bg-opacity-70 rounded-full p-3 hover:bg-opacity-90 z-10 transition-all"
          title="Fermer (Échap)"
        >
          <i class="fas fa-times text-xl"></i>
        </button>
        <div class="relative max-w-[95vw] max-h-[95vh] flex items-center justify-center">
          <img 
            :src="selectedKycImage" 
            alt="Document KYC"
            class="max-w-full max-h-[95vh] object-contain rounded-lg shadow-2xl"
            @click.stop
          />
        </div>
        <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm bg-black bg-opacity-50 px-4 py-2 rounded-lg">
          Cliquez en dehors de l'image pour fermer
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Modal Wallet -->
  <Teleport to="body">
    <div v-if="showWalletModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-6xl mx-4 my-8">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold text-gray-800">
            Wallet de {{ selectedUserForWallet?.first_name }} {{ selectedUserForWallet?.last_name }}
          </h3>
          <button 
            @click="closeWalletModal"
            class="text-gray-400 hover:text-gray-600"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>

        <!-- Résumé du Wallet -->
        <div v-if="walletsStore.summary" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Solde Actuel</p>
            <p class="text-2xl font-bold text-blue-600">
              {{ formatCurrency(parseFloat(walletsStore.summary.current_balance)) }}
            </p>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Total Dépôts</p>
            <p class="text-2xl font-bold text-green-600">
              {{ formatCurrency(parseFloat(walletsStore.summary.total_deposits)) }}
            </p>
          </div>
          <div class="bg-red-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Total Retraits</p>
            <p class="text-2xl font-bold text-red-600">
              {{ formatCurrency(parseFloat(walletsStore.summary.total_withdrawals)) }}
            </p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600">Montant Disponible</p>
            <p class="text-2xl font-bold text-gray-600">
              {{ formatCurrency(parseFloat(walletsStore.summary.available_amount)) }}
            </p>
          </div>
        </div>

        <!-- Filtres -->
        <div class="bg-gray-50 p-4 rounded-lg mb-4">
          <div class="flex flex-wrap gap-4">
            <select 
              v-model="walletTransactionTypeFilter"
              @change="loadWalletTransactions"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les types</option>
              <option value="deposit">Dépôt</option>
              <option value="withdrawal">Retrait</option>
              <option value="bonus">Bonus</option>
              <option value="commission">Commission</option>
              <option value="refund">Remboursement</option>
              <option value="transfer">Transfert</option>
            </select>
            <select 
              v-model="walletStatusFilter"
              @change="loadWalletTransactions"
              class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Complété</option>
              <option value="pending">En attente</option>
              <option value="failed">Échoué</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
        </div>

        <!-- Historique des Transactions -->
        <div class="overflow-x-auto max-h-96">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50 sticky top-0">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solde Avant</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solde Après</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transaction in walletsStore.transactions" :key="transaction.id">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDateTime(transaction.created_at) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span 
                    :class="[
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                      getTransactionTypeClass(transaction.transaction_type)
                    ]"
                  >
                    {{ transaction.transaction_type_display }}
                  </span>
                </td>
                <td 
                  class="px-4 py-3 whitespace-nowrap text-sm font-semibold"
                  :class="getAmountClass(transaction.transaction_type)"
                >
                  {{ transaction.transaction_type === 'deposit' || transaction.transaction_type === 'bonus' ? '+' : '-' }}
                  {{ formatCurrency(parseFloat(transaction.amount)) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {{ formatCurrency(parseFloat(transaction.balance_before)) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {{ formatCurrency(parseFloat(transaction.balance_after)) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span 
                    :class="[
                      'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                      getStatusClass(transaction.status)
                    ]"
                  >
                    {{ transaction.status_display }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">
                  {{ transaction.transaction_reference || transaction.reference }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-4 flex justify-end">
          <button 
            @click="goToFullWalletView"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <i class="fas fa-external-link-alt mr-2"></i>
            Voir toutes les transactions
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { useUsersStore } from '../stores/users'
import { useWalletsStore } from '../stores/wallets'
import { useNotification } from '../services/notification'
import ConfirmationModal from '../components/ConfirmationModal.vue'
import { formatCurrency, formatAmount } from '../utils/currency'

const usersStore = useUsersStore()
const walletsStore = useWalletsStore()
const router = useRouter()
const activeDropdown = ref<number | null>(null)
const actionLoading = reactive<Record<number, boolean>>({})
const dropdownPosition = ref<{top: number, left: number}>({top: 0, left: 0})
const dropdownAnimation = ref('opacity-0 scale-95')

// Modal State
const isModalOpen = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const pendingAction = ref<(() => Promise<void>) | null>(null)
// const pendingUserForModal = ref<User | null>(null) // Optional: if user details needed directly in modal handlers beyond message

// KYC Modal State
const showKycModal = ref(false)
const selectedUserForKyc = ref<User | null>(null)
const kycStatus = ref<string>('')
const kycRejectionReason = ref('')

// Wallet Modal State
const showWalletModal = ref(false)
const selectedUserForWallet = ref<User | null>(null)
const walletTransactionTypeFilter = ref('all')
const walletStatusFilter = ref('all')

// KYC Image Modal
const selectedKycImage = ref<string | null>(null)

interface User {
  id: number;
  is_block: boolean;
  reason_block?: string | null;
  agent_client?: boolean;
  first_name?: string | null; 
  last_name?: string | null;
  status?: string | null;
  card_id?: string | null;
  user_cards?: string[];
}

onMounted(() => {
  usersStore.fetchUsers()
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('keydown', handleEscape)
  window.addEventListener('scroll', handleScroll, true)
  window.addEventListener('resize', closeAllDropdowns)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('keydown', handleEscape)
  window.removeEventListener('scroll', handleScroll, true)
  window.removeEventListener('resize', closeAllDropdowns)
  // S'assurer que le scroll est réactivé
  document.body.style.overflow = ''
})

// Gestion de la fermeture par Escape
function handleEscape(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    // Si une image KYC est ouverte, la fermer en priorité
    if (selectedKycImage.value) {
      closeKycImageModal()
    } else {
      closeAllDropdowns()
    }
  }
}

// Fermeture de tous les dropdowns
function closeAllDropdowns() {
  activeDropdown.value = null
  dropdownAnimation.value = 'opacity-0 scale-95'
}

// Gestion du scroll
function handleScroll() {
  if (activeDropdown.value !== null) {
    updateDropdownPosition(activeDropdown.value)
  }
}

// Calcul de la position du dropdown
function getDropdownStyle(userId: number) {
  if (activeDropdown.value === userId) {
    return {
      top: `${dropdownPosition.value.top}px`,
      left: `${dropdownPosition.value.left}px`,
    }
  }
  return { display: 'none' }
}

// Mise à jour de la position du dropdown
function updateDropdownPosition(userId: number) {
  const button = document.querySelector(`[data-dropdown-id="${userId}"]`) as HTMLElement
  if (button) {
    const rect = button.getBoundingClientRect()
    const windowHeight = window.innerHeight
    const windowWidth = window.innerWidth
    const dropdownHeight = 120 // hauteur approximative du dropdown
    const dropdownWidth = 192 // largeur du dropdown (w-48 = 12rem = 192px)
    
    let top = rect.bottom + 4
    let left = rect.right - dropdownWidth
    
    // Ajustement si le dropdown dépasse en bas
    if (top + dropdownHeight > windowHeight) {
      top = rect.top - dropdownHeight - 4
    }
    
    // Ajustement si le dropdown dépasse à gauche
    if (left < 8) {
      left = rect.left
    }
    
    // Ajustement si le dropdown dépasse à droite
    if (left + dropdownWidth > windowWidth - 8) {
      left = windowWidth - dropdownWidth - 8
    }
    
    dropdownPosition.value = { top, left }
  }
}

// Toggle dropdown avec gestion améliorée
function toggleDropdown(userId: number) {
  if (actionLoading[userId]) return
  
  if (activeDropdown.value === userId) {
    closeAllDropdowns()
  } else {
    activeDropdown.value = userId
    dropdownAnimation.value = 'opacity-100 scale-100'
    nextTick(() => {
      updateDropdownPosition(userId)
    })
  }
}

// Gestion du clic à l'extérieur améliorée
function handleClickOutside(event: MouseEvent) {
  if (activeDropdown.value === null) return
  
  const target = event.target as HTMLElement
  const button = document.querySelector(`[data-dropdown-id="${activeDropdown.value}"]`)
  const dropdown = document.querySelector(`[role="menu"]`)
  
  if (button && !button.contains(target) && dropdown && !dropdown.contains(target)) {
    closeAllDropdowns()
  }
}

async function handleToggleBlock(user: User) {
  const actionText = user.is_block ? 'débloquer' : 'bloquer'
  const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'cet utilisateur'

  modalTitle.value = `Confirmation de ${actionText}`
  modalMessage.value = `Êtes-vous sûr de vouloir ${actionText} ${userName} ?`
  pendingAction.value = async () => {
    actionLoading[user.id] = true
    // closeAllDropdowns() // Déjà appelé dans onModalCancel ou avant l'action
    try {
      await usersStore.toggleUserBlockStatus(user.id);
      const notification = useNotification()
      notification.addNotification(`Utilisateur ${actionText} avec succès.`, 'success')
    } catch (error: any) {
      console.error(`Erreur lors de la tentative de ${actionText} l'utilisateur:`, error);
      const notification = useNotification()
      notification.addNotification(`Erreur: ${error.message || `Impossible de ${actionText} l'utilisateur.`}`, 'error')
    } finally {
      actionLoading[user.id] = false;
    }
  };
  isModalOpen.value = true;
}

async function handleToggleAgent(user: User) {
  const actionText = (user as any).agent_client ? 'retirer des agents' : 'nommer comme agent'
  const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'cet utilisateur'

  modalTitle.value = `Confirmation de ${actionText}`;
  modalMessage.value = `Êtes-vous sûr de vouloir ${actionText} ${userName} ?`;
  pendingAction.value = async () => {
    actionLoading[user.id] = true;
    // closeAllDropdowns(); // Déjà appelé dans onModalCancel ou avant l'action
    try {
      await usersStore.toggleUserAgentStatus(user.id);
      const notification = useNotification()
      notification.addNotification(`Utilisateur ${actionText} avec succès.`, 'success')
    } catch (error: any) {
      console.error(`Erreur lors de la tentative de ${actionText} l'utilisateur:`, error);
      const notification = useNotification()
      notification.addNotification(`Erreur: ${error.message || `Impossible de ${actionText} l'utilisateur.`}`, 'error')
    } finally {
      actionLoading[user.id] = false;
    }
  };
  isModalOpen.value = true;
}

const onModalConfirm = async () => {
  if (pendingAction.value) {
    await pendingAction.value()
  }
  isModalOpen.value = false
  pendingAction.value = null
  // pendingUserForModal.value = null;
  // No need to call closeAllDropdowns() here as it's called before action or in onModalCancel
}

const onModalCancel = () => {
  isModalOpen.value = false
  pendingAction.value = null
  // pendingUserForModal.value = null;
  closeAllDropdowns() // Ensure dropdown is closed if modal is cancelled from overlay or escape
}

// Reset PIN
async function handleResetPin(user: User) {
  const userName = `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'cet utilisateur'
  modalTitle.value = 'Réinitialiser le PIN'
  modalMessage.value = `Êtes-vous sûr de vouloir réinitialiser le PIN de ${userName} ?`
  pendingAction.value = async () => {
    actionLoading[user.id] = true
    try {
      await usersStore.resetUserPin(user.id)
      const notification = useNotification()
      notification.addNotification('PIN réinitialisé avec succès', 'success')
    } catch (error: any) {
      console.error('Erreur lors de la réinitialisation du PIN:', error)
      const notification = useNotification()
      notification.addNotification(`Erreur: ${error.message || 'Impossible de réinitialiser le PIN.'}`, 'error')
    } finally {
      actionLoading[user.id] = false
    }
  }
  isModalOpen.value = true
}

// KYC Management
const openKycModal = (user: User) => {
  selectedUserForKyc.value = user
  kycStatus.value = user.status || 'null'
  kycRejectionReason.value = ''
  showKycModal.value = true
  closeAllDropdowns()
}

const closeKycModal = () => {
  showKycModal.value = false
  selectedUserForKyc.value = null
  kycStatus.value = ''
  kycRejectionReason.value = ''
}

const getKycStatusLabel = (status: string | null | undefined): string => {
  const labels: Record<string, string> = {
    null: 'Aucun document',
    pending: 'En attente',
    accept: 'Approuvé',
    reject: 'Rejeté'
  }
  return labels[status || 'null'] || 'Inconnu'
}

const getKycStatusClass = (status: string | null | undefined): string => {
  const classes: Record<string, string> = {
    null: 'text-gray-600',
    pending: 'text-yellow-600',
    accept: 'text-green-600',
    reject: 'text-red-600'
  }
  return classes[status || 'null'] || 'text-gray-600'
}

const confirmKycUpdate = async () => {
  if (!selectedUserForKyc.value || !kycStatus.value) return
  
  try {
    actionLoading[selectedUserForKyc.value.id] = true
    await usersStore.updateKycStatus(
      selectedUserForKyc.value.id,
      kycStatus.value as 'pending' | 'accept' | 'reject' | 'null',
      kycStatus.value === 'reject' ? kycRejectionReason.value : undefined
    )
    const notification = useNotification()
    notification.addNotification('Statut KYC mis à jour avec succès', 'success')
    closeKycModal()
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du statut KYC:', error)
    const notification = useNotification()
    notification.addNotification(`Erreur: ${error.message || 'Impossible de mettre à jour le statut KYC.'}`, 'error')
  } finally {
    if (selectedUserForKyc.value) {
      actionLoading[selectedUserForKyc.value.id] = false
    }
  }
}

// Wallet Management
const viewUserWallet = async (user: User) => {
  selectedUserForWallet.value = user
  showWalletModal.value = true
  closeAllDropdowns()
  
  try {
    await walletsStore.fetchUserTransactions(user.id, 1)
  } catch (error) {
    const notification = useNotification()
    notification.addNotification('Erreur lors du chargement du wallet', 'error')
  }
}

const closeWalletModal = () => {
  showWalletModal.value = false
  selectedUserForWallet.value = null
  walletTransactionTypeFilter.value = 'all'
  walletStatusFilter.value = 'all'
  walletsStore.resetFilters()
}

const loadWalletTransactions = () => {
  if (!selectedUserForWallet.value) return
  
  walletsStore.fetchUserTransactions(
    selectedUserForWallet.value.id,
    1,
    walletTransactionTypeFilter.value === 'all' ? undefined : walletTransactionTypeFilter.value,
    walletStatusFilter.value === 'all' ? undefined : walletStatusFilter.value
  )
}

const goToFullWalletView = () => {
  if (!selectedUserForWallet.value) return
  closeWalletModal()
  router.push({ name: 'wallets', query: { user_id: selectedUserForWallet.value.id.toString() } })
}

// Format helpers - formatCurrency et formatAmount sont importés depuis utils/currency

const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getTransactionTypeClass = (type: string): string => {
  const classes: Record<string, string> = {
    deposit: 'bg-green-100 text-green-800',
    withdrawal: 'bg-red-100 text-red-800',
    bonus: 'bg-blue-100 text-blue-800',
    commission: 'bg-purple-100 text-purple-800',
    refund: 'bg-yellow-100 text-yellow-800',
    transfer: 'bg-gray-100 text-gray-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

const getAmountClass = (type: string): string => {
  if (type === 'deposit' || type === 'bonus') {
    return 'text-green-600'
  }
  return 'text-red-600'
}

const getStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

const openKycImageModal = (imageUrl: string) => {
  selectedKycImage.value = imageUrl
  // Empêcher le scroll du body quand le modal est ouvert
  document.body.style.overflow = 'hidden'
}

const closeKycImageModal = () => {
  selectedKycImage.value = null
  // Réactiver le scroll du body
  document.body.style.overflow = ''
}

// La gestion de la touche Échap est déjà intégrée dans handleEscape ci-dessus
</script>