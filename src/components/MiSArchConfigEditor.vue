<template>
  <div class="flex flex-col max-h-full min-h-0 h-full grow md:min-w-1/3 md:max-w-3/8">
    <div class="flex flex-row items-center justify-between p-2 bg-[#235f43] text-white">
      <span class="text-xl font-bold px-3 py-1">MiSArch Experiment Configuration</span>
      <div>
        <button
            class="mr-2 px-4 py-2  bg-[#369a6e] rounded text-white cursor-pointer hover:bg-[#2d7a5a] focus:outline-none focus:ring-0 focus:border-transparent appearance-none border-0">
          ?
        </button>
        <button
            class="mr-4 px-4 py-2  bg-[#369a6e] rounded text-white cursor-pointer hover:bg-[#2d7a5a] focus:outline-none focus:ring-0 focus:border-transparent appearance-none border-0"
            @click="showMisarchEditor = !showMisarchEditor">{{ showMisarchEditor ? 'Simple View' : 'Editor View' }}
        </button>
      </div>
    </div>
    <div v-show="showMisarchEditor" ref="editorElement" class="flex-1 min-h-0 max-w-full overflow-y-hidden"></div>
    <div v-show="!showMisarchEditor" class="flex-1 min-h-0 h-full max-w-full overflow-y-auto">
      <div class="flex flex-col gap-4 p-2">
        <div v-for="(config, configIndex) in misarchExperimentConfig" :key="configIndex" class="rounded p-4 border-4 border-[#2d7a5a]">
          <div class="flex flex-row flex-nowrap justify-between min-w-0 w-full">
            <h3 class="text-lg font-semibold text-white mt-1">Failure Set {{ configIndex + 1 }}</h3>
            <button @click="removeConfig(configIndex)"
                    class="bg-[#444] text-white p-2 mb-4 h-full rounded hover:bg-red-900 text-xs">&times;
            </button>
          </div>
          <div v-for="(failure, failureIndex) in config.failures" :key="failureIndex" class="rounded p-3 mb-2 border-4 border-[#42b883]">
            <div class="flex flex-row items-center justify-between">
              <span class="text-lg font-semibold text-white mt-1 mb-2 ">Failure {{ failureIndex + 1 }}</span>
              <div>
                <button class="bg-[#444] text-white px-2 py-1 mb-2 rounded hover:bg-[#333] text-xs ml-2"
                        @click="minimizedFailures[getFailureKey(configIndex, failureIndex)] = !minimizedFailures[getFailureKey(configIndex, failureIndex)]">
                  {{ minimizedFailures[getFailureKey(configIndex, failureIndex)] ? '+' : '–' }}
                </button>
                <button @click="removeFailure(configIndex, failureIndex)"
                        class="bg-[#444] text-white px-2 py-1 mb-2 rounded hover:bg-red-900 text-xs ml-2">&times;
                </button>
              </div>
            </div>
            <div v-show="!minimizedFailures[getFailureKey(configIndex, failureIndex)]">
              <div class="flex flex-col gap-2">
                <div class="flex flex-col gap-2 max-w-full w-full">
                  <label class="text-sm font-medium text-white">Service Name</label>
                  <input v-model="failure.name" class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
                         placeholder="catalog"/>
                  <label class="text-sm font-medium text-white">PubSub Deterioration</label>
                  <div v-if="failure.pubSubDeterioration !== null && failure.pubSubDeterioration !== undefined"
                       class="flex flex-row flex-nowrap justify-evenly items-center gap-2 min-w-0 w-full">
                    <input v-model="failure.pubSubDeterioration.delay" type="number"
                           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0" placeholder="Delay in ms">
                    <input type="number" min="0.00" max="1.00" step="0.01"
                           v-model="failure.pubSubDeterioration.delayProbability"
                           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0" placeholder="Delay probability (0-1)">
                    <input type="number" min="0.00" max="1.00" step="0.01"
                           v-model="failure.pubSubDeterioration.errorProbability"
                           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0" placeholder="Error probability (0-1)">
                    <button @click="removePubSubDeterioration(failure)"
                            class="bg-[#444] text-white px-2 py-2 h-full rounded hover:bg-red-900 text-xs">&times;
                    </button>
                  </div>
                  <button v-show="failure.pubSubDeterioration === undefined || failure.pubSubDeterioration === null"
                          @click="addPubSubDeterioration(failure)"
                          class="bg-[#444] text-white px-2 py-1 rounded hover:bg-[#333] text-xs">+
                  </button>
                </div>

                <label class="text-sm font-medium text-white">Service Invocation Deterioration</label>
                <div class="flex flex-col gap-2 max-w-full w-full">
                  <div v-show="failure.serviceInvocationDeterioration?.length ? failure.serviceInvocationDeterioration.length : 0 > 0"
                       class="flex flex-row flex-nowrap justify-evenly gap-2 min-w-0 w-full">
                    <label class="text-xs font-medium text-white min-w-0 flex-1 text-center">HTTP Path to Fail</label>
                    <label class="text-xs font-medium text-white min-w-0 flex-1 text-center">Delay in ms</label>
                    <label class="text-xs font-medium text-white min-w-0 flex-1 text-center">Delay Probability</label>
                    <label class="text-xs font-medium text-white min-w-0 flex-1 text-center">Error Probability</label>
                    <label class="text-xs font-medium text-white min-w-0 flex-1 text-center">HTTP Error Code</label>
                    <div class="flex-shrink-0" style="width: 2.5rem;"></div>
                  </div>
                  <div v-for="(deterioration, index) in failure.serviceInvocationDeterioration" :key="index"
                       class="flex flex-row flex-nowrap items-center gap-2 w-full min-w-0">
                    <input v-model="deterioration.path" class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
                           placeholder="/*"/>
                    <input type="number" v-model="deterioration.delay"
                           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0" placeholder="1000"/>
                    <input type="number" min="0.00" max="1.00" step="0.01" v-model="deterioration.delayProbability"
                           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
                           placeholder="0.05"/>
                    <input type="number" min="0.00" max="1.00" step="0.01" v-model="deterioration.errorProbability"
                           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
                           placeholder="0.05"/>
                    <input type="number" v-model="deterioration.errorCode"
                           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
                           placeholder="500"/>
                    <button @click="removeServiceInvocationDeterioration(failure, index)"
                            class="bg-[#444] text-white px-2 py-2 h-full rounded hover:bg-red-900 text-xs">&times;
                    </button>
                  </div>
                  <button @click="addServiceInvocationDeterioration(failure)" class="bg-[#444] text-white px-2 py-1 rounded hover:bg-[#333] text-xs">
                    +
                  </button>
                </div>

                <div class="flex flex-col gap-2 max-w-full w-full">
                  <label class="text-sm font-medium text-white">Artificial Memory Usage</label>
                  <div class="flex flex-row flex-nowrap items-center gap-2 w-full min-w-0"
                       v-show="failure.artificialMemoryUsage !== null && failure.artificialMemoryUsage !== undefined">
                    <input type="number" v-model="failure.artificialMemoryUsage"
                           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
                           placeholder="Memory Usage in bites (e.g., 1000000000 for 1GB)">
                    <button @click="removeMemoryUsage(failure)"
                            class="bg-[#444] text-white px-2 py-2 h-full rounded hover:bg-red-900 text-xs">&times;
                    </button>
                  </div>
                  <button
                      v-show="failure.artificialMemoryUsage === undefined || failure.artificialMemoryUsage === null"
                      @click="addMemoryUsage(failure)" class="bg-[#444] text-white px-2 py-1 rounded hover:bg-[#333] text-xs">+
                  </button>
                </div>
                <label class="text-sm font-medium text-white">Artificial CPU Usage</label>
                <div class="flex flex-col gap-2 max-w-full w-full">
                  <div v-for="(cpuUsage, index) in failure.artificialCPUUsage" :key="index"
                       class="flex flex-row flex-nowrap items-center gap-2 w-full min-w-0">
                    <input type="number" v-model="cpuUsage.usageDuration"
                           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0" placeholder="Usage Duration in ms">
                    <input type="number" v-model="cpuUsage.pauseDuration"
                           class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0" placeholder="Pause-Duration in ms">
                    <button @click="removeCPUUsage(failure, index)"
                            class="bg-[#444] text-white px-2 py-2 h-full rounded hover:bg-red-900 text-xs">&times;
                    </button>
                  </div>
                  <button @click="addCPUUsage(failure)" class="bg-[#444] text-white px-2 py-1 rounded hover:bg-[#333] text-xs">+</button>
                </div>
              </div>
            </div>
          </div>
          <div class="flex flex-col gap-2">
            <button @click="addFailure(configIndex)" class="bg-[#369a6e] text-white px-3 py-1 rounded hover:bg-[#2d7a5a] text-sm">+</button>
            <label class="text-sm font-medium text-white">Pause Duration after Failure Group (ms)</label>
            <input v-model="config.pause" type="number" class="p-2 rounded border-[#444] border-1 focus:outline-none text-sm flex-1 min-w-0"
                   placeholder="500"/>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <button @click="addConfig()" class="bg-[#369a6e] text-white px-3 py-1 rounded hover:bg-[#2d7a5a] text-sm">+</button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import {onBeforeUnmount, ref, watch} from 'vue'
