<template>
  <div class="header">
    <span>Experiment Goals</span>
  </div>
  <div class="list-container">
    <button @click="addLine" class="add-button">+</button>
    <div v-for="(line, index) in lines" :key="index" class="line">
      <select v-model="line.dropdown" class="dropdown">
        <option value="min response time">Min Response Time</option>
        <option value="mean response time">Mean Response Time</option>
        <option value="max response time">Max Response Time</option>
      </select>
      <input type="color" v-model="line.color" class="color-picker"/>
      <input type="number" v-model="line.value" class="number-input"/>
      <button @click="removeLine(index)" class="delete-button">x</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// TODO all options in dropdown above
// TODO color picker should actually pick a color from the chart
import {ref, watch} from 'vue'
import type {TestConfig} from "../model/test-config.ts";
import {config} from "../util/test-handler.ts";
import {testUuid} from "../util/test-uuid.ts";
import {showOverlay} from "../util/show-overlay.ts";

interface Line {
  dropdown: string
  color: string
  value: number | null
}

const lines = ref<Line[]>([])

const fetchConfig = async () => {
  const response = await fetch(`http://localhost:8888/experiment/${testUuid.value}/config`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  const data: TestConfig = await response.json()
  lines.value = data.goals.map(goal => ({
    dropdown: goal.metric,
    color: goal.color,
    value: parseFloat(goal.threshold) || null
  }))
  return data
}

const addLine = () => {
  lines.value.push({dropdown: 'min response time', color: '#000000', value: null})
}

const removeLine = (index: number) => {
  lines.value.splice(index, 1)
}

watch(lines, (newLines) => {
  config.value.goals = newLines.map(line => ({
    metric: line.dropdown,
    color: line.color,
    threshold: line.value?.toString() || ''
  }))
}, { deep: true })

watch(showOverlay, async () => {
  config.value = await fetchConfig();
});
// TODO proper resizing of the elmeent, not really responsive rn
</script>

<style scoped>
.list-container {
  display: flex;
  flex-direction: column;
  gap: 1em;
  position: fixed;
  right: 1em;
  bottom: 1em;
  max-height: calc(6 * 3em);
  overflow-y: auto;
}

.line {
  display: flex;
  align-items: center;
  gap: 0.5em;
  flex-wrap: wrap;
  max-width: 100%;
  max-height: 100%;
}

.add-button,
.delete-button {
  padding: 0.5em;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-button:hover,
.delete-button:hover {
  background-color: #369a6e;
}

.dropdown,
.color-picker {
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.number-input {
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 5em;
}

.header {
  position: fixed;
  bottom: 33%;
  right: 0;
  height: 6%;
  width: 18.3%;
  background-color: #235f43;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 0 1em;
}

.header span {
  font-size: 1.2em;
  font-weight: bold;
}
</style>