<template>
  <div class="header">
    <span>Work Configuration</span>
    <button class="header-button">Simple View</button>
  </div>
  <div class="editor-element" ref="editorElement"></div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import { ref, onMounted, onBeforeUnmount } from 'vue'

const editorElement = ref<HTMLElement | null>(null)
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null

onMounted(() => {
  if (editorElement.value) {
    editorInstance = monaco.editor.create(editorElement.value, {
      value: '{\n  "message": "Start coding here..."\n}',
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
.header {
  position: fixed;
  top: 4em;
  right: 0;
  height: 6%;
  width: 32%;
  background-color: #235f43;
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  padding: 0 1em;
}

.header span {
  font-size: 1.2em;
  font-weight: bold;
}

.header-button {
  padding: 0.5em 1em;
  background-color: #369a6e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.header-button:hover {
  background-color: #2d7a5a;
}

.editor-element {
  position: fixed;
  top: 8em;
  right: 0;
  width: 34%;
  height: 100vh;
  z-index: 10;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  background-color: #1e1e1e;
  text-align: left;
  overflow-x: auto;
}
</style>