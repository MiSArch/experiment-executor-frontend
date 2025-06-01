<template>
  <div class="graph-container">
    <LineChart :chart-data="chartData" :chart-options="chartOptions"/>
    <div class="controls">
      <span>Duration</span>
      <input type="number" v-model="duration" placeholder="Duration"/>
      <span>Time:</span>
      <input type="number" v-model="time" placeholder="Time"/>
      <span>Arriving Users:</span>
      <input type="number" v-model="arrivingUsers" placeholder="Arriving Users"/>
      <button @click="applyUsers">Apply</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineChartComponent} from 'vue-chart-3'
import dragDataPlugin from 'chartjs-plugin-dragdata'
import {CategoryScale, Chart as ChartJS, Legend, LinearScale, LineController, LineElement, PointElement, Title, Tooltip} from 'chart.js'
import {onMounted, ref, watch} from 'vue'
import {testUuid, testVersion} from "../util/test-uuid.ts";
import {showOverlay} from "../util/show-overlay.ts";
import {backendUrl, userSteps} from "../util/test-handler.ts";

ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, LineController, dragDataPlugin)

const LineChart = defineChartComponent("test", 'line')
const time = ref<number>(0)
const arrivingUsers = ref<number>(0)
const needsUpdate = ref<boolean>(false)
// TODO this must be calculated from the work
const approximateSessionDuration = 20
const sessionRequests = [1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1]

const chartData = ref({
  labels: [''],
  datasets: [
    {
      label: 'Approx. Total Users',
      data: [0],
      borderColor: 'rgba(75, 192, 192, 1)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
      borderWidth: 2,
      dragData: true,
    },
    {
      label: 'Approx. Total Requests',
      data: [0],
      borderColor: 'rgba(153, 102, 255, 1)',
      backgroundColor: 'rgba(153, 102, 255, 0.2)',
      borderWidth: 2,
      dragData: true,
    }
  ],
})

const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: {
      display: true,
    }
  },
})


async function updateGraph() {
  const usersResult = await calculateTotalUsers(Math.floor(approximateSessionDuration));
  chartData.value.labels = usersResult.map((_, index) => index.toString());
  chartData.value.datasets[0].data = usersResult;
  duration.value = usersResult.length;

  chartData.value.datasets[1].data = await calculateApproximateRequests();
}

async function fetchUserSteps() {
  const response = await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}/gatlingConfig/userSteps`)
  const data = await response.text()
  userSteps.value = data.split('\n').map(line => parseInt(line.trim(), 10)).filter(Number.isFinite);
}

async function calculateTotalUsers(sessionDuration: number): Promise<number[]> {


  const totalUsers: number[] = [];

  userSteps.value.forEach((users, time) => {
    for (let i = 0; i < sessionDuration; i++) {
      totalUsers[time + i] = (totalUsers[time + i] || 0) + users;
    }
  });

  return totalUsers;
}

async function calculateApproximateRequests(): Promise<number[]> {
  const approximateRequests: number[] = [];

  userSteps.value.forEach((users, time) => {
    for (let i = 0; i < sessionRequests.length; i++) {
      const requestIndex = time + i;
      approximateRequests[requestIndex] = (approximateRequests[requestIndex] || 0) + users * sessionRequests[i];
    }
  });

  return approximateRequests;
}

async function applyUsers() {
  if (time.value < 0 || arrivingUsers.value < 0) {
    alert('Time and Arriving Users must be non-negative.')
    return
  }
  if (time.value >= userSteps.value.length) {
    for (let i = userSteps.value.length; i <= time.value; i++) {
      userSteps.value.push(0)
    }
  }
  userSteps.value[time.value] = arrivingUsers.value
  needsUpdate.value = true
}

onMounted(async () => {
  if (testUuid.value != '' || testVersion.value != '') {
    await updateGraph()
  }
})

watch(showOverlay, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    await fetchUserSteps()
    await updateGraph()
  }
})

watch(needsUpdate, async () => {
  await updateGraph()
  needsUpdate.value = false
})

const duration = ref(userSteps.value.length)

watch(duration, (newValue) => {
  for (let i = 0; i < chartData.value.labels.length; i++) {
    chartData.value.labels.pop()
  }
  for (let i = 0; i < newValue; i++) {
    chartData.value.labels[i] = (i).toString()
  }
})

// ChartJS.defaults.plugins.dragData = {
//  round: 0,
//  showTooltip: true,
//  onDragEnd(e, datasetIndex, index, value) {
//    if (typeof value !== 'number' || !Number.isFinite(value)) {
//      return
//    }
//    const rounded = Math.round(value)
//    userSteps.value[index] = rounded
//    chartData.value.datasets[datasetIndex].data[index] = rounded
//  },
// };

</script>

<style scoped>
.graph-container {
  position: absolute;
  top: 0;
  left: 0;
  margin: 1em;
  padding-top: 5em;
  width: 64%;
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