<template>
  <div class="flex flex-col md:min-w-1/3 h-full grow">
    <div class="flex flex-row items-center justify-between p-2 bg-[#235f43] text-white shadow-md">
      <span class="text-xl font-bold">MiSArch Experiment Configuration</span>
      <button
          class="
    mr-4 px-4 py-2
    bg-[#369a6e] rounded
    text-white cursor-pointer
    hover:bg-[#2d7a5a]
    focus:outline-none focus:ring-0 focus:border-transparent
    appearance-none
    border-0
  " @click="showMisarchEditor = !showMisarchEditor"
      >
        {{ showMisarchEditor ? 'Simple View' : 'Editor View' }}
      </button>
    </div>
    <div
        ref="editorElement"
        v-show="showMisarchEditor"
        class="flex-grow overflow-hidden z-10 shadow-[ -2px_0_5px_rgba(0,0,0,0.1) ] bg-[#1e1e1e] text-left overflow-x-auto"
    ></div>
    <div v-show="!showMisarchEditor" class="overflow-y-scroll">
      <div class="flex flex-col gap-4 p-4 max-w-full">
        <div
            v-for="(config, configIndex) in misarchExperimentConfig"
            :key="configIndex"
            class="border rounded p-4 shadow-md"
        >
          <h3 class="text-lg font-semibold text-gray-700 mb-2">Failure Set {{ configIndex + 1 }}</h3>

          <div
              v-for="(failure, failureIndex) in config.failures"
              :key="failureIndex"
              class="border rounded p-3 mb-2"
          >
            <div class="flex flex-col gap-2">
              <label class="text-sm font-medium text-gray-600">Service Name</label>
              <input
                  v-model="failure.name"
                  class="p-2 rounded border text-sm"
                  placeholder="Failure name (e.g., catalog)"
              />

              <label class="text-sm font-medium text-gray-600">PubSub Deterioration</label>
              <div>
                  <textarea
                      :value="failure.pubSubDeterioration?.delay ? JSON.stringify(failure.pubSubDeterioration.delay, null, 2) : ''"
                      class="p-2 rounded border text-sm"
                      placeholder="Delay in ms"
                      @input="handleJsonInput($event, failure, 'pubSubDeterioration')"
                  ></textarea>
                <textarea
                    :value="failure.pubSubDeterioration?.delayProbability ? JSON.stringify(failure.pubSubDeterioration.delayProbability, null, 2) : ''"
                    class="p-2 rounded border text-sm"
                    placeholder="Delay probability (0-1)"
                    @input="handleJsonInput($event, failure, 'pubSubDeterioration')"
                ></textarea>
                <textarea
                    :value="failure.pubSubDeterioration?.errorProbability ? JSON.stringify(failure.pubSubDeterioration.errorProbability, null, 2) : ''"
                    class="p-2 rounded border text-sm"
                    placeholder="Error probability (0-1)"
                    @input="handleJsonInput($event, failure, 'pubSubDeterioration')"
                ></textarea>
              </div>

              <label class="text-sm font-medium text-gray-600">Service Invocation Deterioration</label>
              <div v-for="(deterioration, index) in failure.serviceInvocationDeterioration" :key="index" class="mb-2">
                <textarea
                    v-model="deterioration.path"
                    class="p-2 rounded border text-sm"
                    placeholder="HTTP path to fail"
                    @input="handleJsonInput($event, deterioration, 'path')"
                ></textarea>
                <textarea
                    v-model="deterioration.delay"
                    class="p-2 rounded border text-sm"
                    placeholder="Delay in ms"
                    @input="handleJsonInput($event, deterioration, 'delay')"
                ></textarea>
                <textarea
                    v-model="deterioration.delayProbability"
                    class="p-2 rounded border text-sm"
                    placeholder="Delay probability (0-1)"
                    @input="handleJsonInput($event, deterioration, 'delayProbability')"
                ></textarea>
                <textarea
                    v-model="deterioration.errorProbability"
                    class="p-2 rounded border text-sm"
                    placeholder="Error probability (0-1)"
                    @input="handleJsonInput($event, deterioration, 'errorProbability')"
                ></textarea>
                <textarea
                    v-model="deterioration.errorCode"
                    class="p-2 rounded border text-sm"
                    placeholder="Error Code (e.g., 500)"
                    @input="handleJsonInput($event, deterioration, 'errorCode')"
                ></textarea>
              </div>

              <label class="text-sm font-medium text-gray-600">Artificial Memory Usage</label>
              <textarea
                  v-model="failure.artificialMemoryUsage"
                  class="p-2 rounded border text-sm"
                  placeholder="Memory Usage in bites (e.g., 1000000000 for 1GB)"
              ></textarea>

              <label class="text-sm font-medium text-gray-600">Artificial CPU Usage</label>
              <div v-for="(cpuUsage, index) in failure.artificialCPUUsage" :key="index" class="mb-2">
                <textarea
                    :value="cpuUsage.usageDuration ? JSON.stringify(cpuUsage.usageDuration, null, 2) : ''"
                    class="p-2 rounded border text-sm"
                    placeholder="Usage Duration in ms"
                ></textarea>
                <textarea
                    :value="cpuUsage.pauseDuration ? JSON.stringify(cpuUsage.pauseDuration, null, 2) : ''"
                    class="p-2 rounded border text-sm"
                    placeholder="Pause-Duration in ms"
                ></textarea>
              </div>

              <button
                  @click="removeFailure(configIndex, failureIndex)"
                  class="mt-2 self-start bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm"
              >
                Remove Failure
              </button>
            </div>
          </div>

          <button
              @click="addFailure(configIndex)"
              class="mb-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 text-sm"
          >
            Add Failure
          </button>

          <label class="text-sm font-medium text-gray-600">Pause (ms)</label>
          <input
              v-model="config.pause"
              class="p-2 rounded border text-sm"
              placeholder="Pause duration in ms"
          />
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import {onBeforeUnmount, ref, watch} from 'vue'
import {backendUrl, misarchExperimentConfig, showMisarchEditor, showOverlay, testUuid, testVersion} from '../util/global-state-handler.ts'
import type {MiSArchConfig} from "../model/misarch-config.ts";

const editorElement = ref<HTMLElement | null>(null)
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null
let resizeObserver: ResizeObserver | null = null


async function handleJsonInput(event, failure, key) {
  console.log("hello")
  if (!event || !event.target) return;

  const value = event.target.value;
  try {
    failure[key] = value.trim() ? JSON.parse(value) : null;
  } catch (e) {
    // Optional: show error UI or console warning
    console.warn(`Invalid JSON in ${key}:`, e);
  }
}

async function stringify(input: any) {
  return JSON.stringify(input, null, 2);
}


watch(showOverlay, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    await loadConfig()
    await watcher()
  }
})

watch(showMisarchEditor, async () => {
  await watcher()
})

async function watcher() {
  if (showMisarchEditor.value && !editorInstance) {
    await initEditor()
  } else if (!showMisarchEditor.value) {
    // TODO init simple view
  }
}

onBeforeUnmount(() => {
  editorInstance?.dispose()
  if (resizeObserver && editorElement.value) {
    resizeObserver.unobserve(editorElement.value)
    resizeObserver.disconnect()
  }
})

const loadConfig = async () => {
  const response = await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}/misarchExperimentConfig`)
  const text = await response.text()
  misarchExperimentConfig.value = JSON.parse(text) as [MiSArchConfig]
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
    editorInstance.setValue(JSON.stringify(misarchExperimentConfig.value, null, 2))
    return
  }

  editorInstance = monaco.editor.create(editorElement.value, {
    value: JSON.stringify(misarchExperimentConfig.value, null, 2),
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
    misarchExperimentConfig.value = JSON.parse(editorInstance?.getValue() || '') as [MiSArchConfig]
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
