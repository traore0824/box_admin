<template>
  <div class="space-y-4 sm:space-y-6 px-2 sm:px-0">
    <!-- Header -->
    <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-xl sm:text-2xl font-bold text-gray-900 break-words">
        {{ isCustomerService ? 'Gestion des Messages de Rappel' : 'Paramètres Globaux' }}
      </h1>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>

    <!-- Error Message -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <p class="text-red-700">{{ error }}</p>
    </div>

    <!-- Settings Form -->
    <div v-if="settings" class="bg-white rounded-lg shadow overflow-hidden -mx-2 sm:mx-0">
      <form @submit.prevent="handleSubmit" class="divide-y divide-gray-200">
        <!-- Contact Information -->
        <div v-if="isStaff" class="p-3 sm:p-4 md:p-6">
          <h2 class="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-2 sm:mb-3 md:mb-4">Informations de contact</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Email support</label>
              <input 
                v-model="settings.email" 
                type="email" 
                maxlength="100"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone support</label>
              <input 
                v-model="settings.phone" 
                type="tel" 
                maxlength="120"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        <!-- Amount Settings -->
        <div v-if="isStaff" class="p-3 sm:p-4 md:p-6">
          <h2 class="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-2 sm:mb-3 md:mb-4">Paramètres des montants</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Montant minimum transaction</label>
              <input 
                v-model.number="settings.minimum_amount" 
                type="number" 
                step="0.01"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Montant minimum objectif caisse</label>
              <input 
                v-model.number="settings.minimum_amount_obj" 
                type="number" 
                step="0.01"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Bonus de parrainage</label>
              <input 
                v-model.number="settings.referral_bonus_amount" 
                type="number" 
                step="0.01"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nombre minimum de jours</label>
              <input 
                v-model.number="settings.minimum_days" 
                type="number" 
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Frais de Transaction sur les retrait</label>
              <input 
                v-model.number="settings.operation_fee" 
                type="number" 
                step="0.01"
                min="0"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Marge brute acquisition (%)</label>
              <p class="text-xs text-gray-500 mb-1">
                Utilisée pour LTV et Payback (ex. 70 = 70 %).
              </p>
              <input
                v-model.number="settings.acquisition_gross_margin_percent"
                type="number"
                step="0.01"
                min="0"
                max="100"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Credit Score — minimum</label>
              <input
                v-model.number="settings.credit_score_min"
                type="number"
                min="0"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Credit Score — maximum</label>
              <input
                v-model.number="settings.credit_score_max"
                type="number"
                min="1"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Montant minimum retrait commission</label>
              <input 
                v-model.number="settings.minimum_commission_withdrawal" 
                type="number" 
                step="0.01"
                min="0"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Montant minimum retrait caisse (XOF)</label>
              <p class="text-xs text-gray-500 mb-1">
                Solde brut minimum (montant déjà cotisé) pour lancer un retrait ou une annulation de caisse.
              </p>
              <input
                v-model.number="settings.minimum_withdrawal"
                type="number"
                step="1"
                min="0"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <!-- Commissions -->
        <div v-if="isStaff" class="p-3 sm:p-4 md:p-6">
          <h2 class="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-2 sm:mb-3 md:mb-4">Commissions (%)</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Commission sur Caisse libre annuler (%)</label>
              <input 
                v-model.number="settings.cancellation_commission" 
                type="number" 
                step="0.01"
                min="0"
                max="100"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Commission sur caisse Terminer (%)</label>
              <input 
                v-model.number="settings.done_commission" 
                type="number" 
                step="0.01"
                min="0"
                max="100"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Commission sur caisse bloquer annuler (%)</label>
              <input 
                v-model.number="settings.cancel_block_commission" 
                type="number" 
                step="0.01"
                min="0"
                max="100"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              />
            </div>
          </div>
        </div>

        <!-- Retraits partiels -->
        <div v-if="isStaff" class="p-3 sm:p-4 md:p-6">
          <h2 class="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-2 sm:mb-3 md:mb-4">Retraits partiels</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Autoriser les retraits partiels</label>
              <div class="mt-1">
                <label class="inline-flex items-center">
                  <input
                    v-model="settings.partial_withdrawal_enabled"
                    type="checkbox"
                    class="form-checkbox h-5 w-5 text-primary rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700">Activé</span>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Montant minimum retrait partiel (XOF)</label>
              <input
                v-model.number="settings.minimum_partial_withdrawal"
                type="number"
                step="1"
                min="0"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Solde minimum restant (XOF)</label>
              <p class="text-xs text-gray-500 mb-1">0 = aucune contrainte (hors retrait complet).</p>
              <input
                v-model.number="settings.minimum_remaining_balance"
                type="number"
                step="1"
                min="0"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <!-- WhatsApp OpenWA -->
        <div v-if="isStaff" class="p-3 sm:p-4 md:p-6">
          <h2 class="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-2 sm:mb-3 md:mb-4">
            Vérification WhatsApp (OpenWA)
          </h2>
          <p class="text-xs text-gray-500 mb-4">
            ID de session OpenWA pour la vérification WhatsApp. La clé API reste sur le serveur (.env).
          </p>
          <div class="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ID de session OpenWA</label>
              <input
                v-model="settings.openwa_session_id"
                type="text"
                maxlength="120"
                placeholder="ex. ee3c4a0f-01ed-491b-a02a-5143e8dfde83"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
              />
              <p class="text-xs text-gray-500 mt-1">
                Copier depuis wa-admin.babilonbg.net → Sessions → Détails. Laisser vide pour utiliser OPENWA_SESSION_ID (.env).
              </p>
              <p class="text-xs text-amber-700 mt-1">
                « Tester la session » vérifie l'ID saisi et l'enregistre automatiquement si le test réussit.
              </p>
            </div>
            <div>
              <button
                type="button"
                :disabled="openwaStatusLoading"
                class="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                @click="checkOpenwaSession"
              >
                {{ openwaStatusLoading ? 'Vérification…' : 'Tester la session' }}
              </button>
              <div
                v-if="openwaStatusMessage"
                class="mt-3 rounded-lg p-3 text-sm"
                :class="openwaStatusOk ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'"
              >
                {{ openwaStatusMessage }}
              </div>
            </div>
          </div>
        </div>

        <!-- Connect Pro -->
        <div v-if="isStaff" class="p-3 sm:p-4 md:p-6 border-t border-gray-100">
          <h2 class="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-2 sm:mb-3 md:mb-4">
            Connect Pro
          </h2>
          <p class="text-xs text-gray-500 mb-4">
            Clés API stockées en base (comme CENOF). Les UUID réseaux se configurent sur chaque Network (system_account).
          </p>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">URL de base Connect</label>
              <input
                v-model="settings.connect_pro_base_url"
                type="url"
                placeholder="https://connect.cenof.finance"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                API Key
                <span v-if="settings.connect_pro_api_key_set" class="ml-2 text-xs text-green-600 font-normal">déjà configurée</span>
              </label>
              <input
                v-model="settings.connect_pro_api_key"
                type="password"
                autocomplete="new-password"
                :placeholder="settings.connect_pro_api_key_set ? 'Laisser vide pour ne pas changer' : 'Coller la clé'"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                API Secret
                <span v-if="settings.connect_pro_api_secret_set" class="ml-2 text-xs text-green-600 font-normal">déjà configuré</span>
              </label>
              <input
                v-model="settings.connect_pro_api_secret"
                type="password"
                autocomplete="new-password"
                :placeholder="settings.connect_pro_api_secret_set ? 'Laisser vide pour ne pas changer' : 'Coller le secret'"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              />
            </div>
            <div class="sm:col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">URL publique BOX (webhook)</label>
              <input
                v-model="settings.public_base_url"
                type="url"
                placeholder="https://box.babilonbg.net"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono text-sm"
              />
              <p class="text-xs text-gray-500 mt-1">Callback = {url}/box/connect-pro-webhook</p>
            </div>
          </div>
        </div>

        <!-- Other Settings -->
        <div v-if="isStaff" class="p-3 sm:p-4 md:p-6">
          <h2 class="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-2 sm:mb-3 md:mb-4">Autres paramètres</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Seuls les agents peuvent partager</label>
              <p class="text-xs text-gray-500 mb-2">
                Coché = parrainage réservé aux agents. Décoché = tous les utilisateurs voient leur code et lien.
              </p>
              <div class="mt-1">
                <label class="inline-flex items-center">
                  <input 
                    v-model="settings.only_agente_can_share" 
                    type="checkbox" 
                    class="form-checkbox h-5 w-5 text-primary rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700">Activé</span>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Mode test</label>
              <div class="mt-1">
                <label class="inline-flex items-center">
                  <input 
                    v-model="settings.test_mode" 
                    type="checkbox" 
                    class="form-checkbox h-5 w-5 text-primary rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700">Activé</span>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Distribution des pièces BOX</label>
              <p class="text-xs text-gray-500 mb-2">
                Désactive l'attribution automatique (gains, pénalités et notifications).
              </p>
              <div class="mt-1">
                <label class="inline-flex items-center">
                  <input
                    v-model="settings.box_coins_distribution_enabled"
                    type="checkbox"
                    class="form-checkbox h-5 w-5 text-primary rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700">Activée</span>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Notifications nouveau challenge</label>
              <p class="text-xs text-gray-500 mb-2">
                Push/in-app à tous les users quand un challenge est publié.
              </p>
              <div class="mt-1">
                <label class="inline-flex items-center">
                  <input
                    v-model="settings.challenge_publish_notifications_enabled"
                    type="checkbox"
                    class="form-checkbox h-5 w-5 text-primary rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700">Activées</span>
                </label>
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Popup numéro WhatsApp (mobile)</label>
              <p class="text-xs text-gray-500 mb-2">
                Demande du numéro WhatsApp après un dépôt accepté.
                Désactivée : la popup n'apparaît plus dans l'app, sans mise à jour mobile.
              </p>
              <div class="mt-1">
                <label class="inline-flex items-center">
                  <input
                    v-model="settings.whatsapp_prompt_enabled"
                    type="checkbox"
                    class="form-checkbox h-5 w-5 text-primary rounded"
                  />
                  <span class="ml-2 text-sm text-gray-700">Activée</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <!-- Reminders - Daily -->
        <div class="p-3 sm:p-4 md:p-6">
          <h2 class="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-2 sm:mb-3 md:mb-4">Rappels Quotidiens (8h, 14h, 21h)</h2>
          <p class="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Messages envoyés aux utilisateurs avec des caisses quotidiennes en attente</p>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Matin (8h)</label>
              <MessageListEditor v-model="settings.reminreminder_day_morning" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.reminreminder_day_morning_image" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Après-midi (14h)</label>
              <MessageListEditor v-model="settings.reminreminder_day_afternoon" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.reminreminder_day_afternoon_image" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Soir (21h)</label>
              <MessageListEditor v-model="settings.reminreminder_day_evening" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.reminreminder_day_evening_image" />
              </div>
            </div>
          </div>
        </div>

        <!-- Reminders - Weekly -->
        <div class="p-3 sm:p-4 md:p-6">
          <h2 class="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-2 sm:mb-3 md:mb-4">Rappels Hebdomadaires (8h, 14h, 21h)</h2>
          <p class="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Messages envoyés aux utilisateurs avec des caisses hebdomadaires en attente</p>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Matin (8h)</label>
              <MessageListEditor v-model="settings.reminreminder_week_morning" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.reminreminder_week_morning_image" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Après-midi (14h)</label>
              <MessageListEditor v-model="settings.reminreminder_week_afternoon" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.reminreminder_week_afternoon_image" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Soir (21h)</label>
              <MessageListEditor v-model="settings.reminreminder_week_evening" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.reminreminder_week_evening_image" />
              </div>
            </div>
          </div>
        </div>

        <!-- Reminders - Monthly -->
        <div class="p-3 sm:p-4 md:p-6">
          <h2 class="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-2 sm:mb-3 md:mb-4">Rappels Mensuels (8h, 14h, 21h)</h2>
          <p class="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Messages envoyés aux utilisateurs avec des caisses mensuelles en attente</p>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Matin (8h)</label>
              <MessageListEditor v-model="settings.reminreminder_month_morning" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.reminreminder_month_morning_image" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Après-midi (14h)</label>
              <MessageListEditor v-model="settings.reminreminder_month_afternoon" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.reminreminder_month_afternoon_image" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Soir (21h)</label>
              <MessageListEditor v-model="settings.reminreminder_month_evening" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.reminreminder_month_evening_image" />
              </div>
            </div>
          </div>
        </div>

        <!-- Motivation Messages -->
        <div class="p-3 sm:p-4 md:p-6">
          <h2 class="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-2 sm:mb-3 md:mb-4">Messages de Motivation (8h, 14h, 21h)</h2>
          <p class="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Messages envoyés aux utilisateurs actifs qui n'ont aucune caisse en attente pour les motiver à en créer une</p>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Matin (8h)</label>
              <MessageListEditor v-model="settings.motivation_no_caisse_morning" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.motivation_no_caisse_morning_image" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Après-midi (14h)</label>
              <MessageListEditor v-model="settings.motivation_no_caisse_afternoon" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.motivation_no_caisse_afternoon_image" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Soir (21h)</label>
              <MessageListEditor v-model="settings.motivation_no_caisse_evening" />
              <div class="mt-3">
                <label class="block text-sm font-medium text-gray-700 mb-1">Image (optionnel)</label>
                <ImageUploader v-model="settings.motivation_no_caisse_evening_image" />
              </div>
            </div>
          </div>
        </div>

        <!-- Version Settings -->
        <div v-if="isStaff" class="p-3 sm:p-4 md:p-6">
          <h2 class="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-2 sm:mb-3 md:mb-4">Paramètres de version</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Version minimale requise</label>
              <input 
                v-model.number="settings.min_version" 
                type="number" 
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Dernière version disponible</label>
              <input 
                v-model.number="settings.last_version" 
                type="number" 
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
              />
            </div>
            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-700 mb-1">Message de mise à jour</label>
              <textarea 
                v-model="settings.update_message" 
                rows="3" 
                maxlength="250"
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Message affiché lors de la mise à jour..."
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Download Links -->
        <div v-if="isStaff" class="p-3 sm:p-4 md:p-6">
          <h2 class="text-sm sm:text-base md:text-lg font-medium text-gray-900 mb-2 sm:mb-3 md:mb-4">Liens de téléchargement</h2>
          <div class="grid grid-cols-1 gap-3 sm:gap-4 md:gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Lien téléchargement Android</label>
              <input 
                v-model="settings.dowload_android_apk" 
                type="url" 
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                placeholder="https://..."
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Lien téléchargement iOS</label>
              <input 
                v-model="settings.dowload_ios_apk" 
                type="url" 
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                placeholder="https://..."
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Lien téléchargement générique</label>
              <input 
                v-model="settings.dowload_apk_link" 
                type="url" 
                class="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent" 
                placeholder="https://..."
              />
            </div>
          </div>
        </div>

        <!-- Submit Button -->
        <div class="p-3 sm:p-4 md:p-6 bg-gray-50">
          <button 
            type="submit" 
            class="w-full sm:w-auto bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base" 
            :disabled="loading"
          >
            <span v-if="!loading" class="flex items-center justify-center">
              <i class="fas fa-save mr-2"></i>
              Sauvegarder les modifications
            </span>
            <span v-else class="flex items-center justify-center">
              <i class="fas fa-spinner animate-spin mr-2"></i>
              Enregistrement...
            </span>
          </button>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="p-6 bg-green-50">
          <div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg" role="alert">
            <p class="font-bold">✓ Succès</p>
            <p>{{ successMessage }}</p>
          </div>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '../stores/settings'
