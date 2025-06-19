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
  <label class="text-sm font-medium text-white">Provider Details</label>

  <!-- Python Provider -->
  <div v-if="probeOrAction.provider.type === 'python'" class="flex flex-col gap-2">
    <input v-model="probeOrAction.provider.module"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="Python Module">
    <input v-model="probeOrAction.provider.func"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="Function Name">
    <!-- Optional: arguments and secrets as JSON -->
    <textarea ref="argumentsTextarea"
              v-model="argumentsJson"
              class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm min-w-0 grow shrink overflow-hidden"
              placeholder="Arguments (JSON)"></textarea>
    <textarea v-model="secretsJson"
              class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm min-w-0 grow shrink overflow-hidden"
              placeholder="Secrets (JSON)"
              rows="3"></textarea>
  </div>

  <!-- HTTP Provider -->
  <div v-else-if="probeOrAction.provider.type === 'http'" class="flex flex-col gap-2">
    <input v-model="probeOrAction.provider.url"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="HTTP URL">
    <input v-model="probeOrAction.provider.method"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="HTTP Method">
    <div class="flex flex-row gap-2 w-full justify-between items-center">
      <button @click="addHeader(probeOrAction.provider)" class="bg-[#444] text-white p-2 h-full rounded hover:bg-[#369a6e] text-xs">Add Header
      </button>
    </div>
    <!-- TODO FINALIZE HEADERS -->
    <div v-for="(header, index) in probeOrAction.provider.headers" class="flex flex-row gap-2 w-full">
      <input v-model="header.key"
             class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
             placeholder="Header Key">
      <input v-model="header.value"
             class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
             placeholder="Header Value">
      <button v-if="probeOrAction.provider.headers !== undefined"
              @click="probeOrAction.provider.headers.splice(index, 1)"
              class="bg-[#444] text-white p-2 h-full rounded hover:bg-red-900 text-xs">&times;
      </button>
    </div>
    <input v-model="probeOrAction.provider.expected_status"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="Expected Status Code">
    <textarea v-model="argumentsJson"
              class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm min-w-0 grow shrink overflow-hidden"
              placeholder="Arguments (JSON)"></textarea>
    <textarea v-model="secretsJson"
              class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm min-w-0 grow shrink overflow-hidden"
              placeholder="Secrets (JSON)"></textarea>
    <input v-model="probeOrAction.provider.timeout"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="Timeout (seconds)">
  </div>

  <!-- Process Provider -->
  <div v-else-if="probeOrAction.provider.type === 'process'" class="flex flex-col gap-2">
    <input v-model="probeOrAction.provider.path"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="HTTP URL">
    <input v-model="probeOrAction.provider.timeout"
           type="number"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="Timeout (seconds)">
    <textarea ref="argumentsTextarea"
              v-model="argumentsJson"
              class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm min-w-0 grow shrink overflow-hidden"
              placeholder="Arguments (JSON)"></textarea>
    <textarea v-model="secretsJson"
              class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm min-w-0 grow shrink overflow-hidden"
              placeholder="Secrets (JSON)"
              rows="3"></textarea>
  </div>
</template>

<script setup lang="ts">
import {type Provider, HttpProvider, PROVIDER_OPTIONS} from "../model/chaostoolkit-config.ts";
import {computed} from "vue";

const props = defineProps<{
  probeOrAction: {
    provider: Provider
  }
}>()


function addHeader(provider: HttpProvider) {
  if (provider.headers === undefined) {
    provider.headers = [{key: '', value: ''}]
  } else {
    provider.headers.push({key: '', value: ''})
  }
  console.log(provider.headers)
}

function safeStringify(obj: any) {
  try {
    return obj ? JSON.stringify(obj, null, 2) : ''
  } catch {
    return ''
  }
}

const argumentsJson = computed({
  get() {
    return safeStringify(props.probeOrAction.provider.arguments)
  },
  set(val: string) {
    try {
      props.probeOrAction.provider.arguments = val ? JSON.parse(val) : undefined
    } catch {
      // Optionally handle parse error
    }
  }
})

const secretsJson = computed({
  get() {
    return safeStringify(props.probeOrAction.provider.secrets)
  },
  set(val: string) {
    try {
      props.probeOrAction.provider.secrets = val ? JSON.parse(val) : undefined
    } catch {
      // Optionally handle parse error
    }
  }
})

// This nasty function helps to really reset the provider object when changing types
function onProviderTypeChange(provider: Provider) {
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