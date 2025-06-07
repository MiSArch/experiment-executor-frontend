<template>
  <div class="header">
    <span>MISARCH EXPERIMENT TOOL</span>
    <span v-if="testUuid" class="test-uuid">Test UUID: {{ testUuid }}</span>
    <span v-if="testVersion" class="test-version">Test Version: {{ testVersion }}</span>
    <div class="button-group">
      <button v-if="!showOverlay" type="button" class="header-button">{{ 'Help' }}</button>
      <button v-if="!showOverlay" type="button" @click="persistAll" :disabled="isSaving" class="header-button">{{ isSaving ? 'Saving... ' : 'Save' }}</button>
      <button v-if="!showOverlay" type="button" @click="loadOrGenerate" :disabled="isSaving" class="header-button">{{ 'Load / Generate' }}</button>
      <button v-if="!showOverlay" type="button" @click="newVersion" :disabled="isSaving" class="header-button">{{ 'New Version' }}</button>
      <button
          v-if="!showOverlay"
          type="button"
          @click="isRunningExperiment ? stopExperiment() : startExperiment()"
          class="header-button">
        {{ isRunningExperiment ? 'Stop Experiment' : 'Execute Experiment' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {testUuid, testVersion} from '../util/test-uuid.ts'
import {backendUrl, testHandler} from '../util/test-handler.ts'
import {showOverlay} from "../util/show-overlay.ts";

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

<style scoped>
.header {
  width: 100%;
  background-color: #42b883;
  color: white;
  padding: 1em;
  display: flex;
  align-items: center;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
}

.header span {
  margin-right: 1em;
  font-size: 1.2em;
  font-weight: bold;
  color: #ffffff;
}

.header-button {
  padding: 0.5em 1em;
  margin-left: 1em;
  background-color: #369a6e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.header-button:hover {
  background-color: #2d7a5a;
}

.header .button-group {
  margin-left: auto;
  display: flex;
  gap: 1em;
  padding-right: 3em;
}

</style>