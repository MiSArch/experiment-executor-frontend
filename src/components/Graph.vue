<template>
  <div class="m-2 pt-5 w-full max-h-[95vh] md:w-2/3 relative">
    <button class="btn-graph-hover right-2" @click="showGraphOverlay = !showGraphOverlay;" title="Configure Experiment Load">⚙</button>
    <button class="btn-graph-hover right-2 !top-14" @click="showWarmUpOverlay = !showWarmUpOverlay;" title="Configure Warm Up">☰</button>
    <button class="btn-graph-hover right-2 !top-26" @click="toggleHelpOverlay('Graph')" title="Open Experiment Graph Help">?</button>

    <LineChart ref="chartRef" :key="chartKey" class="grow h-full" :chart-data="chartData" :chart-options="chartOptions"/>

    <div v-if="showGraphOverlay" class="z-50 absolute w-full h-full top-0 left-0 right-0 bg-[#242424] p-6">
      <button class="btn-graph-hover right-14" @click="toggleHelpOverlay('Load')" title="Open Load Configuration Help">?</button>
      <button class="btn-graph-hover right-2" @click="showGraphOverlay = !showGraphOverlay;" title="Close Configuration">&times;</button>
      <div class="flex flex-col gap-4 items-center pt-12 max-w-2xl mx-auto min-width-xl">
        <span class="span-ui-header !-mt-5 !text-center w-full">Configure Load</span>
        <div class="flex flex-row gap-4 w-full items-center">
          <select v-model="currentlyEditing" class="select-default" title="Select Scenario for Configuration">
            <option v-for="(config, idx) in gatlingConfigs" :key="config.fileName" :value="idx" style="text-align: center;">{{
                config.fileName
              }}
            </option>
          </select>
        </div>

        <div class="flex flex-row gap-4 w-full items-center">
          <div class="flex flex-col gap-2 w-full">
            <div class="flex flex-row gap-2 items-center">
              <span class="span-label">Duration</span>
              <input class="input-default" v-model="duration[currentlyEditing]" placeholder="Duration"/>
            </div>
          </div>
          <button class="btn-apply" @click="applyDuration" style="align-self: stretch;" title="Apply Duration Configuration for Scenario">Apply
          </button>
        </div>

        <div class="flex flex-row gap-4 w-full items-center">
          <div class="flex flex-col gap-2 w-full">
            <div class="flex flex-row gap-2 items-center">
              <span class="span-label">From Second</span>
              <input class="input-default" type="number" min="0" step="1" v-model="timeFrom" placeholder="0"/>
            </div>
            <div class="flex flex-row gap-2 items-center">
              <span class="span-label">To Second</span>
              <input class="input-default" type="number" min="0" step="1" v-model="timeTo" placeholder="0"/>
            </div>
            <div class="flex flex-row gap-2 items-center">
              <span class="span-label">Arriving Users / s</span>
              <input class="input-default" type="number" min="0" step="1" v-model="arrivingUsers" placeholder="0"/>
            </div>
          </div>
          <button class="btn-apply" @click="applyUsers" style="align-self: stretch;" title="Apply Arriving Users Configuration for Scenario">Apply
          </button>
        </div>
        <button class="btn-green-add" :disabled="arraysEqual(gatlingConfigs[currentlyEditing].userSteps,
        userStepsResetState[currentlyEditing].userSteps)" @click="resetGatlingTimeConfigs" title="Reset Load Configuration for Scenario">Reset
        </button>
      </div>
    </div>
    <div v-if="showWarmUpOverlay" class="z-60 absolute w-full h-full top-0 left-0 right-0 bg-[#242424] p-6">
      <button class="btn-graph-hover right-14" @click="toggleHelpOverlay('WarmUp')" title="Open Warm Up Help">?</button>
      <button class="btn-graph-hover right-2" @click="showWarmUpOverlay = !showWarmUpOverlay;" title="Close Configuration">&times;</button>
      <div class="flex flex-col gap-4 items-center pt-12 max-w-2xl mx-auto min-width-xl">
        <span class="span-ui-header !-mt-5 !text-center w-full">Configure Warm-Up </span>
        <div class="flex flex-row gap-4 items-center w-full justify-end">
          <div v-if="useWarmUp" class="flex flex-row gap-4 w-full items-center">
            <span class="span-label">Constant Users / s</span>
            <input class="input-default" type="number" min="0" step="1" placeholder="10" v-model="warmUpRate"/>
          </div>
          <div v-if="useWarmUp" class="flex flex-row gap-4 w-full items-center">
            <span class="span-label">Duration (s)</span>
            <input class="input-default" type="number" min="0" step="1" placeholder="10" v-model="warmUpDuration"/>
          </div>
          <button v-if="useWarmUp" class="btn-gray-close" @click="toggleWarmUp" title="Delete Warm Up for Experiment">&times;</button>
        </div>
        <button v-if="!useWarmUp" class="btn-green-add" @click="toggleWarmUp" title="Add Warm Up for Experiment">+</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineChartComponent} from 'vue-chart-3'
