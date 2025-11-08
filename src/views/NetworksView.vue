<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <h1 class="text-2xl font-bold text-gray-900">Gestion des Réseaux de Paiement</h1>
      <button 
        @click="openCreateModal"
        class="mt-4 sm:mt-0 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        <i class="fas fa-plus mr-2"></i>
        Créer un réseau
      </button>
    </div>

    <!-- Filtres -->
    <div class="bg-white rounded-lg shadow-sm p-4">
      <div class="flex flex-wrap gap-4">
        <select 
          v-model="isActiveFilter"
          @change="loadNetworks"
          class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option :value="null">Tous les réseaux</option>
          <option :value="true">Actifs uniquement</option>
          <option :value="false">Inactifs uniquement</option>
        </select>
      </div>
    </div>

    <!-- Liste des Réseaux -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div 
        v-for="network in networksStore.networks" 
        :key="network.id"
        class="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-3">
            <img 
              v-if="network.image" 
              :src="network.image" 
              :alt="network.publique_name"
              class="w-12 h-12 object-contain rounded"
            />
            <div>
              <h3 class="text-lg font-semibold text-gray-900">{{ network.publique_name }}</h3>
              <p class="text-sm text-gray-500">{{ network.name_display }}</p>
            </div>
          </div>
          <span 
            :class="[
              'px-2 py-1 text-xs font-semibold rounded-full',
              network.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            ]"
          >
            {{ network.is_active ? 'Actif' : 'Inactif' }}
          </span>
        </div>

        <div class="space-y-2 mb-4">
          <div class="flex items-center text-sm text-gray-600">
            <i class="fas fa-flag mr-2"></i>
            {{ network.indication_country }} ({{ network.country_code }})
          </div>
          <div class="flex items-center text-sm">
            <span class="mr-2">Dépôts:</span>
            <span :class="network.enable_for_deposit ? 'text-green-600' : 'text-red-600'">
              <i :class="network.enable_for_deposit ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
            </span>
          </div>
          <div class="flex items-center text-sm">
            <span class="mr-2">Retraits:</span>
            <span :class="network.enable_for_withdrawal ? 'text-green-600' : 'text-red-600'">
              <i :class="network.enable_for_withdrawal ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
            </span>
          </div>
        </div>

        <div class="flex space-x-2">
          <button 
            @click="openEditModal(network)"
            class="flex-1 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
          >
            <i class="fas fa-edit mr-1"></i>
            Modifier
          </button>
          <button 
            @click="confirmDelete(network)"
            class="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Message si aucun réseau -->
    <div v-if="networksStore.networks.length === 0" class="bg-white rounded-lg shadow-sm p-12 text-center">
      <i class="fas fa-network-wired text-6xl text-gray-300 mb-4"></i>
      <p class="text-gray-500">Aucun réseau trouvé</p>
    </div>

    <!-- Modal Créer/Modifier -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
          <h3 class="text-xl font-semibold text-gray-800 mb-4">
            {{ editingNetwork ? 'Modifier le réseau' : 'Créer un réseau' }}
          </h3>
          
          <form @submit.prevent="handleSubmit" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom (unique) *</label>
              <select 
                v-model="formData.name"
                required
                :disabled="editingNetwork !== null"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">Sélectionner un réseau</option>
                <option value="moov">MOOV</option>
                <option value="mtn">MTN</option>
                <option value="celtis">Celtis</option>
              </select>
              <p class="mt-1 text-xs text-gray-500">Le nom du réseau est unique et ne peut pas être modifié après création</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Nom public *</label>
              <input 
                v-model="formData.publique_name"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="MOOV Money"
              />
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Code pays *</label>
                <input 
                  v-model="formData.country_code"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+229"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Pays *</label>
                <input 
                  v-model="formData.indication_country"
                  type="text"
                  required
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Bénin"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="flex items-center space-x-2">
                  <input 
                    v-model="formData.enable_for_deposit"
                    type="checkbox"
                    class="rounded border-gray-300"
                  />
                  <span class="text-sm font-medium text-gray-700">Activer pour dépôts</span>
                </label>
              </div>
              <div>
                <label class="flex items-center space-x-2">
                  <input 
                    v-model="formData.enable_for_withdrawal"
                    type="checkbox"
                    class="rounded border-gray-300"
                  />
                  <span class="text-sm font-medium text-gray-700">Activer pour retraits</span>
                </label>
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">Image</label>
              <div class="flex items-center space-x-4">
                <input 
                  type="file"
                  @change="handleImageUpload"
                  accept="image/*"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <img 
                  v-if="formData.image"
                  :src="formData.image"
                  alt="Preview"
                  class="w-16 h-16 object-contain rounded"
                />
              </div>
            </div>

            <div>
              <label class="flex items-center space-x-2">
                <input 
                  v-model="formData.is_active"
                  type="checkbox"
                  class="rounded border-gray-300"
                />
                <span class="text-sm font-medium text-gray-700">Actif</span>
              </label>
            </div>

            <div class="flex justify-end space-x-3 pt-4">
              <button 
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Annuler
              </button>
              <button 
                type="submit"
                :disabled="networksStore.isLoading"
                class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {{ editingNetwork ? 'Modifier' : 'Créer' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>

    <!-- Modal de confirmation de suppression -->
    <ConfirmationModal
      :is-open="showDeleteModal"
      title="Supprimer le réseau"
      :message="deleteModalMessage"
      @confirm="handleDelete"
      @cancel="closeDeleteModal"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useNetworksStore } from '../stores/networks'
import { useUploadStore } from '../stores/upload'
import ConfirmationModal from '../components/ConfirmationModal.vue'

const networksStore = useNetworksStore()
const uploadStore = useUploadStore()
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingNetwork = ref<any>(null)
const isActiveFilter = ref<boolean | null>(null)
const networkToDelete = ref<any>(null)
const deleteModalMessage = ref('')

const formData = reactive({
  name: '',
  publique_name: '',
  country_code: '',
  indication_country: '',
  enable_for_deposit: true,
  enable_for_withdrawal: true,
  image: '',
  is_active: true
})

onMounted(() => {
  loadNetworks()
})

const loadNetworks = async () => {
  try {
    await networksStore.fetchNetworks(isActiveFilter.value ?? undefined)
  } catch (error) {
    // L'erreur est déjà gérée dans le store
  }
}

const openCreateModal = () => {
  editingNetwork.value = null
  resetForm()
  showModal.value = true
}

const openEditModal = (network: any) => {
  editingNetwork.value = network
  formData.name = network.name
  formData.publique_name = network.publique_name
  formData.country_code = network.country_code
  formData.indication_country = network.indication_country
  formData.enable_for_deposit = network.enable_for_deposit
  formData.enable_for_withdrawal = network.enable_for_withdrawal
  formData.image = network.image
  formData.is_active = network.is_active
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  editingNetwork.value = null
  resetForm()
}

const resetForm = () => {
  formData.name = ''
  formData.publique_name = ''
  formData.country_code = ''
  formData.indication_country = ''
  formData.enable_for_deposit = true
  formData.enable_for_withdrawal = true
  formData.image = ''
  formData.is_active = true
}

const handleImageUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  try {
    const url = await uploadStore.uploadFile(file, 'image')
    formData.image = url
  } catch (error) {
    // L'erreur est déjà gérée dans le store
  }
}

const handleSubmit = async () => {
  try {
    if (editingNetwork.value) {
      await networksStore.updateNetwork(editingNetwork.value.id, formData)
    } else {
      await networksStore.createNetwork(formData)
    }
    closeModal()
  } catch (error) {
    // L'erreur est déjà gérée dans le store
  }
}

const confirmDelete = (network: any) => {
  networkToDelete.value = network
  deleteModalMessage.value = `Êtes-vous sûr de vouloir supprimer le réseau "${network.publique_name}" ? Cette action est irréversible.`
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  networkToDelete.value = null
}

const handleDelete = async () => {
  if (!networkToDelete.value) return
  
  try {
    await networksStore.deleteNetwork(networkToDelete.value.id)
    closeDeleteModal()
  } catch (error) {
    // L'erreur est déjà gérée dans le store
  }
}
</script>

