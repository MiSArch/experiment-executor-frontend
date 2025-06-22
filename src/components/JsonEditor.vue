<template>
  <div ref="editorElement" class="flex-1 min-h-0 max-w-full overflow-y-hidden"></div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import {ref, onBeforeUnmount, watch} from 'vue'
import {
  showOverlay,
  testUuid,
  testVersion,
  backendUrl,
} from '../util/global-state-handler.ts'
import type {ChaostoolkitConfig} from "../model/chaostoolkit-config.ts";
import type {MiSArchConfig} from "../model/misarch-config.ts";

const editorElement = ref<HTMLElement | null>(null)
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null
let resizeObserver: ResizeObserver | null = null

const emit = defineEmits<{
  (e: 'update:config', value: ChaostoolkitConfig | MiSArchConfig[]): void
}>()

const props = defineProps<{
  config: ChaostoolkitConfig | MiSArchConfig[]
  showEditor: boolean
  endpoint: string
}>()

watch(showOverlay, async (newValue, oldValue) => {
  if (newValue !== oldValue) {
    await loadConfig()
    await watcher()
  }
})

watch(() => props.showEditor, async () => {
  await watcher()
})

async function watcher() {
  if (props.showEditor && !editorInstance) {
    await initEditor()
  }
}

watch(() => props.config, async (newValue) => {
  if (!props.showEditor) {
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
  const response = await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}/${props.endpoint}`)
  const text = await response.text()
  emit('update:config', JSON.parse(text))
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
    editorInstance.setValue(JSON.stringify(props.config, null, 2))
    return
  }

  editorInstance = monaco.editor.create(editorElement.value, {
    value: JSON.stringify(props.config, null, 2),
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
    if (props.config) {
      emit('update:config', JSON.parse(editorInstance?.getValue() || ''))
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