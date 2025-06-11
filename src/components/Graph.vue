<template>
  <div class="flex flex-col m-2 pt-5 w-full md:w-2/3">
    <LineChart class="grow" :chart-data="chartData" :chart-options="chartOptions"/>
    <div class="flex flex-row mt-2 items-stretch gap-1 max-w-full w-full box-border">
      <span class="min-w-0 box-border">Duration in s</span>
      <input class="min-w-0 box-border flex-1" type="number" v-model="duration" placeholder="Duration"/>
      <button class="min-w-0 box-border p-2 mr-3 border-0 rounded-xs flex cursor-pointer" @click="applyDuration">Apply</button>

      <span class="min-w-0 box-border">From second</span>
      <input class="min-w-0 box-border" type="number" v-model="timeFrom" placeholder="TimeFrom"/>
      <span class="min-w-0 box-border">To second</span>
      <input class="min-w-0 box-border" type="number" v-model="timeTo" placeholder="TimeTo"/>
      <span class="min-w-0 box-border">Arriving Users / s</span>
      <input class="min-w-0 box-border" type="number" v-model="arrivingUsers" placeholder="Arriving Users"/>
      <button class="min-w-0 box-border" @click="applyUsers">Apply</button>
      <select v-model="currentlyEditing" class="dropdown">
        <option v-for="(config, idx) in gatlingConfigs" :key="config.fileName" :value="idx">
          {{ config.fileName }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO we need a ui element to select the currently edited user step
import {defineChartComponent} from 'vue-chart-3'
import dragDataPlugin from 'chartjs-plugin-dragdata'
import {CategoryScale, Chart as ChartJS, Legend, LinearScale, LineController, LineElement, PointElement, Title, Tooltip} from 'chart.js'
import {onMounted, ref, watch} from 'vue'
import {testUuid, testVersion} from "../util/test-uuid.ts";
import {showOverlay} from "../util/show-overlay.ts";
import {gatlingConfigs} from "../util/test-handler.ts";

ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, LineController, dragDataPlugin)

const LineChart = defineChartComponent("test", 'line')
const timeFrom = ref<number>(0)
const timeTo = ref<number>(0)
const arrivingUsers = ref<number>(0)
const needsUpdate = ref<boolean>(false)
const duration = ref(0)
const currentlyEditing = ref<number>(1)

// TODO this must be calculated from the work
const approximateSessionDuration = 20
const sessionRequests = [1, 0, 0, 0, 0, 0, 0, 3, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1]

const colors = [
  {border: 'rgba(83, 102, 255, 1)', background: 'rgba(83, 102, 255, 0.2)'},
  {border: 'rgba(60, 179, 113, 1)', background: 'rgba(60, 179, 113, 0.2)'},
  {border: 'rgba(255, 206, 86, 1)', background: 'rgba(255, 206, 86, 0.2)'},
  {border: 'rgba(255, 105, 180, 1)', background: 'rgba(255, 105, 180, 0.2)'},
  {border: 'rgba(153, 102, 255, 1)', background: 'rgba(153, 102, 255, 0.2)'},
  {border: 'rgba(54, 162, 235, 1)', background: 'rgba(54, 162, 235, 0.2)'},
  {border: 'rgba(255, 99, 132, 1)', background: 'rgba(255, 99, 132, 0.2)'},
  {border: 'rgba(187, 102, 255, 1)', background: 'rgba(187, 102, 255, 0.2)'},
  {border: 'rgba(75, 192, 192, 1)', background: 'rgba(75, 192, 192, 0.2)'},
  {border: 'rgba(255, 159, 64, 1)', background: 'rgba(255, 159, 64, 0.2)'},
];

