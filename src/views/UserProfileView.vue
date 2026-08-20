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
              <span
                v-if="user.credit_score != null"
                class="px-2 py-1 text-xs font-semibold rounded-full"
                :class="creditScoreBadgeClass(user.credit_score_grade)"
              >
                Credit Score {{ user.credit_score }}
                <span v-if="user.credit_score_grade">· {{ user.credit_score_grade }}</span>
              </span>
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
                user.agent_client ? 'bg-primary-100 text-primary-800' : 'bg-gray-100 text-gray-800'
              ]">
                {{ user.agent_client ? 'Agent' : 'Client' }}
              </span>
              <span :class="[
                'px-3 py-1 inline-flex items-center text-sm leading-5 font-semibold rounded-full',
                isAccountVerified ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              ]">
                <i :class="['fas mr-1', isAccountVerified ? 'fa-user-check' : 'fa-user-clock']"></i>
                {{ isAccountVerified ? 'Compte Vérifié' : 'Compte Non Vérifié' }}
              </span>
              <span :class="[
                'px-3 py-1 inline-flex items-center text-sm leading-5 font-semibold rounded-full',
                kycBadgeClass
              ]">
                <i :class="['fas mr-1', kycBadgeIcon]"></i>
                {{ kycBadgeLabel }}
              </span>
              <span v-if="user.is_suspect"
                class="px-3 py-1 inline-flex items-center text-sm leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300">
                <i class="fas fa-exclamation-triangle mr-1"></i>
                SUSPECT
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
            :class="user.agent_client ? 'border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100' : 'border-primary-300 bg-primary-50 text-primary-dark hover:bg-primary-100'">
            <i :class="['fas mr-2', user.agent_client ? 'fa-user-minus' : 'fa-user-tie']"></i>
            {{ user.agent_client ? 'Retirer Agent' : 'Nommer Agent' }}
          </button>

          <!-- Réinitialiser PIN -->
          <button @click="handleResetPin" :disabled="actionLoading"
            class="flex items-center justify-center px-4 py-3 border border-purple-300 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-key mr-2"></i>
            Réinitialiser PIN
          </button>

          <!-- Envoyer OTP PIN — uniquement si compte bloqué -->
          <button v-if="user.is_block" @click="handleSendPinVerificationOtp" :disabled="actionLoading"
            class="flex items-center justify-center px-4 py-3 border border-cyan-300 bg-cyan-50 text-cyan-700 rounded-lg hover:bg-cyan-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-mobile-alt mr-2"></i>
            Envoyer OTP PIN
          </button>

          <!-- Mettre à jour KYC -->
          <button @click="openKycModal" :disabled="actionLoading"
            class="flex items-center justify-center px-4 py-3 border border-primary-300 bg-primary-50 text-primary-dark rounded-lg hover:bg-primary-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
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
          <button v-if="user.is_active === false" @click="handleActivateUser" :disabled="actionLoading"
            class="flex items-center justify-center px-4 py-3 border border-emerald-300 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-check-circle mr-2"></i>
            Activer Compte
          </button>

          <!-- Admin KYC Verify — uniquement si KYC non vérifié -->
          <button v-if="user.status !== 'accept'" @click="openAdminKycModal" :disabled="actionLoading"
            class="flex items-center justify-center px-4 py-3 border border-primary-300 bg-primary-50 text-primary-dark rounded-lg hover:bg-primary-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-shield-alt mr-2"></i>
            Vérifier KYC (Admin)
          </button>

          <!-- Voir Wallet -->
          <button @click="viewUserWallet" :disabled="actionLoading"
            class="flex items-center justify-center px-4 py-3 border border-teal-300 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-wallet mr-2"></i>
            Voir Wallet
          </button>

          <!-- Attribuer un bonus -->
          <button @click="showGrantBonusModal = true" :disabled="actionLoading"
            class="flex items-center justify-center px-4 py-3 border border-amber-300 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-award mr-2"></i>
            Attribuer un bonus
          </button>

          <!-- Voir Photos KYC — uniquement si KYC approuvé et photos disponibles -->
          <button
            v-if="user.status === 'accept' && user.user_cards && user.user_cards.length > 0"
            @click="showKycImagesModal = true"
            :disabled="actionLoading"
            class="flex items-center justify-center px-4 py-3 border border-green-300 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed">
            <i class="fas fa-images mr-2"></i>
            Photos KYC
          </button>

          <!-- Marquer / Retirer Suspect -->
          <button @click="openSuspectModal" :disabled="actionLoading"
            class="flex items-center justify-center px-4 py-3 border rounded-lg transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            :class="user.is_suspect ? 'border-yellow-400 bg-yellow-50 text-yellow-800 hover:bg-yellow-100' : 'border-yellow-300 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'">
            <i class="fas fa-exclamation-triangle mr-2"></i>
            {{ user.is_suspect ? 'Retirer Suspect' : 'Marquer Suspect' }}
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
            <label class="block text-sm font-medium text-gray-700 mb-1">Dernière connexion</label>
            <p class="text-gray-900">{{ user.last_login ? formatDateTime(user.last_login) : 'Jamais' }}</p>
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

      <!-- Credit Score BOX -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <i class="fas fa-gauge-high mr-2 text-primary"></i>
            Credit Score BOX
          </h3>
          <button
            @click="recalculateCreditScore"
            :disabled="creditScoreLoading"
            class="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1.5"
          >
            <i class="fas" :class="creditScoreLoading ? 'fa-spinner fa-spin' : 'fa-sync'"></i>
            Recalculer
          </button>
        </div>
        <div class="flex flex-wrap items-end gap-6 mb-4">
          <div>
            <p class="text-sm text-gray-500 mb-1">Score</p>
            <p class="text-4xl font-bold" :class="creditScoreTextClass(creditScoreDetail?.grade || user.credit_score_grade)">
              {{ creditScoreDetail?.score ?? user.credit_score ?? '—' }}
            </p>
            <p class="text-sm text-gray-600 mt-1">
              {{ creditScoreDetail?.grade || user.credit_score_grade || 'Non calculé' }}
            </p>
          </div>
          <div v-if="creditScoreDetail?.calculated_at" class="text-xs text-gray-400">
            Mis à jour : {{ formatDateTime(creditScoreDetail.calculated_at) }}
          </div>
        </div>
        <div
          v-if="creditScoreCriteria.length"
          class="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4"
        >
          <div
            v-for="row in creditScoreCriteria"
            :key="row.key"
            class="text-xs bg-gray-50 rounded px-3 py-2 flex justify-between gap-2"
          >
            <span class="text-gray-600">
              {{ row.label }}
              <span class="text-gray-400">({{ row.weight }}%)</span>
            </span>
            <span class="font-semibold text-gray-900">{{ row.subScore }}/100</span>
          </div>
        </div>
      </div>

      <!-- Engagement & valeur (pièces, badge, parrainage) -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <i class="fas fa-chart-pie mr-2 text-primary"></i>
            Engagement & valeur
          </h3>
          <button
            @click="loadPointsHistory"
            :disabled="pointsHistoryLoading"
            class="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1.5"
          >
            <i class="fas" :class="pointsHistoryLoading ? 'fa-spinner fa-spin' : 'fa-history'"></i>
            Historique pièces
          </button>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="bg-amber-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Pièces BOX</p>
            <p class="text-2xl font-bold text-amber-700">
              {{ user.total_points ?? 0 }}
            </p>
            <p v-if="user.points_to_next != null" class="text-xs text-gray-500 mt-1">
              {{ user.points_to_next }} avant {{ user.next_level?.label || 'prochain niveau' }}
            </p>
          </div>
          <div class="bg-yellow-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Badge actuel</p>
            <p class="text-2xl font-bold text-yellow-700">
              {{ user.points_level?.label || '—' }}
            </p>
            <p v-if="user.achieved_levels?.length" class="text-xs text-gray-500 mt-1">
              {{ user.achieved_levels.length }} palier(s) atteints
            </p>
          </div>
          <div class="bg-primary-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Filleuls</p>
            <p class="text-2xl font-bold text-primary-dark">
              {{ user.number_sponsor ?? 0 }}
            </p>
            <p class="text-xs text-gray-500 mt-1">Inscrits avec son code</p>
          </div>
          <div class="bg-emerald-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Revenus BOX (parrainage)</p>
            <p class="text-2xl font-bold text-emerald-700">
              {{ formatAmount(user.referral_revenue_for_box ?? 0) }}
            </p>
            <p class="text-xs text-gray-500 mt-1">
              Commissions sur activité des filleuls
            </p>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-3">
          Bonus versés à cet utilisateur :
          <span class="font-medium text-gray-700">{{ formatAmount(user.referral_bonus_attributed ?? 0) }}</span>
          (coût BOX, distinct du revenu ci-dessus)
        </p>

        <div v-if="showPointsHistory" class="mt-5 border-t pt-4">
          <h4 class="text-sm font-semibold text-gray-800 mb-3">Historique des pièces BOX</h4>
          <div v-if="pointsHistoryLoading" class="text-center py-6 text-gray-400">
            <i class="fas fa-spinner fa-spin"></i>
          </div>
          <div v-else-if="pointsHistory.length === 0" class="text-center py-6 text-gray-400 text-sm">
            Aucun mouvement de pièces
          </div>
          <div v-else class="overflow-x-auto">
            <table class="min-w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-3 py-2 text-left text-xs text-gray-500">Date</th>
                  <th class="px-3 py-2 text-left text-xs text-gray-500">Action</th>
                  <th class="px-3 py-2 text-left text-xs text-gray-500">Points</th>
                  <th class="px-3 py-2 text-left text-xs text-gray-500">Solde après</th>
                  <th class="px-3 py-2 text-left text-xs text-gray-500">Détail</th>
                </tr>
              </thead>
              <tbody class="divide-y">
                <tr v-for="row in pointsHistory" :key="row.id">
                  <td class="px-3 py-2 whitespace-nowrap">{{ formatDateTime(row.created_at) }}</td>
                  <td class="px-3 py-2 font-mono text-xs">{{ row.action_code }}</td>
                  <td class="px-3 py-2" :class="Number(row.points) >= 0 ? 'text-green-600' : 'text-red-600'">
                    {{ Number(row.points) >= 0 ? '+' : '' }}{{ row.points }}
                  </td>
                  <td class="px-3 py-2 font-medium">{{ row.balance_after }}</td>
                  <td class="px-3 py-2 text-gray-500 truncate max-w-xs">{{ row.description || '—' }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-if="user.achieved_levels?.length" class="mt-4">
            <p class="text-xs font-semibold text-gray-600 mb-2">Paliers atteints</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="lvl in user.achieved_levels"
                :key="lvl.code || lvl.id"
                class="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
              >
                {{ lvl.label }}
                <span v-if="lvl.min_points != null" class="text-gray-400">({{ lvl.min_points }} pts)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Historique KYC -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-lg font-semibold text-gray-900 flex items-center">
            <i class="fas fa-id-card mr-2 text-primary"></i>
            Historique KYC
            <span v-if="kycStatus2FA && kycStatus2FA.history.length > 0" class="ml-2 text-xs font-normal text-gray-400">
              ({{ kycStatus2FA.history.length }} demande{{ kycStatus2FA.history.length > 1 ? 's' : '' }})
            </span>
          </h3>
          <button
            @click="loadKycHistory"
            :disabled="kycHistoryLoading"
            class="text-xs px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 flex items-center gap-1.5"
          >
            <i class="fas" :class="kycHistoryLoading ? 'fa-spinner fa-spin' : 'fa-sync'"></i>
            Actualiser
          </button>
        </div>

        <!-- Loading -->
        <div v-if="kycHistoryLoading && !kycStatus2FA" class="text-center py-10">
          <i class="fas fa-spinner fa-spin text-2xl text-primary"></i>
        </div>

        <!-- Pas de données KYC -->
        <div v-else-if="!kycStatus2FA" class="text-center py-10 text-gray-400">
          <i class="fas fa-id-card text-4xl mb-3"></i>
          <p class="text-sm">Aucune donnée KYC disponible pour cet utilisateur</p>
        </div>

        <div v-else class="space-y-5">
          <!-- Statut actuel en-tête -->
          <div class="flex flex-wrap items-center gap-3 p-4 rounded-lg border"
            :class="{
              'bg-green-50 border-green-200': kycStatus2FA.status === 'accept',
              'bg-yellow-50 border-yellow-200': kycStatus2FA.status === 'pending',
              'bg-red-50 border-red-200': kycStatus2FA.status === 'reject',
              'bg-gray-50 border-gray-200': !kycStatus2FA.status
            }"
          >
            <div>
              <p class="text-xs text-gray-500 mb-1">Statut actuel</p>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold"
                :class="getKycStatusClass(kycStatus2FA.status)"
              >
                <i class="fas" :class="{
                  'fa-check-circle': kycStatus2FA.status === 'accept',
                  'fa-clock': kycStatus2FA.status === 'pending',
                  'fa-times-circle': kycStatus2FA.status === 'reject',
                  'fa-question-circle': !kycStatus2FA.status
                }"></i>
                {{ getKycStatusLabel(kycStatus2FA.status) }}
              </span>
            </div>
            <div v-if="kycStatus2FA.card_id">
              <p class="text-xs text-gray-500 mb-1">N° pièce</p>
              <p class="font-mono font-semibold text-gray-800 text-sm">{{ kycStatus2FA.card_id }}</p>
            </div>
            <div v-if="kycStatus2FA.rejection_reason" class="w-full">
              <p class="text-xs text-gray-500 mb-1">Raison du rejet</p>
              <p class="text-sm text-red-700 bg-white bg-opacity-70 px-3 py-2 rounded border border-red-200">{{ kycStatus2FA.rejection_reason }}</p>
            </div>
          </div>

          <!-- Tableau historique des demandes -->
          <div>
            <p class="text-sm font-medium text-gray-700 mb-3">
              <i class="fas fa-history mr-1.5 text-gray-400"></i>
              Toutes les demandes
            </p>
            <div class="space-y-4">
              <div
                v-for="(req, index) in kycStatus2FA.history"
                :key="req.id"
                class="border rounded-lg overflow-hidden"
                :class="{
                  'border-green-200': req.status === 'verified',
                  'border-red-200': req.status === 'rejected',
                  'border-yellow-200': ['pending','in_review','needs_revision'].includes(req.status),
                  'border-gray-200': !req.status
                }"
              >
                <!-- Request header -->
                <div class="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
                  :class="{
                    'bg-green-50': req.status === 'verified',
                    'bg-red-50': req.status === 'rejected',
                    'bg-yellow-50': ['pending','in_review','needs_revision'].includes(req.status),
                    'bg-gray-50': !req.status
                  }"
                >
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-medium text-gray-400">#{{ kycStatus2FA.history.length - index }}</span>
                    <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
                      :class="kycReqStatusClass(req.status)"
                    >
                      <i class="fas" :class="kycReqStatusIcon(req.status)"></i>
                      {{ kycReqStatusLabel(req.status) }}
                    </span>
                    <span v-if="index === 0" class="text-xs px-2 py-0.5 bg-primary-100 text-primary-dark rounded-full font-medium">Dernière</span>
                  </div>
                  <div class="flex items-center gap-4 text-xs text-gray-500">
                    <span v-if="req.submitted_at">
                      <i class="fas fa-paper-plane mr-1"></i>
                      {{ formatDateTime(req.submitted_at) }}
                    </span>
                    <span v-if="req.reviewed_at">
                      <i class="fas fa-check mr-1"></i>
                      Révisée : {{ formatDateTime(req.reviewed_at) }}
                    </span>
                  </div>
                </div>

                <!-- Request body -->
                <div class="p-4 space-y-3">
                  <!-- Reviewer info + notes -->
                  <div class="flex flex-wrap gap-4 text-sm">
                    <div v-if="req.reviewed_by_email">
                      <p class="text-xs text-gray-500">Révisé par</p>
                      <p class="font-medium text-gray-800">{{ req.reviewed_by_email }}</p>
                    </div>
                    <div v-if="req.rejection_reason">
                      <p class="text-xs text-gray-500">Raison du rejet</p>
                      <p class="text-red-700 bg-red-50 px-2 py-1 rounded text-xs mt-0.5 max-w-sm">{{ req.rejection_reason }}</p>
                    </div>
                    <div v-if="req.review_notes">
                      <p class="text-xs text-gray-500">Notes</p>
                      <p class="text-gray-700 bg-gray-50 px-2 py-1 rounded text-xs mt-0.5 max-w-sm">{{ req.review_notes }}</p>
                    </div>
                  </div>

                  <!-- Documents de cette demande -->
                  <div v-if="req.documents && req.documents.length > 0">
                    <p class="text-xs text-gray-500 mb-2">Documents</p>
                    <div class="flex flex-wrap gap-3">
                      <div
                        v-for="doc in req.documents"
                        :key="doc.id"
                        class="relative group cursor-pointer rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary transition-colors w-28 h-20 flex-shrink-0"
                        @click="selectedKycImage = doc.file_url"
                      >
                        <img
                          :src="doc.file_url"
                          :alt="doc.document_type"
                          class="w-full h-full object-cover"
                          @error="handleKycImgError($event)"
                        />
                        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                          <i class="fas fa-search-plus text-white opacity-0 group-hover:opacity-100 drop-shadow"></i>
                        </div>
                        <div class="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white text-[10px] text-center py-0.5 px-1 leading-tight">
                          {{ kycDocTypeLabel(doc.document_type) }}
                        </div>
                        <div v-if="doc.is_verified" class="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <i class="fas fa-check text-white text-[8px]"></i>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
          <div class="bg-primary-50 p-4 rounded-lg">
            <p class="text-sm text-gray-600 mb-1">Solde actuel (Wallet)</p>
            <p class="text-2xl font-bold text-primary">
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
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                <td class="px-4 py-3 whitespace-nowrap text-sm">
                  <div class="flex flex-wrap gap-2">
                    <router-link
                      :to="{ name: 'caisse-details', params: { id: caisse.id.toString() } }"
                      class="inline-flex items-center px-2.5 py-1 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <i class="fas fa-eye mr-1"></i> Détails
                    </router-link>
                    <button
                      type="button"
                      class="inline-flex items-center px-2.5 py-1 text-xs font-medium text-primary bg-white border border-primary/30 rounded-md hover:bg-primary/5"
                      @click="openCaisseBalanceHistory(caisse)"
                    >
                      <i class="fas fa-history mr-1"></i> Historique
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <CaisseBalanceHistoryModal
      v-model="showCaisseBalanceHistoryModal"
      :caisse-id="selectedCaisseHistoryId"
      :caisse-name="selectedCaisseHistoryName"
    />

    <GrantBonusModal
      :show="showGrantBonusModal"
      :preset-emails="user ? [user.email] : []"
      hide-emails
      @close="showGrantBonusModal = false"
      @success="loadUserInfo"
    />

    <!-- Historique des blocages -->
    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <i class="fas fa-history mr-2 text-primary"></i>
        Historique des blocages
      </h3>
      <div v-if="blockHistoryStore.isLoading" class="text-center py-8">
        <i class="fas fa-spinner fa-spin text-2xl text-primary"></i>
      </div>
      <div v-else-if="blockHistoryStore.history.length === 0" class="text-center py-8 text-gray-500">
        Aucun historique de blocage
      </div>
      <div v-else class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Événement</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Raison</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Détail</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Effectué par</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="entry in blockHistoryStore.history" :key="entry.id">
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                {{ formatDateTime(entry.created_at) }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="[
                  'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                  entry.event === 'blocked' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                ]">
                  <i :class="['fas mr-1', entry.event === 'blocked' ? 'fa-lock' : 'fa-unlock']"></i>
                  {{ entry.event_label }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                {{ entry.reason_label }}
              </td>
              <td class="px-4 py-3 text-sm text-gray-500 max-w-xs" :title="entry.reason_detail">
                {{ entry.reason_detail }}
              </td>
              <td class="px-4 py-3 whitespace-nowrap">
                <span :class="[
                  'px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full',
                  entry.is_automatic ? 'bg-yellow-100 text-yellow-800' : 'bg-primary-100 text-primary-800'
                ]">
                  {{ entry.is_automatic ? 'Automatique' : 'Manuel' }}
                </span>
              </td>
              <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                <span v-if="entry.performed_by">
                  {{ entry.performed_by.full_name }}
                  <span class="text-xs text-gray-400 block">{{ entry.performed_by.email }}</span>
                </span>
                <span v-else class="text-gray-400">Système</span>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- Pagination -->
        <div v-if="blockHistoryStore.count > blockHistoryStore.pageSize" class="flex items-center justify-between px-4 py-3 border-t border-gray-200">
          <p class="text-sm text-gray-700">
            Page {{ blockHistoryStore.currentPage }} sur {{ Math.ceil(blockHistoryStore.count / blockHistoryStore.pageSize) }}
          </p>
          <div class="flex gap-2">
            <button
              @click="blockHistoryStore.fetchBlockHistory(userId!, blockHistoryStore.currentPage - 1)"
              :disabled="blockHistoryStore.currentPage === 1"
              class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button
              @click="blockHistoryStore.fetchBlockHistory(userId!, blockHistoryStore.currentPage + 1)"
              :disabled="blockHistoryStore.currentPage * blockHistoryStore.pageSize >= blockHistoryStore.count"
              class="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
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
            <div class="bg-primary-50 p-4 rounded-lg">
              <p class="text-sm text-gray-600">Solde Actuel</p>
              <p class="text-2xl font-bold text-primary">
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

    <!-- Modal Photos KYC -->
    <Teleport to="body">
      <div v-if="showKycImagesModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-3xl mx-4 my-8">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-xl font-semibold text-gray-800">Photos KYC</h3>
            <button @click="showKycImagesModal = false" class="text-gray-400 hover:text-gray-600">
              <i class="fas fa-times text-xl"></i>
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div
              v-for="(url, index) in user.user_cards"
              :key="index"
              class="relative group cursor-pointer"
              @click="selectedKycImage = url"
            >
              <img
                :src="url"
                :alt="`Photo KYC ${index + 1}`"
                class="w-full h-56 object-cover rounded-lg border border-gray-200 hover:border-primary transition-colors"
              />
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-opacity flex items-center justify-center">
                <i class="fas fa-search-plus text-white opacity-0 group-hover:opacity-100 text-2xl transition-opacity"></i>
              </div>
              <p class="text-xs text-gray-500 mt-1 text-center">
                {{ index === 0 ? 'Pièce d\'identité' : 'Selfie' }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Visionneuse image KYC plein écran -->
    <Teleport to="body">
      <div v-if="selectedKycImage" class="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-95" @click="selectedKycImage = null">
        <button @click="selectedKycImage = null" class="absolute top-4 right-4 text-white bg-black bg-opacity-70 rounded-full p-3 hover:bg-opacity-90 z-10">
          <i class="fas fa-times text-xl"></i>
        </button>
        <img
          :src="selectedKycImage"
          alt="Photo KYC"
          class="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl"
          @click.stop
        />
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

    <!-- Modal Suspect -->
    <Teleport to="body">
      <div v-if="showSuspectModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
              <i class="fas fa-exclamation-triangle text-yellow-600"></i>
            </div>
            <h3 class="text-lg font-semibold text-gray-900">
              {{ user?.is_suspect ? 'Retirer le marquage suspect' : 'Marquer comme suspect' }}
            </h3>
          </div>

          <p class="text-sm text-gray-600 mb-4">
            {{ user?.is_suspect
              ? `Confirmer le retrait du marquage suspect pour ${user?.first_name} ${user?.last_name}. Les transactions déjà flagguées restent inchangées.`
              : `Marquer ${user?.first_name} ${user?.last_name} comme suspect. Les prochaines transactions seront flagguées.`
            }}
          </p>

          <!-- Champ raison (uniquement pour marquer) -->
          <div v-if="!user?.is_suspect" class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Raison <span class="text-gray-400">(optionnel)</span>
            </label>
            <textarea
              v-model="suspectReason"
              rows="3"
              placeholder="Ex: Activité inhabituelle détectée..."
              class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 text-sm"
            ></textarea>
          </div>

          <!-- Info raison existante (pour démarquer) -->
          <div v-if="user?.is_suspect && user?.suspect_reason" class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p class="text-xs text-gray-500 mb-1">Raison du marquage actuel</p>
            <p class="text-sm text-gray-800">{{ user.suspect_reason }}</p>
            <p v-if="user.suspect_marked_at" class="text-xs text-gray-400 mt-1">
              {{ new Date(user.suspect_marked_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
            </p>
          </div>

          <div class="flex justify-end gap-3">
            <button @click="showSuspectModal = false" class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 text-sm">
              Annuler
            </button>
            <button
              @click="handleToggleSuspect"
              :disabled="actionLoading"
              class="px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              :class="user?.is_suspect ? 'bg-gray-700 text-white hover:bg-gray-800' : 'bg-yellow-500 text-white hover:bg-yellow-600'"
            >
              <i v-if="actionLoading" class="fas fa-spinner fa-spin mr-1"></i>
              {{ user?.is_suspect ? 'Retirer le suspect' : 'Confirmer marquage' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ApiRequestError, fetchWithAuth, handleApiResponse } from '../stores/fetchwithtoken'
import { formatCurrency, formatAmount } from '../utils/currency'
import { useNotification } from '../services/notification'
import { useUsersStore } from '../stores/users'
import { useWalletsStore } from '../stores/wallets'
import { useUploadStore } from '../stores/upload'
import { useBlockHistoryStore } from '../stores/blockHistory'
import ConfirmationModal from '../components/ConfirmationModal.vue'
import CaisseBalanceHistoryModal from '../components/CaisseBalanceHistoryModal.vue'
import GrantBonusModal from '../components/GrantBonusModal.vue'

const route = useRoute()
const router = useRouter()
const notification = useNotification()
const usersStore = useUsersStore()
const walletsStore = useWalletsStore()
const uploadStore = useUploadStore()
const blockHistoryStore = useBlockHistoryStore()

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

const showCaisseBalanceHistoryModal = ref(false)
const showGrantBonusModal = ref(false)
const selectedCaisseHistoryId = ref<number | null>(null)
const selectedCaisseHistoryName = ref('')

const openCaisseBalanceHistory = (caisse: { id: number; name?: string }) => {
  selectedCaisseHistoryId.value = caisse.id
  selectedCaisseHistoryName.value = caisse.name || `Caisse #${caisse.id}`
  showCaisseBalanceHistoryModal.value = true
}

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

// KYC Images Modal State
const showKycImagesModal = ref(false)
const selectedKycImage = ref<string | null>(null)

// Suspect Modal State
const showSuspectModal = ref(false)
const suspectReason = ref('')

function openSuspectModal() {
  suspectReason.value = ''
  showSuspectModal.value = true
}

async function handleToggleSuspect() {
  if (!user.value) return
  try {
    actionLoading.value = true
    const body: Record<string, string> = { user_id: String(user.value.id) }
    if (!user.value.is_suspect && suspectReason.value.trim()) {
      body.reason = suspectReason.value.trim()
    }
    const response = await fetchWithAuth('/auth/toggle-suspect/', {
      method: 'POST',
      body
    })
    const data = await handleApiResponse<{ user: typeof user.value }>(
      response,
      'Erreur lors de la mise à jour'
    )
    user.value = data.user
    showSuspectModal.value = false
  } catch (err) {
    alert(err instanceof Error ? err.message : 'Erreur inattendue')
  } finally {
    actionLoading.value = false
  }
}

// KYC History State
interface KycDocument { document_type: string; url: string }
interface KycDocumentV2 {
  id: string
  document_type: string
  file_url: string
  expiry_date: string | null
  is_verified: boolean
  verification_notes: string | null
  created_at: string
  updated_at: string
}
interface KycRequest {
  id: string
  user: number
  user_email: string
  status: string
  submitted_at: string | null
  reviewed_at: string | null
  reviewed_by: number | null
  reviewed_by_email: string | null
  review_notes: string | null
  rejection_reason: string | null
  documents: KycDocumentV2[]
  created_at: string
  updated_at: string
}
interface KycStatusV2 {
  status: string | null
  card_id: string | null
  rejection_reason: string | null
  documents: KycDocument[]
  history: KycRequest[]
}
const kycStatus2FA = ref<KycStatusV2 | null>(null)
const kycHistoryLoading = ref(false)
const pointsHistoryLoading = ref(false)
const showPointsHistory = ref(false)
const pointsHistory = ref<Array<{
  id: number
  action_code: string
  points: number
  balance_after: number
  description?: string | null
  created_at: string
}>>([])
const creditScoreLoading = ref(false)
const creditScoreDetail = ref<{
  score: number
  grade: string
  breakdown?: Record<string, any>
  calculated_at?: string | null
} | null>(null)

const creditScoreCriteria = computed(() => {
  const breakdown = creditScoreDetail.value?.breakdown || {}
  return Object.entries(breakdown)
    .filter(([, v]) => v && typeof v === 'object' && 'sub_score' in (v as object))
    .map(([key, v]: [string, any]) => ({
      key,
      label: v.label || key,
      weight: v.weight_percent ?? 0,
      subScore: v.sub_score ?? 0,
    }))
})

function creditScoreBadgeClass(grade?: string | null) {
  if (grade === 'Excellent') return 'bg-emerald-100 text-emerald-800'
  if (grade === 'Bon') return 'bg-green-100 text-green-800'
  if (grade === 'Moyen') return 'bg-amber-100 text-amber-800'
  if (grade === 'Faible') return 'bg-orange-100 text-orange-800'
  if (grade === 'Risqué') return 'bg-red-100 text-red-800'
  return 'bg-primary-100 text-primary-800'
}

function creditScoreTextClass(grade?: string | null) {
  if (grade === 'Excellent') return 'text-emerald-700'
  if (grade === 'Bon') return 'text-green-700'
  if (grade === 'Moyen') return 'text-amber-700'
  if (grade === 'Faible') return 'text-orange-700'
  if (grade === 'Risqué') return 'text-red-700'
  return 'text-gray-800'
}

const isLegacyKycAccepted = computed(() => user.value?.status === 'accept')

const isKycV2Verified = computed(() => {
  if (isLegacyKycAccepted.value) return true
  const kyc = kycStatus2FA.value
  if (!kyc) return false
  if (kyc.status === 'accept' || kyc.status === 'verified') return true
  return kyc.history.some((req) => req.status === 'verified')
})

const isAccountVerified = computed(() => isLegacyKycAccepted.value || isKycV2Verified.value)

const kycBadgeLabel = computed(() => {
  if (isKycV2Verified.value) return 'KYC Vérifié'
  if (user.value?.status === 'pending' || kycStatus2FA.value?.status === 'pending') return 'KYC En attente'
  if (user.value?.status === 'reject' || kycStatus2FA.value?.status === 'reject') return 'KYC Rejeté'
  return 'KYC Non Vérifié'
})

const kycBadgeClass = computed(() => {
  if (isKycV2Verified.value) return 'bg-green-100 text-green-800'
  if (user.value?.status === 'pending' || kycStatus2FA.value?.status === 'pending') {
    return 'bg-yellow-100 text-yellow-800'
  }
  if (user.value?.status === 'reject' || kycStatus2FA.value?.status === 'reject') {
    return 'bg-red-100 text-red-800'
  }
  return 'bg-gray-100 text-gray-600'
})

const kycBadgeIcon = computed(() => {
  if (isKycV2Verified.value) return 'fa-id-card'
  if (user.value?.status === 'pending' || kycStatus2FA.value?.status === 'pending') return 'fa-clock'
  if (user.value?.status === 'reject' || kycStatus2FA.value?.status === 'reject') return 'fa-times-circle'
  return 'fa-id-card'
})

const kycDocTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    id_card: 'Carte d\'identité',
    passport: 'Passeport',
    driver_license: 'Permis',
    selfie: 'Selfie'
  }
  return labels[type] ?? type
}

const kycReqStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    verified: 'Vérifié',
    rejected: 'Rejeté',
    pending: 'En attente',
    in_review: 'En cours',
    needs_revision: 'À réviser'
  }
  return labels[status] ?? status
}

const kycReqStatusClass = (status: string): string => {
  const map: Record<string, string> = {
    verified: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    pending: 'bg-yellow-100 text-yellow-800',
    in_review: 'bg-primary-100 text-primary-800',
    needs_revision: 'bg-orange-100 text-orange-800'
  }
  return map[status] ?? 'bg-gray-100 text-gray-600'
}

const kycReqStatusIcon = (status: string): string => {
  const map: Record<string, string> = {
    verified: 'fa-check-circle',
    rejected: 'fa-times-circle',
    pending: 'fa-clock',
    in_review: 'fa-search',
    needs_revision: 'fa-exclamation-circle'
  }
  return map[status] ?? 'fa-question-circle'
}

const handleKycImgError = (e: Event) => {
  const img = e.target as HTMLImageElement
  img.style.display = 'none'
}

const loadKycHistory = async () => {
  if (!userId.value) return
  try {
    kycHistoryLoading.value = true
    const response = await fetchWithAuth('/auth/kyc/status/', {
      method: 'GET',
      queryParams: { user_id: userId.value.toString() }
    })
    const data = await handleApiResponse<{
      status?: string | null
      card_id?: string | null
      rejection_reason?: string | null
      documents?: KycDocument[]
      history?: KycRequest[]
    }>(response, 'Erreur lors du chargement de l\'historique KYC')
    kycStatus2FA.value = {
      status: data.status ?? null,
      card_id: data.card_id ?? null,
      rejection_reason: data.rejection_reason ?? null,
      documents: Array.isArray(data.documents) ? data.documents : [],
      history: Array.isArray(data.history) ? data.history : []
    }
  } catch (err) {
    console.error('Error loading KYC history:', err)
    kycStatus2FA.value = null
  } finally {
    kycHistoryLoading.value = false
  }
}

const loadPointsHistory = async () => {
  if (!userId.value) return
  showPointsHistory.value = true
  pointsHistoryLoading.value = true
  try {
    const response = await fetchWithAuth('/box/points/history', {
      queryParams: {
        user_id: userId.value.toString(),
        limit: '100',
      },
    })
    const data = await handleApiResponse<{ success?: boolean; data?: typeof pointsHistory.value }>(
      response,
      'Erreur chargement historique pièces'
    )
    pointsHistory.value = Array.isArray(data?.data) ? data.data : []
  } catch (err) {
    console.error('Error loading points history:', err)
    pointsHistory.value = []
    notification.addNotification(
      err instanceof Error ? err.message : 'Erreur historique pièces',
      'error'
    )
  } finally {
    pointsHistoryLoading.value = false
  }
}

const loadCreditScore = async () => {
  if (!userId.value) return
  creditScoreLoading.value = true
  try {
    const response = await fetchWithAuth(`/box/credit-score/${userId.value}/`, {
      method: 'GET',
    })
    creditScoreDetail.value = await handleApiResponse(
      response,
      'Erreur chargement Credit Score'
    )
  } catch (err) {
    console.error('Error loading credit score:', err)
  } finally {
    creditScoreLoading.value = false
  }
}

const recalculateCreditScore = async () => {
  if (!userId.value) return
  creditScoreLoading.value = true
  try {
    const response = await fetchWithAuth(
      `/box/credit-score/${userId.value}/recalculate/`,
      { method: 'POST' }
    )
    creditScoreDetail.value = await handleApiResponse(
      response,
      'Erreur recalcul Credit Score'
    )
    if (user.value && creditScoreDetail.value) {
      user.value.credit_score = creditScoreDetail.value.score
      user.value.credit_score_grade = creditScoreDetail.value.grade
    }
    notification.addNotification('Credit Score mis à jour', 'success')
  } catch (err) {
    notification.addNotification(
      err instanceof Error ? err.message : 'Erreur recalcul',
      'error'
    )
  } finally {
    creditScoreLoading.value = false
  }
}

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
    bonus: 'bg-primary-100 text-primary-800',
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
    completed: 'bg-primary-100 text-primary-800',
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

    user.value = await handleApiResponse(
      response,
      `Utilisateur avec l'ID ${userId.value} non trouvé`
    )

    // Charger toutes les données en parallèle
    await Promise.all([
      loadWalletBalance(),
      loadTransactions(),
      loadWalletTransactions(),
      loadCaisses(),
      blockHistoryStore.fetchBlockHistory(userId.value),
      loadKycHistory(),
      loadCreditScore(),
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

    const data = await handleApiResponse<{ success?: boolean; data?: typeof walletBalance.value }>(
      response,
      'Erreur lors de la récupération du solde wallet'
    )
    if (data.success && data.data) {
      walletBalance.value = data.data
    }
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) {
      walletBalance.value = null
      return
    }
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

    const data = await handleApiResponse<{ results?: typeof transactions.value }>(
      response,
      'Erreur lors de la récupération des transactions'
    )
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

    const data = await handleApiResponse<{ success?: boolean; data?: typeof walletTransactions.value }>(
      response,
      'Erreur lors de la récupération des transactions wallet'
    )
    if (data.success && data.data) {
      walletTransactions.value = data.data
    } else {
      walletTransactions.value = []
    }
  } catch (err) {
    if (err instanceof ApiRequestError && err.status === 404) {
      walletTransactions.value = []
      return
    }
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

    const data = await handleApiResponse<{ results?: typeof caisses.value } | typeof caisses.value>(
      response,
      'Erreur lors de la récupération des caisses'
    )
    // Gérer le format de réponse avec { count, next, previous, results: [...] }
    if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
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

