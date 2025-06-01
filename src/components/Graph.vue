<template>
  <div class="graph-container">
    <LineChart :chart-data="chartData" :chart-options="chartOptions"/>
    <div class="controls">
      <span>Duration in s</span>
      <input type="number" v-model="duration" placeholder="Duration"/>
      <button @click="applyDuration">Apply</button>
      <span>From s</span>
      <input type="number" v-model="timeFrom" placeholder="TimeFrom"/>
      <span>To s</span>
      <input type="number" v-model="timeTo" placeholder="TimeTo"/>
      <span>Arriving Users / s</span>
      <input type="number" v-model="arrivingUsers" placeholder="Arriving Users"/>
      <button @click="applyUsers">Apply</button>
      <button @click="reset">Reset</button>
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
const timeFrom = ref<number>(0)
const timeTo = ref<number>(0)
const arrivingUsers = ref<number>(0)
const needsUpdate = ref<boolean>(false)
const duration = ref(userSteps.value.length)

const userStepsBackup = ref([] as number[])

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
  maintainAspectRatio: true,
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
  userStepsBackup.value = userSteps.value.slice()
}

async function reset() {
  userSteps.value = [...userStepsBackup.value];
  needsUpdate.value = true;
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
  if (timeTo.value < 0 || timeFrom.value < 0 || arrivingUsers.value < 0) {
    alert('Time and Arriving Users must be non-negative.')
    return
  }
  if (timeFrom.value >= userSteps.value.length) {
    for (let i = userSteps.value.length; i < timeFrom.value; i++) {
      userSteps.value.push(0)
    }
  }
  for (let i = timeFrom.value; i <= timeTo.value; i++) {
    if (i < userSteps.value.length) {
      userSteps.value[i] = arrivingUsers.value;
    } else {
      userSteps.value.push(arrivingUsers.value);
    }
  }

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


async function applyDuration() {
  if (duration.value > userSteps.value.length) {
    for (let i = userSteps.value.length; i < duration.value; i++) {
      userSteps.value.push(0);
    }
  } else if (duration.value < userSteps.value.length) {
    userSteps.value.splice(duration.value);
  }
  needsUpdate.value = true
}

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
  height: 50%;
  overflow-y: auto;
}

.controls {
  margin-top: 0.5em;
  position: relative;
  display: flex;
  align-items: stretch;
  gap: 0.5em;
  flex-wrap: wrap;
  max-width: 100%;
  width: 100%;
  height: 2.5em;
  box-sizing: border-box;
}

.controls > * {
  height: 100%;
  min-width: 0;
  box-sizing: border-box;
}

input {
  flex: 1;
  padding: 0.5em;
  border: 0 solid #ccc;
  border-radius: 4px;
  background-color: #369a6e;
  appearance: none;
}

input:focus {
  outline: none;
  box-shadow: 0 0 5px rgba(54, 154, 110, 0.5);
}

span {
  flex: 4;
  padding: 0.5em;
  border: 0 solid #ccc;
  border-radius: 4px;
  background-color: #369a6e;
  color: white;
  font-size: 1em;
  text-align: center;
  appearance: none;
  cursor: pointer;
}

button {
  padding: 0.5em;
  margin-right: 0.5em;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
}

button:hover {
  background-color: #369a6e;
}
</style>