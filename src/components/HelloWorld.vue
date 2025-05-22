<script setup lang="ts">
import { ref } from 'vue'

defineProps<{ msg: string }>()

const isLoading = ref(false)
const sendConfig = async () => {
  isLoading.value = true
  try {

    const experimentConfigResponse = await fetch('/example-test-config.json');
    const text = await experimentConfigResponse.text();
    const experimentConfig = JSON.parse(text);
    console.log(experimentConfig);

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
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="sendConfig" :disabled="isLoading">
      {{ isLoading ? 'Running Experiment...' : 'Start Experiment' }}
    </button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank"
      >create-vue</a
    >, the official Vue + Vite starter
  </p>
  <p>
    Learn more about IDE Support for Vue in the
    <a
      href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support"
      target="_blank"
      >Vue Docs Scaling up Guide</a
    >.
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
