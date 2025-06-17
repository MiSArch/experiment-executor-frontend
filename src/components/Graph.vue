<template>
  <div class="m-2 pt-5 w-full max-h-[95vh] md:w-2/3 relative">
    <button
        class="z-50 absolute top-2 right-2 w-10 h-10 flex justify-center items-center rounded-md bg-[#369a6e] text-white hover:bg-[#2d7a5a] border-0"
        @click="toggleGraphOverlay">☰
    </button>

    <LineChart :key="chartKey" class="grow h-full" :chart-data="chartData" :chart-options="chartOptions"/>

    <div v-if="isGraphOverlayVisible" class="z-50 absolute w-full h-full top-0 left-0 right-0 bg-[#242424] p-6">
      <button
          class="z-50 absolute top-2 right-2 w-10 h-10 flex justify-center items-center rounded-md bg-[#369a6e] text-white hover:bg-[#2d7a5a] border-0"
          @click="toggleGraphOverlay">X
      </button>
      <div class="flex flex-col gap-4 items-center pt-12 max-w-2xl mx-auto min-width-xl">
        <div class="flex flex-row gap-4 w-full items-center">
          <select v-model="currentlyEditing"
                  class="p-2 rounded-md bg-[#42b883] text-white text-sm appearance-none cursor-pointer focus:outline-none grow font-bold"
                  style="user-select: none;">
            <option v-for="(config, idx) in gatlingConfigs" :key="config.fileName" :value="idx" style="text-align: center;">{{
                config.fileName
              }}
            </option>
          </select>
        </div>

        <div class="flex flex-row gap-4 w-full items-center">
          <div class="flex flex-col gap-2 w-full">
            <div class="flex flex-row gap-2 items-center">
              <span class="flex-1 p-2 rounded bg-[#369a6e] text-white text-base text-center">Duration</span>
              <input class="min-w-0 p-2 rounded bg-[#369a6e] text-white flex-1" type="number" v-model="duration" placeholder="Duration"/>
            </div>
          </div>
          <button class="min-w-0 w-auto px-4 flex justify-center items-center rounded-md bg-[#369a6e] text-white hover:bg-[#2d7a5a] border-0"
                  @click="applyDuration" style="align-self: stretch;">Apply
          </button>
        </div>

        <div class="flex flex-row gap-4 w-full items-center">
          <div class="flex flex-col gap-2 w-full">
            <div class="flex flex-row gap-2 items-center">
              <span class="flex-1 p-2 rounded bg-[#369a6e] text-white text-base text-center">From Second</span>
              <input class="min-w-0 p-2 rounded bg-[#369a6e] text-white flex-1" type="number" v-model="timeFrom" placeholder="TimeFrom"/>
            </div>
            <div class="flex flex-row gap-2 items-center">
              <span class="flex-1 p-2 rounded bg-[#369a6e] text-white text-base text-center">To Second</span>
              <input class="min-w-0 p-2 rounded bg-[#369a6e] text-white flex-1" type="number" v-model="timeTo" placeholder="TimeTo"/>
            </div>
            <div class="flex flex-row gap-2 items-center">
              <span class="flex-1 p-2 rounded bg-[#369a6e] text-white text-base text-center">Arriving Users / s</span>
              <input class="min-w-0 p-2 rounded bg-[#369a6e] text-white flex-1" type="number" v-model="arrivingUsers" placeholder="Arriving Users"/>
            </div>
          </div>
          <button class="min-w-0 w-auto px-4 flex justify-center items-center rounded-md bg-[#369a6e] text-white hover:bg-[#2d7a5a] border-0"
                  @click="applyUsers" style="align-self: stretch;">Apply
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineChartComponent} from 'vue-chart-3'
import dragDataPlugin from 'chartjs-plugin-dragdata'
import {CategoryScale, Chart as ChartJS, Legend, LinearScale, LineController, LineElement, PointElement, Title, Tooltip} from 'chart.js'
import {ref, watch} from 'vue'
import {gatlingConfigs} from "../util/test-handler.ts";

ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, LineController, dragDataPlugin)

const LineChart = defineChartComponent("test", 'line')
const timeFrom = ref<number>(0)
const timeTo = ref<number>(0)
const arrivingUsers = ref<number>(0)
const needsUpdate = ref<boolean>(false)
const duration = ref(0)
const currentlyEditing = ref<number>(1)
const isGraphOverlayVisible = ref(false)
const chartKey = ref(0);

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

function toggleGraphOverlay() {
  isGraphOverlayVisible.value = !isGraphOverlayVisible.value;
}

async function updateGraph() {
  const maxLength = Math.max(...gatlingConfigs.value.map(config => config.userSteps.length));
  chartData.value.labels = Array.from({length: maxLength}, (_, i) => (i + 1).toString());
  duration.value = maxLength;

  for (let i = 0; i < chartData.value.datasets.length - 1; i++) {
    chartData.value.datasets[i + 1].data = await calculateTotalUsers(Math.floor(approximateSessionDuration), i);
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
  for (let i = 0; i < gatlingConfigs.value.length; i++) {
    gatlingConfigs.value[i].userSteps.forEach((users, time) => {
      for (let j = 0; j < sessionRequests.length; j++) {
        const requestIndex = time + j;
        approximateRequests[requestIndex] = (approximateRequests[requestIndex] || 0) + users * sessionRequests[j];
      }
    });
  }

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

watch(gatlingConfigs, async () => {
      if (gatlingConfigs.value.length + 1 != chartData.value.datasets.length) {
        const list = []
        const totalRequests = await createTotalRequestChartData()
        list.push(totalRequests)

        for (let i = 0; i < gatlingConfigs.value.length; i++) {
          const color = colors[i % colors.length];
          list.push({
            label: 'Approx. Total Users - ' + gatlingConfigs.value[i].fileName,
            data: [0],
            borderColor: color.border,
            backgroundColor: color.background,
            borderWidth: 2,
            dragData: false,
          })
        }

        chartData.value.datasets = list;
        chartKey.value++;
        needsUpdate.value = true;
      }
    },
    {
      deep: true
    }
)

watch(needsUpdate, async () => {
  await updateGraph()
  needsUpdate.value = false
})

async function createTotalRequestChartData() {
  return {
    label: 'Approx. Total Requests',
    data: [0],
    borderColor: 'rgba(199, 199, 199, 1)',
    backgroundColor: 'rgba(199, 199, 199, 0.2)',
    borderWidth: 2,
    dragData: false,
  };
}

// TODO show the correct duration for each scenario
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

<style/>