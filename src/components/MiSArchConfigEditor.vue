<template>
  <div class="flex flex-col max-h-full min-h-0 h-full grow md:min-w-1/3 md:max-w-3/8">
    <div class="div-subheader">
      <span class="span-subheader">MiSArch Experiment Configuration</span>
      <div>
        <button class="btn-header">?</button>
        <button class="btn-header !mr-4" @click="showMisarchEditor = !showMisarchEditor">{{ showMisarchEditor ? 'Simplified UI' : 'Editor' }}</button>
      </div>
    </div>
    <div v-show="showMisarchEditor" class="flex flex-1">
      <JsonEditor :config="misarchExperimentConfig" @update:config="onConfigUpdate" :showEditor="showMisarchEditor"
                  :endpoint="'misarchExperimentConfig'"></JsonEditor>
    </div>
    <div v-show="!showMisarchEditor" class="flex-1 min-h-0 h-full max-w-full overflow-y-scroll">
      <div class="flex flex-col gap-4 p-2">
        <div v-for="(failureSet, configIndex) in misarchExperimentConfig" :key="configIndex" class="div-outer-border flex flex-col">
          <div class="flex flex-row justify-between w-full mb-2">
            <h3 class="span-ui-header">Failure Set {{ configIndex + 1 }}</h3>
            <button @click="misarchExperimentConfig.splice(configIndex, 1)" class="btn-gray-close">&times;</button>
          </div>
          <div v-for="(failure, failureIndex) in failureSet.failures" :key="failureIndex" class="div-inner-border">
            <MiSArchConfigEditorFailure :configIndex="configIndex" :failureIndex="failureIndex" :failure="failure"></MiSArchConfigEditorFailure>
          </div>
          <div class="flex flex-col gap-2">
            <button @click="addFailure(configIndex)" class="btn-green-add">+</button>
            <label class="label-small">Pause Durations Before and After Failure Group (s)</label>
            <div class="flex flex-row gap-2 w-full justify-between items-center">
              <input v-model.number="failureSet.pauses.before" type="number" class="input-default" placeholder="Pause Before Execution (s)" min="0">
              <input v-model.number="failureSet.pauses.after" type="number" class="input-default" placeholder="Pause After Execution (s)" min="0">
            </div>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <button @click="addFailureSet()" class="btn-green-add">+</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import {ref} from 'vue'
import {misarchExperimentConfig, showMisarchEditor} from '../util/global-state-handler.ts'
import JsonEditor from "./JsonEditor.vue";
import type {ChaostoolkitConfig} from "../model/chaostoolkit-config.ts";
import type {MiSArchConfig} from "../model/misarch-config.ts";
import MiSArchConfigEditorFailure from "./MiSArchConfigEditorFailure.vue";

const initialized = ref(false)

function onConfigUpdate(newConfig: ChaostoolkitConfig | MiSArchConfig[]) {
  if (!Array.isArray(newConfig)) return;
  if (!initialized.value) {
    initialized.value = true;
    misarchExperimentConfig.value = newConfig;
    return;
  }
  if (showMisarchEditor.value) {
    misarchExperimentConfig.value = newConfig;
  }
}

function addFailure(configIndex: number) {
  misarchExperimentConfig.value[configIndex].failures.push({
    name: '',
    pubSubDeterioration: null,
    serviceInvocationDeterioration: [],
    artificialMemoryUsage: null,
    artificialCPUUsage: []
  });
}

function addFailureSet() {
  misarchExperimentConfig.value.push({
    failures: [{
      name: '',
      pubSubDeterioration: null,
      serviceInvocationDeterioration: [],
      artificialMemoryUsage: null,
      artificialCPUUsage: []
    }],
    pauses: {
      before: 5,
      after: 5
    }
  })
}

</script>

<style/>
