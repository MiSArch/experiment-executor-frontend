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
        <div v-for="(config, configIndex) in misarchExperimentConfig" :key="configIndex" class="div-outer-border flex flex-col">
          <div class="flex flex-row justify-between w-full mb-2">
            <h3 class="span-ui-header">Failure Set {{ configIndex + 1 }}</h3>
            <button @click="removeConfig(configIndex)" class="btn-gray-close">&times;</button>
          </div>
          <div v-for="(failure, failureIndex) in config.failures" :key="failureIndex" class="div-inner-border">
            <div class="flex flex-row items-center justify-between">
              <span class="span-ui-header">Failure {{ failureIndex + 1 }}</span>
              <div>
                <button class="btn-gray-close-small"
                        @click="minimizedFailures[getFailureKey(configIndex, failureIndex)] = !minimizedFailures[getFailureKey(configIndex, failureIndex)]">
                  {{ minimizedFailures[getFailureKey(configIndex, failureIndex)] ? '+' : '–' }}
                </button>
                <button @click="removeFailure(configIndex, failureIndex)" class="btn-gray-close-small">&times;</button>
              </div>
            </div>
            <div v-show="!minimizedFailures[getFailureKey(configIndex, failureIndex)]">
              <div class="flex flex-col gap-2">
                <div class="flex flex-col gap-2 max-w-full w-full">
                  <label class="label-small">Service Name</label>
                  <input v-model="failure.name" class="input-default" placeholder="catalog"/>
                  <label class="label-small">PubSub Deterioration</label>
                  <div v-if="failure.pubSubDeterioration !== null && failure.pubSubDeterioration !== undefined"
                       class="flex flex-row flex-nowrap justify-evenly items-center gap-2 min-w-0 w-full">
                    <input v-model="failure.pubSubDeterioration.delay" type="number" class="input-default" placeholder="Delay in ms">
                    <input type="number" min="0.00" max="1.00" step="0.01" v-model="failure.pubSubDeterioration.delayProbability"
                           class="input-default" placeholder="Delay probability (0-1)">
                    <input type="number" min="0.00" max="1.00" step="0.01" v-model="failure.pubSubDeterioration.errorProbability"
                           class="input-default" placeholder="Error probability (0-1)">
                    <button @click="removePubSubDeterioration(failure)" class="btn-gray-close">&times;</button>
                  </div>
                  <button v-show="failure.pubSubDeterioration === undefined || failure.pubSubDeterioration === null"
                          @click="addPubSubDeterioration(failure)" class="btn-gray-add">+
                  </button>
                </div>

                <label class="label-small">Service Invocation Deterioration</label>
                <div class="flex flex-col gap-2 max-w-full w-full">
                  <div v-show="failure.serviceInvocationDeterioration?.length ? failure.serviceInvocationDeterioration.length : 0 > 0"
                       class="flex flex-row flex-nowrap justify-evenly gap-2 min-w-0 w-full">
                    <label class="label-xs">HTTP Path to Fail</label>
                    <label class="label-xs">Delay in ms</label>
                    <label class="label-xs">Delay Probability</label>
                    <label class="label-xs">Error Probability</label>
                    <label class="label-xs">HTTP Error Code</label>
                    <div class="flex-shrink-0" style="width: 2.5rem;"></div>
                  </div>
                  <div v-for="(deterioration, index) in failure.serviceInvocationDeterioration" :key="index"
                       class="flex flex-row flex-nowrap items-center gap-2 w-full min-w-0">
                    <input v-model="deterioration.path" class="input-default" placeholder="/*"/>
                    <input type="number" v-model="deterioration.delay" class="input-default" placeholder="1000"/>
                    <input type="number" min="0.00" max="1.00" step="0.01" v-model="deterioration.delayProbability" class="input-default"
                           placeholder="0.05"/>
                    <input type="number" min="0.00" max="1.00" step="0.01" v-model="deterioration.errorProbability" class="input-default"
                           placeholder="0.05"/>
                    <input type="number" v-model="deterioration.errorCode" class="input-default" placeholder="500"/>
                    <button @click="removeServiceInvocationDeterioration(failure, index)" class="btn-gray-close">&times;</button>
                  </div>
                  <button @click="addServiceInvocationDeterioration(failure)" class="btn-gray-add">+</button>
                </div>

                <div class="flex flex-col gap-2 max-w-full w-full">
                  <label class="label-small">Artificial Memory Usage</label>
                  <div class="flex flex-row flex-nowrap items-center gap-2 w-full min-w-0"
                       v-show="failure.artificialMemoryUsage !== null && failure.artificialMemoryUsage !== undefined">
                    <input type="number" v-model="failure.artificialMemoryUsage" class="input-default"
                           placeholder="Memory Usage in bites (e.g., 1000000000 for 1GB)">
                    <button @click="removeMemoryUsage(failure)" class="btn-gray-close">&times;</button>
                  </div>
                  <button
                      v-show="failure.artificialMemoryUsage === undefined || failure.artificialMemoryUsage === null"
                      @click="addMemoryUsage(failure)" class="btn-gray-add">+
                  </button>
                </div>
                <label class="label-small">Artificial CPU Usage</label>
                <div class="flex flex-col gap-2 max-w-full w-full">
                  <div v-for="(cpuUsage, index) in failure.artificialCPUUsage" :key="index"
                       class="flex flex-row flex-nowrap items-center gap-2 w-full min-w-0">
                    <input type="number" v-model="cpuUsage.usageDuration" class="input-default" placeholder="Usage Duration in ms">
                    <input type="number" v-model="cpuUsage.pauseDuration" class="input-default" placeholder="Pause-Duration in ms">
                    <button @click="removeCPUUsage(failure, index)" class="btn-gray-close">&times;</button>
                  </div>
                  <button @click="addCPUUsage(failure)" class="btn-gray-add">+</button>
                </div>
              </div>
            </div>

          </div>
          <div class="flex flex-col gap-2">
            <button @click="addFailure(configIndex)" class="btn-green-add">+</button>
            <label class="label-small">Pause Duration after Failure Group (ms)</label>
            <input v-model="config.pause" type="number" class="input-default" placeholder="500"/>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <button @click="addConfig()" class="btn-green-add">+</button>
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

