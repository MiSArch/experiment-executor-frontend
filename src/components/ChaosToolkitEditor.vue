<template>
  <div class="flex flex-col max-h-full min-h-0 h-full grow md:min-w-1/3 md:max-w-3/8">
    <div class="div-subheader">
      <span class="span-subheader">ChaosToolkit Configuration</span>
      <div>
        <button class="btn-header">?</button>
        <button class="btn-header !mr-4" @click="showChaostoolkitEditor = !showChaostoolkitEditor">
          {{ showChaostoolkitEditor ? 'Simplified UI' : 'Editor' }}
        </button>
      </div>
    </div>
    <div v-show="showChaostoolkitEditor" class="flex flex-1">
      <JsonEditor :config="chaostoolkitConfig" @update:config="onConfigUpdate" :showEditor="showChaostoolkitEditor"
                  :endpoint="'chaosToolkitConfig'"></JsonEditor>
    </div>
    <div v-show="!showChaostoolkitEditor" class="flex-1 min-h-0 h-full max-w-full overflow-y-scroll">
      <div class="flex flex-col gap-4 p-2">
        <div class="div-outer-border flex flex-col justify-between w-full">
          <div v-if="chaostoolkitConfig['steady-state-hypothesis'] !== null && chaostoolkitConfig['steady-state-hypothesis'] !== undefined"
               class="flex flex-col gap-2 w-full">
            <div class="flex flex-row items-center justify-between">
              <h3 class="span-ui-header">Steady State Hypothesis</h3>
              <button @click="chaostoolkitConfig['steady-state-hypothesis'] = undefined" class="btn-gray-close">&times;</button>
            </div>
            <input v-model="chaostoolkitConfig['steady-state-hypothesis'].title" class="input-default" placeholder="Name of the Hypothesis">
            <div v-for="(probeOrAction, probeOrActionIndex) in chaostoolkitConfig['steady-state-hypothesis'].probes" :key="probeOrActionIndex"
                 class="flex flex-col gap-2 w-full">
              <ChaosToolkitConfiguratorProbeOrAction :probeOrAction="probeOrAction" :probeOrActionIndex="probeOrActionIndex"
                                                     :totalProbesOrActions="chaostoolkitConfig['steady-state-hypothesis'].probes"
                                                     :isSteadyState="true"/>
            </div>
            <button @click="chaostoolkitConfig['steady-state-hypothesis'].probes.push({type: 'probe', name: '', provider: {type: 'http', url: ''}})"
                    class="bg-[#369a6e] text-white px-3 py-1 rounded hover:bg-[#2d7a5a] text-sm">+
            </button>
          </div>

          <button v-if="chaostoolkitConfig['steady-state-hypothesis'] === null || chaostoolkitConfig['steady-state-hypothesis'] === undefined"
                  @click="chaostoolkitConfig['steady-state-hypothesis'] = {title: '', probes: [{type: 'probe', name: '', provider: {type: 'http', url: ''}}]}"
                  class="btn-green-add">Add Steady State Hypotheses
          </button>

        </div>
        <div class="div-outer-border flex flex-col min-w-0 w-full">
          <div class="flex flex-col gap-2 min-w-0 w-full">
            <div class="flex flex-row items-center justify-between">
              <h3 class="span-ui-header">Method</h3>
            </div>
            <div v-for="(probeOrAction, probeOrActionIndex) in chaostoolkitConfig.method" :key="probeOrActionIndex"
                 class="flex flex-col gap-2 w-full">
              <ChaosToolkitConfiguratorProbeOrAction :probeOrAction="probeOrAction" :probeOrActionIndex="probeOrActionIndex"
                                                     :totalProbesOrActions="chaostoolkitConfig.method" :isSteadyState="false"/>
            </div>
            <button @click="chaostoolkitConfig.method.push({type: 'probe', name: '', provider: {type: 'http', url: ''}})" class="btn-green-add">+
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChaosToolkitConfiguratorProbeOrAction from './ChaosToolkitConfiguratorProbeOrAction.vue';
import {chaostoolkitConfig, showChaostoolkitEditor} from '../util/global-state-handler.ts'
import JsonEditor from "./JsonEditor.vue";
import type {ChaostoolkitConfig} from "../model/chaostoolkit-config.ts";
import type {MiSArchConfig} from "../model/misarch-config.ts";
import {ref} from "vue";

const initialized = ref(false)

function onConfigUpdate(newConfig: ChaostoolkitConfig | MiSArchConfig[]) {
  if (Array.isArray(newConfig)) return;
  if (!initialized.value) {
    initialized.value = true;
    chaostoolkitConfig.value = newConfig;
    return;
  }
  if (showChaostoolkitEditor.value) {
    chaostoolkitConfig.value = newConfig;
  }
}
</script>

<style/>