import dragDataPlugin from 'chartjs-plugin-dragdata'
import {CategoryScale, Chart as ChartJS, Legend, LinearScale, LineController, LineElement, PointElement, Title, Tooltip} from 'chart.js'
import {ref, toRaw, watch} from 'vue'
import {
  chaostoolkitConfig,
  config,
  gatlingConfigs,
  misarchExperimentConfig,
  showGraphOverlay,
  showOverlay,
  showWarmUpOverlay,
  toggleAlert,
  toggleHelpOverlay,
  userStepsResetState,
} from "../util/global-state-handler.ts";

ChartJS.register(Title, Tooltip, Legend, LineElement, LinearScale, PointElement, CategoryScale, LineController, dragDataPlugin)

const LineChart = defineChartComponent("graph", 'line')
const timeFrom = ref<number>(0)
const timeTo = ref<number>(0)
const arrivingUsers = ref<number>(0)
const needsUpdate = ref<boolean>(false)
const duration = ref<number[]>([])
const currentlyEditing = ref<number>(0)
const chartRef = ref<ChartJS | null>(null)
const chartKey = ref(0)
const lastMisarchPauses = ref<string>('')
const lastChaosPauses = ref<string>('')
const lastGatlingConfigs = ref<string>('')
const useWarmUp = ref<boolean>(false)
const warmUpDuration = ref<number>(0);
const warmUpRate = ref<number>(0);

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
      data: [0, null],
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

async function getXLabels() {
  const maxSessionDuration = Math.max(...gatlingConfigs.value.map((_, i) => calculateSessionDuration(i)));
  const maxLength = Math.max(...gatlingConfigs.value.map(config => config.userSteps.length)) + maxSessionDuration

  return Array.from({length: maxLength}, (_, i) => (i).toString());
}

async function updateGraph() {

  chartData.value.labels = await getXLabels();
  gatlingConfigs.value.map(config => {
    duration.value[gatlingConfigs.value.indexOf(config)] = config.userSteps.length;
  });

  await removeFailureLinesFromChart()
  chartRef.value?.update()

  for (let i = 0; i < chartData.value.datasets.length - 1; i++) {
    chartData.value.datasets[i + 1].data = await calculateTotalUsers(i);
  }

  chartData.value.datasets[0].data = await calculateApproximateRequests();
  await addFailureLinesChaosToolkit();
  await addFailureLinesMiSArch()
  chartRef.value?.update()
}

async function calculateTotalUsers(index: number): Promise<number[]> {
  const totalUsers: number[] = [];
  const sessionDuration = calculateSessionDuration(index);

  gatlingConfigs.value[index].userSteps.forEach((users, time) => {
    for (let i = 0; i < sessionDuration; i++) {
      totalUsers[time + i] = (totalUsers[time + i] || 0) + users;
    }
  });

  return totalUsers;
}