const minimizedFailures = ref<{ [key: string]: boolean }>({})
const getFailureKey = (configIndex: number, failureIndex: number) => `${configIndex}-${failureIndex}`;

function addServiceInvocationDeterioration(failure: any) {
  if (!failure.serviceInvocationDeterioration) failure.serviceInvocationDeterioration = [];
  failure.serviceInvocationDeterioration.push({
    path: '',
    delay: '',
    delayProbability: '',
    errorProbability: '',
    errorCode: ''
  });
}

function removeServiceInvocationDeterioration(failure: any, index: number) {
  if (failure.serviceInvocationDeterioration) {
    failure.serviceInvocationDeterioration.splice(index, 1);
  }
}

function addPubSubDeterioration(failure: any) {
  if (!failure.pubSubDeterioration) failure.pubSubDeterioration = {};
  failure.pubSubDeterioration = {
    delay: '',
    delayProbability: '',
    errorProbability: ''
  };
}

function removePubSubDeterioration(failure: any) {
  if (failure.pubSubDeterioration) {
    failure.pubSubDeterioration = null;
  }
}

function addMemoryUsage(failure: any) {
  if (!failure.artificialMemoryUsage) failure.artificialMemoryUsage = null;
  failure.artificialMemoryUsage = 'not empty';
}

function removeMemoryUsage(failure: any) {
  if (failure.artificialMemoryUsage) {
    failure.artificialMemoryUsage = null;
  }
}

function addCPUUsage(failure: any) {
  if (!failure.artificialCPUUsage) failure.artificialCPUUsage = [];
  failure.artificialCPUUsage.push({
    usageDuration: '',
    pauseDuration: ''
  });
}

function removeCPUUsage(failure: any, index: number) {
  if (failure.artificialCPUUsage) {
    failure.artificialCPUUsage.splice(index, 1);
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

function removeFailure(configIndex: number, failureIndex: number) {
  misarchExperimentConfig.value[configIndex].failures.splice(failureIndex, 1);
}

function addConfig() {
  misarchExperimentConfig.value.push({
    failures: [{
      name: '',
      pubSubDeterioration: null,
      serviceInvocationDeterioration: [],
      artificialMemoryUsage: null,
      artificialCPUUsage: []
    }],
    pause: 500
  })
}

function removeConfig(configIndex: number) {
  misarchExperimentConfig.value.splice(configIndex, 1);
  // Reset minimized states for the removed config
  Object.keys(minimizedFailures.value).forEach(key => {
    if (key.startsWith(`${configIndex}-`)) {
      delete minimizedFailures.value[key];
    }
  });
}

</script>

<style/>
