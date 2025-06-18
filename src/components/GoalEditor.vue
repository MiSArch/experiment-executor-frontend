<template>
  <div class="flex flex-col w-full md:min-w-2/12 md:max-w-3/12 h-full max-h-[512px] overflow-x-hidden">
    <div class="flex flex-row items-center justify-between p-2 bg-[#235f43] text-white shadow-md">
      <span class="text-lg font-bold">Experiment Goals</span>
      <button @click="addLine" class="px-4 py-2 bg-[#369a6e] text-white rounded hover:bg-[#2d7a5a] mr-4">+</button>
    </div>
    <div class="flex flex-col gap-2 p-2 max-w-full overflow-y-scroll">
      <div v-for="(line, index) in lines" :key="index" class="flex flex-wrap items-center gap-2 w-full relative">
        <select v-model="line.dropdown" class="flex-6 min-w-0 h-full text-sm p-2 rounded bg-[#369a6e] text-white appearance-none cursor-pointer hover:bg-[#42b883] focus:outline-none focus:ring focus:ring-[#369a6e]/50">
          <option v-for="option in dropdownOptions" :key="option" :value="option">{{ option }}</option>
        </select>

        <div class="flex-1 rounded cursor-pointer min-w-0 h-full" :style="{ backgroundColor: line.color }" @click="toggleColorOptions(index)"></div>
        <div v-if="line.showDropdown" class="absolute top-0 left-0 z-10 flex flex-wrap gap-2 bg-gray-100 p-2 rounded shadow-md w-1/2 max-w-full overflow-auto">
          <div v-for="(hex, color) in reverseColorMap" :key="color" class="h-5 w-[12%] rounded cursor-pointer" :style="{ backgroundColor: hex }" @click="selectColor(index, hex)"></div>
        </div>

        <input type="number" v-model="line.value" class="flex-[1.5] min-w-0 h-10 p-2 rounded bg-[#369a6e] text-white focus:outline-none focus:ring focus:ring-[#369a6e] appearance-none"/>
        <button @click="removeLine(index)" class="flex-1 min-w-0 px-2 py-1 bg-[#369a6e] text-white rounded hover:bg-[#42b883] h-full">&times;</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, watch} from 'vue'
import type {TestConfig} from "../model/test-config.ts";
import {showOverlay, testUuid, testVersion, backendUrl, config} from "../util/global-state-handler.ts";

interface Line {
  dropdown: string;
  color: string;
  value: number | null;
  showDropdown: boolean;
}

const lines = ref<Line[]>([])

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
  'number reqs with resp. time t < 800 ms',
  'number reqs with resp. time t < 800 ms < t < 1200 ms',
  'number reqs with resp. time t > 1200 ms',
  'number failed requests',
  'number of requests total',
  'number of requests total ok',
  'number of requests total ko',
  'mean requests/sec',
  'mean requests/sec ok',
  'mean requests/sec ko',
  'min response time',
  'mean response time',
  'max response time',
  'min response time ok',
  'mean response time ok',
  'max response time ok',
  'min response time ko',
  'mean response time ko',
  'max response time ko',
];

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
  const data: TestConfig = await response.json()
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

watch(lines, (newLines) => {
  config.value.goals = newLines.map(line => ({
    metric: line.dropdown,
    color: colorMap[line.color] || line.color,
    threshold: line.value?.toString() || ''
  }))
}, {deep: true})

watch(showOverlay, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    config.value = await fetchConfig();
  }
});
</script>

<style/>