const chartData = ref({
  labels: [''],
  datasets: [
    {
      label: 'Approx. Total Requests',
      data: [0],
      borderColor: 'rgba(199, 199, 199, 1)',
      backgroundColor: 'rgba(199, 199, 199, 0.2)',
      borderWidth: 2,
      dragData: false,
    },
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
  for (let i = 1; i <= gatlingConfigs.value.length; i++) {
    const usersResult = await calculateTotalUsers(Math.floor(approximateSessionDuration), i - 1);
    chartData.value.labels = usersResult.map((_, index) => index.toString());
    chartData.value.datasets[i].data = usersResult;
    duration.value = usersResult.length;
  }

  chartData.value.datasets[0].data = await calculateApproximateRequests();
}

async function calculateTotalUsers(sessionDuration: number, index: number): Promise<number[]> {
  const totalUsers: number[] = [];

  gatlingConfigs.value[index].userSteps.forEach((users, time) => {
    for (let i = 0; i < sessionDuration; i++) {
      totalUsers[time + i] = (totalUsers[time + i] || 0) + users;
    }
  });

  return totalUsers;
}

async function calculateApproximateRequests(): Promise<number[]> {
  const approximateRequests: number[] = [];

  gatlingConfigs.value[currentlyEditing.value].userSteps.forEach((users, time) => {
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
  if (timeFrom.value >= gatlingConfigs.value[currentlyEditing.value].userSteps.length) {
    for (let i = gatlingConfigs.value[currentlyEditing.value].userSteps.length; i < timeFrom.value; i++) {
      gatlingConfigs.value[currentlyEditing.value].userSteps.push(0)
    }
  }
  for (let i = timeFrom.value; i <= timeTo.value; i++) {
    if (i < gatlingConfigs.value[currentlyEditing.value].userSteps.length) {
      gatlingConfigs.value[currentlyEditing.value].userSteps[i] = arrivingUsers.value;
    } else {
      gatlingConfigs.value[currentlyEditing.value].userSteps.push(arrivingUsers.value);
    }
  }

  needsUpdate.value = true
}

onMounted(async () => {
  if (testUuid.value != '' || testVersion.value != '') {
    await updateGraph()
  }
})

watch(gatlingConfigs, async() =>  {
  // TODO this does not work properly yet because on the init it is called
  if (gatlingConfigs.value.length > chartData.value.datasets.length) {
    chartData.value.datasets.push({
      label: 'Approx. Total Users - ' + gatlingConfigs.value[length + 1].fileName,
      data: [0],
      borderColor: colors[gatlingConfigs.value.length /*+ 1*/ % colors.length].border,
      backgroundColor: colors[gatlingConfigs.value.length /*+ 1*/ % colors.length].background,
      borderWidth: 2,
      dragData: false,
    });
    await updateGraph();
  }
}, { deep: true })

watch(showOverlay, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    while (!gatlingConfigs.value[currentlyEditing.value]) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    for (let i = 0; i < gatlingConfigs.value.length; i++) {
      const color = colors[i % colors.length];

      chartData.value.datasets.push({
        label: 'Approx. Total Users - ' + gatlingConfigs.value[i].fileName,
        data: [0],
        borderColor: color.border,
        backgroundColor: color.background,
        borderWidth: 2,
        dragData: false,
      });
    }

    await updateGraph();
  }
});


watch(needsUpdate, async () => {
  await updateGraph()
  needsUpdate.value = false
})


async function applyDuration() {
  if (duration.value > gatlingConfigs.value[currentlyEditing.value].userSteps.length) {
    for (let i = gatlingConfigs.value[currentlyEditing.value].userSteps.length; i < duration.value; i++) {
      gatlingConfigs.value[currentlyEditing.value].userSteps.push(0);
    }
  } else if (duration.value < gatlingConfigs.value[currentlyEditing.value].userSteps.length) {
    gatlingConfigs.value[currentlyEditing.value].userSteps.splice(duration.value);
  }
  needsUpdate.value = true
}

</script>

<style scoped>
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
  flex: 3;
  padding: 0.5em;
  border: 0 solid #ccc;
  border-radius: 4px;
  background-color: #369a6e;
  color: white;
  font-size: 1em;
  text-align: center;
  appearance: none;
}

button {
  background-color: #42b883;
  color: white;
}

button:hover {
  background-color: #369a6e;
}
</style>