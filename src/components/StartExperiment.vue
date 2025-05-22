<script setup lang="ts">
import { ref } from 'vue'

const isLoading = ref(false)
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

<template>
  <div class="card">
    <button type="button" @click="sendConfig" :disabled="isLoading" class="top-button">
      {{ isLoading ? 'Running Experiment...' : 'Start Experiment' }}
    </button>
  </div>
</template>

<style scoped>
.card {
  position: relative;
}

.top-button {
  position: fixed;
  top: 0;
  left: 30%;
  margin: 1em;
  padding: 0.5em 1em;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  z-index: 1000; /* Ensures the button stays above other elements */
}

.top-button:hover {
  background-color: #369a6e;
}
</style>
