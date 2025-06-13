<template>
  <div class="flex flex-col md:min-w-1/3 h-full grow">
    <div class="flex flex-row items-center justify-between p-2 bg-[#235f43] text-white shadow-md">
      <span class="text-xl font-bold">ChaosToolkit Configuration</span>
      <button
          class="
    mr-4 px-4 py-2
    bg-[#369a6e] rounded
    text-white cursor-pointer
    hover:bg-[#2d7a5a]
    focus:outline-none focus:ring-0 focus:border-transparent
    appearance-none
    border-0
  "
      >
        Simple View
      </button>    </div>
    <div
        ref="editorElement"
        class="flex-grow overflow-hidden z-10 shadow-[ -2px_0_5px_rgba(0,0,0,0.1) ] bg-[#1e1e1e] text-left overflow-x-auto"
    ></div>
  </div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import {ref, onBeforeUnmount, watch} from 'vue'
import {testUuid, testVersion} from "../util/test-uuid.ts";
import {showOverlay} from '../util/show-overlay.ts'
import {backendUrl, chaostoolkitConfig} from '../util/test-handler.ts'

const editorElement = ref<HTMLElement | null>(null)
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null
let resizeObserver: ResizeObserver | null = null

const loadConfig = async (): Promise<string> => {
  const response = await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}/chaosToolkitConfig`)
  return await response.text()
}

watch(showOverlay, async (newValue, oldValue) => {
  if (newValue !== oldValue && editorElement.value) {
    const config = await loadConfig()
    chaostoolkitConfig.value = config
    if (editorInstance?.getEditorType() != undefined) {
      editorInstance?.setValue(config)
    } else {
      editorInstance = monaco.editor.create(editorElement.value, {
        value: chaostoolkitConfig.value,
        language: 'yaml',
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
        chaostoolkitConfig.value = editorInstance?.getValue() || ''
      })

      // debounce resize layout call to prevent loop
      const debouncedLayout = debounce(() => {
        editorInstance?.layout()
      }, 10)

      resizeObserver = new ResizeObserver(() => {
        debouncedLayout()
      })

      resizeObserver.observe(editorElement.value)
    }
  }
})

onBeforeUnmount(() => {
  editorInstance?.dispose()
  if (resizeObserver && editorElement.value) {
    resizeObserver.unobserve(editorElement.value)
    resizeObserver.disconnect()
  }
})

function debounce(func: Function, wait: number) {
  let timeout: number | undefined
  return () => {
    clearTimeout(timeout)
    timeout = window.setTimeout(() => func(), wait)
  }
}
</script>

<style/>