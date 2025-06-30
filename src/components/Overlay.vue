<template>
  <div v-if="showOverlay" class="fixed inset-0 bg-[#141414] bg-opacity-70 flex justify-center items-center z-[1000] text-black">
    <div class="relative bg-white p-8 rounded-lg text-center w-[90%] max-w-md">
      <div class="flex flex-col gap-2">
        <span class="span-header">Experiment Configuration</span>
        <div v-if="uuidList.length > 0" class="flex flex-col gap-2">
          <span class="span-header">Use Existing Experiment</span>
          <select v-model="uuidInputValue" @change="fetchVersions" class="select-default bg-[#444]">
            <option v-for="uuid in uuidList" :key="uuid" :value="uuid">{{ uuid }}</option>
          </select>

          <select v-model="versionInputValue"
                  class="select-default bg-[#444]">
            <option v-for="version in versionList" :key="version" :value="version">{{ version }}</option>
          </select>
          <button @click="useExistingTest" class="btn-header !mr-0 mb-24">Use Existing Experiment</button>
        </div>
        <span class="span-header">Create New Experiment</span>
        <select v-model="loadType" class="select-default bg-[#444]">
          <option value="NormalLoadTest">Realistic Load Test</option>
          <option value="ElasticityLoadTest">Elasticity Load Test</option>
          <option value="ResilienceLoadTest">Resilience Load Test</option>
          <option value="ScalabilityLoadTest">Scalability Load Test</option>
        </select>
        <label class="label-small !text-[#444]" type="number">Duration of the Load Test (s)</label>
        <input v-model="testDuration" class="input-default bg-[#444] text-white" type="number" placeholder="60">
        <label v-if="loadType==='NormalLoadTest'" class="label-small !text-[#444]">Maximum Arriving Users/s</label>
        <input v-if="loadType==='NormalLoadTest'" v-model="testMaxArrivingUsers" class="input-default bg-[#444] text-white" placeholder="10"
               type="number">
        <label v-if="loadType!=='NormalLoadTest'" class="label-small !text-[#444]">Growth Rate Arriving Users/s</label>
        <input v-if="loadType!=='NormalLoadTest'" v-model="testRate" class="input-default bg-[#444] text-white" placeholder="0.8" type="number">
        <button @click="submitRequest" class="btn-header !mr-0">Create New Experiment</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import {backendUrl, testUuid, testVersion, showOverlay, toggleAlert} from '../util/global-state-handler.ts'

const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const uuidList = ref<string[]>([])
const versionList = ref<string[]>([])
const uuidInputValue = ref('')
const versionInputValue = ref('')
const loadType = ref('NormalLoadTest')

const testDuration = ref(1800)
const testRate = ref(0.9)
const testMaxArrivingUsers = ref(10)

const fetchUUIDs = async () => {
  try {
    const response = await fetch(`${backendUrl}/experiment/list`)
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
    const response = await
        fetch(`${backendUrl}/experiment/generate` +
            `?loadType=${loadType.value}` +
            `&testDuration=${testDuration.value}` +
            `&maximumArrivingUsersPerSecond=${testMaxArrivingUsers.value}` +
            `&rate=${testRate.value}`, {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
        })
    const strings = (await response.text()).split(":")

    testUuid.value = strings[0].trim()
    testVersion.value = strings[1].trim()
    showOverlay.value = false
  } catch (error) {
    toggleAlert('Failed to create new experiment!<br>Is the experiment-executor running?')
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
    toggleAlert('Please enter a valid Test UUID and version.');
  }
}

onMounted(fetchUUIDs)
watch(showOverlay, async (newValue, oldValue) => {
  if (newValue !== oldValue && newValue) {
    await fetchUUIDs()
    await fetchVersions()
  }
})
</script>

<style/>