<script setup lang="ts">
import { defineChartComponent } from 'vue-chart-3'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, LineController } from 'chart.js'

// Register required Chart.js components
ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, LineController)

// Define the chart component
const LineChart = defineChartComponent("test", 'line')

// Example dynamic data
import { ref } from 'vue'
const chartData = ref({
  labels: ['January', 'February', 'March', 'April', 'May'],
  datasets: [
    {
      label: 'Dynamic Data',
      data: [10, 20, 15, 30, 25],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderWidth: 2,
    },
  ],
})

const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: {
      display: true,
    },
  },
})

// Function to update the graph dynamically
const updateGraph = () => {
  chartData.value.datasets[0].data = chartData.value.datasets[0].data.map(
      () => Math.floor(Math.random() * 50)
  )
}
</script>

<template>
  <div class="graph-container">
    <LineChart :chart-data="chartData" :chart-options="chartOptions" />
    <button @click="updateGraph">Update Graph</button>
  </div>
</template>

<style scoped>
.graph-container {
  position: absolute;
  top: 0;
  left: 0;
  margin: 1em;
}
button {
  margin-top: 1em;
  padding: 0.5em 1em;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
button:hover {
  background-color: #369a6e;
}
</style>