function calculateSessionDuration(index: number): number {
  return Math.floor(gatlingConfigs.value[index].workModel.steps
  .filter((step): step is typeof step & { durationMin: number, durationMax: number } =>
      step.type === 'pause' && step.durationMin !== undefined && step.durationMax !== undefined)
  .reduce((sum, step) => sum + (step.durationMin + step.durationMax) / 2, 0) / 1000);
}

async function calculateApproximateRequests(): Promise<number[]> {
  const approximateRequests: number[] = [];
  for (let i = 0; i < gatlingConfigs.value.length; i++) {
    const requestPauses = gatlingConfigs.value[i].workModel.steps
    .filter((step): step is typeof step & { durationMin: number, durationMax: number } =>
        step.type === 'pause' && step.durationMin !== undefined && step.durationMax !== undefined)
    .map(step => Math.floor((step.durationMin + step.durationMax) / 2 / 1000));
    const sessionRequests = await expandPausesToTimeline(requestPauses);

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
    toggleAlert('Time and Arriving Users must be non-negative.')
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

watch(config, async (newValue, oldValue) => {
  if (newValue !== oldValue && config.value.warmUp !== undefined && config.value.warmUp !== null) {
    useWarmUp.value = true;
    warmUpRate.value = config.value.warmUp.rate;
    warmUpDuration.value = config.value.warmUp.duration;
  }
})

watch(gatlingConfigs, async (newVal) => {
      if (showOverlay.value) return;
      const configs = toRaw(newVal)
      .map((item: any) => `${item.fileName},${item.fileName}`)
      .join('|')
      if (configs !== lastGatlingConfigs.value) {
        currentlyEditing.value = 0;
        lastGatlingConfigs.value = configs
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
            showLine: true,
            pointRadius: 0,
          })
        }

        chartData.value.datasets = list;
        chartKey.value++;
      }

      clearTimeout((watch as any)._debounceTimeout);
      (watch as any)._debounceTimeout = setTimeout(() => {
        needsUpdate.value = true;
      }, 300);
    },
    {
      deep: true
    }
)

watch(misarchExperimentConfig, async (newVal) => {
      if (showOverlay.value) return;
      const pauses = toRaw(newVal)
      .map((item: any) => `${item.pauses.before},${item.pauses.after}`)
      .join('|')
      if (pauses !== lastMisarchPauses.value) {
        clearTimeout((watch as any)._debounceTimeout);
        (watch as any)._debounceTimeout = setTimeout(() => {
          needsUpdate.value = true;
        }, 300);
        lastMisarchPauses.value = pauses
      }
    }, {deep: true}
)

watch(chaostoolkitConfig, async (newVal) => {
      if (showOverlay.value) return;
      const pauses = toRaw(newVal).method
      .filter((item: any) => item.type === 'action' && item.pauses)
      .map((item: any) => `${item.pauses.before},${item.pauses.after}`)
      .join('|')
      if (pauses !== lastChaosPauses.value) {
        clearTimeout((watch as any)._debounceTimeout);
        (watch as any)._debounceTimeout = setTimeout(() => {
          needsUpdate.value = true;
        }, 300);
        lastChaosPauses.value = pauses
      }
    }, {deep: true}
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
    showLine: true,
    pointRadius: 0,
  };
}

async function applyDuration() {
  if (duration.value[currentlyEditing.value] > gatlingConfigs.value[currentlyEditing.value].userSteps.length) {
    for (let i = gatlingConfigs.value[currentlyEditing.value].userSteps.length; i < duration.value[currentlyEditing.value]; i++) {
      gatlingConfigs.value[currentlyEditing.value].userSteps.push(0);
    }
  } else if (duration.value[currentlyEditing.value] < gatlingConfigs.value[currentlyEditing.value].userSteps.length) {
    gatlingConfigs.value[currentlyEditing.value].userSteps.splice(duration.value[currentlyEditing.value]);
  }
  needsUpdate.value = true
}

