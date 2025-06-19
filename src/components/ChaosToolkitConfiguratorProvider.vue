<template>
  <label class="text-sm font-medium text-white">Provider Type</label>
  <select v-model="probeOrAction.provider.type"
          class="pw-full my-2 p-2 rounded border-1 border-[#444] text-white text-sm appearance-none cursor-pointer hover:bg-[#333] focus:outline-none">
    <option v-for="(provider) in PROVIDER_OPTIONS()" :key="provider.label" :value="provider.value" style="text-align: center;">{{
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
    <!-- TODO: JSON parser -->
    <textarea v-model="probeOrAction.provider.arguments"
              class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
              placeholder="Arguments (JSON)"></textarea>
    <textarea v-model="probeOrAction.provider.secrets"
              class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
              placeholder="Secrets (JSON)"></textarea>
  </div>

  <!-- HTTP Provider -->
  <div v-else-if="probeOrAction.provider.type === 'http'" class="flex flex-col gap-2">
    <input v-model="probeOrAction.provider.url"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="HTTP URL">
    <input v-model="probeOrAction.provider.method"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="HTTP Method">
    <!-- TODO: JSON parser -->
    <textarea v-model="probeOrAction.provider.headers"
              class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
              placeholder="Headers (JSON)"></textarea>
    <input v-model="probeOrAction.provider.expected_status"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="Expected Status Code">
    <!-- TODO: JSON parser -->
    <textarea v-model="probeOrAction.provider.arguments"
              class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
              placeholder="Arguments (JSON)"></textarea>
    <input v-model="probeOrAction.provider.timeout"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="Timeout (seconds)">
    <textarea v-model="probeOrAction.provider.secrets"
              class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
              placeholder="Secrets (JSON)"></textarea>
  </div>

  <!-- Process Provider -->
  <div v-else-if="probeOrAction.provider.type === 'process'" class="flex flex-col gap-2">
    <input v-model="probeOrAction.provider.path"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="HTTP URL">
    <textarea v-model="probeOrAction.provider.arguments"
              class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
              placeholder="Arguments (JSON)"></textarea>
    <input v-model="probeOrAction.provider.timeout"
           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
           placeholder="Timeout (seconds)">
    <textarea v-model="probeOrAction.provider.secrets"
              class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
              placeholder="Secrets (JSON)"></textarea>
  </div>
</template>

<script lang="ts">
import {Action, Probe, PROVIDER_OPTIONS} from "../model/chaostoolkit-config.ts";

export default {
  methods: {
    PROVIDER_OPTIONS() {
      return PROVIDER_OPTIONS
    }
  },
  props: {
    probeOrAction: {
      type: Object as () => Probe | Action,
      required: true
    }
  }
}
</script>

<style/>