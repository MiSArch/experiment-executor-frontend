<template>
  <div class="sticky top-0 left-0 right-0 z-[1000] bg-[#1a4a34] text-white flex items-center px-4 py-3">
    <span class="span-header">MISARCH EXPERIMENT TOOL</span>
    <span v-if="testUuid" class="span-header">Test UUID: {{ testUuid }}</span>
    <span v-if="testVersion" class="span-header">Test Version: {{ testVersion }}</span>
    <div class="ml-auto flex gap-2">
      <button @click="toggleHelpOverlay('Header')" class="btn-header" title="Open MiSArch Experiment Tool Help">?</button>
      <button v-if="!showOverlay" @click="showDeleteOverlay = true" class="btn-header" title="Delete Experiment or Experiment Version">Delete</button>
      <button v-if="!showOverlay" @click="persistAll" :disabled="isSaving" class="btn-header" title="Save Experiment Version">
        {{ isSaving ? 'Saving... ' : 'Save' }}
      </button>
      <button v-if="!showOverlay" @click="loadOrGenerate" :disabled="isSaving" class="btn-header"
              title="Load Existing or Generate New Experiment">Load / Generate
      </button>
      <button v-if="!showOverlay" @click="newVersion" :disabled="isSaving" class="btn-header" title="Create New Experiment Version">
        New Version
      </button>
      <button v-if="!showOverlay" type="button" @click="isRunningExperiment ? stopExperiment() : startExperiment()" class="btn-header"
              title="Execute / Stop Experiment">
        {{ isRunningExperiment ? 'Stop Run' : 'Execute' }}
      </button>
      <span v-if="isRunningExperiment" class="spinner"></span>
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
  showDeleteOverlay, toggleAlert
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
    const response = await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}/start`, {
      method: 'POST',
    })
    if (response.status !== 200) {
      throw new Error(`Failed to start experiment.`)
    }
    toggleAlert(`Experiment started! You will be notified once it has finished!`)
  } catch (error) {
    isRunningExperiment.value = false
    console.error('Error running experiment:', error)
    toggleAlert('Failed to run experiment!<br>Make sure the test is not executed in parallel<br>and the experiment-executor is running!')
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
    toggleAlert('Experiment stopped successfully.')
    isRunningExperiment.value = false
  } catch (error) {
    stopEventListener()
    console.error('Error stopping experiment:', error)
    toggleAlert('Failed to stop experiment.')
  } finally {
  }
}

const persistAll = async () => {
  isSaving.value = true
  try {
    await testHandler.persistAllConfigs()
  } catch (error) {
    console.error('Error saving experiment:', error)
    toggleAlert('Failed to save experiment configuration.')
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
    toggleAlert('Failed to create new version.')
  } finally {
    isSaving.value = false
  }
}

const loadOrGenerate = async () => {
  await persistAll()
  resetGlobalState()
}

let reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
let reconnectAttempts = 0;

const maxReconnectAttempts = 10;
const baseReconnectDelay = 1000;

const startEventListener = () => {
  if (eventSource.value) {
    eventSource.value.close()
  }

  eventSource.value = new EventSource(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}/events`)

  eventSource.value.onmessage = (event) => {
    const urlRegex = /^https?:\/\/[^\/]+\/d\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-v\d+$/i;
    const message = event.data;
    isRunningExperiment.value = false;

    if (urlRegex.test(message)) {
      const url = message.match(urlRegex)?.[0];
      toggleAlert(`Experiment finished successfully, please open the URL below to see the result dashboard: ${url}`);
    } else {
      toggleAlert(message);
    }

    // Reset reconnect attempts on successful message
    reconnectAttempts = 0;
  };

  eventSource.value.onerror = () => {
    console.error('Error receiving server-sent events. Attempting to reconnect...');

    eventSource.value?.close();
    eventSource.value = null;

    if (reconnectAttempts < maxReconnectAttempts) {
      const delay = baseReconnectDelay * Math.pow(2, reconnectAttempts); // exponential backoff
      reconnectAttempts++;

      reconnectTimeout = setTimeout(() => {
        startEventListener();
      }, delay);
    } else {
      toggleAlert('Unable to reconnect to event stream after several attempts.');
    }
  };
};

const stopEventListener = () => {
  if (eventSource.value) {
    eventSource.value.close()
    eventSource.value = null
  }
  if (reconnectTimeout) {
    clearTimeout(reconnectTimeout);
    reconnectTimeout = null;
  }
  reconnectAttempts = 0;
};
</script>

<style/>