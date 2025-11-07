<template>
  <div class="card">
    <div class="flex justify-between items-start mb-4">
      <h3 class="text-gray-700 font-medium">{{ title }}</h3>
      <div class="text-sm text-gray-500">
        <select v-model="selectedPeriod" class="bg-transparent border-0 focus:ring-0">
          <option v-for="period in periods" :key="period" :value="period">
            {{ period }}
          </option>
        </select>
      </div>
    </div>
    <div class="h-64 relative">
      <Line 
        :data="chartData" 
        :options="chartOptions" 
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Line } from 'vue-chartjs';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement,
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const props = defineProps<{
  title: string;
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      tension?: number;
    }[];
  };
}>();

const periods = ['Last 7 days', 'Last 30 days', 'Last 90 days'];
const selectedPeriod = ref(periods[0]);

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
      displayColors: false,
      callbacks: {
        label: function(context: any) {
          let label = context.dataset.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed.y !== null) {
            label += context.parsed.y;
          }
          return label;
        }
      }
    },
  },
  scales: {
    x: {
      grid: {
        display: false
      }
    },
    y: {
      beginAtZero: true,
      grid: {
        borderDash: [2, 2],
        color: 'rgba(156, 163, 175, 0.2)'
      },
      ticks: {
        precision: 0
      }
    }
  },
  interaction: {
    mode: 'index',
    intersect: false,
  },
  elements: {
    line: {
      tension: 0.4
    },
    point: {
      radius: 0,
      hoverRadius: 6
    }
  }
};
</script>