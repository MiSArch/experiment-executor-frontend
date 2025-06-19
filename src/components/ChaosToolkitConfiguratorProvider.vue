<template>
  <label class="text-sm font-medium text-white">Provider Type</label>
  <select v-model="probeOrAction.provider.type"
          @change="onProviderTypeChange(probeOrAction.provider)"
          class="pw-full my-2 p-2 rounded border-1 border-[#444] text-white text-sm appearance-none cursor-pointer hover:bg-[#333] focus:outline-none">
    <option v-for="(provider) in PROVIDER_OPTIONS" :key="provider.label" :value="provider.value" style="text-align: center;">{{
        provider.label
      }}
    </option>
  </select>

  <!-- Python Provider -->
  <div v-if="probeOrAction.provider.type === 'python'" class="flex flex-col gap-2">
    <label class="text-sm font-medium text-white">Python Module</label>
    <input v-model="probeOrAction.provider.module"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="Module Name">
    <label class="text-sm font-medium text-white">Python Function</label>
    <input v-model="probeOrAction.provider.func"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="Function Name">
    <label class="text-sm font-medium text-white">Python Function Arguments</label>
    <textarea ref="argumentsTextarea"
              v-model="argumentsInput"
              class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm min-w-0 overflow-hidden resize-none"
              placeholder="Arguments (JSON)"></textarea>
    <label class="text-sm font-medium text-white">ChaosToolkit Secrets</label>
    <textarea ref="secretsTextarea"
              v-model="secretsInput"
              class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm min-w-0 overflow-hidden resize-none"
              placeholder="Secrets (JSON)"></textarea>
  </div>

  <!-- HTTP Provider -->
  <div v-else-if="probeOrAction.provider.type === 'http'" class="flex flex-col gap-2">
    <label class="text-sm font-medium text-white">HTTP URL</label>
    <input v-model="probeOrAction.provider.url"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="https://example.com">
    <label class="text-sm font-medium text-white">HTTP Method</label>
    <input v-model="probeOrAction.provider.method"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="POST">
    <label class="text-sm font-medium text-white">HTTP Headers</label>
    <div class="flex flex-col gap-2 max-w-full w-full">
      <div v-for="(header, index) in headersRef" class="flex flex-row gap-2 w-full">
        <input v-model="header.key"
               class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
               placeholder="Header Key">
        <input v-model="header.value"
               class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
               placeholder="Header Value">
        <button @click="headersRef.splice(index, 1)"
                class="bg-[#444] text-white p-2 h-full rounded hover:bg-red-900 text-xs">&times;
        </button>
      </div>
      <button @click="headersRef.push({key: '', value: ''})" class="bg-[#444] text-white px-2 py-1 rounded hover:bg-[#333] text-xs">+
      </button>

    </div>
    <label class="text-sm font-medium text-white">Expected HTTP Status Code</label>
    <input v-model="probeOrAction.provider.expected_status"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="404">
    <label class="text-sm font-medium text-white">Timeout (s)</label>
    <input v-model="probeOrAction.provider.timeout"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="30">
    <label class="text-sm font-medium text-white">Request Args / Body</label>
    <textarea ref="argumentsTextarea"
              v-model="argumentsInput"
              class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm min-w-0 overflow-hidden resize-none"
              placeholder="Arguments (JSON)"></textarea>
    <label class="text-sm font-medium text-white">ChaosToolkit Secrets</label>
    <textarea ref="secretsTextarea"
              v-model="secretsInput"
              class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm min-w-0 overflow-hidden resize-none"
              placeholder="Secrets (JSON)"></textarea>
  </div>

  <!-- Process Provider -->
  <div v-else-if="probeOrAction.provider.type === 'process'" class="flex flex-col gap-2">
    <label class="text-sm font-medium text-white">Process Path</label>
    <input v-model="probeOrAction.provider.path"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="/bin/bash">
    <label class="text-sm font-medium text-white">Timeout (s)</label>
    <input v-model="probeOrAction.provider.timeout"
           type="number"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="30">
    <label class="text-sm font-medium text-white">Process Arguments</label>
    <textarea ref="argumentsTextarea"
              v-model="argumentsInput"
              class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm min-w-0 overflow-hidden resize-none"
              placeholder="Arguments List (JSON)"></textarea>
    <label class="text-sm font-medium text-white">ChaosToolkit Secrets</label>
    <textarea ref="secretsTextarea"
              v-model="secretsInput"
              class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm min-w-0 overflow-hidden resize-none"
              placeholder="Secrets (JSON)"></textarea>
  </div>
