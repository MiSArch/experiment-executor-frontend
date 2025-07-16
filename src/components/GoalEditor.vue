<template>
  <div class="flex flex-col w-full md:min-w-2/12 md:max-w-3/12 h-full max-h-[512px] overflow-x-hidden">
    <div class="div-subheader">
      <span class="span-subheader">Experiment Goals</span>
      <div>
        <button class="btn-header" @click="toggleHelpOverlay('GoalEditor')">?</button>
        <button class="btn-header" @click="toggleExperimentGoals">{{ showExperimentGoals ? 'Auto' : 'Manual' }}
        </button>
      </div>
    </div>
    <div v-if="!showExperimentGoals" class="flex flex-col items-center justify-center w-full p-2 gap-2 overflow-y-auto">
      <span class="span-label">Automatically detecting experiment goals using a steady-state hypothesis measured before the test execution.</span>
      <div class="flex flex-row gap-2 w-full">
        <span class="span-label">Static User Rate</span>
        <input class="input-default" type="number" min="0" step="1" v-model="steadyStateRate">
      </div>
      <div class="flex flex-row gap-2 w-full">
        <span class="span-label">Duration</span>
        <input class="input-default" type="number" min="0" step="1" v-model="steadyStateDuration">
      </div>
      <div class="flex flex-row gap-2 w-full">
        <span class="span-label">Factor</span>
        <input class="input-default" type="number" min="0" step="0.01" v-model="steadyStateFactor">
      </div>
    </div>
    <div v-if="showExperimentGoals" class="flex flex-col gap-2 p-2 max-w-full overflow-y-auto min-w-0">
      <div v-for="(line, index) in lines" :key="index" class="flex items-center gap-2 w-full relative">
        <select v-model="line.dropdown" class="select-default !min-w-0 !flex-6">
          <option v-for="option in dropdownOptions" :key="option" :value="option">{{ option }}</option>
        </select>
        <input type="number" v-model="line.value" class="input-default !flex-[1.5]"/>
        <div class="flex-1 rounded cursor-pointer min-w-0 h-full" :style="{ backgroundColor: line.color }" @click="toggleColorOptions(index)"></div>
        <div v-if="line.showDropdown"
             class="absolute top-0 left-0 z-10 flex gap-2 bg-gray-100 p-2 rounded shadow-md w-1/2 max-w-full overflow-auto">
          <div v-for="(hex, color) in reverseColorMap" :key="color" class="h-5 w-[12%] rounded cursor-pointer" :style="{ backgroundColor: hex }"
               @click="selectColor(index, hex)"></div>
        </div>
        <button @click="removeLine(index)" class="btn-gray-close">&times;</button>
      </div>
      <button v-if="showExperimentGoals" @click="addLine" class="btn-green-add">+</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import type {ExperimentConfig} from "../model/experiment-config.ts";
import {
  showOverlay,
  testUuid,
  testVersion,
  backendUrl,
  config,
  toggleHelpOverlay,
  showExperimentGoals,
} from "../util/global-state-handler.ts";

interface Line {
  dropdown: string;
  color: string;
  value: number | null;
  showDropdown: boolean;
}

const lines = ref<Line[]>([])
const steadyStateDuration = ref<number>(0);
const steadyStateFactor = ref<number>(1.0);
const steadyStateRate = ref<number>(0);

const colorMap: Record<string, string> = {
  '#f2495c': 'red',
  '#fc9830': 'orange',
  '#fade2b': 'yellow',
  '#73bf69': 'green',
  '#5794f2': 'blue',
  '#b977d9': 'purple',
};

const reverseColorMap: Record<string, string> = {
  red: '#f2495c',
  orange: '#fc9830',
  yellow: '#fade2b',
  green: '#73bf69',
  blue: '#5794f2',
  purple: '#b977d9',
};

const dropdownOptions = [
  'percentage reqs with resp. time t < 800 ms',
  'percentage reqs with resp. time 800 ms < t < 1200 ms',
  'percentage reqs with resp. time t > 1200 ms',
  'percentage failed requests',
  'percentage mean requests/sec ok',
  'percentage mean requests/sec ko',
  'min response time',
  'mean response time',
  'max response time',
  'min response time ok',
  'mean response time ok',
  'max response time ok',
  'min response time ko',
  'mean response time ko',
  'max response time ko',
  '50th percentile response time',
  '50th percentile response time ok',
  '50th percentile response time ko',
  '75th percentile response time',
  '75th percentile response time ok',
  '75th percentile response time ko',
  '95th percentile response time',
  '95th percentile response time ok',
  '95th percentile response time ko',
  '99th percentile response time',
  '99th percentile response time ok',
  '99th percentile response time ko',
];

async function toggleExperimentGoals() {
  showExperimentGoals.value = !showExperimentGoals.value;
  if (!showExperimentGoals.value) {
    config.value.steadyState = {duration: steadyStateDuration.value, rate: steadyStateRate.value, factor: steadyStateFactor.value}
    config.value.goals = []
  } else {
    config.value.steadyState = undefined;
    config.value.goals = lines.value.map(line => ({
      metric: line.dropdown,
      color: colorMap[line.color] || line.color,
      threshold: line.value?.toString() || ''
    }))
  }
}

const toggleColorOptions = (index: number) => {
  lines.value[index].showDropdown = !lines.value[index].showDropdown;
};

const selectColor = (index: number, color: string) => {
  lines.value[index].color = color;
  lines.value[index].showDropdown = false;
};

const fetchConfig = async () => {
  const response = await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}/config`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const data: ExperimentConfig = await response.json()
  lines.value = data.goals.map(goal => ({
    dropdown: goal.metric,
    color: reverseColorMap[goal.color] || goal.color,
    value: parseFloat(goal.threshold) || null,
    showDropdown: false
  }))
  return data
}

const addLine = () => {
  lines.value.push({dropdown: 'min response time', color: '#000000', value: null, showDropdown: false});
};

const removeLine = (index: number) => {
  lines.value.splice(index, 1)
}

watch(lines, async (newLines) => {
  config.value.goals = newLines.map(line => ({
    metric: line.dropdown,
    color: colorMap[line.color] || line.color,
    threshold: line.value?.toString() || ''
  }))
}, {deep: true})

watch(showOverlay, async (newValue, oldValue) => {
  if (newValue !== oldValue && !newValue) {
    config.value = await fetchConfig();
    steadyStateDuration.value = config.value.steadyState?.duration ? config.value.steadyState.duration : 0;
    steadyStateRate.value = config.value.steadyState?.rate ? config.value.steadyState.rate : 0;
    steadyStateFactor.value = config.value.steadyState?.factor ? config.value.steadyState.factor : 1.0;
    if (config.value.goals.length === 0 && config.value.steadyState !== undefined && config.value.steadyState !== null &&
        showExperimentGoals.value) {
      showExperimentGoals.value = false;
    }
  }
});

watch(steadyStateDuration, async (newValue, oldValue) => {
  if (!showExperimentGoals.value && newValue !== oldValue) {
    config.value.steadyState!.duration = newValue;
  }
})

watch(steadyStateRate, async (newValue, oldValue) => {
  if (!showExperimentGoals.value && newValue !== oldValue) {
    config.value.steadyState!.rate = newValue;
  }
})

watch(steadyStateFactor, async (newValue, oldValue) => {
  if (!showExperimentGoals.value && newValue !== oldValue) {
    config.value.steadyState!.factor = newValue;
  }
})
</script>

<style/>