<template>
  <div class="editor-element" ref="editorElement"></div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const editorElement = ref<HTMLElement | null>(null)
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null


//const loadConfig = async (): Promise<string> => {
//  const misarchConfigResponse = await fetch('/example-experiment-config.json');
//  const text = await misarchConfigResponse.text();
//  return JSON.parse(text);
//}

onMounted(() => {
  if (editorElement.value) {
    const misarchConfig = 'test';
    editorInstance = monaco.editor.create(editorElement.value, {
      value: misarchConfig,
      language: 'json',
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
  }
})

onBeforeUnmount(() => {
  editorInstance?.dispose()
})
</script>

<style scoped>
.editor-element {
  position: fixed;
  bottom: 0;
  left: 33%;
  width: 33%;
  height: 33vh;
  z-index: 10;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  background-color: #1e1e1e;
  text-align: left;
  overflow-x: auto;
}
</style>
