import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Caisse {
  id: number
  name: string
  endDate: string
  savedAmount: number
  targetAmount: number
  frequency: 'daily' | 'weekly' | 'monthly'
  progress: number
  status: 'active' | 'completed' | 'blocked'
  ownerName: string
  membersCount: number
  createdDate: string
}

// Mock data for demo
const mockCaisses: Caisse[] = []

// Generate mock caisses
for (let i = 1; i <= 15; i++) {
  const savedAmount = Math.floor(Math.random() * 5000) + 1000
  const targetAmount = Math.floor(Math.random() * 10000) + 5000
  const progress = Math.floor((savedAmount / targetAmount) * 100)
  const status = progress >= 100 ? 'completed' : i % 10 === 0 ? 'blocked' : 'active'
  
  mockCaisses.push({
    id: i,
    name: `Caisse ${i}`,
    endDate: `2023-${(i % 12 + 7).toString().padStart(2, '0')}-${(i % 28 + 1).toString().padStart(2, '0')}`,
    savedAmount,
    targetAmount,
    frequency: i % 3 === 0 ? 'daily' : i % 3 === 1 ? 'weekly' : 'monthly',
    progress,
    status,
    ownerName: `User ${i + 10}`,
    membersCount: Math.floor(Math.random() * 10) + 2,
    createdDate: `2023-${(i % 12 + 1).toString().padStart(2, '0')}-${(i % 28 + 1).toString().padStart(2, '0')}`
  })
}

export const useCaissesStore = defineStore('caisses', () => {
  const caisses = ref<Caisse[]>(mockCaisses)
  const searchQuery = ref('')
  const statusFilter = ref<string>('all')
  const frequencyFilter = ref<string>('all')

  function getFilteredCaisses() {
    return caisses.value.filter(caisse => {
      // Search by name or owner
      const matchesSearch = caisse.name.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
                           caisse.ownerName.toLowerCase().includes(searchQuery.value.toLowerCase())
      
      // Filter by status
      const matchesStatus = statusFilter.value === 'all' || caisse.status === statusFilter.value
      
      // Filter by frequency
      const matchesFrequency = frequencyFilter.value === 'all' || caisse.frequency === frequencyFilter.value
      
      return matchesSearch && matchesStatus && matchesFrequency
    })
  }
  
  function blockCaisse(caisseId: number) {
    const caisseIndex = caisses.value.findIndex(c => c.id === caisseId)
    if (caisseIndex >= 0) {
      caisses.value[caisseIndex].status = 'blocked'
    }
  }
  
  function unblockCaisse(caisseId: number) {
    const caisseIndex = caisses.value.findIndex(c => c.id === caisseId)
    if (caisseIndex >= 0) {
      caisses.value[caisseIndex].status = 'active'
    }
  }
  
  return {
    caisses,
    searchQuery,
    statusFilter,
    frequencyFilter,
    getFilteredCaisses,
    blockCaisse,
    unblockCaisse
  }
})