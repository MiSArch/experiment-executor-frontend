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
    <div v-show="!showMisarchEditor">
      <span>HELLO</span>
    </div>
  </div>
</template>


<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import {onBeforeUnmount, ref, watch} from 'vue'
import {backendUrl, misarchExperimentConfig, showMisarchEditor, showOverlay, testUuid, testVersion} from '../util/global-state-handler.ts'

const editorElement = ref<HTMLElement | null>(null)
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null
let resizeObserver: ResizeObserver | null = null

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
  misarchExperimentConfig.value = JSON.stringify(JSON.parse(text), null, 2)
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
    editorInstance.setValue(misarchExperimentConfig.value)
    return
  }

  editorInstance = monaco.editor.create(editorElement.value, {
    value: misarchExperimentConfig.value,
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
    misarchExperimentConfig.value = editorInstance?.getValue() || ''
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
