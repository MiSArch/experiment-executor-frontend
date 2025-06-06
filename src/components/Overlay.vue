<template>
  <div v-if="showOverlay" class="overlay">
    <div class="overlay-content">
      <p>Enter your experiment details:</p>
      <select v-model="uuidInputValue" @change="fetchVersions" class="dropdown">
        <option v-for="uuid in uuidList" :key="uuid" :value="uuid">{{ uuid }}</option>
      </select>
      <select v-model="versionInputValue" class="dropdown">
        <option v-for="version in versionList" :key="version" :value="version">{{ version }}</option>
      </select>
      <button @click="useExistingTest">Use Existing Test</button>
      <select v-model="loadType" class="dropdown">
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
import {onMounted, ref} from 'vue'
import {testUuid, testVersion} from '../util/test-uuid.ts'
import { showOverlay } from '../util/show-overlay.ts'
import { backendUrl } from "../util/test-handler.ts";

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const uuidList = ref<string[]>([])
const versionList = ref<string[]>([])
const uuidInputValue = ref('')
const versionInputValue = ref('')
const loadType = ref('NormalLoadTest')

const fetchUUIDs = async () => {
  try {
    const response = await fetch(`${backendUrl}/experiments`)
    uuidList.value = await response.json()
    if (uuidList.value.length > 0) {
      uuidInputValue.value = uuidList.value[0]
      await fetchVersions()
    }
  } catch (error) {
    console.error('Error fetching UUIDs:', error)
  }
}

const fetchVersions = async () => {
  try {
    if (!uuidInputValue.value) return
    const response = await fetch(`${backendUrl}/experiment/${uuidInputValue.value}/versions`)
    versionList.value = await response.json()
    if (versionList.value.length > 0) {
      versionInputValue.value = versionList.value[0]
    }
  } catch (error) {
    console.error('Error fetching versions:', error)
  }
}

const submitRequest = async () => {
  try {
    const response = await fetch(`${backendUrl}/experiment/generate?loadType=${loadType.value}`, {
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

onMounted(fetchUUIDs)
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