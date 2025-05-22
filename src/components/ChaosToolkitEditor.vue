<template>
  <div class="editor-element2" ref="editorElement2"></div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const editorElement2 = ref<HTMLElement | null>(null)
const chaostoolkitConfig = ref<string>('')
let editorInstance2: monaco.editor.IStandaloneCodeEditor | null = null

const loadConfig = async (): Promise<string> => {
  const chaostoolkitConfig = await fetch('/todo-delete-toolkit.yaml') // TODO probably via API
  return await chaostoolkitConfig.text()
}

onMounted(async () => {
  if (editorElement2.value) {
    chaostoolkitConfig.value = await loadConfig()
    editorInstance2 = monaco.editor.create(editorElement2.value, {
      value: chaostoolkitConfig.value,
      language: 'yaml',
      tabSize: 2,
      insertSpaces: true,
      theme: 'vs-dark',
      detectIndentation: false,
      automaticLayout: true,
      formatOnType: true,
      formatOnPaste: true,
      glyphMargin: false,
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 2,
      wordWrap: 'on',
      wordWrapColumn: 80,
      wrappingIndent: 'same',
    })

    editorInstance2.onDidChangeModelContent(() => {
      chaostoolkitConfig.value = editorInstance2?.getValue() || ''
    })
  }
})

onBeforeUnmount(() => {
  editorInstance2?.dispose()
})
</script>

<style scoped>
.editor-element2 {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 33%;
  height: 33vh;
  z-index: 10;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  background-color: #1e1e1e;
  text-align: left;
  overflow-x: auto;
}
</style>
