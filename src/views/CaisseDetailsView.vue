<template>
  <div class="space-y-6 p-3 sm:p-4 md:p-6">
    <!-- Header avec bouton retour -->
    <div class="flex items-center gap-4">
      <button
        @click="$router.back()"
        class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Retour"
      >
        <i class="fas fa-arrow-left"></i>
      </button>
      <div>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Détails de la Caisse</h1>
        <p v-if="caisse" class="text-sm text-gray-500 mt-1">ID: {{ caisse.id }}</p>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <p class="text-red-800">{{ error }}</p>
    </div>

    <!-- Caisse Details -->
    <div v-else-if="caisse" class="space-y-6">
      <!-- Informations générales -->
      <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations générales</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Nom</label>
            <p class="text-gray-900 font-medium">{{ caisse.name }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Statut</label>
            <span class="badge text-xs" :class="{
              'bg-green-100 text-green-800': caisse.status === 'done',
              'bg-yellow-100 text-yellow-800': caisse.status === 'pending',
              'bg-red-100 text-red-800': caisse.status === 'disabled',
              'bg-blue-100 text-blue-800': !['done', 'pending', 'disabled'].includes(caisse.status)
            }">
              {{ caisse.status === 'done' ? 'Terminé' :
              caisse.status === 'pending' ? 'En cours' :
              caisse.status === 'disabled' ? 'Désactivé' :
              caisse.status.charAt(0).toUpperCase() + caisse.status.slice(1) }}
            </span>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Type</label>
            <p class="text-gray-900">{{ caisse.type_box === 'locked' ? 'Verrouillée' : 'Libre' }}</p>
            <p class="text-xs text-gray-400 mt-1">
              Choix utilisateur à la création : retrait possible avec pénalité si verrouillée.
            </p>
          </div>
          <div class="md:col-span-2">
            <label class="text-sm font-medium text-gray-500">Blocage définitif (admin)</label>
            <div class="mt-2 flex flex-wrap items-center gap-3">
              <label class="inline-flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  v-model="defineBlockEnabled"
                  :disabled="savingDefineBlock"
                  class="w-4 h-4"
                  @change="saveDefineBlock"
                />
                <span class="text-sm text-gray-800">
                  Retrait impossible tant que la caisse n'est pas terminée
                </span>
              </label>
              <span
                class="text-xs px-2 py-1 rounded-full"
                :class="defineBlockEnabled ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-600'"
              >
                {{ defineBlockEnabled ? 'Bloquée' : 'Non bloquée' }}
              </span>
              <i v-if="savingDefineBlock" class="fas fa-spinner fa-spin text-gray-400 text-sm"></i>
            </div>
            <p class="text-xs text-gray-400 mt-1">
              Champ <code class="text-xs">define_block</code> — réservé à l'administration. Sur mobile, le bouton
              « Retirer » est masqué tant que le statut n'est pas « Terminé ».
            </p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Personnelle</label>
            <p class="text-gray-900">{{ caisse.personal ? 'Oui' : 'Non' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Date de début</label>
            <p class="text-gray-900">{{ formatDate(caisse.start_date) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Date de fin</label>
            <p class="text-gray-900">{{ caisse.end_date ? formatDate(caisse.end_date) : 'Non définie' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Date de création</label>
            <p class="text-gray-900">{{ formatDateTime(caisse.created_at) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Dernière mise à jour</label>
            <p class="text-gray-900">{{ formatDateTime(caisse.updated_at) }}</p>
          </div>
        </div>
      </div>

      <!-- Informations financières -->
      <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations financières</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Montant objectif</label>
            <p class="text-gray-900 font-semibold text-lg">{{ formatCurrency(caisse.amount_obj) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Montant déjà payé</label>
            <p class="text-gray-900 font-semibold text-lg">{{ formatCurrency(caisse.amount_already_paid) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Progression</label>
            <div class="flex items-center gap-2">
              <div class="flex-1 bg-gray-200 rounded-full h-3">
                <div class="bg-primary h-3 rounded-full" :style="{ width: `${caisse.percentage_progession}%` }"></div>
              </div>
              <span class="text-sm font-medium text-gray-900">{{ caisse.percentage_progession }}%</span>
            </div>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Total transactions</label>
            <p class="text-gray-900 font-semibold">{{ caisse.total_trans }}</p>
          </div>
        </div>
      </div>

      <!-- Actions admin : retrait / annulation (caisse personnelle) -->
      <div
        v-if="caisse.personal"
        class="bg-white rounded-lg shadow-sm p-4 sm:p-6 border border-indigo-100"
      >
        <h2 class="text-lg font-semibold text-gray-900 mb-1">Créer une demande pour l'utilisateur</h2>
        <p class="text-sm text-gray-500 mb-4">
          Transaction créée au nom du propriétaire de la caisse ({{ caisse.created_by.email }}).
          Réservé aux caisses personnelles.
        </p>

        <div
          v-if="caisse.has_pending_withdrawal"
          class="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800"
        >
          <i class="fas fa-exclamation-triangle mr-2"></i>
          Un retrait ou une annulation est déjà en cours sur cette caisse.
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mode de paiement</label>
            <select v-model="adminPaymentMode" class="input w-full" :disabled="adminActionLoading">
              <option value="moov">MOOV</option>
              <option value="mtn">MTN</option>
              <option value="celtis">Celtis</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone (Mobile Money)</label>
            <div class="flex">
              <span class="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-200 bg-gray-50 text-sm text-gray-600">229</span>
              <input
                v-model="adminPhoneLocal"
                type="tel"
                maxlength="10"
                placeholder="XXXXXXXX"
                class="input rounded-l-none w-full"
                :disabled="adminActionLoading"
              />
            </div>
          </div>
          <div v-if="showPartialAmountField">
            <label class="block text-sm font-medium text-gray-700 mb-1">Montant brut (retrait partiel)</label>
            <input
              v-model.number="adminPartialAmount"
              type="number"
              min="1"
              step="1"
              class="input w-full"
              :disabled="adminActionLoading"
              placeholder="Ex: 5000"
            />
          </div>
        </div>

        <div class="flex flex-wrap gap-3">
          <button
            v-if="canAdminWithdraw"
            type="button"
            class="btn btn-primary btn-sm"
            :disabled="adminActionLoading"
            @click="openAdminConfirmModal('withdrawal')"
          >
            <i v-if="adminActionLoading && adminActionType === 'withdrawal'" class="fas fa-spinner fa-spin mr-2"></i>
            <i v-else class="fas fa-money-bill-wave mr-2"></i>
            Retrait complet
          </button>
          <button
            v-if="canAdminCancel"
            type="button"
            class="btn btn-outline btn-sm border-red-300 text-red-700 hover:bg-red-50"
            :disabled="adminActionLoading"
            @click="openAdminConfirmModal('cancellation')"
          >
            <i v-if="adminActionLoading && adminActionType === 'cancellation'" class="fas fa-spinner fa-spin mr-2"></i>
            <i v-else class="fas fa-ban mr-2"></i>
            Annulation
          </button>
          <button
            v-if="canAdminPartial"
            type="button"
            class="btn btn-outline btn-sm"
            :disabled="adminActionLoading"
            @click="openAdminConfirmModal('partial')"
          >
            <i v-if="adminActionLoading && adminActionType === 'partial'" class="fas fa-spinner fa-spin mr-2"></i>
            <i v-else class="fas fa-percent mr-2"></i>
            Retrait partiel
          </button>
        </div>

        <p v-if="!canAdminWithdraw && !canAdminCancel && !canAdminPartial && !caisse.has_pending_withdrawal" class="text-sm text-gray-500 mt-3">
          Aucune action disponible pour le statut actuel de la caisse ({{ caisse.status }}).
        </p>
      </div>

      <!-- Informations sur le créateur -->
      <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Créateur</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Nom complet</label>
            <p class="text-gray-900">{{ caisse.created_by.first_name }} {{ caisse.created_by.last_name }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Email</label>
            <p class="text-gray-900">{{ caisse.created_by.email }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Téléphone</label>
            <p class="text-gray-900">{{ caisse.created_by.phone }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Agent</label>
            <p class="text-gray-900">{{ caisse.created_by.agent_client ? 'Oui' : 'Non' }}</p>
          </div>
          <div class="md:col-span-2">
            <router-link
              :to="{ name: 'user-profile', params: { id: caisse.created_by.id.toString() } }"
              class="text-primary hover:underline inline-flex items-center gap-2"
            >
              <i class="fas fa-user"></i>
              Voir le profil de l'utilisateur
            </router-link>
          </div>
        </div>
      </div>

      <!-- Membres (si caisse non personnelle) -->
      <div v-if="!caisse.personal && caisse.members && caisse.members.length > 0" class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Membres</h2>
        <div class="space-y-2">
          <div v-for="member in caisse.members" :key="member.id" class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p class="font-medium text-gray-900">{{ member.first_name }} {{ member.last_name }}</p>
              <p class="text-sm text-gray-500">{{ member.email }}</p>
            </div>
            <router-link
              :to="{ name: 'user-profile', params: { id: member.id.toString() } }"
              class="text-primary hover:underline text-sm"
            >
              Voir profil
            </router-link>
          </div>
        </div>
      </div>

      <!-- Informations supplémentaires -->
      <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations supplémentaires</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="text-sm font-medium text-gray-500">Fréquence</label>
            <p class="text-gray-900">{{ formatFrequence(caisse.frequence) }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Prochaine date de paiement</label>
            <p class="text-gray-900">{{ caisse.next_payment ? formatDate(caisse.next_payment) : 'Non définie' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Nombre de retards</label>
            <p class="text-gray-900">{{ caisse.transaction_delay }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Active</label>
            <p class="text-gray-900">{{ caisse.is_active ? 'Oui' : 'Non' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Date d'activation</label>
            <p class="text-gray-900">{{ caisse.date_active ? formatDateTime(caisse.date_active) : 'Non activée' }}</p>
          </div>
          <div>
            <label class="text-sm font-medium text-gray-500">Date avant suppression</label>
            <p class="text-gray-900">{{ formatDateTime(caisse.date_before_delete) }}</p>
          </div>
          <div v-if="caisse.cancel_date">
            <label class="text-sm font-medium text-gray-500">Date d'annulation</label>
            <p class="text-gray-900">{{ formatDateTime(caisse.cancel_date) }}</p>
          </div>
        </div>
      </div>

      <!-- Historique du solde -->
      <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-lg font-semibold text-gray-900">Historique du solde</h2>
            <p v-if="caisseStore.balanceHistoryTotal > 0" class="text-sm text-gray-500 mt-0.5">
              {{ caisseStore.balanceHistoryTotal }} mouvement(s)
            </p>
          </div>
          <div class="flex items-center gap-3">
            <!-- Solde actuel -->
            <div v-if="caisseStore.balanceHistoryCurrentAmount > 0" class="text-right">
              <p class="text-xs text-gray-500">Solde actuel</p>
              <p class="text-base font-bold text-primary">{{ formatCurrency(caisseStore.balanceHistoryCurrentAmount) }}</p>
            </div>
            <button
              @click="loadBalanceHistory(caisseStore.balanceHistoryPage)"
              :disabled="caisseStore.balanceHistoryLoading"
              class="btn btn-outline btn-sm"
            >
              <i v-if="caisseStore.balanceHistoryLoading" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-sync mr-2"></i>
              Actualiser
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="caisseStore.balanceHistoryLoading && caisseStore.balanceHistory.length === 0" class="flex justify-center items-center py-10">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <!-- Error -->
        <div v-else-if="caisseStore.balanceHistoryError" class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          <i class="fas fa-exclamation-circle mr-2"></i>{{ caisseStore.balanceHistoryError }}
        </div>

        <!-- Table -->
        <div v-else-if="caisseStore.balanceHistory.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200 text-sm">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Motif</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Avant</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Variation</th>
                <th class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Après</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Déclenché par</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="entry in caisseStore.balanceHistory" :key="entry.id" class="hover:bg-gray-50 transition-colors">
                <!-- Date -->
                <td class="px-4 py-3 whitespace-nowrap text-gray-600">
                  {{ formatDateTime(entry.created_at) }}
                </td>
                <!-- Motif -->
                <td class="px-4 py-3 whitespace-nowrap">
                  <span
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
                    :class="reasonBadgeClass(entry.reason)"
                  >
                    <i :class="reasonIcon(entry.reason)"></i>
                    {{ entry.reason_label }}
                  </span>
                  <p v-if="entry.note" class="text-xs text-gray-400 mt-0.5 max-w-[160px] truncate" :title="entry.note">
                    {{ entry.note }}
                  </p>
                </td>
                <!-- Avant -->
                <td class="px-4 py-3 whitespace-nowrap text-right text-gray-500 font-mono text-xs">
                  {{ formatCurrency(entry.amount_before) }}
                </td>
                <!-- Delta -->
                <td class="px-4 py-3 whitespace-nowrap text-right font-semibold font-mono">
                  <span :class="entry.delta >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ entry.delta >= 0 ? '+' : '' }}{{ formatCurrency(entry.delta) }}
                  </span>
                </td>
                <!-- Après -->
                <td class="px-4 py-3 whitespace-nowrap text-right font-semibold font-mono text-gray-900">
                  {{ formatCurrency(entry.amount_after) }}
                </td>
                <!-- Déclenché par -->
                <td class="px-4 py-3 whitespace-nowrap">
                  <div v-if="entry.triggered_by" class="flex items-center gap-1.5">
                    <div class="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                      <span class="text-xs text-gray-600 font-medium">
                        {{ triggeredByInitials(entry.triggered_by) }}
                      </span>
                    </div>
                    <div>
                      <p class="text-xs font-medium text-gray-800 leading-tight">
                        {{ entry.triggered_by.first_name }} {{ entry.triggered_by.last_name }}
                      </p>
                      <p class="text-xs text-gray-400 leading-tight">{{ entry.triggered_by.email }}</p>
                    </div>
                  </div>
                  <span v-else class="text-gray-300 text-xs">—</span>
                </td>
                <!-- Transaction -->
                <td class="px-4 py-3 whitespace-nowrap">
                  <router-link
                    v-if="entry.transaction_id"
                    :to="{ name: 'transaction-details', params: { id: entry.transaction_id.toString() } }"
                    class="inline-flex items-center gap-1 text-primary hover:underline text-xs font-medium"
                    :title="entry.transaction_reference || undefined"
                  >
                    <i class="fas fa-external-link-alt text-[10px]"></i>
                    {{ entry.transaction_reference ? truncateRef(entry.transaction_reference) : `#${entry.transaction_id}` }}
                  </router-link>
                  <span v-else class="text-gray-300 text-xs">—</span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div class="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p class="text-xs text-gray-500">
              Page <span class="font-semibold">{{ caisseStore.balanceHistoryPage }}</span> sur
              <span class="font-semibold">{{ caisseStore.balanceHistoryTotalPages() }}</span>
            </p>
            <div class="flex items-center gap-2">
              <button
                @click="loadBalanceHistory(caisseStore.balanceHistoryPage - 1)"
                :disabled="caisseStore.balanceHistoryPage === 1 || caisseStore.balanceHistoryLoading"
                class="btn btn-outline btn-sm flex items-center gap-1"
              >
                <i class="fas fa-chevron-left text-xs"></i>
                Précédent
              </button>
              <span class="px-3 py-1 bg-primary text-white text-xs rounded-md font-medium">
                {{ caisseStore.balanceHistoryPage }}
              </span>
              <button
                @click="loadBalanceHistory(caisseStore.balanceHistoryPage + 1)"
                :disabled="caisseStore.balanceHistoryPage >= caisseStore.balanceHistoryTotalPages() || caisseStore.balanceHistoryLoading"
                class="btn btn-outline btn-sm flex items-center gap-1"
              >
                Suivant
                <i class="fas fa-chevron-right text-xs"></i>
              </button>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else class="text-center py-10">
          <i class="fas fa-history text-gray-300 text-4xl mb-3"></i>
          <p class="text-gray-500 text-sm">Aucun mouvement de solde enregistré</p>
        </div>
      </div>

      <!-- Transactions -->
      <div class="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-lg font-semibold text-gray-900">Transactions</h2>
          <button
            @click="loadTransactions"
            class="btn btn-outline btn-sm"
            :disabled="transactionsLoading"
          >
            <i v-if="transactionsLoading" class="fas fa-spinner fa-spin mr-2"></i>
            <i v-else class="fas fa-sync mr-2"></i>
            Actualiser
          </button>
        </div>

        <!-- Loading Transactions -->
        <div v-if="transactionsLoading" class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <!-- Transactions List -->
        <div v-else-if="transactions.length > 0" class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Référence</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Montant</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="transaction in transactions" :key="transaction.id" class="hover:bg-gray-50">
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ transaction.public_reference }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {{ formatDateTime(transaction.created_at) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm" :class="{
                  'text-green-600': transaction.type_trans === 'deposit',
                  'text-red-600': transaction.type_trans === 'withdrawal' || transaction.type_trans === 'cancellation'
                }">
                  {{ transaction.type_trans === 'deposit' ? '+' : '-' }}{{ formatCurrency(transaction.amount) }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="badge text-xs" :class="{
                    'bg-green-100 text-green-800': transaction.type_trans === 'deposit',
                    'bg-yellow-100 text-yellow-800': transaction.type_trans === 'withdrawal',
                    'bg-red-100 text-red-800': transaction.type_trans === 'cancellation'
                  }">
                    {{ transaction.type_trans === 'deposit' ? 'Dépôt' :
                    transaction.type_trans === 'withdrawal' ? 'Retrait' :
                    transaction.type_trans === 'cancellation' ? 'Annulation' :
                    transaction.type_trans === 'partial_withdrawal' ? 'Retrait partiel' :
                    transaction.type_trans }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span class="badge text-xs" :class="{
                    'bg-green-100 text-green-800': transaction.status === 'accept',
                    'bg-red-100 text-red-800': transaction.status === 'error',
                    'bg-gray-100 text-gray-800': transaction.status === 'pending',
                    'bg-orange-100 text-orange-800': transaction.status === 'expired',
                    'bg-yellow-100 text-yellow-800': transaction.status === 'timeout'
                  }">
                    {{ transaction.status === 'accept' ? 'Succès' :
                    transaction.status === 'error' ? 'Erreur' :
                    transaction.status === 'pending' ? 'En attente' :
                    transaction.status === 'expired' ? 'Expiré' :
                    transaction.status === 'timeout' ? 'Timeout' : transaction.status }}
                  </span>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  <router-link
                    :to="{ name: 'transaction-details', params: { id: transaction.id.toString() } }"
                    class="text-primary hover:underline"
                  >
                    Voir détails
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-8">
          <i class="fas fa-inbox text-gray-400 text-4xl mb-4"></i>
          <p class="text-gray-600">Aucune transaction trouvée pour cette caisse</p>
        </div>
      </div>
    </div>

    <!-- Modal confirmation création transaction admin -->
    <Teleport to="body">
      <div
        v-if="showAdminConfirmModal"
        class="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        @click="closeAdminConfirmModal"
      >
        <div
          class="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 overflow-hidden"
          @click.stop
        >
          <div
            class="px-6 py-4 border-b"
            :class="adminConfirmHeaderClass"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-xs font-medium uppercase tracking-wide opacity-80">Confirmation requise</p>
                <h3 class="text-lg font-semibold mt-0.5">{{ adminConfirmTitle }}</h3>
              </div>
              <button
                type="button"
                class="text-gray-400 hover:text-gray-600 p-1"
                :disabled="adminActionLoading"
                @click="closeAdminConfirmModal"
              >
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>

          <div class="px-6 py-5 space-y-4">
            <p class="text-sm text-gray-600">
              {{ adminConfirmDescription }}
            </p>

            <div v-if="caisse" class="rounded-lg bg-gray-50 border border-gray-100 p-4 space-y-3 text-sm">
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 shrink-0">Utilisateur</span>
                <span class="text-right font-medium text-gray-900">
                  {{ caisse.created_by.first_name }} {{ caisse.created_by.last_name }}
                  <span class="block text-xs font-normal text-gray-500">{{ caisse.created_by.email }}</span>
                </span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 shrink-0">Caisse</span>
                <span class="text-right font-medium text-gray-900">
                  {{ caisse.name }}
                  <span class="block text-xs font-normal text-gray-500">#{{ caisse.id }}</span>
                </span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 shrink-0">Solde épargné</span>
                <span class="font-medium text-gray-900">{{ formatCurrency(caisse.amount_already_paid) }}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 shrink-0">Mode de paiement</span>
                <span class="font-medium text-gray-900">{{ adminPaymentModeLabel }}</span>
              </div>
              <div class="flex justify-between gap-4">
                <span class="text-gray-500 shrink-0">Téléphone</span>
                <span class="font-medium text-gray-900">229 {{ adminPhoneLocal }}</span>
              </div>
              <div
                v-if="pendingAdminAction === 'partial' && adminPartialAmount"
                class="flex justify-between gap-4 pt-2 border-t border-gray-200"
              >
                <span class="text-gray-500 shrink-0">Montant brut</span>
                <span class="font-semibold text-primary">{{ formatCurrency(adminPartialAmount) }}</span>
              </div>
            </div>

            <div
              class="rounded-lg px-4 py-3 text-sm"
              :class="adminConfirmNoticeClass"
            >
              <i class="fas fa-info-circle mr-2"></i>
              La transaction sera créée au nom du propriétaire et passera en statut
              <strong>En attente</strong> jusqu'à approbation.
            </div>
          </div>

          <div class="px-6 py-4 bg-gray-50 border-t flex justify-end gap-3">
            <button
              type="button"
              class="btn btn-outline btn-sm"
              :disabled="adminActionLoading"
              @click="closeAdminConfirmModal"
            >
              Annuler
            </button>
            <button
              type="button"
              class="btn btn-sm"
              :class="adminConfirmButtonClass"
              :disabled="adminActionLoading"
              @click="confirmAdminAction"
            >
              <i v-if="adminActionLoading" class="fas fa-spinner fa-spin mr-2"></i>
              <i v-else class="fas fa-check mr-2"></i>
              {{ adminConfirmButtonLabel }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchWithAuth, handleApiResponse } from '../stores/fetchwithtoken'
import { useNotification } from '../services/notification'
import { Transaction } from '../types/transaction'
import { Caisse, useCaisseStore, type BalanceHistoryEntry } from '../stores/caisse'

const route = useRoute()
const router = useRouter()
const notification = useNotification()
const caisseStore = useCaisseStore()

const caisse = ref<Caisse | null>(null)
const defineBlockEnabled = ref(false)
const savingDefineBlock = ref(false)
const isLoading = ref(false)
const error = ref<string | null>(null)
const transactions = ref<Transaction[]>([])
const transactionsLoading = ref(false)

const adminPaymentMode = ref('moov')
const adminPhoneLocal = ref('')
const adminPartialAmount = ref<number | null>(null)
const adminActionLoading = ref(false)
const adminActionType = ref<'withdrawal' | 'cancellation' | 'partial' | null>(null)
const showAdminConfirmModal = ref(false)
const pendingAdminAction = ref<'withdrawal' | 'cancellation' | 'partial' | null>(null)

const PAYMENT_MODE_LABELS: Record<string, string> = {
  moov: 'MOOV',
  mtn: 'MTN',
  celtis: 'Celtis',
}

const adminPaymentModeLabel = computed(
  () => PAYMENT_MODE_LABELS[adminPaymentMode.value] || adminPaymentMode.value,
)

const adminConfirmTitle = computed(() => {
  switch (pendingAdminAction.value) {
    case 'withdrawal':
      return 'Confirmer le retrait complet'
    case 'cancellation':
      return "Confirmer l'annulation"
    case 'partial':
      return 'Confirmer le retrait partiel'
    default:
      return 'Confirmer la demande'
  }
})

const adminConfirmDescription = computed(() => {
  switch (pendingAdminAction.value) {
    case 'withdrawal':
      return 'Vous allez créer une demande de retrait complet pour le propriétaire de cette caisse.'
    case 'cancellation':
      return "Vous allez créer une demande d'annulation pour le propriétaire de cette caisse."
    case 'partial':
      return 'Vous allez créer une demande de retrait partiel pour le propriétaire de cette caisse.'
    default:
      return 'Confirmez la création de cette demande.'
  }
})

const adminConfirmButtonLabel = computed(() => {
  switch (pendingAdminAction.value) {
    case 'withdrawal':
      return 'Créer le retrait'
    case 'cancellation':
      return "Créer l'annulation"
    case 'partial':
      return 'Créer le retrait partiel'
    default:
      return 'Confirmer'
  }
})

const adminConfirmHeaderClass = computed(() => {
  switch (pendingAdminAction.value) {
    case 'cancellation':
      return 'bg-red-50 border-red-100 text-red-900'
    case 'partial':
      return 'bg-blue-50 border-blue-100 text-blue-900'
    default:
      return 'bg-indigo-50 border-indigo-100 text-indigo-900'
  }
})

const adminConfirmNoticeClass = computed(() => {
  switch (pendingAdminAction.value) {
    case 'cancellation':
      return 'bg-red-50 text-red-800 border border-red-100'
    case 'partial':
      return 'bg-blue-50 text-blue-800 border border-blue-100'
    default:
      return 'bg-amber-50 text-amber-800 border border-amber-100'
  }
})

const adminConfirmButtonClass = computed(() => {
  switch (pendingAdminAction.value) {
    case 'cancellation':
      return 'bg-red-600 hover:bg-red-700 text-white border-red-600'
    case 'partial':
      return 'btn-primary'
    default:
      return 'btn-primary'
  }
})

const canAdminWithdraw = computed(() => {
  if (!caisse.value?.personal || caisse.value.has_pending_withdrawal) return false
  return caisse.value.status === 'done'
})

const canAdminCancel = computed(() => {
  if (!caisse.value?.personal || caisse.value.has_pending_withdrawal) return false
  return caisse.value.status === 'pending'
})

const canAdminPartial = computed(() => {
  if (!caisse.value?.personal || caisse.value.has_pending_withdrawal) return false
  return caisse.value.status === 'done' || caisse.value.status === 'pending'
})

const showPartialAmountField = computed(() => canAdminPartial.value)

const buildAdminPayload = () => {
  if (!caisse.value) throw new Error('Caisse introuvable')
  const local = adminPhoneLocal.value.replace(/\D/g, '')
  if (local.length < 8) {
    throw new Error('Numéro de téléphone invalide (8 chiffres minimum après 229).')
  }
  return {
    caisse_id: caisse.value.id,
    payment_mode: adminPaymentMode.value,
    phone: `229${local}`,
  }
}

const openAdminConfirmModal = (action: 'withdrawal' | 'cancellation' | 'partial') => {
  if (!caisse.value) return

  try {
    buildAdminPayload()
  } catch (err) {
    notification.addNotification(err instanceof Error ? err.message : 'Erreur', 'error')
    return
  }

  if (action === 'partial') {
    const amount = adminPartialAmount.value
    if (!amount || amount <= 0) {
      notification.addNotification('Indiquez un montant brut valide pour le retrait partiel.', 'error')
      return
    }
  }

  pendingAdminAction.value = action
  showAdminConfirmModal.value = true
}

const closeAdminConfirmModal = () => {
  if (adminActionLoading.value) return
  showAdminConfirmModal.value = false
  pendingAdminAction.value = null
}

const confirmAdminAction = async () => {
  if (!caisse.value || !pendingAdminAction.value) return

  const action = pendingAdminAction.value

  try {
    adminActionLoading.value = true
    adminActionType.value = action
    const payload = buildAdminPayload()
    let result: { id?: number }

    if (action === 'withdrawal') {
      result = await caisseStore.createAdminWithdrawal(payload)
      notification.addNotification(`Demande de retrait créée (#${result.id})`, 'success')
    } else if (action === 'cancellation') {
      result = await caisseStore.createAdminCancellation(payload)
      notification.addNotification(`Demande d'annulation créée (#${result.id})`, 'success')
    } else {
      result = await caisseStore.createAdminPartialWithdrawal({
        ...payload,
        amount: adminPartialAmount.value as number,
      })
      notification.addNotification(`Retrait partiel créé (#${result.id})`, 'success')
    }

    showAdminConfirmModal.value = false
    pendingAdminAction.value = null

    await Promise.all([
      loadCaisse(),
      loadTransactions(),
      action === 'partial'
        ? loadBalanceHistory(caisseStore.balanceHistoryPage)
        : Promise.resolve(),
    ])

    if (result.id) {
      router.push({ name: 'transaction-details', params: { id: String(result.id) } })
    }
  } catch (err) {
    notification.addNotification(err instanceof Error ? err.message : 'Erreur', 'error')
  } finally {
    adminActionLoading.value = false
    adminActionType.value = null
  }
}

const initAdminPhoneFromCaisse = (c: Caisse) => {
  const raw = (c.created_by.phone || '').replace(/\D/g, '')
  adminPhoneLocal.value = raw.startsWith('229') ? raw.slice(3) : raw
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR')
}

const formatDateTime = (dateString: string) => {
  return new Date(dateString).toLocaleString('fr-FR')
}

const formatCurrency = (amount: number | string) => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return numAmount.toLocaleString('fr-FR') + ' XOF'
}

const formatFrequence = (frequence: string) => {
  const labels: Record<string, string> = {
    all_days: 'Tous les jours',
    all_week: 'Toutes les semaines',
    all_month: 'Tous les mois',
    custom: 'Personnalisée'
  }
  return labels[frequence] || frequence
}

const loadBalanceHistory = async (page = 1) => {
  if (!caisse.value) return
  try {
    await caisseStore.fetchBalanceHistory(caisse.value.id, page)
  } catch {
    notification.addNotification("Erreur lors du chargement de l'historique du solde", 'error')
  }
}

// ── Balance history helpers ───────────────────────────────────────
const reasonBadgeClass = (reason: BalanceHistoryEntry['reason']): string => {
  const map: Record<string, string> = {
    deposit: 'bg-green-100 text-green-800',
    withdrawal: 'bg-orange-100 text-orange-800',
    cancellation: 'bg-red-100 text-red-800',
    adjustment: 'bg-blue-100 text-blue-800',
    unknown: 'bg-gray-100 text-gray-600'
  }
  return map[reason] ?? map.unknown
}

const reasonIcon = (reason: BalanceHistoryEntry['reason']): string => {
  const map: Record<string, string> = {
    deposit: 'fas fa-arrow-down',
    withdrawal: 'fas fa-arrow-up',
    cancellation: 'fas fa-times',
    adjustment: 'fas fa-sliders-h',
    unknown: 'fas fa-question'
  }
  return map[reason] ?? map.unknown
}

const triggeredByInitials = (user: NonNullable<BalanceHistoryEntry['triggered_by']>): string => {
  const f = user.first_name?.charAt(0)?.toUpperCase() ?? ''
  const l = user.last_name?.charAt(0)?.toUpperCase() ?? ''
  return f + l || user.email.charAt(0).toUpperCase()
}

const truncateRef = (ref: string): string => {
  return ref.length > 18 ? ref.slice(0, 15) + '…' : ref
}

const saveDefineBlock = async () => {
  if (!caisse.value) return
  const nextValue = defineBlockEnabled.value
  const previousValue = caisse.value.define_block === true
  if (nextValue === previousValue) return

  try {
    savingDefineBlock.value = true
    const updated = await caisseStore.updateCaisseDefineBlock(caisse.value.id, nextValue)
    caisse.value = { ...caisse.value, ...updated, define_block: nextValue }
    notification.addNotification(
      nextValue ? 'Caisse bloquée définitivement' : 'Blocage définitif désactivé',
      'success',
    )
  } catch (err) {
    defineBlockEnabled.value = previousValue
    notification.addNotification(
      err instanceof Error ? err.message : 'Erreur lors de la mise à jour',
      'error',
    )
  } finally {
    savingDefineBlock.value = false
  }
}

const loadCaisse = async () => {
  const caisseId = route.params.id as string
  if (!caisseId) {
    error.value = 'ID de caisse manquant'
    return
  }

  try {
    isLoading.value = true
    error.value = null

    // Récupérer la caisse via son point de terminaison de détail direct
    const response = await fetchWithAuth(`/box/caisse/${caisseId}`)
    
    caisse.value = await handleApiResponse(
      response,
      'Erreur lors de la récupération de la caisse'
    )
    defineBlockEnabled.value = caisse.value?.define_block === true
    if (caisse.value) initAdminPhoneFromCaisse(caisse.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    notification.addNotification(error.value, 'error')
  } finally {
    isLoading.value = false
  }
}

const loadTransactions = async () => {
  if (!caisse.value) return

  try {
    transactionsLoading.value = true

    const response = await fetchWithAuth('/box/all-transaction', {
      queryParams: {
        caisse_id: caisse.value.id.toString()
      }
    })

    const data = await handleApiResponse<{ results?: typeof transactions.value }>(
      response,
      'Erreur lors de la récupération des transactions'
    )
    transactions.value = data.results || []
  } catch (err) {
    notification.addNotification(
      err instanceof Error ? err.message : 'Erreur lors de la récupération des transactions',
      'error'
    )
  } finally {
    transactionsLoading.value = false
  }
}

onMounted(async () => {
  await loadCaisse()
  if (caisse.value) {
    await Promise.all([
      loadTransactions(),
      loadBalanceHistory(1)
    ])
  }
})
</script>

<style scoped>
.badge {
  @apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium;
}

.btn {
  @apply inline-flex items-center px-4 py-2 border border-transparent rounded-md font-medium text-sm transition-colors;
}

.btn-outline {
  @apply border-gray-300 text-gray-700 bg-white hover:bg-gray-50;
}

.btn-sm {
  @apply px-3 py-1.5 text-xs;
}

.btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}
</style>