import { useAuthStore } from '../stores/auth'
import { fetchWithAuth } from '../stores/fetchwithtoken'
import MessageListEditor from '../components/settings/MessageListEditor.vue'
import ImageUploader from '../components/settings/ImageUploader.vue'

const settingsStore = useSettingsStore()
const authStore = useAuthStore()
const { settings, loading, error } = storeToRefs(settingsStore)
const { fetchSettings, updateSettings } = settingsStore
const successMessage = ref<string | null>(null)
const openwaStatusLoading = ref(false)
const openwaStatusMessage = ref<string | null>(null)
const openwaStatusOk = ref(false)

// Vérifier si l'utilisateur est admin (staff) ou service client
const isStaff = computed(() => authStore.user?.is_staff === true)
const isCustomerService = computed(() => !isStaff.value)

onMounted(() => {
  fetchSettings()
})

const handleSubmit = async () => {
  if (settings.value) {
    try {
      successMessage.value = null
      const success = await updateSettings(settings.value)
      if (success) {
        successMessage.value = 'Les paramètres ont été mis à jour avec succès'
        setTimeout(() => {
          successMessage.value = null
        }, 5000)
      }
    } catch (err) {
      console.error('Erreur lors de la soumission:', err)
    }
  }
}

const checkOpenwaSession = async () => {
  openwaStatusLoading.value = true
  openwaStatusMessage.value = null
  openwaStatusOk.value = false
  try {
    const sessionId = settings.value?.openwa_session_id?.trim() || ''
    const query = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : ''
    const response = await fetchWithAuth(`/box/openwa/session-status${query}`)
    const data = await response.json()
    if (data.ok) {
      openwaStatusOk.value = true
      const st = data.status
      let saveHint = ''

      // Test réussi → enregistrer la session en base pour l'app mobile
      if (sessionId) {
        const saved = await updateSettings({ openwa_session_id: sessionId })
        if (saved) {
          if (settings.value) {
            settings.value.openwa_session_id = sessionId
          }
          saveHint = ' — Session enregistrée en base pour l’app mobile.'
        } else {
          saveHint = ' — Test OK mais enregistrement échoué : cliquez « Enregistrer les paramètres ».'
        }
      } else if (data.tested_from_form) {
        saveHint = ' — Enregistrez les paramètres pour activer en production.'
      }

      if (st && typeof st === 'object' && st.status) {
        openwaStatusMessage.value =
          `Session OK — statut: ${st.status}` +
          (st.phone ? `, numéro: ${st.phone}` : '') +
          (st.pushName ? ` (${st.pushName})` : '') +
          saveHint
      } else {
        openwaStatusMessage.value = `Session active (${data.session_id})${saveHint}`
      }
    } else {
      openwaStatusMessage.value =
        data.error === 'whatsapp_service_not_configured'
          ? 'OpenWA non configuré (clé API manquante sur le serveur .env).'
          : data.error === 'openwa_session_id_not_configured'
            ? 'Aucun ID de session — saisissez-le ci-dessus ou configurez OPENWA_SESSION_ID (.env).'
            : data.error === 'openwa_session_not_found' || data.http_status === 404
            ? `Session introuvable sur OpenWA (${data.session_id}). Vérifiez l'ID copié depuis wa-admin.babilonbg.net.`
            : data.error === 'whatsapp_service_timeout'
              ? 'OpenWA ne répond pas (timeout). Vérifiez la session sur wa.babilonbg.net.'
              : `Erreur : ${data.error || 'inconnue'}`
    }
  } catch (err) {
    openwaStatusMessage.value = 'Impossible de contacter le serveur.'
    console.error('checkOpenwaSession:', err)
  } finally {
    openwaStatusLoading.value = false
  }
}

</script>
