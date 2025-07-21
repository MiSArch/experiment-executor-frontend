<template>
  <div class="flex flex-row items-center justify-between">
    <span class="span-ui-header">Failure {{ failureIndex + 1 }}</span>
    <div>
      <button class="btn-gray-minimize-small" @click="minimized = !minimized" title="Minimize / Maximize">{{ minimized ? '+' : '–' }}</button>
      <button @click="removeFailure(configIndex, failureIndex)" class="btn-gray-close-small" title="Delete Failure">&times;</button>
    </div>
  </div>
  <div v-show="!minimized">
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
          <button @click="removePubSubDeterioration(failure)" class="btn-gray-close" title="Delete PubSub Deterioration">&times;</button>
        </div>
        <button v-show="failure.pubSubDeterioration === undefined || failure.pubSubDeterioration === null"
                @click="addPubSubDeterioration(failure)" class="btn-gray-add" title="Add PubSub Deterioration">+
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
          <button @click="removeServiceInvocationDeterioration(failure, index)" class="btn-gray-close"
                  title="Delete Service Invocation Deterioration">&times;</button>
        </div>
        <button @click="addServiceInvocationDeterioration(failure)" class="btn-gray-add" title="Add Service Invocation Deterioration">+</button>
      </div>

      <div class="flex flex-col gap-2 max-w-full w-full">
        <label class="label-small">Artificial Memory Usage</label>
        <div class="flex flex-row flex-nowrap items-center gap-2 w-full min-w-0"
             v-show="failure.artificialMemoryUsage !== null && failure.artificialMemoryUsage !== undefined">
          <input type="number" min="0" step="1" v-model="failure.artificialMemoryUsage" class="input-default"
                 placeholder="Memory Usage in bites (e.g., 1000000000 for 1GB)">
          <button @click="removeMemoryUsage(failure)" class="btn-gray-close" title="Delete Artificial Memory Usage">&times;</button>
        </div>
        <button
            v-show="failure.artificialMemoryUsage === undefined || failure.artificialMemoryUsage === null"
            @click="addMemoryUsage(failure)" class="btn-gray-add" title="Add Artificial Memory Usage">+
        </button>
      </div>
      <label class="label-small">Artificial CPU Usage</label>
      <div class="flex flex-col gap-2 max-w-full w-full">
        <div v-for="(cpuUsage, index) in failure.artificialCPUUsage" :key="index"
             class="flex flex-row flex-nowrap items-center gap-2 w-full min-w-0">
          <input type="number" min="0" step="1" v-model="cpuUsage.usageDuration" class="input-default" placeholder="Usage Duration in ms">
          <input type="number" min="0" step="1" v-model="cpuUsage.pauseDuration" class="input-default" placeholder="Pause-Duration in ms">
          <button @click="removeCPUUsage(failure, index)" class="btn-gray-close" title="Delete Artificial CPU Usage">&times;</button>
        </div>
        <button @click="addCPUUsage(failure)" class="btn-gray-add" title="Add Artificial CPU Usage">+</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import {misarchExperimentConfig} from "../util/global-state-handler.ts";
import {MisArchFailure} from "../model/misarch-config.ts";
import {ref} from "vue";

defineProps<{
  configIndex: number;
  failureIndex: number;
  failure: MisArchFailure
}>();

const minimized = ref(false);

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

function removeFailure(configIndex: number, failureIndex: number) {
  misarchExperimentConfig.value[configIndex].failures.splice(failureIndex, 1);
}
</script>
<style/>