import {
  backendUrl,
  misarchExperimentConfig,
  showMisarchEditor,
  showOverlay,
  testUuid,
  testVersion
} from '../util/global-state-handler.ts'
import type {MiSArchConfig} from "../model/misarch-config.ts";

const editorElement = ref<HTMLElement | null>(null)
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null
let resizeObserver: ResizeObserver | null = null
const minimizedFailures = ref<{ [key: string]: boolean }>({})
const getFailureKey = (configIndex: number, failureIndex: number) => `${configIndex}-${failureIndex}`;

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
  }
}

watch(misarchExperimentConfig, async (newValue) => {
  if (!showMisarchEditor.value) {
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
    if (showMisarchEditor.value) {
      misarchExperimentConfig.value = JSON.parse(editorInstance?.getValue() || '') as [MiSArchConfig]
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

function addServiceInvocationDeterioration(failure: any) {
  if (!failure.serviceInvocationDeterioration) failure.serviceInvocationDeterioration = [];
  failure.serviceInvocationDeterioration.push({
    path: '',
    delay: '',
    delayProbability: '',
    errorProbability: '',
    errorCode: ''
  });
}

function removeServiceInvocationDeterioration(failure: any, index: number) {
  if (failure.serviceInvocationDeterioration) {
    failure.serviceInvocationDeterioration.splice(index, 1);
  }
}

function addPubSubDeterioration(failure: any) {
  if (!failure.pubSubDeterioration) failure.pubSubDeterioration = {};
  failure.pubSubDeterioration = {
    delay: '',
    delayProbability: '',
    errorProbability: ''
  };
}

function removePubSubDeterioration(failure: any) {
  if (failure.pubSubDeterioration) {
    failure.pubSubDeterioration = null;
  }
}

function addMemoryUsage(failure: any) {
  if (!failure.artificialMemoryUsage) failure.artificialMemoryUsage = null;
  failure.artificialMemoryUsage = 'not empty';
}

function removeMemoryUsage(failure: any) {
  if (failure.artificialMemoryUsage) {
    failure.artificialMemoryUsage = null;
  }
}

function addCPUUsage(failure: any) {
  if (!failure.artificialCPUUsage) failure.artificialCPUUsage = [];
  failure.artificialCPUUsage.push({
    usageDuration: '',
    pauseDuration: ''
  });
}

function removeCPUUsage(failure: any, index: number) {
  if (failure.artificialCPUUsage) {
    failure.artificialCPUUsage.splice(index, 1);
  }
}

function addFailure(configIndex: number) {
  misarchExperimentConfig.value[configIndex].failures.push({
    name: '',
    pubSubDeterioration: null,
    serviceInvocationDeterioration: [],
    artificialMemoryUsage: null,
    artificialCPUUsage: []
  });
}

function removeFailure(configIndex: number, failureIndex: number) {
  misarchExperimentConfig.value[configIndex].failures.splice(failureIndex, 1);
}

function addConfig() {
  misarchExperimentConfig.value.push({
    failures: [{
      name: '',
      pubSubDeterioration: null,
      serviceInvocationDeterioration: [],
      artificialMemoryUsage: null,
      artificialCPUUsage: []
    }],
    pause: 500
  })
}

function removeConfig(configIndex: number) {
  misarchExperimentConfig.value.splice(configIndex, 1);
  // Reset minimized states for the removed config
  Object.keys(minimizedFailures.value).forEach(key => {
    if (key.startsWith(`${configIndex}-`)) {
      delete minimizedFailures.value[key];
    }
  });
}

</script>

<style/>
