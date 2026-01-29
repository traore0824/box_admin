<template>
  <div class="space-y-6">
    <!-- Header avec bouton retour -->
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4">
        <button @click="goBack" class="text-gray-600 hover:text-primary transition-colors">
          <i class="fas fa-arrow-left text-xl"></i>
        </button>
        <h1 class="text-xl sm:text-2xl font-bold text-gray-900">Détails de la transaction</h1>
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

    <!-- Transaction Details Content -->
    <div v-else-if="transaction" class="space-y-6">
      <!-- En-tête de la transaction -->
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-2xl font-bold text-gray-900 mb-2">
              {{ transaction.public_reference }}
            </h2>
            <p class="text-gray-600">Référence de la transaction</p>
          </div>
          <span :class="[
            'px-4 py-2 inline-flex text-sm leading-5 font-semibold rounded-full',
            getStatusClass(transaction.status)
          ]">
            {{ getStatusLabel(transaction.status) }}
          </span>
        </div>
      </div>

      <!-- Informations générales -->
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="fas fa-info-circle mr-2 text-primary"></i>
          Informations générales
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ID</label>
            <p class="text-gray-900 font-mono">{{ transaction.id }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Référence publique</label>
            <p class="text-gray-900 font-mono">{{ transaction.public_reference }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Référence interne</label>
            <p class="text-gray-900 font-mono">{{ formatNullValue(transaction.reference) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date de création</label>
            <p class="text-gray-900">{{ formatDateTime(transaction.created_at) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type de transaction</label>
            <span :class="[
              'px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full',
              getTypeClass(transaction.type_trans)
            ]">
              {{ getTypeLabel(transaction.type_trans) }}
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Mode de paiement</label>
            <p class="text-gray-900">{{ formatNullValue(transaction.payment_mode) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Montant</label>
            <p class="text-2xl font-bold" :class="getAmountClass(transaction.type_trans)">
              {{ transaction.type_trans === 'deposit' ? '+' : '-' }}{{ formatAmount(transaction.amount) }}
            </p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <p class="text-gray-900">{{ formatNullValue(transaction.phone) }}</p>
          </div>
        </div>
      </div>

      <!-- Informations utilisateur -->
      <div v-if="transaction.created_by" class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="fas fa-user mr-2 text-primary"></i>
          Informations utilisateur
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <p class="text-gray-900">{{ transaction.created_by.first_name }} {{ transaction.created_by.last_name }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p class="text-gray-900">{{ transaction.created_by.email }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
            <p class="text-gray-900">{{ formatNullValue(transaction.created_by.phone) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Code parrainage</label>
            <p class="text-gray-900 font-mono">{{ formatNullValue(transaction.created_by.referral_code) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <span :class="[
              'px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full',
              transaction.created_by.agent_client ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            ]">
              {{ transaction.created_by.agent_client ? 'Agent' : 'Client' }}
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Actions</label>
            <button @click="viewUserProfile" class="text-primary hover:text-primary-dark font-medium">
              <i class="fas fa-user-circle mr-1"></i>
              Voir le profil
            </button>
          </div>
        </div>
      </div>

      <!-- Informations caisse -->
      <div v-if="transaction.caisse" class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <i class="fas fa-piggy-bank mr-2 text-primary"></i>
          Informations caisse
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nom de la caisse</label>
            <p class="text-gray-900 font-semibold">{{ formatNullValue(transaction.caisse.name) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">ID Caisse</label>
            <p class="text-gray-900 font-mono">{{ transaction.caisse.id }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <p class="text-gray-900">{{ transaction.caisse.start_date ? new Date(transaction.caisse.start_date).toLocaleDateString('fr-FR') : 'Non défini' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <p class="text-gray-900">{{ transaction.caisse.end_date ? new Date(transaction.caisse.end_date).toLocaleDateString('fr-FR') : 'Non défini' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Date de création</label>
            <p class="text-gray-900">{{ transaction.caisse.created_at ? formatDateTime(transaction.caisse.created_at) : 'Non défini' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Prochaine date de paiement</label>
            <p class="text-gray-900">{{ transaction.caisse.next_payment ? new Date(transaction.caisse.next_payment).toLocaleDateString('fr-FR') : 'Non défini' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Montant objectif</label>
            <p class="text-gray-900 font-semibold">{{ transaction.caisse.amount_obj ? formatAmount(transaction.caisse.amount_obj) : 'Non défini' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Montant déjà payé</label>
            <p class="text-gray-900 font-semibold">{{ transaction.caisse.amount_already_paid ? formatAmount(transaction.caisse.amount_already_paid) : 'Non défini' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Pourcentage de progression</label>
            <p class="text-gray-900 font-semibold">{{ transaction.caisse.percentage_progession ? `${transaction.caisse.percentage_progession}%` : 'Non défini' }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Fréquence</label>
            <p class="text-gray-900">{{ getFrequencyLabel(transaction.caisse.frequence) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Type de caisse</label>
            <span class="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
              {{ formatNullValue(transaction.caisse.type_box) }}
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <span :class="[
              'px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full',
              getCaisseStatusClass(transaction.caisse.status)
            ]">
              {{ getCaisseStatusLabel(transaction.caisse.status) }}
            </span>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de retards</label>
            <p class="text-gray-900">{{ formatNullValue(transaction.caisse.transaction_delay) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Total transactions</label>
            <p class="text-gray-900">{{ formatNullValue(transaction.caisse.total_trans) }}</p>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Personnelle</label>
            <span :class="[
              'px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full',
              transaction.caisse.personal ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
            ]">
              {{ transaction.caisse.personal ? 'Oui' : 'Non' }}
            </span>
          </div>
          <div v-if="!transaction.caisse.personal && transaction.caisse.members && transaction.caisse.members.length > 0">
            <label class="block text-sm font-medium text-gray-700 mb-1">Membres</label>
            <div class="space-y-1">
              <div v-for="member in transaction.caisse.members" :key="member.id || member" class="text-sm text-gray-700">
                {{ member.first_name || member.last_name || member.email || member }}
              </div>
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
        <div class="flex flex-wrap gap-3">
          <button @click="handleUpdateStatus" :disabled="actionLoading"
            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 transition-colors">
            <i class="fas fa-sync-alt mr-2"></i>
            Mettre à jour le statut
          </button>
          <button @click="handleCheckFeexpay" :disabled="actionLoading"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
            <i class="fas fa-search mr-2"></i>
            Vérifier statut Feexpay
          </button>
          <button v-if="transaction.type_trans === 'withdrawal' || transaction.type_trans === 'cancellation'" 
            @click="handleValidateWithdrawal" :disabled="actionLoading"
            class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
            <i class="fas fa-check-circle mr-2"></i>
            Valider
          </button>
          <button v-if="transaction.type_trans === 'withdrawal' || transaction.type_trans === 'cancellation'" 
            @click="handleApproveWithdrawal" :disabled="actionLoading"
            class="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors">
            <i class="fas fa-thumbs-up mr-2"></i>
            Approuver
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { fetchWithAuth } from '../stores/fetchwithtoken'
import { formatAmount } from '../utils/currency'
import { useNotification } from '../services/notification'
import { useTransactionsStore } from '../stores/transactions'

const route = useRoute()
const router = useRouter()
const notification = useNotification()
const transactionsStore = useTransactionsStore()

// State
const transaction = ref<any>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)
const actionLoading = ref(false)

const transactionId = ref<number | null>(null)

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
  return value.toString()
}

// Fonction pour obtenir le label de statut
const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    accept: 'Accepté',
    pending: 'En attente',
    error: 'Erreur',
    expired: 'Expiré',
    timeout: 'Timeout'
  }
  return labels[status] || status
}

// Fonction pour obtenir la classe de statut
const getStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    accept: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800',
    expired: 'bg-gray-100 text-gray-800',
    timeout: 'bg-orange-100 text-orange-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// Fonction pour obtenir le label de type
const getTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    deposit: 'Dépôt',
    withdrawal: 'Retrait',
    cancellation: 'Annulation'
  }
  return labels[type] || type
}

// Fonction pour obtenir la classe de type
const getTypeClass = (type: string): string => {
  const classes: Record<string, string> = {
    deposit: 'bg-green-100 text-green-800',
    withdrawal: 'bg-red-100 text-red-800',
    cancellation: 'bg-orange-100 text-orange-800'
  }
  return classes[type] || 'bg-gray-100 text-gray-800'
}

// Fonction pour obtenir la classe de montant
const getAmountClass = (type: string): string => {
  if (type === 'deposit') {
    return 'text-green-600'
  }
  return 'text-red-600'
}

// Fonction pour obtenir le label de fréquence
const getFrequencyLabel = (frequency: string): string => {
  const labels: Record<string, string> = {
    all_days: 'Tous les jours',
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
    pending: 'En attente',
    completed: 'Terminée',
    blocked: 'Bloquée'
  }
  return labels[status] || status
}

// Fonction pour obtenir la classe de statut de caisse
const getCaisseStatusClass = (status: string): string => {
  const classes: Record<string, string> = {
    active: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    blocked: 'bg-red-100 text-red-800'
  }
  return classes[status] || 'bg-gray-100 text-gray-800'
}

// Fonction pour revenir en arrière
const goBack = () => {
  router.push({ name: 'transactions' })
}

// Fonction pour voir le profil utilisateur
const viewUserProfile = () => {
  if (transaction.value?.created_by?.id) {
    router.push({ name: 'user-profile', params: { id: transaction.value.created_by.id.toString() } })
  }
}

// Charger les détails de la transaction
const loadTransactionDetails = async () => {
  try {
    isLoading.value = true
    error.value = null

    // Récupérer l'ID depuis la route
    const id = route.params.id as string
    transactionId.value = parseInt(id)

    if (!transactionId.value) {
      throw new Error('ID transaction invalide')
    }

    // Charger la transaction depuis l'API
    // Essayer d'abord avec la référence publique
    let response = await fetchWithAuth('/box/all-transaction', {
      queryParams: { 
        page: '1', 
        page_size: '100',
        public_reference: id
      }
    })

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération des détails de la transaction')
    }

    let data = await response.json()
    
    // Chercher la transaction par ID dans les résultats
    let foundTransaction = data.results?.find((t: any) => t.id === transactionId.value)
    
    // Si pas trouvé, essayer de chercher par référence publique
    if (!foundTransaction) {
      foundTransaction = data.results?.find((t: any) => t.public_reference === id)
    }

    // Si toujours pas trouvé, essayer une recherche directe sans filtre et parcourir plusieurs pages
    if (!foundTransaction) {
      let page = 1
      const maxPages = 10 // Limiter à 10 pages pour éviter une boucle infinie
      
      while (page <= maxPages && !foundTransaction) {
        response = await fetchWithAuth('/box/all-transaction', {
          queryParams: { 
            page: page.toString(), 
            page_size: '100'
          }
        })
        
        if (!response.ok) break
        
        data = await response.json()
        foundTransaction = data.results?.find((t: any) => t.id === transactionId.value)
        
        if (!foundTransaction && !data.next) {
          // Plus de pages disponibles
          break
        }
        
        page++
      }
    }

    if (!foundTransaction) {
      throw new Error('Transaction non trouvée')
    }

    transaction.value = foundTransaction
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Une erreur est survenue'
    console.error('Error loading transaction details:', err)
    notification.addNotification(error.value, 'error')
  } finally {
    isLoading.value = false
  }
}

// Actions handlers
const handleUpdateStatus = async () => {
  if (!transaction.value) return
  
  try {
    actionLoading.value = true
    await transactionsStore.updateTransactionStatus(transaction.value.id)
    notification.addNotification('Statut de la transaction mis à jour avec succès', 'success')
    // Recharger les détails
    await loadTransactionDetails()
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du statut:', error)
    notification.addNotification(`Erreur: ${error.message || 'Impossible de mettre à jour le statut.'}`, 'error')
  } finally {
    actionLoading.value = false
  }
}

const handleCheckFeexpay = async () => {
  if (!transaction.value) return
  
  try {
    actionLoading.value = true
    const result = await transactionsStore.checkFeexpayStatus(transaction.value.id)
    notification.addNotification('Statut Feexpay vérifié avec succès', 'success')
    // Recharger les détails
    await loadTransactionDetails()
  } catch (error: any) {
    console.error('Erreur lors de la vérification Feexpay:', error)
    notification.addNotification(`Erreur: ${error.message || 'Impossible de vérifier le statut Feexpay.'}`, 'error')
  } finally {
    actionLoading.value = false
  }
}

const handleValidateWithdrawal = async () => {
  if (!transaction.value) return
  
  try {
    actionLoading.value = true
    const result = await transactionsStore.validateWithdrawal(transaction.value.id)
    notification.addNotification('Transaction validée avec succès', 'success')
  } catch (error: any) {
    console.error('Erreur lors de la validation:', error)
    notification.addNotification(`Erreur: ${error.message || 'Impossible de valider la transaction.'}`, 'error')
  } finally {
    actionLoading.value = false
  }
}

const handleApproveWithdrawal = async () => {
  if (!transaction.value) return
  
  try {
    actionLoading.value = true
    await transactionsStore.approveWithdrawal(transaction.value.id)
    notification.addNotification('Transaction approuvée avec succès', 'success')
    // Recharger les détails
    await loadTransactionDetails()
  } catch (error: any) {
    console.error('Erreur lors de l\'approbation:', error)
    notification.addNotification(`Erreur: ${error.message || 'Impossible d\'approuver la transaction.'}`, 'error')
  } finally {
    actionLoading.value = false
  }
}

onMounted(() => {
  loadTransactionDetails()
})
</script>

