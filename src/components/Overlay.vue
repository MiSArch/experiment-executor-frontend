<template>
  <div v-if="showOverlay" class="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-[1000] text-black">
    <div class="relative bg-white p-8 rounded-lg text-center w-[90%] max-w-md">
      <button v-if="testUuid && testVersion" class="absolute top-2 right-2 text-2xl text-gray-700 hover:text-black" @click="showOverlay = false">
        &times;
      </button>
      <h3 class="text-xl font-semibold mb-4">Use Existing Or Create New Experiment</h3>

      <select v-model="uuidInputValue" @change="fetchVersions"
              class="w-full my-2 p-2 rounded bg-[#369a6e] text-white text-sm appearance-none cursor-pointer hover:bg-[#42b883] focus:outline-none focus:ring focus:ring-[#369a6e]/50">
        <option v-for="uuid in uuidList" :key="uuid" :value="uuid">{{ uuid }}</option>
      </select>

      <select v-model="versionInputValue"
              class="w-full my-2 p-2 rounded bg-[#369a6e] text-white text-sm appearance-none cursor-pointer hover:bg-[#42b883] focus:outline-none focus:ring focus:ring-[#369a6e]/50">
        <option v-for="version in versionList" :key="version" :value="version">{{ version }}</option>
      </select>

      <button @click="useExistingTest" class="w-full my-2 p-2 rounded bg-[#369a6e] text-white hover:bg-[#2d7a5a]">Use Existing Experiment</button>

      <select v-model="loadType"
              class="w-full my-2 p-2 rounded bg-[#369a6e] text-white text-sm appearance-none cursor-pointer hover:bg-[#42b883] focus:outline-none focus:ring focus:ring-[#369a6e]/50">
        <option value="NormalLoadTest">Realistic Load Test</option>
        <option value="ElasticityLoadTest">Elasticity Load Test</option>
        <option value="ResilienceLoadTest">Resilience Load Test</option>
        <option value="ScalabilityLoadTest">Scalability Load Test</option>
      </select>

      <button @click="submitRequest" class="w-full my-2 p-2 rounded bg-[#369a6e] text-white hover:bg-[#2d7a5a]">Create New Experiment</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import {backendUrl, testUuid, testVersion, showOverlay} from '../util/global-state-handler.ts'

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
watch(showOverlay, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    await fetchUUIDs()
  }
})
</script>

<style/>