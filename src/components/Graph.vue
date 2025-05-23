<template>
  <div class="graph-container">
    <LineChart :chart-data="chartData" :chart-options="chartOptions" />
    <div class="controls">
      <span>Duration</span>
      <input type="number" v-model="duration" placeholder="Duration" />
      <button @click="">No Function Yet</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineChartComponent } from 'vue-chart-3'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, LineController } from 'chart.js'
import {onMounted, ref, watch} from 'vue'

ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, LineController)

const LineChart = defineChartComponent("test", 'line')

async function calculateTotalUsers(sessionDuration: number): Promise<number[]> {
  const response =  await fetch('/todo-delete-usersteps.csv')
  const data = await response.text()
  const userSteps = data.split('\n').map(line => parseInt(line.trim(), 10)).filter(Number.isFinite);

  const totalUsers: number[] = [];

  userSteps.forEach((users, time) => {
    for (let i = 0; i < sessionDuration; i++) {
      totalUsers[time + i] = (totalUsers[time + i] || 0) + users;
    }
  });

  return totalUsers;
}

onMounted(async () => {
  const approximateSessionDuration = 10
  const result = await calculateTotalUsers(Math.floor(approximateSessionDuration))

  chartData.value.labels = result.map((_, index) => index.toString())
  chartData.value.datasets[0].data = result
})

const chartData = ref({
  labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'],
  datasets: [
    {
      label: 'Approx. Total Users',
      data: [0],
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

const duration = ref(0)

watch(duration, (newValue) => {
  for (let i = 0; i < chartData.value.labels.length; i++) {
    chartData.value.labels.pop()
  }
  for (let i = 0; i < newValue; i++) {
    chartData.value.labels[i] = (i).toString()
}})

</script>

<style scoped>
.graph-container {
  position: absolute;
  top: 0;
  left: 0;
  margin: 1em;
  padding-top: 5em;
  width: 45%;
}

.controls {
  display: flex;
  align-items: center;
  margin-top: 1em;
}

input {
  margin-left: 1em;
  margin-right: 1em;
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
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