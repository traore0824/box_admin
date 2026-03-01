<template>
  <div class="space-y-6">
    <!-- Header avec bouton retour -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button @click="goBack" class="text-gray-600 hover:text-primary transition-colors">
          <i class="fas fa-arrow-left text-xl"></i>
        </button>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Profil Utilisateur</h1>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <i class="fas fa-spinner fa-spin text-3xl text-primary"></i>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <!-- User Profile Content -->
    <div v-else-if="user" class="space-y-6">
      <!-- En-tête du profil -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <!-- Avatar -->
          <div class="flex-shrink-0 w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white font-bold text-2xl">
            {{ getUserInitials(user) }}
          </div>
          
          <!-- Informations principales -->
          <div class="flex-1 min-w-0">
            <h2 class="text-2xl font-bold text-gray-900 mb-1">
              {{ user.first_name }} {{ user.last_name }}
            </h2>
            <p class="text-gray-600 mb-2">{{ user.email }}</p>
            <div class="flex flex-wrap gap-2">
              <span :class="[
                'px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full',
                user.is_block ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              ]">
                <i :class="[
                  'fas mr-1',
                  user.is_block ? 'fa-lock' : 'fa-unlock'
                ]"></i>
                {{ user.is_block ? 'Bloqué' : 'Actif' }}
              </span>
              <span :class="[
                'px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full',
                user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              ]">
                {{ user.is_active ? 'Compte Activé' : 'Compte Inactif' }}
              </span>
              <span :class="[
                'px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full',
                user.agent_client ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              ]">
                {{ user.agent_client ? 'Agent' : 'Client' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="fas fa-cog mr-2 text-primary"></i>
          Actions
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <!-- Bloquer/Débloquer -->
          <button @click="handleToggleBlock" :disabled="actionLoading"
            class="flex items-center justify-center px-4 py-3 border rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="user.is_block ? 'border-green-300 bg-green-50 text-green-700 hover:bg-green-100' : 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100'">
            <i :class="['fas mr-2', user.is_block ? 'fa-unlock' : 'fa-lock']"></i>
            {{ user.is_block ? 'Débloquer' : 'Bloquer' }}
          </button>

          <!-- Nommer Agent / Retirer Agent -->
          <button @click="handleToggleAgent" :disabled="actionLoading"
            class="flex items-center justify-center px-4 py-3 border rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="user.agent_client ? 'border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100' : 'border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100'">
            <i :class="['fas mr-2', user.agent_client ? 'fa-user-minus' : 'fa-user-tie']"></i>
            {{ user.agent_client ? 'Retirer Agent' : 'Nommer Agent' }}
          </button>

          <!-- Réinitialiser PIN -->
          <button @click="handleResetPin" :disabled="actionLoading"
            class="flex items-center justify-center px-4 py-3 border border-purple-300 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-key mr-2"></i>
            Réinitialiser PIN
          </button>

          <!-- Envoyer OTP PIN -->
          <button @click="handleSendPinVerificationOtp" :disabled="actionLoading"
            class="flex items-center justify-center px-4 py-3 border border-cyan-300 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-mobile-alt mr-2"></i>
            Envoyer OTP PIN
          </button>

          <!-- Mettre à jour KYC -->
          <button @click="openKycModal" :disabled="actionLoading"
            class="flex items-center justify-center px-4 py-3 border border-indigo-300 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-id-card mr-2"></i>
            Mettre à jour KYC
          </button>

          <!-- Modifier Profil -->
          <button @click="openUpdateModal" :disabled="actionLoading"
            class="flex items-center justify-center px-4 py-3 border border-orange-300 bg-orange-50 text-orange-700 rounded-lg hover:bg-orange-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-user-edit mr-2"></i>
            Modifier Profil
          </button>

          <!-- Activer Compte -->
          <button v-if="!user.is_active" @click="handleActivateUser" :disabled="actionLoading"
            class="flex items-center justify-center px-4 py-3 border border-emerald-300 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-check-circle mr-2"></i>
            Activer Compte
          </button>

          <!-- Admin KYC Verify -->
          <button @click="openAdminKycModal" :disabled="actionLoading"
            class="flex items-center justify-center px-4 py-3 border border-blue-300 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-shield-alt mr-2"></i>
            Vérifier KYC (Admin)
          </button>

          <!-- Voir Wallet -->
          <button @click="viewUserWallet" :disabled="actionLoading"
            class="flex items-center justify-center px-4 py-3 border border-teal-300 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-wallet mr-2"></i>
            Voir Wallet
          </button>
        </div>
      </div>

      <!-- Informations personnelles -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="fas fa-user-circle mr-2 text-primary"></i>
          Informations personnelles
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <p class="text-gray-900">{{ formatNullValue(user.phone) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date de création</label>
            <p class="text-gray-900">{{ user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'Non défini' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
            <p class="text-gray-900">{{ user.birthday ? new Date(user.birthday).toLocaleDateString('fr-FR') : 'Non défini' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
            <p class="text-gray-900">{{ formatNullValue(user.sexe) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Code parrainage</label>
            <p class="text-gray-900 font-mono">{{ formatNullValue(user.referral_code) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Code parrain</label>
            <p class="text-gray-900 font-mono">{{ formatNullValue(user.user_referral_code) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Carte ID</label>
            <p class="text-gray-900 font-mono">{{ formatNullValue(user.card_id) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Statut KYC</label>
            <span :class="[
              'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
              getKycStatusClass(user.status)
            ]">
              {{ getKycStatusLabel(user.status) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Statistiques financières -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="fas fa-chart-line mr-2 text-primary"></i>
          Statistiques financières
        </h3>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Solde actuel (Wallet)</p>
            <p class="text-2xl font-bold text-blue-600">
              {{ walletBalance && walletBalance.current_balance ? formatCurrency(parseFloat(walletBalance.current_balance)) : 'Non défini' }}
            </p>
          </div>
          <div class="bg-green-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Total dépôts</p>
            <p class="text-2xl font-bold text-green-600">
              {{ walletBalance && walletBalance.total_deposits ? formatCurrency(parseFloat(walletBalance.total_deposits)) : 'Non défini' }}
            </p>
          </div>
          <div class="bg-red-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Total retraits</p>
            <p class="text-2xl font-bold text-red-600">
              {{ walletBalance && walletBalance.total_withdrawals ? formatCurrency(parseFloat(walletBalance.total_withdrawals)) : 'Non défini' }}
            </p>
          </div>
          <div class="bg-gray-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Montant disponible</p>
            <p class="text-2xl font-bold text-gray-600">
              {{ walletBalance && walletBalance.available_amount ? formatCurrency(parseFloat(walletBalance.available_amount)) : 'Non défini' }}
            </p>
          </div>
          <div class="bg-primary-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Solde total</p>
            <p class="text-2xl font-bold text-primary">
              {{ formatAmount(user.total_funds) }}
            </p>
          </div>
          <div class="bg-purple-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Caisse total</p>
            <p class="text-2xl font-bold text-purple-600">
              {{ user.total_box || 0 }}
            </p>
          </div>
        </div>
      </div>

      <!-- Historique des transactions -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="fas fa-history mr-2 text-primary"></i>
          Historique des transactions
        </h3>
        <div v-if="transactionsLoading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-2xl text-primary"></i>
        </div>
        <div v-else-if="transactions.length === 0" class="text-center py-8 text-gray-500">
          Aucune transaction trouvée
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transaction in transactions" :key="transaction.id">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDateTime(transaction.created_at) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {{ transaction.type_trans }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold">
                  {{ formatAmount(transaction.amount) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span :class="[
                    'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                    getTransactionStatusClass(transaction.status)
                  ]">
                    {{ transaction.status }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">
                  {{ formatNullValue(transaction.public_reference) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Portefeuille de l'utilisateur -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="fas fa-wallet mr-2 text-primary"></i>
          Portefeuille de l'utilisateur
        </h3>
        <div v-if="walletTransactionsLoading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-2xl text-primary"></i>
        </div>
        <div v-else-if="walletTransactions.length === 0" class="text-center py-8 text-gray-500">
          Aucune transaction wallet trouvée
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solde Avant</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solde Après</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transaction in walletTransactions" :key="transaction.id">
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDateTime(transaction.created_at) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span :class="[
                    'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                    getWalletTransactionTypeClass(transaction.transaction_type)
                  ]">
                    {{ transaction.transaction_type_display }}
                  </span>
                </td>
                <td :class="[
                  'px-4 py-3 whitespace-nowrap text-sm font-semibold',
                  getWalletAmountClass(transaction.transaction_type)
                ]">
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
                  <span :class="[
                    'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                    getWalletStatusClass(transaction.status)
                  ]">
                    {{ transaction.status_display }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Caisses de l'utilisateur -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="fas fa-piggy-bank mr-2 text-primary"></i>
          Caisses de l'utilisateur
        </h3>
        <div v-if="caissesLoading" class="text-center py-8">
          <i class="fas fa-spinner fa-spin text-2xl text-primary"></i>
        </div>
        <div v-else-if="caisses.length === 0" class="text-center py-8 text-gray-500">
          Aucune caisse trouvée
        </div>
        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nom</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date de début</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date de fin</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date de création</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nombre de retard</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total transaction</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Argent objectif</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Argent atteint</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prochaine date de payment</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Membres</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="caisse in caisses" :key="caisse.id">
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ formatNullValue(caisse.name) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {{ caisse.start_date ? new Date(caisse.start_date).toLocaleDateString('fr-FR') : 'Non défini' }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {{ caisse.end_date ? new Date(caisse.end_date).toLocaleDateString('fr-FR') : 'Non défini' }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {{ caisse.created_at ? new Date(caisse.created_at).toLocaleDateString('fr-FR') : 'Non défini' }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {{ formatNullValue(caisse.transaction_delay) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  <span class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    {{ formatNullValue(caisse.type_box) }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {{ formatNullValue(caisse.total_trans) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {{ caisse.amount_obj ? formatAmount(caisse.amount_obj) : 'Non défini' }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {{ caisse.amount_already_paid ? formatAmount(caisse.amount_already_paid) : 'Non défini' }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {{ caisse.next_payment ? new Date(caisse.next_payment).toLocaleDateString('fr-FR') : 'Non défini' }}
                </td>
                <td class="px-4 py-3 text-sm text-gray-500">
                  <div v-if="!caisse.personal && caisse.members && caisse.members.length > 0" class="space-y-1">
                    <div v-for="member in caisse.members" :key="member.id || member" class="text-xs">
                      {{ member.first_name || member.last_name || member.email || member }}
                    </div>
                  </div>
                  <span v-else class="text-gray-400">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal :is-open="isModalOpen" :title="modalTitle" :message="modalMessage" @confirm="onModalConfirm"
      @cancel="onModalCancel" />

    <!-- Modal KYC -->
    <Teleport to="body">
      <div v-if="showKycModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl mx-4 my-8">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">Mettre à jour le statut KYC</h3>
          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-2">
              Utilisateur: <span class="font-semibold">{{ user?.first_name }} {{ user?.last_name }}</span>
            </p>
            <p class="text-sm text-gray-600">
              Statut actuel: 
              <span class="font-semibold" :class="getKycStatusClass(user?.status)">
                {{ getKycStatusLabel(user?.status) }}
              </span>
            </p>
            <p v-if="user?.card_id" class="text-sm text-gray-600 mt-1">
              Numéro de carte: <span class="font-semibold">{{ user.card_id }}</span>
            </p>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">Nouveau statut *</label>
            <select 
              v-model="kycStatus"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows="4"
              placeholder="Expliquez la raison du rejet..."
              required
            ></textarea>
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
              :disabled="!kycStatus || (kycStatus === 'reject' && !kycRejectionReason.trim()) || actionLoading"
              class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50"
            >
              Mettre à jour
            </button>
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
              Wallet de {{ user?.first_name }} {{ user?.last_name }}
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
                @change="loadWalletTransactionsForModal"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                @change="loadWalletTransactionsForModal"
                class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
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
                        getWalletTransactionTypeClass(transaction.transaction_type)
                      ]"
                    >
                      {{ transaction.transaction_type_display }}
                    </span>
                  </td>
                  <td 
                    class="px-4 py-3 whitespace-nowrap text-sm font-semibold"
                    :class="getWalletAmountClass(transaction.transaction_type)"
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
                        getWalletStatusClass(transaction.status)
                      ]"
                    >
                      {{ transaction.status_display }}
                    </span>
                  </td>
                  <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">
                    {{ formatNullValue(transaction.transaction_reference || transaction.reference) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Admin Update User -->
    <Teleport to="body">
      <div v-if="showUpdateModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 my-8">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">Modifier les informations de l'utilisateur</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input v-model="updateForm.first_name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input v-model="updateForm.last_name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input v-model="updateForm.phone" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
              <input v-model="updateForm.birthday" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
              <select v-model="updateForm.sexe" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                <option value="H">Homme</option>
                <option value="F">Femme</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Carte ID</label>
              <input v-model="updateForm.card_id" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
          </div>
          <div class="flex justify-end space-x-3">
            <button @click="closeUpdateModal" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Annuler</button>
            <button @click="handleAdminUpdate" :disabled="actionLoading" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50">Mettre à jour</button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal Admin KYC Verify -->
    <Teleport to="body">
      <div v-if="showAdminKycModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 my-8">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">Vérification KYC (Admin)</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input v-model="kycForm.first_name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input v-model="kycForm.last_name" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Date de naissance</label>
              <input v-model="kycForm.birthday" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Sexe</label>
              <select v-model="kycForm.sexe" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary">
                <option value="H">Homme</option>
                <option value="F">Femme</option>
              </select>
            </div>
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Carte ID</label>
              <input v-model="kycForm.card_id" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary" />
            </div>
            
            <!-- Upload Pièce d'identité -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Pièce d'identité
              </label>
              <div class="flex items-center gap-3">
                <input 
                  type="file"
                  ref="adminIdCardFileInput"
                  @change="handleAdminIdCardFileSelect"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  class="hidden"
                />
                <button
                  type="button"
                  @click="triggerAdminIdCardFileInput"
                  :disabled="uploadingAdminIdCard"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <i class="fas fa-id-card"></i>
                  {{ uploadingAdminIdCard ? 'Upload en cours...' : 'Sélectionner la pièce' }}
                </button>
                <span v-if="adminIdCardUrl" class="text-sm text-green-600 flex items-center gap-1">
                  <i class="fas fa-check-circle"></i>
                  Fichier uploadé
                </span>
              </div>
              <p v-if="adminIdCardUrl" class="text-xs text-gray-500 mt-1 truncate">{{ adminIdCardUrl }}</p>
            </div>

            <!-- Upload Selfie -->
            <div class="md:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-2">
                Selfie
              </label>
              <div class="flex items-center gap-3">
                <input 
                  type="file"
                  ref="adminSelfieFileInput"
                  @change="handleAdminSelfieFileSelect"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  class="hidden"
                />
                <button
                  type="button"
                  @click="triggerAdminSelfieFileInput"
                  :disabled="uploadingAdminSelfie"
                  class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <i class="fas fa-camera"></i>
                  {{ uploadingAdminSelfie ? 'Upload en cours...' : 'Sélectionner le selfie' }}
                </button>
                <span v-if="adminSelfieUrl" class="text-sm text-green-600 flex items-center gap-1">
                  <i class="fas fa-check-circle"></i>
                  Fichier uploadé
                </span>
              </div>
              <p v-if="adminSelfieUrl" class="text-xs text-gray-500 mt-1 truncate">{{ adminSelfieUrl }}</p>
            </div>
          </div>
          <div class="flex justify-end space-x-3">
            <button @click="closeAdminKycModal" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Annuler</button>
            <button @click="handleAdminKycVerify" :disabled="actionLoading || uploadingAdminIdCard || uploadingAdminSelfie" class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50">Valider KYC</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchWithAuth } from '../stores/fetchwithtoken'
import { formatCurrency, formatAmount } from '../utils/currency'
import { useNotification } from '../services/notification'
import { useUsersStore } from '../stores/users'
import { useWalletsStore } from '../stores/wallets'
import { useUploadStore } from '../stores/upload'
import ConfirmationModal from '../components/ConfirmationModal.vue'

const route = useRoute()
const router = useRouter()
const notification = useNotification()
const usersStore = useUsersStore()
const walletsStore = useWalletsStore()
const uploadStore = useUploadStore()

// State
const user = ref<any>(null)
const walletBalance = ref<any>(null)
const transactions = ref<any[]>([])
const walletTransactions = ref<any[]>([])
const caisses = ref<any[]>([])
const isLoading = ref(false)
const transactionsLoading = ref(false)
const walletTransactionsLoading = ref(false)
const caissesLoading = ref(false)
const error = ref<string | null>(null)
const actionLoading = ref(false)

const userId = ref<number | null>(null)

// Modal State
const isModalOpen = ref(false)
const modalTitle = ref('')
const modalMessage = ref('')
const pendingAction = ref<(() => Promise<void>) | null>(null)

// KYC Modal State
const showKycModal = ref(false)
const kycStatus = ref<string>('')
const kycRejectionReason = ref('')

// Update Modal State
const showUpdateModal = ref(false)
const updateForm = ref({
  first_name: '',
  last_name: '',
  phone: '',
  birthday: '',
  sexe: '',
  card_id: ''
})

// Admin KYC Modal State
const showAdminKycModal = ref(false)
const kycForm = ref({
  first_name: '',
  last_name: '',
  birthday: '',
  sexe: '',
  card_id: '',
  photosString: ''
})
const adminIdCardFileInput = ref<HTMLInputElement | null>(null)
const adminSelfieFileInput = ref<HTMLInputElement | null>(null)
const adminIdCardUrl = ref<string>('')
const adminSelfieUrl = ref<string>('')
const uploadingAdminIdCard = ref(false)
const uploadingAdminSelfie = ref(false)

// Wallet Modal State
const showWalletModal = ref(false)
const walletTransactionTypeFilter = ref('all')
const walletStatusFilter = ref('all')

// Fonction pour générer les initiales
const getUserInitials = (user: any): string => {
  const firstName = user.first_name || ''
  const lastName = user.last_name || ''
  const firstInitial = firstName.charAt(0).toUpperCase()
  const lastInitial = lastName.charAt(0).toUpperCase()
  return `${firstInitial}${lastInitial}` || 'U'
}

// Fonction pour obtenir le label KYC
const getKycStatusLabel = (status: string | null | undefined): string => {
  const labels: Record<string, string> = {
    null: 'Aucun document',
    pending: 'En attente',
    accept: 'Approuvé',
    reject: 'Rejeté'
  }
  return labels[status || 'null'] || 'Inconnu'
}

// Fonction pour obtenir la classe KYC
const getKycStatusClass = (status: string | null | undefined): string => {
  const classes: Record<string, string> = {
    null: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800',
    accept: 'bg-green-100 text-green-800',
    reject: 'bg-red-100 text-red-800'
  }
  return classes[status || 'null'] || 'bg-gray-100 text-gray-800'
}

// Fonction pour obtenir la classe de statut de transaction
const getTransactionStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    accept: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800',
    timeout: 'bg-orange-100 text-orange-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// Fonction pour obtenir la classe de type de transaction wallet
const getWalletTransactionTypeClass = (type: string): string => {
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

// Fonction pour obtenir la classe de montant wallet
const getWalletAmountClass = (type: string): string => {
  if (type === 'deposit' || type === 'bonus') {
    return 'text-green-600'
  }
  return 'text-red-600'
}

// Fonction pour obtenir la classe de statut wallet
const getWalletStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
    cancelled: 'bg-gray-100 text-gray-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// Fonction pour obtenir le label de fréquence
const getFrequencyLabel = (frequency: string): string => {
  const labels: Record<string, string> = {
    daily: 'Quotidienne',
    weekly: 'Hebdomadaire',
    monthly: 'Mensuelle'
  }
  return labels[frequency] || frequency
}

// Fonction pour obtenir le label de statut de caisse
const getCaisseStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    active: 'Active',
    completed: 'Terminée',
    blocked: 'Bloquée'
  }
  return labels[status] || status
}

// Fonction pour obtenir la classe de statut de caisse
const getCaisseStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    blocked: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// Fonction pour formater la date et l'heure
const formatDateTime = (date: string): string => {
  return new Date(date).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Fonction pour formater les valeurs null
const formatNullValue = (value: any): string => {
  if (value === null || value === undefined || value === '') {
    return 'Non défini'
  }
  return value
}

// Fonction pour revenir en arrière
const goBack = () => {
  router.back()
}

// Charger les informations de l'utilisateur
const loadUserInfo = async () => {
  try {
    isLoading.value = true
    error.value = null

    // Récupérer l'ID depuis la route
    const id = route.params.id as string
    userId.value = parseInt(id)

    if (!userId.value) {
      throw new Error('ID utilisateur invalide')
    }

    // Charger les informations de l'utilisateur directement via l'API /auth/me/
    const response = await fetchWithAuth('/auth/me/', {
      queryParams: { user_id: userId.value.toString() }
    })

    if (!response.ok) {
      throw new Error(`Utilisateur avec l'ID ${userId.value} non trouvé`)
    }

    user.value = await response.json()

    // Charger toutes les données en parallèle
    await Promise.all([
      loadWalletBalance(),
      loadTransactions(),
      loadWalletTransactions(),
      loadCaisses()
    ])
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    console.error('Error loading user info:', err)
    notification.addNotification(error.value, 'error')
  } finally {
    isLoading.value = false
  }
}

// Charger le solde wallet
const loadWalletBalance = async () => {
  if (!userId.value) return

  try {
    const response = await fetchWithAuth('/box/wallet/balance', {
      queryParams: { user_id: userId.value.toString() }
    })

    if (!response.ok) {
      if (response.status === 404) {
        walletBalance.value = null
        return
      }
      throw new Error('Erreur lors de la récupération du solde wallet')
    }

    const data = await response.json()
    if (data.success && data.data) {
      walletBalance.value = data.data
    }
  } catch (err) {
    console.error('Error loading wallet balance:', err)
  }
}

// Charger les transactions
const loadTransactions = async () => {
  if (!userId.value) return

  try {
    transactionsLoading.value = true
    const response = await fetchWithAuth('/box/all-transaction', {
      queryParams: { user_id: userId.value.toString(), page_size: '20' }
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des transactions')
    }

    const data = await response.json()
    transactions.value = data.results || []
  } catch (err) {
    console.error('Error loading transactions:', err)
  } finally {
    transactionsLoading.value = false
  }
}

// Charger les transactions wallet
const loadWalletTransactions = async () => {
  if (!userId.value) return

  try {
    walletTransactionsLoading.value = true
    const response = await fetchWithAuth('/box/wallet/transactions', {
      queryParams: { user_id: userId.value.toString(), page_size: '20' }
    })

    if (!response.ok) {
      if (response.status === 404) {
        walletTransactions.value = []
        return
      }
      throw new Error('Erreur lors de la récupération des transactions wallet')
    }

    const data = await response.json()
    if (data.success && data.data) {
      walletTransactions.value = data.data
    } else {
      walletTransactions.value = []
    }
  } catch (err) {
    console.error('Error loading wallet transactions:', err)
  } finally {
    walletTransactionsLoading.value = false
  }
}

// Charger les caisses
const loadCaisses = async () => {
  if (!userId.value) return

  try {
    caissesLoading.value = true
    const response = await fetchWithAuth('/box/caisse', {
      queryParams: { user_id: userId.value.toString() }
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des caisses')
    }

    const data = await response.json()
    // Gérer le format de réponse avec { count, next, previous, results: [...] }
    if (data.results && Array.isArray(data.results)) {
      caisses.value = data.results
    } else if (Array.isArray(data)) {
      caisses.value = data
    } else {
      caisses.value = []
    }
  } catch (err) {
    console.error('Error loading caisses:', err)
  } finally {
    caissesLoading.value = false
  }
}

// Actions handlers
const handleToggleBlock = async () => {
  if (!user.value) return
  const actionText = user.value.is_block ? 'débloquer' : 'bloquer'
  const userName = `${user.value.first_name || ''} ${user.value.last_name || ''}`.trim() || 'cet utilisateur'

  modalTitle.value = `Confirmation de ${actionText}`
  modalMessage.value = `Êtes-vous sûr de vouloir ${actionText} ${userName} ?`
  pendingAction.value = async () => {
    actionLoading.value = true
    try {
      await usersStore.toggleUserBlockStatus(user.value.id)
      notification.addNotification(`Utilisateur ${actionText} avec succès.`, 'success')
      // Recharger les informations utilisateur
      await loadUserInfo()
    } catch (error: any) {
      console.error(`Erreur lors de la tentative de ${actionText} l'utilisateur:`, error)
      notification.addNotification(`Erreur: ${error.message || `Impossible de ${actionText} l'utilisateur.`}`, 'error')
    } finally {
      actionLoading.value = false
    }
  }
  isModalOpen.value = true
}

const handleToggleAgent = async () => {
  if (!user.value) return
  const actionText = user.value.agent_client ? 'retirer des agents' : 'nommer comme agent'
  const userName = `${user.value.first_name || ''} ${user.value.last_name || ''}`.trim() || 'cet utilisateur'

  modalTitle.value = `Confirmation de ${actionText}`
  modalMessage.value = `Êtes-vous sûr de vouloir ${actionText} ${userName} ?`
  pendingAction.value = async () => {
    actionLoading.value = true
    try {
      await usersStore.toggleUserAgentStatus(user.value.id)
      notification.addNotification(`Utilisateur ${actionText} avec succès.`, 'success')
      // Recharger les informations utilisateur
      await loadUserInfo()
    } catch (error: any) {
      console.error(`Erreur lors de la tentative de ${actionText} l'utilisateur:`, error)
      notification.addNotification(`Erreur: ${error.message || `Impossible de ${actionText} l'utilisateur.`}`, 'error')
    } finally {
      actionLoading.value = false
    }
  }
  isModalOpen.value = true
}

const handleResetPin = async () => {
  if (!user.value) return
  const userName = `${user.value.first_name || ''} ${user.value.last_name || ''}`.trim() || 'cet utilisateur'
  modalTitle.value = 'Réinitialiser le PIN'
  modalMessage.value = `Êtes-vous sûr de vouloir réinitialiser le PIN de ${userName} ?`
  pendingAction.value = async () => {
    actionLoading.value = true
    try {
      await usersStore.resetUserPin(user.value.id)
      notification.addNotification('PIN réinitialisé avec succès', 'success')
      // Recharger les informations utilisateur
      await loadUserInfo()
    } catch (error: any) {
      console.error('Erreur lors de la réinitialisation du PIN:', error)
      notification.addNotification(`Erreur: ${error.message || 'Impossible de réinitialiser le PIN.'}`, 'error')
    } finally {
      actionLoading.value = false
    }
  }
  isModalOpen.value = true
}

const handleSendPinVerificationOtp = async () => {
  if (!user.value) return
  const userName = `${user.value.first_name || ''} ${user.value.last_name || ''}`.trim() || 'cet utilisateur'
  modalTitle.value = 'Envoyer OTP de vérification PIN'
  modalMessage.value = `Êtes-vous sûr de vouloir envoyer un OTP de vérification PIN à ${userName} ?`
  pendingAction.value = async () => {
    actionLoading.value = true
    try {
      await usersStore.sendPinVerificationOtp(user.value.id)
      notification.addNotification('OTP de vérification PIN envoyé avec succès', 'success')
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de l\'OTP de vérification PIN:', error)
      notification.addNotification(`Erreur: ${error.message || 'Impossible d\'envoyer l\'OTP de vérification PIN.'}`, 'error')
    } finally {
      actionLoading.value = false
    }
  }
  isModalOpen.value = true
}

const openKycModal = () => {
  if (!user.value) return
  kycStatus.value = user.value.status || 'null'
  kycRejectionReason.value = ''
  showKycModal.value = true
}

const closeKycModal = () => {
  showKycModal.value = false
  kycStatus.value = ''
  kycRejectionReason.value = ''
}

const confirmKycUpdate = async () => {
  if (!user.value || !kycStatus.value) return
  
  try {
    actionLoading.value = true
    await usersStore.updateKycStatus(
      user.value.id,
      kycStatus.value as 'pending' | 'accept' | 'reject' | 'null',
      kycStatus.value === 'reject' ? kycRejectionReason.value : undefined
    )
    notification.addNotification('Statut KYC mis à jour avec succès', 'success')
    closeKycModal()
    // Recharger les informations utilisateur
    await loadUserInfo()
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du statut KYC:', error)
    notification.addNotification(`Erreur: ${error.message || 'Impossible de mettre à jour le statut KYC.'}`, 'error')
  } finally {
    actionLoading.value = false
  }
}

const viewUserWallet = async () => {
  if (!user.value) return
  showWalletModal.value = true
  
  try {
    await walletsStore.fetchUserTransactions(user.value.id, 1)
  } catch (error) {
    notification.addNotification('Erreur lors du chargement du wallet', 'error')
  }
}

const closeWalletModal = () => {
  showWalletModal.value = false
  walletTransactionTypeFilter.value = 'all'
  walletStatusFilter.value = 'all'
  walletsStore.resetFilters()
}

const loadWalletTransactionsForModal = () => {
  if (!user.value) return
  
  walletsStore.fetchUserTransactions(
    user.value.id,
    1,
    walletTransactionTypeFilter.value === 'all' ? undefined : walletTransactionTypeFilter.value,
    walletStatusFilter.value === 'all' ? undefined : walletStatusFilter.value
  )
}

// Handlers for new Admin APIs
const openUpdateModal = () => {
  if (!user.value) return
  updateForm.value = {
    first_name: user.value.first_name || '',
    last_name: user.value.last_name || '',
    phone: user.value.phone || '',
    birthday: user.value.birthday || '',
    sexe: user.value.sexe || 'H',
    card_id: user.value.card_id || ''
  }
  showUpdateModal.value = true
}

const closeUpdateModal = () => {
  showUpdateModal.value = false
}

const handleAdminUpdate = async () => {
  if (!user.value) return
  try {
    actionLoading.value = true
    await usersStore.adminUpdateUser({
      user_id: user.value.id,
      ...updateForm.value
    })
    notification.addNotification('Profil utilisateur mis à jour avec succès', 'success')
    closeUpdateModal()
    await loadUserInfo()
  } catch (error: any) {
    notification.addNotification(error.message || 'Erreur lors de la mise à jour', 'error')
  } finally {
    actionLoading.value = false
  }
}

const openAdminKycModal = () => {
  if (!user.value) return
  kycForm.value = {
    first_name: user.value.first_name || '',
    last_name: user.value.last_name || '',
    birthday: user.value.birthday || '',
    sexe: user.value.sexe || 'H',
    card_id: user.value.card_id || '',
    photosString: user.value.user_cards ? user.value.user_cards.join('\n') : ''
  }
  adminIdCardUrl.value = ''
  adminSelfieUrl.value = ''
  showAdminKycModal.value = true
}

const closeAdminKycModal = () => {
  showAdminKycModal.value = false
  adminIdCardUrl.value = ''
  adminSelfieUrl.value = ''
}

const triggerAdminIdCardFileInput = () => {
  adminIdCardFileInput.value?.click()
}

const triggerAdminSelfieFileInput = () => {
  adminSelfieFileInput.value?.click()
}

const handleAdminIdCardFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    uploadingAdminIdCard.value = true
    const url = await uploadStore.uploadFile(file, 'image')
    adminIdCardUrl.value = url
    notification.addNotification('Pièce d\'identité uploadée avec succès', 'success')
  } catch (error: any) {
    console.error('Erreur lors de l\'upload de la pièce d\'identité:', error)
    notification.addNotification(`Erreur: ${error.message || 'Impossible d\'uploader la pièce d\'identité'}`, 'error')
  } finally {
    uploadingAdminIdCard.value = false
    if (target) target.value = ''
  }
}

const handleAdminSelfieFileSelect = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return
  
  try {
    uploadingAdminSelfie.value = true
    const url = await uploadStore.uploadFile(file, 'image')
    adminSelfieUrl.value = url
    notification.addNotification('Selfie uploadé avec succès', 'success')
  } catch (error: any) {
    console.error('Erreur lors de l\'upload du selfie:', error)
    notification.addNotification(`Erreur: ${error.message || 'Impossible d\'uploader le selfie'}`, 'error')
  } finally {
    uploadingAdminSelfie.value = false
    if (target) target.value = ''
  }
}

const handleAdminKycVerify = async () => {
  if (!user.value) return
  try {
    // Construire le tableau des URLs - priorité aux fichiers uploadés
    const photos: string[] = []
    if (adminIdCardUrl.value) photos.push(adminIdCardUrl.value)
    if (adminSelfieUrl.value) photos.push(adminSelfieUrl.value)
    
    // Si aucun fichier uploadé, utiliser le champ texte (pour compatibilité)
    if (photos.length === 0 && kycForm.value.photosString) {
      const textPhotos = kycForm.value.photosString.split('\n').map(u => u.trim()).filter(u => u)
      photos.push(...textPhotos)
    }
    
    if (photos.length === 0) {
      notification.addNotification('Veuillez uploader au moins une photo (pièce d\'identité ou selfie)', 'warning')
      return
    }

    actionLoading.value = true
    await usersStore.adminKycVerify({
      user_id: user.value.id,
      first_name: kycForm.value.first_name,
      last_name: kycForm.value.last_name,
      birthday: kycForm.value.birthday,
      sexe: kycForm.value.sexe,
      card_id: kycForm.value.card_id,
      photos
    })
    notification.addNotification('KYC validé avec succès (admin)', 'success')
    closeAdminKycModal()
    await loadUserInfo()
  } catch (error: any) {
    notification.addNotification(error.message || 'Erreur lors de la validation KYC', 'error')
  } finally {
    actionLoading.value = false
  }
}

const handleActivateUser = async () => {
  if (!user.value) return
  modalTitle.value = 'Activer le compte'
  modalMessage.value = `Êtes-vous sûr de vouloir activer le compte de ${user.value.first_name} ${user.value.last_name} ?`
  pendingAction.value = async () => {
    try {
      actionLoading.value = true
      await usersStore.adminActivateUser(user.value.id)
      notification.addNotification('Compte activé avec succès', 'success')
      await loadUserInfo()
    } catch (error: any) {
      notification.addNotification(error.message || 'Erreur lors de l\'activation', 'error')
    } finally {
      actionLoading.value = false
    }
  }
  isModalOpen.value = true
}

const onModalConfirm = async () => {
  if (pendingAction.value) {
    await pendingAction.value()
  }
  isModalOpen.value = false
  pendingAction.value = null
}

const onModalCancel = () => {
  isModalOpen.value = false
  pendingAction.value = null
}

onMounted(() => {
  loadUserInfo()
})
</script>

