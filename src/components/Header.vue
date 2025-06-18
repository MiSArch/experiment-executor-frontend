<template>
  <div class="sticky top-0 left-0 right-0 z-[1000] bg-[#42b883] text-white flex items-center px-4 py-3">
    <span class="mr-4 text-lg font-bold">MISARCH EXPERIMENT TOOL</span>
    <span v-if="testUuid" class="mr-4 text-lg font-bold">Test UUID: {{ testUuid }}</span>
    <span v-if="testVersion" class="mr-4 text-lg font-bold">Test Version: {{ testVersion }}</span>
    <div class="ml-auto flex gap-4 pr-12">
      <button
          v-if="!showOverlay"
          type="button"
          class="bg-[#369a6e] text-white hover:bg-[#2d7a5a] rounded px-4 py-2 cursor-pointer"
      >
        Help
      </button>
      <button
          v-if="!showOverlay"
          type="button"
          @click="persistAll"
          :disabled="isSaving"
          class="bg-[#369a6e] text-white hover:bg-[#2d7a5a] rounded px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {{ isSaving ? 'Saving... ' : 'Save' }}
      </button>
      <button
          v-if="!showOverlay"
          type="button"
          @click="loadOrGenerate"
          :disabled="isSaving"
          class="bg-[#369a6e] text-white hover:bg-[#2d7a5a] rounded px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Load / Generate
      </button>
      <button
          v-if="!showOverlay"
          type="button"
          @click="newVersion"
          :disabled="isSaving"
          class="bg-[#369a6e] text-white hover:bg-[#2d7a5a] rounded px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        New Version
      </button>
      <button
          v-if="!showOverlay"
          type="button"
          @click="isRunningExperiment ? stopExperiment() : startExperiment()"
          class="bg-[#369a6e] text-white hover:bg-[#2d7a5a] rounded px-4 py-2"
      >
        {{ isRunningExperiment ? 'Stop Experiment' : 'Execute Experiment' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {backendUrl, testUuid, testVersion, showOverlay} from "../util/global-state-handler.ts";
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
    // TODO implement an input field to add an optional access token for the experiment
    alert(`Experiment started! You will be notified once it is completed!`)
  } catch (error) {
    console.error('Error running experiment:', error)
    alert('Failed to run experiment.')
  } finally {
  }
}

const stopExperiment = async () => {
  try {
    await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}`, {
      method: 'DELETE',
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
  showOverlay.value = true
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