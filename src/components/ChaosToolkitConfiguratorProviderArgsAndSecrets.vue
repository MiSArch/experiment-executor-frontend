<template>
  <div class="flex flex-col w-full">
    <div class="flex flex-row gap-2 w-full items-center">
      <textarea ref="argumentsTextarea" v-if="probeOrAction.provider.arguments !== undefined" v-model="argumentsInput" class="textarea-default"
                placeholder="Arguments (JSON)"></textarea>
      <button v-if="probeOrAction.provider.arguments !== undefined" @click="removeArguments(probeOrAction.provider)" class="btn-gray-close">&times;
      </button>
    </div>
    <button v-if="probeOrAction.provider.arguments === undefined" @click="addArguments(probeOrAction.provider)" class="btn-gray-add">+</button>
  </div>
  <label class="label-small">ChaosToolkit Secrets</label>
  <div class="flex flex-col w-full">
    <div class="flex flex-row gap-2 w-full items-center">
      <textarea ref="secretsTextarea" v-if="probeOrAction.provider.secrets !== undefined" v-model="secretsInput" class="textarea-default"
                placeholder="Secrets (JSON)"></textarea>
      <button v-if="probeOrAction.provider.secrets !== undefined" @click="removeSecrets(probeOrAction.provider)" class="btn-gray-close">&times;
      </button>
    </div>
    <button v-if="probeOrAction.provider.secrets === undefined" @click="addSecrets(probeOrAction.provider)" class="btn-gray-add">+</button>
  </div>
</template>

<script setup lang="ts">

import {ref, watch} from "vue";
import {showChaostoolkitEditor} from "../util/global-state-handler.ts";
import {useTextareaAutosize} from "@vueuse/core";
import {type Provider} from "../model/chaostoolkit-config.ts";

const props = defineProps<{
  probeOrAction: {
    provider: Provider
  }
}>()

const argumentsTextarea = ref<HTMLTextAreaElement | null>(null);
const argumentsInput = ref<string>('');
const secretsTextarea = ref<HTMLTextAreaElement | null>(null);
const secretsInput = ref<string>('');

const initialized = ref(false);

useTextareaAutosize({element: argumentsTextarea, input: argumentsInput})
useTextareaAutosize({element: secretsTextarea, input: secretsInput})

watch(argumentsInput, async (newValue, oldValue) => {
  if (newValue === oldValue || showChaostoolkitEditor.value) return
  try {
    props.probeOrAction.provider.arguments = JSON.parse(newValue);
  } catch (e) {
  }
}, {deep: true});

watch(secretsInput, async (newValue, oldValue) => {
  if (newValue === oldValue || showChaostoolkitEditor.value) return
  try {
    props.probeOrAction.provider.secrets = JSON.parse(newValue);
  } catch (e) {
  }
}, {deep: true});

watch(() => props.probeOrAction, async (newValue, oldValue) => {
  if (initialized.value === false) {
    initialized.value = true;
    await parseJsonToModels(newValue.provider)
  }

  if (newValue === oldValue || !showChaostoolkitEditor.value) return
  await parseJsonToModels(newValue.provider)
}, {deep: true});

async function parseJsonToModels(provider: Provider) {
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

function addArguments(provider: Provider) {
  provider.arguments = {};
  parseJsonToModels(provider)
}

function removeArguments(provider: Provider) {
  provider.arguments = undefined;
  argumentsInput.value = '';
}

function addSecrets(provider: Provider) {
  provider.secrets = {};
  parseJsonToModels(provider)
}

function removeSecrets(provider: Provider) {
  provider.secrets = undefined;
  secretsInput.value = '';
}
</script>

<style/>