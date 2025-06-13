<template>
  <div class="flex flex-col w-full md:w-1/3 overflow-hidden">
    <div class="header flex flex-row p-3">
      <span>Work Configuration</span>
      <button class="header-button">Simple View</button>
    </div>
    <div class="tabs flex flex-row w-full justify-evenly">
      <button
          v-for="(tab, index) in gatlingConfigs"
          :key="index"
          :title="tab.fileName"
          :class="['tab-button !rounded-none', { active: activeTabIndex === index }]"
          @click="switchTab(index)"
      >
        <span class="close-tab" @click.stop="removeTab(index)">&times;</span>
        {{ tab.fileName }}
      </button>
      <button class="add-tab-button !rounded-none" @click="addTab">＋</button>
    </div>
    <div class="editor-element h-full" ref="editorElement"></div>
  </div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import {ref, watch, onBeforeUnmount} from 'vue'
import {showOverlay} from "../util/show-overlay.ts";
import {backendUrl, gatlingConfigs} from '../util/test-handler.ts'
import {testUuid, testVersion} from "../util/test-uuid.ts";

const activeTabIndex = ref(0)
const editorElement = ref<HTMLElement | null>(null)
const newTabCounter = ref(0)
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null

const loadConfig = async () => {
  const response = await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}/gatlingConfig`)
  const dtoList = await response.json()
  const list: Array<{ fileName: string; workFileContent: string; userSteps: number[] }> = []
  dtoList.forEach((item: { fileName: string,
    encodedWorkFileContent: string, encodedUserStepsFileContent: string }) => {
    list.push({
      fileName: item.fileName,
      workFileContent: atob(item.encodedWorkFileContent),
      userSteps: atob(item.encodedUserStepsFileContent).split('\n').map(line => parseInt(line.trim(), 10)).filter(Number.isFinite)
    })
  })
  gatlingConfigs.value = list
}

const switchTab = (index: number) => {
  if (editorInstance && gatlingConfigs.value[index]) {
    activeTabIndex.value = index
    editorInstance.setValue(gatlingConfigs.value[index].workFileContent)
  }
}

const addTab = () => {
  newTabCounter.value += 1
  const newTab = {
    fileName: `newScenario${newTabCounter.value}`,
    workFileContent: 'package org.misarch\n\n' +
        'import io.gatling.javaapi.core.CoreDsl.*\n' +
        'import io.gatling.javaapi.http.HttpDsl.http\n' +
        'import java.time.Duration\n\n' +
        `val newScenario${newTabCounter.value} = scenario("My Custom Scenario ${newTabCounter.value}")\n`,
    // TODO this should add some usersteps
    userSteps: [1,2,3,4,5,6,7,8,9,10],
  }
  gatlingConfigs.value.push(newTab)
  switchTab(gatlingConfigs.value.length - 1)
}

const removeTab = (index: number) => {
  if (index < 0 || index >= gatlingConfigs.value.length) return

  gatlingConfigs.value.splice(index, 1)

  if (activeTabIndex.value === index) {
    activeTabIndex.value = index > 0 ? index - 1 : 0
  } else if (activeTabIndex.value > index) {
    activeTabIndex.value--
  }

  if (gatlingConfigs.value.length > 0) {
    editorInstance?.setValue(gatlingConfigs.value[activeTabIndex.value].workFileContent)
  } else {
    editorInstance?.setValue('')
  }
}

watch(showOverlay, async (newValue, oldValue) => {
  if (newValue !== oldValue && editorElement.value) {
    await loadConfig()
    if (editorInstance?.getEditorType() != undefined) {
      editorInstance?.setValue(gatlingConfigs.value[0].workFileContent)
    } else {
      editorInstance = monaco.editor.create(editorElement.value, {
        value: gatlingConfigs.value[0].workFileContent,
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
      })

      editorInstance.onDidChangeModelContent(() => {
        gatlingConfigs.value[activeTabIndex.value].workFileContent = editorInstance?.getValue() || ''
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
  background-color: #235f43;
  color: white;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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
  z-index: 10;
  box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
  background-color: #1e1e1e;
  text-align: left;
  overflow-x: auto;
}

.tabs {
  display: flex;
  background-color: #2c2c2c;
  border-bottom: 1px solid #444;
  z-index: 11;
}

.tab-button {
  flex: 1 1 auto;
  word-break: break-word;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 0.5em;
  background: none;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 0.9em;
  border-right: 1px solid #444;
}

.add-tab-button {
  background-color: #369a6e;
  color: white;
  border: none;
  cursor: pointer;
  font-size: 0.9em;
  padding: 0.5em 1em;
}

.add-tab-button:hover {
  background-color: #2d7a5a;
}


.tab-button.active {
  background-color: #444;
  font-weight: bold;
  color: #fff;
}

.tab-button:hover {
  background-color: #333;
}
</style>