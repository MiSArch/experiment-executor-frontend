<template>
  <div class="div-inner-border flex flex-col w-full">
    <div class="flex flex-row justify-between items-center">
      <span class="span-ui-header">{{ probeOrAction.type === 'action' ? 'Action' : 'Probe' }} {{ probeOrActionIndex + 1 }}</span>
      <div>
        <button class="btn-gray-close-small" @click="minimized = !minimized">{{ minimized ? '+' : '–' }}</button>
        <button v-if="totalProbesOrActions.length > 1" @click="totalProbesOrActions.splice(probeOrActionIndex, 1)" class="btn-gray-close-small">
          &times;
        </button>
      </div>
    </div>
    <div v-if="!minimized" class="flex flex-col gap-2">
      <label v-if="!isSteadyState" class="label-small">Type</label>
      <select v-if="!isSteadyState" v-model="probeOrAction.type" @change="probeOrAction.pauses = undefined" class="select-default">
        <option v-for="(method) in METHOD_OPTIONS" :key="method.label" :value="method.value" style="text-align: center;">{{ method.label }}</option>
      </select>
      <label class="label-small">Name</label>
      <input v-model="probeOrAction.name" class="input-default" placeholder="Name of the Probe">
      <label v-if="isSteadyState" class="label-small">Tolerance</label>
      <div v-if="isSteadyState" class="flex flex-col w-full">
        <div class="flex flex-row flex-nowrap gap-2 min-w-0 w-full">
          <textarea v-if="probeOrAction.tolerance !== undefined" ref="toleranceTextarea" v-model="toleranceInput" class="textarea-default"
                    placeholder="Tolerance (JSON)"></textarea>
        </div>
      </div>
      <ChaosToolkitConfiguratorProvider :probeOrAction="probeOrAction"></ChaosToolkitConfiguratorProvider>
      <label v-if="!isSteadyState && probeOrAction.type === 'action'" class="label-small">Pause Durations Before and After
        Execution (s)</label>
      <div v-if="!isSteadyState && probeOrAction.type === 'action'" class="flex flex-col w-full gap-2">
        <div v-if="probeOrAction.pauses !== null && probeOrAction.pauses !== undefined"
             class="flex flex-row gap-2 w-full justify-between items-center">
          <input v-model.number="probeOrAction.pauses.before" type="number" class="input-default" placeholder="Pause Before Execution (s)" min="0">
          <input v-model.number="probeOrAction.pauses.after" type="number" class="input-default" placeholder="Pause After Execution (s)" min="0">
          <button @click="probeOrAction.pauses = undefined" class="btn-gray-close">&times;</button>
        </div>
        <button v-if="probeOrAction.pauses === undefined" @click="probeOrAction.pauses = {before: 0, after: 0}" class="btn-gray-add">+</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {useTextareaAutosize} from "@vueuse/core";

const props = defineProps<{
  probeOrAction: any,
  probeOrActionIndex: number,
  totalProbesOrActions: Array<Probe | Action>
  isSteadyState: boolean
}>()
import ChaosToolkitConfiguratorProvider from "./ChaosToolkitConfiguratorProvider.vue";
import {Action, METHOD_OPTIONS, Probe} from "../model/chaostoolkit-config.ts";
import {ref, watch} from "vue";
import {showChaostoolkitEditor} from "../util/global-state-handler.ts";

const toleranceInput = ref<string>('');
const toleranceTextarea = ref<HTMLTextAreaElement | null>(null);
const initialized = ref(false);
const minimized = ref(false);

useTextareaAutosize({element: toleranceTextarea, input: toleranceInput})

watch(toleranceInput, async (newValue, oldValue) => {
  if (newValue === oldValue || showChaostoolkitEditor.value) return
  try {
    props.probeOrAction.tolerance = JSON.parse(newValue);
  } catch (e) {
  }
}, {deep: true, immediate: true});

watch(() => props.probeOrAction, async (newValue, oldValue) => {
  if (initialized.value === false) {
    initialized.value = true;
    console.log(newValue)
    await parseJsonToModels(newValue)
  }

  if (newValue === oldValue || !showChaostoolkitEditor.value) return
  await parseJsonToModels(newValue)
}, {deep: true, immediate: true});


async function parseJsonToModels(probeOrAction: Probe | Action) {
  if (probeOrAction.type === "probe" && probeOrAction.tolerance !== undefined) {
    try {
      toleranceInput.value = JSON.stringify(probeOrAction.tolerance, null, 2)
    } catch (e) {
    }
  } else {
    toleranceInput.value = '';
  }
}
</script>