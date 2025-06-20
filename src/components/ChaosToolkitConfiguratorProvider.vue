<template>
  <label class="label-small">Provider Type</label>
  <select v-model="probeOrAction.provider.type"
          @change="onProviderTypeChange(probeOrAction.provider)"
          class="select-default">
    <option v-for="(provider) in PROVIDER_OPTIONS" :key="provider.label" :value="provider.value" style="text-align: center;">{{
        provider.label
      }}
    </option>
  </select>

  <!-- Python Provider -->
  <div v-if="probeOrAction.provider.type === 'python'" class="flex flex-col gap-2">
    <label class="label-small">Python Module</label>
    <input v-model="probeOrAction.provider.module" class="input-default" placeholder="Module Name">
    <label class="label-small">Python Function</label>
    <input v-model="probeOrAction.provider.func" class="input-default" placeholder="Function Name">
    <label class="label-small">Python Function Arguments</label>
    <ChaosToolkitConfiguratorProviderArgsAndSecrets :probeOrAction="probeOrAction"></ChaosToolkitConfiguratorProviderArgsAndSecrets>
  </div>

  <!-- HTTP Provider -->
  <div v-else-if="probeOrAction.provider.type === 'http'" class="flex flex-col gap-2">
    <label class="label-small">HTTP URL</label>
    <input v-model="probeOrAction.provider.url" class="input-default" placeholder="https://example.com">

    <label class="label-small">HTTP Method</label>
    <div class="flex flex-col w-full">
      <div class="flex flex-row gap-2 w-full items-center">
        <input v-if="probeOrAction.provider.method !== undefined" v-model="probeOrAction.provider.method" class="input-default" placeholder="POST">
        <button v-if="probeOrAction.provider.method !== undefined" @click="removeMethod(probeOrAction.provider)" class="btn-gray-close">&times;
        </button>
      </div>
      <button v-if="probeOrAction.provider.method === undefined" @click="addMethod(probeOrAction.provider)" class="btn-gray-add">+</button>
    </div>

    <label class="label-small">HTTP Headers</label>
    <div class="flex flex-col gap-2 max-w-full w-full">
      <div v-for="(header, index) in headersRef" class="flex flex-row gap-2 w-full">
        <input v-model="header.key" class="input-default" placeholder="Header Key">
        <input v-model="header.value" class="input-default" placeholder="Header Value">
        <button @click="headersRef.splice(index, 1)" class="btn-gray-close">&times;</button>
      </div>
      <button @click="headersRef.push({key: '', value: ''})" class="btn-gray-add">+</button>
    </div>

    <label class="label-small">Expected HTTP Status Code</label>
    <div class="flex flex-col max-w-full w-full">
      <div class="flex flex-row gap-2 w-full items-center">
        <input v-if="probeOrAction.provider.expected_status !== undefined" v-model="probeOrAction.provider.expected_status" class="input-default"
               placeholder="404">
        <button v-if="probeOrAction.provider.expected_status !== undefined" @click="removeExpectedStatus(probeOrAction.provider)"
                class="btn-gray-close">&times;
        </button>
      </div>
      <button v-if="probeOrAction.provider.expected_status === undefined" @click="addExpectedStatus(probeOrAction.provider)" class="btn-gray-add">+
      </button>
    </div>

    <label class="label-small">Timeout (s)</label>
    <div class="flex flex-col w-full">
      <div class="flex flex-row gap-2 w-full items-center">
        <input v-if="probeOrAction.provider.timeout !== undefined" v-model="probeOrAction.provider.timeout" class="input-default" placeholder="30">
        <button v-if="probeOrAction.provider.timeout !== undefined" @click="removeTimeout(probeOrAction.provider)" class="btn-gray-close">&times;
        </button>
      </div>
      <button v-if="probeOrAction.provider.timeout === undefined" @click="addTimeout(probeOrAction.provider)" class="btn-gray-add">+</button>
    </div>
    <label class="label-small">Request Args / Body</label>
    <ChaosToolkitConfiguratorProviderArgsAndSecrets :probeOrAction="probeOrAction"></ChaosToolkitConfiguratorProviderArgsAndSecrets>
  </div>

  <!-- Process Provider -->
  <div v-else-if="probeOrAction.provider.type === 'process'" class="flex flex-col gap-2">
    <label class="label-small">Process Path</label>
    <input v-model="probeOrAction.provider.path" class="input-default" placeholder="/bin/bash">
    <label class="label-small">Timeout (s)</label>
    <div class="flex flex-col w-full">
      <div class="flex flex-row gap-2 w-full items-center">
        <input v-if="probeOrAction.provider.timeout !== undefined" v-model="probeOrAction.provider.timeout" class="input-default" placeholder="30">
        <button v-if="probeOrAction.provider.timeout !== undefined" @click="removeTimeout(probeOrAction.provider)" class="btn-gray-close">&times;</button>
      </div>
      <button v-if="probeOrAction.provider.timeout === undefined" @click="addTimeout(probeOrAction.provider)" class="btn-gray-add">+</button>
    </div>

    <label class="label-small">Process Arguments</label>
    <ChaosToolkitConfiguratorProviderArgsAndSecrets :probeOrAction="probeOrAction"></ChaosToolkitConfiguratorProviderArgsAndSecrets>
  </div>
</template>

<script setup lang="ts">
import {HttpProvider, type Provider, PROVIDER_OPTIONS} from "../model/chaostoolkit-config.ts";
import {ref, watch} from "vue";
import {showChaostoolkitEditor} from "../util/global-state-handler.ts";
import ChaosToolkitConfiguratorProviderArgsAndSecrets from "./ChaosToolkitConfiguratorProviderArgsAndSecrets.vue";

const props = defineProps<{
  probeOrAction: {
    provider: Provider
  }
}>()

const headersRef = ref<{ key: string, value: string }[]>([]);
const initialized = ref(false);

watch(headersRef, async () => {
  if (props.probeOrAction.provider.type !== "http" || showChaostoolkitEditor.value) return
  try {
    props.probeOrAction.provider.headers = mapHeadersArrayToObject(headersRef.value);
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
      method: undefined,
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

function addExpectedStatus(provider: Provider) {
  if (provider.type !== 'http') return
  provider.expected_status = 200;
  parseJsonToModels(provider)
}

function removeExpectedStatus(provider: Provider) {
  if (provider.type !== 'http') return
  provider.expected_status = undefined
}

function addMethod(provider: Provider) {
  if (provider.type !== 'http') return
  provider.method = "GET";
  parseJsonToModels(provider)
}

function removeMethod(provider: Provider) {
  if (provider.type !== 'http') return
  provider.method = undefined
}

function addTimeout(provider: Provider) {
  if (provider.type === 'python') return
  provider.timeout = 0;
  parseJsonToModels(provider)
}

function removeTimeout(provider: Provider) {
  if (provider.type === 'python') return
  provider.timeout = undefined
}
</script>

<style/>