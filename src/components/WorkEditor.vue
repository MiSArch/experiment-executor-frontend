<template>
  <div class="header">
    <span>Work Configuration</span>
    <button class="header-button">Simple View</button>
  </div>
  <div class="tabs">
    <button
        v-for="(tab, index) in tabs"
        :key="index"
        :class="['tab-button', { active: activeTabIndex === index }]"
        @click="switchTab(index)"
    >
      {{ tab.label }}
      <span class="close-tab" @click.stop="removeTab(index)">×</span>
    </button>
    <button class="add-tab-button" @click="addTab">＋ Add Tab</button>
  </div>
  <div class="editor-element" ref="editorElement"></div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import {ref, watch, onBeforeUnmount} from 'vue'
import {testUuid, testVersion} from '../util/test-uuid.ts';
import {showOverlay} from "../util/show-overlay.ts";
import {backendUrl, gatlingWork} from '../util/test-handler.ts'

const tabs = ref<{ label: string; model: string}[]>([])
const activeTabIndex = ref(0)
const editorElement = ref<HTMLElement | null>(null)
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null

const loadConfig = async (): Promise<string> => {
  const response = await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}/gatlingConfig/work`)
  return await response.text()
}

// TODO fix it, that the correct models are used and the stuff is preserved when switching tabs
const switchTab = (index: number) => {
  if (editorInstance && tabs.value[index]) {
    activeTabIndex.value = index
    editorInstance.setValue(tabs.value[index].model)
  }
}

const addTab = () => {
  const newIndex = tabs.value.length + 1
  const newTab = {
    label: `New Tab ${newIndex}`,
    model: '{\n  "new": "tab"\n}',
  }
  tabs.value.push(newTab)
  switchTab(tabs.value.length - 1)
}

const removeTab = (index: number) => {
  if (index < 0 || index >= tabs.value.length) return

  tabs.value.splice(index, 1)

  if (activeTabIndex.value === index) {
    activeTabIndex.value = index > 0 ? index - 1 : 0
  } else if (activeTabIndex.value > index) {
    activeTabIndex.value--
  }

  if (tabs.value.length > 0) {
    editorInstance?.setValue(tabs.value[activeTabIndex.value].model)
  } else {
    editorInstance?.setValue('')
  }
}

watch(showOverlay, async(newValue, oldValue) => {
  if (newValue !== oldValue && editorElement.value) {
    const config = await loadConfig()
    gatlingWork.value = config
    if (editorInstance?.getEditorType() != undefined) {
      editorInstance?.setValue(config)
    } else {
      tabs.value[0] = {
        label: 'Work Configuration',
        model: gatlingWork.value
      }
      tabs.value[1] = {
        label: 'test',
        model: "something here"
      }
      editorInstance = monaco.editor.create(editorElement.value, {
        value: tabs.value[0].model,
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
      })

      editorInstance.onDidChangeModelContent(() => {
        gatlingWork.value = editorInstance?.getValue() || ''
      })
    }
  }
})


onBeforeUnmount(() => {
  editorInstance?.dispose()
})
</script>

<style scoped>
.header {
  position: fixed;
  top: 7%;
  right: 0;
  height: 6%;
  width: 32.4%;
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
  top: 12.9%;
  right: 0;
  width: 34%;
  height: 47.5%;
  z-index: 10;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  background-color: #1e1e1e;
  text-align: left;
  overflow-x: auto;
}

.tabs {
  position: fixed;
  top: 10%;
  right: 0;
  width: 34%;
  display: flex;
  background-color: #2c2c2c;
  border-bottom: 1px solid #444;
  z-index: 11;
}

.tab-button {
  flex: 1;
  padding: 0.5em;
  background: none;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 0.9em;
  border-right: 1px solid #444;
}

.tab-button:hover {
  background-color: #333;
}
</style>