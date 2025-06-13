<template>
  <div class="flex flex-col w-full md:min-w-2/12 md:max-w-3/12 h-full max-h-[512px] overflow-x-hidden">
    <div class="header flex flex-row items-center justify-between p-2">
      <span>Experiment Goals</span>
      <button @click="addLine" class="header-button">+</button>
    </div>
    <div class="list-container flex flex-col gap-2 p-2 max-w-full overflow-y-scroll ">
      <div v-for="(line, index) in lines" :key="index" class="line">
        <select v-model="line.dropdown" class="dropdown">
          <option v-for="option in dropdownOptions" :key="option" :value="option">{{ option }}</option>
        </select>
        <div
            class="color-display"
            :style="{ backgroundColor: line.color }"
            @click="toggleColorOptions(index)"
        ></div>
        <div v-if="line.showDropdown" class="color-options">
          <div
              v-for="(hex, color) in reverseColorMap"
              :key="color"
              class="color-option"
              :style="{ backgroundColor: hex }"
              @click="selectColor(index, hex)"
          ></div>
        </div>
        <input type="number" v-model="line.value" class="number-input"/>
        <button @click="removeLine(index)" class="delete-button">&times;</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO all options in dropdown above
// TODO color picker should actually pick a color from the chart
import {ref, watch} from 'vue'
import type {TestConfig} from "../model/test-config.ts";
import {backendUrl, config} from "../util/test-handler.ts";
import {testUuid, testVersion} from "../util/test-uuid.ts";
import {showOverlay} from "../util/show-overlay.ts";

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

<style scoped>

.color-display {
  flex: 1;
}

.color-option {
  width: 12%
}

.color-display,
.color-option {
  height: 20px;
  border-radius: 4px;
  cursor: pointer;
}

.color-options {
  position: absolute;
  top: -100%;
  left: 0;
  z-index: 10;
  display: flex;
  gap: 0.5em;
  margin-top: 0.2em; /* Slight spacing */
  background-color: #f9f9f9;
  padding: 0.5em;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  flex-wrap: wrap;
  width: 50%;
  max-width: 100%;
  overflow: auto;
}

.line {
  display: flex;
  align-items: center;
  gap: 0.5em;
  flex-wrap: wrap;
  max-width: 100%;
  width: 100%;
}

.dropdown, .number-input, .delete-button, .color-display {
  min-width: 0;
}

.line > * {
  flex: 1;
  height: 100%;
  min-width: 0;
}

.header-button {
  padding: 0.5em 1em;
  background-color: #369a6e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 1em;
}

.header-button:hover {
  background-color: #2d7a5a;
}

.delete-button {
  padding: 0.5em;
  background-color: #369a6e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  flex: 1;
}

.delete-button:hover {
  background-color: #42b883;
}

.dropdown {
  flex: 6;
  padding: 0.5em;
  border: 0 solid #ccc;
  border-radius: 4px;
  background-color: #369a6e;
  color: white;
  font-size: 0.8em;
  appearance: none;
  cursor: pointer;
}

.dropdown:hover {
  background-color: #42b883;
}

.dropdown:focus {
  outline: none;
  box-shadow: 0 0 5px rgba(54, 154, 110, 0.5);
}

.number-input {
  height: 2.5em;
  padding: 0.5em;
  border: 0 solid #ccc;
  border-radius: 4px;
  background-color: #369a6e;
  flex: 1.5;
  appearance: none;
}

.number-input:focus {
  outline: none;
  box-shadow: 0 0 5px rgba(54, 154, 110, 0.5);
}

.header {
  background-color: #235f43;
  color: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.header span {
  font-size: 1.2em;
  font-weight: bold;
}
</style>