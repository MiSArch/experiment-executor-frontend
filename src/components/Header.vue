<template>
  <div class="header">
    <span>MISARCH EXPERIMENT TOOL</span>
    <select v-model="selectedOption" class="dropdown">
      <option value="Realistic">Realistic</option>
      <option value="Customizable">Customizable</option>
      <option value="Elasticity">Elasticity</option>
      <option value="Scalability">Scalability</option>
      <option value="Resilience">Resilience</option>
    </select>
    <button type="button" class="header-button">{{ 'Help and Guidelines' }}</button>
    <button type="button" class="header-button">{{ 'Save Experiment' }}</button>
    <button type="button" @click="sendConfig" :disabled="isLoading" class="header-button">
      {{ isLoading ? 'Running Experiment...' : 'Start Experiment' }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const isLoading = ref(false)
const selectedOption = ref('Realistic') // Default value

const sendConfig = async () => {
  isLoading.value = true
  try {
    const experimentConfigResponse = await fetch('/example-test-config.json');
    const text = await experimentConfigResponse.text();
    const experimentConfig = JSON.parse(text);

    const response = await fetch('http://localhost:8888/experiment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(experimentConfig),
    })
    const testUUID = await response.text()
    alert(`Experiment executed! Open Results Dashboard: http://localhost:3001/d/${testUUID}` )
  } catch (error) {
    console.error('Error running experiment:', error)
    alert('Failed to run experiment.')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.header {
  width: 100%;
  background-color: #42b883;
  color: white;
  padding: 1em;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

.dropdown {
  margin-right: auto;
  margin-left: 1em;
  padding: 0.5em 1em;
  border: none;
  border-radius: 4px;
  background-color: #369a6e;
  color: white;
  font-size: 1em;
  cursor: pointer;
  appearance: none; /* Removes default dropdown styling */
  text-align: center;
}

.header span {
  font-size: 1.2em;
  font-weight: bold;
}

.dropdown:hover {
  background-color: #2d7a5a;
}

.dropdown::after {
  content: '▼'; /* Adds a dropdown arrow */
  margin-left: 0.5em;
  pointer-events: none;
}

.header-button {
  padding: 0.5em 1em;
  margin-right: 2%;
  background-color: #369a6e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.header-button:hover {
  background-color: #2d7a5a;
}
</style>