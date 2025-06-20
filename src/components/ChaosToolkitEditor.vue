<template>
  <div class="flex flex-col max-h-full min-h-0 h-full grow md:min-w-1/3 md:max-w-3/8">
    <div class="flex flex-row items-center justify-between p-2 bg-[#235f43] text-white">
      <span class="text-xl font-bold px-3 py-1">ChaosToolkit Configuration</span>
      <div>
        <button
            class="mr-2 px-4 py-2  bg-[#369a6e] rounded text-white cursor-pointer hover:bg-[#2d7a5a] focus:outline-none focus:ring-0 focus:border-transparent appearance-none border-0">
          ?
        </button>
        <button
            class="mr-4 px-4 py-2  bg-[#369a6e] rounded text-white cursor-pointer hover:bg-[#2d7a5a] focus:outline-none focus:ring-0 focus:border-transparent appearance-none border-0"
            @click="showChaostoolkitEditor = !showChaostoolkitEditor">{{ showChaostoolkitEditor ? 'Simple View' : 'Editor View' }}
        </button>
      </div>
    </div>
    <div v-show="showChaostoolkitEditor" class="flex flex-1">
      <JsonEditor :config="chaostoolkitConfig" @update:config="onConfigUpdate" :showEditor="showChaostoolkitEditor"
                  :endpoint="'chaosToolkitConfig'"></JsonEditor>
    </div>
    <div v-show="!showChaostoolkitEditor" class="flex-1 min-h-0 h-full max-w-full overflow-y-auto">
      <div class="flex flex-col gap-4 p-2">
        <div class="flex flex-row flex-nowrap justify-between min-w-0 w-full rounded p-4 border-4 border-[#2d7a5a]">
          <div v-if="chaostoolkitConfig['steady-state-hypothesis'] !== null && chaostoolkitConfig['steady-state-hypothesis'] !== undefined"
               class="flex flex-col gap-2 w-full">
            <div class="flex flex-row items-center justify-between">
              <h3 class="text-lg font-semibold text-white">Steady State Hypothesis</h3>
              <button @click="chaostoolkitConfig['steady-state-hypothesis'] = undefined"
                      class="bg-[#444] text-white p-2 h-full rounded hover:bg-red-900 text-xs">&times;
              </button>
            </div>
            <input v-model="chaostoolkitConfig['steady-state-hypothesis'].title"
                   class="p-2 mt-2 mb-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
                   placeholder="Name of the Steady State Hypothesis">
            <div v-for="(probeOrAction, probeOrActionIndex) in chaostoolkitConfig['steady-state-hypothesis'].probes" :key="probeOrActionIndex"
                 class="flex flex-col gap-2 w-full">
              <ChaosToolkitConfiguratorProbeOrAction :probeOrAction="probeOrAction"
                                                     :probeOrActionIndex="probeOrActionIndex"
                                                     :totalProbesOrActions="chaostoolkitConfig['steady-state-hypothesis'].probes"
                                                     :isSteadyState="true"/>
            </div>
            <button @click="chaostoolkitConfig['steady-state-hypothesis'].probes.push({type: 'probe', name: '', provider: {type: 'http', url: ''}})"
                    class="bg-[#369a6e] text-white px-3 py-1 rounded hover:bg-[#2d7a5a] text-sm">+
            </button>
          </div>

          <button v-if="chaostoolkitConfig['steady-state-hypothesis'] === null || chaostoolkitConfig['steady-state-hypothesis'] === undefined"
                  @click="chaostoolkitConfig['steady-state-hypothesis'] = {title: '', probes: [{type: 'probe', name: '', provider: {type: 'http', url: ''}}]}"
                  class="bg-[#369a6e] text-white px-3 py-1 rounded hover:bg-[#2d7a5a] text-sm w-full">Add Steady State Hypotheses
          </button>

        </div>
        <div class="flex flex-row flex-nowrap min-w-0 w-full rounded p-4 border-4 border-[#2d7a5a]">
          <div class="flex flex-col gap-2 min-w-0 w-full">
            <div class="flex flex-row items-center justify-between">
              <h3 class="text-lg font-semibold text-white">Method</h3>
            </div>
            <div v-for="(probeOrAction, probeOrActionIndex) in chaostoolkitConfig.method" :key="probeOrActionIndex"
                 class="flex flex-col gap-2 w-full">
              <ChaosToolkitConfiguratorProbeOrAction :probeOrAction="probeOrAction"
                                                     :probeOrActionIndex="probeOrActionIndex"
                                                     :totalProbesOrActions="chaostoolkitConfig.method"
                                                     :isSteadyState="false"/>
            </div>
            <button @click="chaostoolkitConfig.method.push({type: 'probe', name: '', provider: {type: 'http', url: ''}})"
                    class="bg-[#369a6e] text-white px-3 py-1 rounded hover:bg-[#2d7a5a] text-sm">+
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

function onConfigUpdate(newConfig: ChaostoolkitConfig | MiSArchConfig[]) {
  if (showChaostoolkitEditor.value) {
    if (Array.isArray(newConfig)) return;
    chaostoolkitConfig.value = newConfig;
  }
}
</script>

<style/>