async function resetGatlingTimeConfigs() {
  gatlingConfigs.value[currentlyEditing.value].userSteps = [...userStepsResetState.value[currentlyEditing.value].userSteps];
  duration.value[currentlyEditing.value] = gatlingConfigs.value[currentlyEditing.value].userSteps.length;
  needsUpdate.value = true
}

async function expandPausesToTimeline(pauses: number[]): Promise<number[]> {
  const timeline: number[] = [];
  let time = 0;

  for (const pause of pauses) {
    if (timeline[time] === undefined) {
      timeline[time] = 0;
    }

    timeline[time] += 1;

    for (let i = 1; i <= pause; i++) {
      if (timeline[time + i] === undefined) {
        timeline[time + i] = 0;
      }
    }

    time += pause;
  }

  return timeline;
}

async function removeFailureLinesFromChart() {
  chartData.value.datasets = chartData.value.datasets.filter(ds => !ds.label.startsWith('MiSArch Failure Sets')
      && !ds.label.startsWith('ChaosToolkit Actions'))
}

async function addFailureLinesChaosToolkit() {
  const xValues: number[] = [];
  if (chaostoolkitConfig.value.method && chaostoolkitConfig.value.method.length !== 0) {
    let currentTime = 0;
    chaostoolkitConfig.value.method.forEach(probeOrAction => {
      if (probeOrAction.type === 'action' && probeOrAction.pauses) {
        currentTime += probeOrAction.pauses.before;
      }
      xValues.push(currentTime);
      if (probeOrAction.type === 'action' && probeOrAction.pauses) {
        currentTime += probeOrAction.pauses.after;
      }
    });
  }
  await buildFailureGraph(xValues, 'ChaosToolkit Actions', 'rgb(255,128,59, 1)', 'rgba(255, 128, 59, 0.2)');
}

async function addFailureLinesMiSArch() {
  const xValues: number[] = [];
  if (misarchExperimentConfig.value.length !== 0) {
    let currentTime = 0;
    misarchExperimentConfig.value.forEach(config => {
      currentTime += config.pauses.before
      xValues.push(currentTime);
      currentTime += config.pauses.after;
    });
  }
  await buildFailureGraph(xValues, 'MiSArch Failure Sets', 'rgb(255,54,54,1)', 'rgba(255, 54, 54, 0.2)');
}

async function getMaxYValue() {
  const values = chartData.value.datasets
  .filter(ds => !ds.label.startsWith('MiSArch Failure Sets') && !ds.label.startsWith('ChaosToolkit Actions'))
  .flatMap(ds => ds.data as number[]);
  return values.length > 0 ? Math.max(...values) : 0;
}

async function buildFailureGraph(xValues: number[], label: string, borderColor: string, backgroundColor: string) {
  const maxY = await getMaxYValue() * 1.10;
  const minY = 0;
  const maxX = Math.ceil(xValues[xValues.length - 1]);
  let data: Array<number | null> = [];

  for (let x = 0; x <= maxX; x++) {
    if (xValues.includes(x)) {
      data.push(minY);
      data.push(maxY);
      x++;
    } else {
      data.push(null);
    }
  }

  const failureLineDataSet = {
    label: label,
    data,
    borderColor: borderColor,
    backgroundColor: backgroundColor,
    borderWidth: 2,
    fill: false,
    showLine: true,
    pointRadius: 0,
    borderDash: [5, 5],
    dragData: false,
  };

  chartData.value.datasets.push(failureLineDataSet);
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((val, idx) => val === b[idx])
}

async function toggleWarmUp() {
  useWarmUp.value = !useWarmUp.value;
  if (useWarmUp.value) {
    config.value.warmUp = {
      rate: warmUpRate.value,
      duration: warmUpDuration.value,
    };
  } else {
    config.value.warmUp = undefined;
  }
}

watch(warmUpDuration, async (newValue, oldValue) => {
  if (newValue !== oldValue)  {
    config.value.warmUp!.duration = newValue;
  }
})

watch(warmUpRate, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    config.value.warmUp!.rate = newValue;
  }
})

</script>

<style/>