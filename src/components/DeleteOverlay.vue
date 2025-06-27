<template>
  <div v-if="showDeleteOverlay"
       class="flex fixed justify-center bg-[#242424] bg-opacity-70 w-full h-full z-[400] text-white overflow-y-auto">
    <div class="flex flex-col w-full max-w-screen-lg m-24  rounded-lg">
      <div class="flex flex-row gap-2 justify-center items-center  rounded-t-lg pt-4 pr-4">
        <span class="span-header">Are You Sure?</span>
        <button @click="deleteExperiment" :disabled="loading" class="btn-header !bg-red-900 hover:!bg-red-800">
          {{ loading ? 'Deleting Experiment...' : 'Delete Experiment' }}
        </button>
        <button @click="deleteExperimentVersion" :disabled="loading" class="btn-header !bg-red-900 hover:!bg-red-800">
          {{ loading ? 'Deleting Experiment...' : 'Delete Experiment Version' }}
        </button>
        <button @click="showDeleteOverlay = false" class="btn-header">&times;</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {backendUrl, resetGlobalState, showDeleteOverlay, testUuid, testVersion, toggleAlert} from "../util/global-state-handler.ts";


const loading = ref(false);
const error = ref('');

async function deleteExperiment() {
  try {
    await fetch(`${backendUrl}/experiment/${testUuid.value}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (e: any) {
    error.value = e?.response?.data?.message || 'Delete failed';
  } finally {
    loading.value = false;
    resetGlobalState()
  }
}

async function deleteExperimentVersion() {
  try {
    await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (e: any) {
    toggleAlert('Failed to delete experiment version.')
  } finally {
    loading.value = false;
    resetGlobalState()
  }
}
</script>

<style/>