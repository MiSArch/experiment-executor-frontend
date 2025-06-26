<template>
  <div class="sticky top-0 left-0 right-0 z-[1000] bg-[#1a4a34] text-white flex items-center px-4 py-3">
    <span class="span-header">MISARCH EXPERIMENT TOOL</span>
    <span v-if="testUuid" class="span-header">Test UUID: {{ testUuid }}</span>
    <span v-if="testVersion" class="span-header">Test Version: {{ testVersion }}</span>
    <div class="ml-auto flex gap-2">
      <button v-if="!showOverlay" @click="toggleHelpOverlay('Header')" class="btn-header">?</button>
      <button v-if="!showOverlay" @click="showDeleteOverlay = true" class="btn-header">Delete</button>
      <button v-if="!showOverlay" @click="persistAll" :disabled="isSaving" class="btn-header">{{ isSaving ? 'Saving... ' : 'Save' }}</button>
      <button v-if="!showOverlay" @click="loadOrGenerate" :disabled="isSaving" class="btn-header">Load / Generate</button>
      <button v-if="!showOverlay" @click="newVersion" :disabled="isSaving" class="btn-header">New Version</button>
      <button v-if="!showOverlay" type="button" @click="isRunningExperiment ? stopExperiment() : startExperiment()" class="btn-header">
        {{ isRunningExperiment ? 'Stop Experiment' : 'Execute Experiment' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {
  backendUrl,
  testUuid,
  testVersion,
  showOverlay,
  resetGlobalState,
  toggleHelpOverlay,
  showDeleteOverlay
} from "../util/global-state-handler.ts";
import {testHandler} from "../util/test-handler.ts";

const isRunningExperiment = ref(false)
const isSaving = ref(false)
const eventSource = ref<EventSource | null>(null)

const startExperiment = async () => {
  isRunningExperiment.value = true
  try {
    await persistAll()
    startEventListener()
    await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}`, {
      method: 'POST',
    })
    alert(`Experiment started! You will be notified once it is completed!`)
  } catch (error) {
    console.error('Error running experiment:', error)
    alert('Failed to run experiment.')
  } finally {
  }
}

const stopExperiment = async () => {
  try {
    await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}/stop`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
    alert('Experiment stopped successfully.')
    isRunningExperiment.value = false
  } catch (error) {
    stopEventListener()
    console.error('Error stopping experiment:', error)
    alert('Failed to stop experiment.')
  } finally {
  }
}

const persistAll = async () => {
  isSaving.value = true
  try {
    await testHandler.persistAllConfigs()
  } catch (error) {
    console.error('Error saving experiment:', error)
    alert('Failed to save experiment configuration.')
  } finally {
    isSaving.value = false
  }
}

const newVersion = async () => {
  isSaving.value = true
  try {
    await testHandler.persistAllConfigs()
    const response = await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}/newVersion`, {
      method: 'POST',
    })
    testVersion.value = await response.text()
  } catch (error) {
    console.error('Error creating new version:', error)
    alert('Failed to create new version.')
  } finally {
    isSaving.value = false
  }
}

const loadOrGenerate = async () => {
  await persistAll()
  resetGlobalState()
}

const startEventListener = () => {
  if (eventSource.value) {
    eventSource.value.close()
  }

  eventSource.value = new EventSource(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}/events`)

  eventSource.value.onmessage = (event) => {
    const urlRegex = /(http?:\/\/\S+)/g;
    const message = event.data;
    isRunningExperiment.value = false;

    if (urlRegex.test(message)) {
      const url = message.match(urlRegex)?.[0];
      alert(`Experiment finished successfully, please open the URL below.\n\n\n${url}`);
    } else {
      alert(message);
    }
  };
  eventSource.value.onerror = () => {
    console.error('Error receiving server-sent events.')
    eventSource.value?.close()
    eventSource.value = null
  }
}

const stopEventListener = () => {
  if (eventSource.value) {
    eventSource.value.close()
    eventSource.value = null
  }
}
</script>

<style/>