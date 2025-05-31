<template>
  <div v-if="showOverlay" class="overlay">
    <div class="overlay-content">
      <p>Enter your experiment details:</p>
      <input v-model="uuidInputValue" type="text" placeholder="Enter Existing Test UUID" />
      <input v-model="versionInputValue" type="text" placeholder="Enter Existing Test Version" />
      <button @click="useExistingTest">Use Existing Test</button>
      <select v-model="loadType">
        <option value="NormalLoadTest">Realistic Load Test</option>
        <option value="ElasticityLoadTest">Elasticity Load Test</option>
        <option value="ResilienceLoadTest">Resilience Load Test</option>
        <option value="ScalabilityLoadTest">Scalability Load Test</option>
      </select>
      <button @click="submitRequest">Create new Test</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {testUuid, testVersion} from '../util/test-uuid.ts'
import { showOverlay } from '../util/show-overlay.ts'
import { backendUrl } from "../util/test-handler.ts";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const uuidInputValue = ref('')
const versionInputValue = ref('')
const loadType = ref('NormalLoadTest')

const submitRequest = async () => {
  try {
    const response = await fetch(`${backendUrl}/experiment/generate/${loadType.value}`, {
      method: 'POST',
    })
    const strings = (await response.text()).split(":")

    testUuid.value = strings[0].trim()
    testVersion.value = strings[1].trim()
    showOverlay.value = false
  } catch (error) {
    console.error('Error:', error)
  }
}

const useExistingTest = () => {
  const trimmedUuidValue = uuidInputValue.value?.trim();
  const trimmedVersionValue = versionInputValue.value?.trim();
  if (trimmedUuidValue && uuidRegex.test(trimmedUuidValue) && trimmedVersionValue) {
    testUuid.value = trimmedUuidValue;
    testVersion.value = trimmedVersionValue;
    showOverlay.value = false;
  } else {
    alert('Please enter a valid Test UUID and version.');
  }
}
</script>

<style scoped>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.overlay-content {
  background: white;
  padding: 2em;
  border-radius: 8px;
  text-align: center;
}

input, select {
  margin: 1em 0;
  padding: 0.5em;
  width: 80%;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 0.5em 1em;
  background-color: #369a6e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #2d7a5a;
}
</style>