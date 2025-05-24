<template>
  <div class="header">
    <span>MISARCH EXPERIMENT TOOL</span>
    <span v-if="testUuid" class="test-uuid">Test UUID: {{ testUuid }}</span>
    <div class="button-group">
      <button type="button" class="header-button">{{ 'Help and Guidelines' }}</button>
      <button type="button" @click="persistAll" :disabled="isSaving" class="header-button">{{ isSaving ? 'Saving... ' : 'Save Experiment' }}</button>
      <button type="button" class="header-button">{{ 'Load / Generate New Experiment' }}</button>
      <button type="button" @click="startExperiment" :disabled="isLoading" class="header-button">
        {{ isLoading ? 'Running Experiment...' : 'Start Experiment' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
import {testUuid} from '../util/test-uuid.ts'
import {testHandler} from '../util/test-handler.ts'

const isLoading = ref(false)
const isSaving = ref(false)

const startExperiment = async () => {
  isLoading.value = true
  try {
    await persistAll()
    await fetch(`http://localhost:8888/experiment/${testUuid.value}`, {
      method: 'POST',
    })
    alert(`Experiment executed! Open Results Dashboard: http://localhost:3001/d/${testUuid.value}`)
  } catch (error) {
    console.error('Error running experiment:', error)
    alert('Failed to run experiment.')
  } finally {
    isLoading.value = false
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