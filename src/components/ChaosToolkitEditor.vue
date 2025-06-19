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
    <div v-show="showChaostoolkitEditor" ref="editorElement" class="flex-1 min-h-0 max-w-full overflow-y-hidden"></div>
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
          </div>
        </div>
        <div class="flex flex-col flex-nowrap gap-2 justify-between min-w-0 w-full rounded p-4 border-4 border-[#2d7a5a]">
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
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ChaosToolkitConfiguratorProbeOrAction from './ChaosToolkitConfiguratorProbeOrAction.vue';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import {ref, onBeforeUnmount, watch} from 'vue'
import {
  showOverlay,
  testUuid,
  testVersion,
  backendUrl,
  chaostoolkitConfig,
  showChaostoolkitEditor,
} from '../util/global-state-handler.ts'
import {type ChaostoolkitConfig} from "../model/chaostoolkit-config.ts";

const editorElement = ref<HTMLElement | null>(null)
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null
let resizeObserver: ResizeObserver | null = null

watch(showOverlay, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    await loadConfig()
    await watcher()
  }
})

watch(showChaostoolkitEditor, async () => {
  await watcher()
})

async function watcher() {
  if (showChaostoolkitEditor.value && !editorInstance) {
    await initEditor()
  }
}

watch(chaostoolkitConfig, async (newValue) => {
  if (!showChaostoolkitEditor.value) {
    if (editorInstance) {
      editorInstance.setValue(JSON.stringify(newValue, null, 2))
    }
  }
}, {deep: true})

onBeforeUnmount(() => {
  editorInstance?.dispose()
  if (resizeObserver && editorElement.value) {
    resizeObserver.unobserve(editorElement.value)
    resizeObserver.disconnect()
  }
})

const loadConfig = async () => {
  const response = await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}/chaosToolkitConfig`)
  const text = await response.text()
  chaostoolkitConfig.value = JSON.parse(text) as ChaostoolkitConfig
}

function debounce(func: Function, wait: number) {
  let timeout: number | undefined
  return () => {
    clearTimeout(timeout)
    timeout = window.setTimeout(() => func(), wait)
  }
}

async function initEditor() {
  if (!editorElement.value) return;

  if (editorInstance) {
    editorInstance.setValue(JSON.stringify(chaostoolkitConfig.value, null, 2))
    return
  }

  editorInstance = monaco.editor.create(editorElement.value, {
    value: JSON.stringify(chaostoolkitConfig.value, null, 2),
    language: 'json',
    tabSize: 2,
    insertSpaces: true,
    theme: 'vs-dark',
    detectIndentation: false,
    automaticLayout: false,
    formatOnType: true,
    formatOnPaste: true,
    glyphMargin: false,
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 2,
    wordWrap: 'on',
    wordWrapColumn: 80,
    wrappingIndent: 'same',
  })

  editorInstance.onDidChangeModelContent(() => {
    if (showChaostoolkitEditor.value) {
      chaostoolkitConfig.value = JSON.parse(editorInstance?.getValue() || '') as ChaostoolkitConfig
    }
  })

  const debouncedLayout = debounce(() => {
    editorInstance?.layout()
  }, 10)

  resizeObserver = new ResizeObserver(() => {
    debouncedLayout()
  })
  resizeObserver.observe(editorElement.value)
}
</script>

<style/>