</template>

<script setup lang="ts">
import {HttpProvider, type Provider, PROVIDER_OPTIONS} from "../model/chaostoolkit-config.ts";
import {ref, watch} from "vue";
import {showChaostoolkitEditor} from "../util/global-state-handler.ts";

import {useTextareaAutosize} from "@vueuse/core";

const props = defineProps<{
  probeOrAction: {
    provider: Provider
  }
}>()

const headersRef = ref<{ key: string, value: string }[]>([]);
const argumentsTextarea = ref<HTMLTextAreaElement | null>(null);
const argumentsInput = ref<string>('');
const secretsTextarea = ref<HTMLTextAreaElement | null>(null);
const secretsInput = ref<string>('');

const initialized = ref(false);

useTextareaAutosize({element: argumentsTextarea, input: argumentsInput})
useTextareaAutosize({element: secretsTextarea, input: secretsInput})

watch(headersRef, async () => {
  if (props.probeOrAction.provider.type !== "http" || showChaostoolkitEditor.value) return
  try {
    props.probeOrAction.provider.headers = mapHeadersArrayToObject(headersRef.value);
  } catch (e) {
  }
}, {deep: true, immediate: true});

watch(argumentsInput, async (newValue, oldValue) => {
  if (newValue === oldValue || showChaostoolkitEditor.value) return
  try {
    props.probeOrAction.provider.arguments = JSON.parse(newValue);
  } catch (e) {
  }
}, {deep: true, immediate: true});

watch(secretsInput, async (newValue, oldValue) => {
  if (newValue === oldValue || showChaostoolkitEditor.value) return
  try {
    props.probeOrAction.provider.secrets = JSON.parse(newValue);
  } catch (e) {
  }
}, {deep: true, immediate: true});

watch(() => props.probeOrAction, async (newValue, oldValue) => {
  if (initialized.value === false) {
    initialized.value = true;
    await parseJsonToModels(newValue.provider)
  }

  if (newValue === oldValue || !showChaostoolkitEditor.value) return
  await parseJsonToModels(newValue.provider)
}, {deep: true, immediate: true});

async function parseJsonToModels(provider: Provider) {
  // headers
  if (provider.type === "http") {
    let httpProvider = provider as HttpProvider;
    if (!httpProvider.headers || typeof httpProvider.headers !== 'object') {
      httpProvider.headers = {};
    }
    try {
      headersRef.value = Object.entries(httpProvider.headers || {}).map(([key, value]) => ({key, value}));
    } catch (e) {
    }
  }

  // arguments
  if (provider.arguments && typeof provider.arguments === 'object') {
    try {
      argumentsInput.value = JSON.stringify(provider.arguments, null, 2)
    } catch (e) {
    }
  } else {
    argumentsInput.value = '';
  }

  // secrets
  if (provider.secrets && typeof provider.secrets === 'object') {
    try {
      secretsInput.value = JSON.stringify(provider.secrets, null, 2)
    } catch (e) {
    }
  } else {
    secretsInput.value = '';
  }
}

function mapHeadersArrayToObject(headers: { key: string, value: string }[] | undefined) {
  if (!headers) return undefined;
  return headers.reduce((acc, {key, value}) => {
    if (key) acc[key] = value;
    return acc;
  }, {} as Record<string, string>);
}

// This nasty function helps to really reset the provider object when changing types
function onProviderTypeChange(provider: Provider) {
  headersRef.value = []
  argumentsInput.value = ''
  secretsInput.value = ''

  if (provider.type === 'python') {
    Object.assign(provider, {
      type: 'python',
      module: '',
      func: '',
      arguments: undefined,
      secrets: undefined,
      url: undefined,
      method: undefined,
      headers: undefined,
      expected_status: undefined,
      timeout: undefined,
      path: undefined,
    })
  } else if (provider.type === 'http') {
    Object.assign(provider, {
      type: 'http',
      url: '',
      method: '',
      headers: undefined,
      expected_status: undefined,
      arguments: undefined,
      timeout: undefined,
      secrets: undefined,
      module: undefined,
      func: undefined,
      path: undefined,
    })
  } else if (provider.type === 'process') {
    Object.assign(provider, {
      type: 'process',
      path: '',
      url: undefined,
      method: undefined,
      headers: undefined,
      expected_status: undefined,
      arguments: undefined,
      timeout: undefined,
      secrets: undefined,
      module: undefined,
      func: undefined,
    })
  }
}
</script>

<style/>