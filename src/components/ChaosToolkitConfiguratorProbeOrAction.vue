<template>
  <div class="flex flex-col gap-2 w-full rounded p-3 mb-2 border-4 border-[#42b883] relative">
    <div class="flex flex-row gap-2 justify-between items-center">
      <span class="text-lg font-semibold text-white mt-1 mb-2">
        {{ probeOrAction.type === 'action' ? 'Action' : 'Probe' }} {{ probeOrActionIndex + 1 }}
      </span>
      <button v-if="totalProbesOrActions.length > 1"
              @click="totalProbesOrActions.splice(probeOrActionIndex, 1)"
              class="bg-[#444] text-white p-2 h-full rounded hover:bg-red-900 text-xs">&times;
      </button>
    </div>
    <label v-if="!isSteadyState" class="text-sm font-medium text-white">Type</label>
    <select v-if="!isSteadyState" v-model="probeOrAction.type"
            class="pw-full my-2 p-2 rounded border-1 border-[#444] text-white text-sm appearance-none cursor-pointer hover:bg-[#333] focus:outline-none">
      <option v-for="(method) in METHOD_OPTIONS" :key="method.label" :value="method.value" style="text-align: center;">{{
          method.label
        }}
      </option>
    </select>
    <label class="text-sm font-medium text-white">Name</label>
    <input v-model="probeOrAction.name" class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="Name of the Probe">
    <label v-if="isSteadyState" class="text-sm font-medium text-white">Tolerance</label>
    <textarea v-if="isSteadyState" v-model="probeOrAction.tolerance"
              class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
              placeholder="Tolerance of the Probe"></textarea>
    <ChaosToolkitConfiguratorProvider :probeOrAction="probeOrAction"></ChaosToolkitConfiguratorProvider>
    <label v-if="!isSteadyState" class="text-sm font-medium text-white">Pauses</label>
    <div v-if="!isSteadyState && probeOrAction.pauses !== null && probeOrAction.pauses !== undefined"
         class="flex flex-row gap-2 w-full justify-between items-center">
      <input v-model.number="probeOrAction.pauses.before" type="number"
             class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
             placeholder="Pause before Execution in seconds" min="0">
      <input v-model.number="probeOrAction.pauses.after" type="number"
             class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
             placeholder="Pause after Execution in seconds" min="0">
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  probeOrAction: any,
  probeOrActionIndex: number,
  totalProbesOrActions: Array<Probe | Action>
  isSteadyState: boolean
}>()
import ChaosToolkitConfiguratorProvider from "./ChaosToolkitConfiguratorProvider.vue";
import {Action, METHOD_OPTIONS, Probe} from "../model/chaostoolkit-config.ts";
</script>