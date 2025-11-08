<template>
  <div class="card">
    <div class="flex justify-between items-start mb-4">
      <h3 class="text-gray-700 font-medium">{{ title }}</h3>
    </div>
    <div class="flex items-center justify-center h-56 relative">
      <Doughnut 
        :data="chartData" 
        :options="chartOptions" 
      />
    </div>
    <div class="grid grid-cols-3 gap-2 mt-4">
      <div 
        v-for="(item, index) in chartData.labels" 
        :key="index"
        class="flex items-center text-sm"
      >
        <span 
          class="w-3 h-3 rounded-full mr-2"
          :style="{ backgroundColor: chartData.datasets[0].backgroundColor[index] }"
        ></span>
        <span class="text-gray-600">{{ item }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Doughnut } from 'vue-chartjs';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { 
  Chart as ChartJS, 
  ArcElement,
  Tooltip, 
  Legend
} from 'chart.js';
// Les imports sont utilisés via ChartJS.register

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const props = defineProps<{
  title: string;
  chartData: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderColor: string[];
      borderWidth: number;
    }[];
  };
}>();

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(255,255,255,0.9)',
      titleColor: '#1E293B',
      bodyColor: '#1E293B',
      borderColor: '#E2E8F0',
      borderWidth: 1,
      padding: 10,
    },
  },
  cutout: '70%',
};
</script>