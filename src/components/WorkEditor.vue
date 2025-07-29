<template>
  <div class="flex flex-col w-full md:w-1/3 overflow-hidden">
    <div class="div-subheader !pt-3 ">
      <span class="span-subheader">Work Configuration</span>
      <button class="btn-header" @click="toggleHelpOverlay('WorkEditor')" title="Open Work Configuration Help">?</button>
    </div>
    <div class="flex flex-row w-full justify-evenly bg-[#2c2c2c] border-b border-[#444] z-10">
      <button v-for="(tab, index) in gatlingConfigs" :key="index" :title="tab.fileName" @click="switchTab(index)" @dblclick="startRenaming(index)"
              :class="['flex-1 min-w-0 px-2 py-1 text-white text-sm border-r border-[#444]', {'bg-[#444] font-bold text-white': activeTabIndex === index,'hover:bg-[#333]': activeTabIndex !== index,'overflow-hidden whitespace-nowrap text-ellipsis': renamingTabIndex !== index}]">
  <span class="inline-block select-none rounded mr-1 ml-1 pr-1.5 pl-1.5 hover:bg-red-900" @click.stop="removeTab(index)"
        aria-label="Close Tab"
        title="Close Tab">&times;</span>
        <template v-if="renamingTabIndex === index">
          <input ref="renameInput" v-model="gatlingConfigs[index].fileName" @blur="finishRenaming(index, $event)"
                 @keyup.enter="finishRenaming(index, $event)" class="w-full bg-[#222] text-white px-1 rounded border-2 border-[#2d7a5a] focus:outline-none"/>
        </template>
        <template v-else>{{ tab.fileName }}</template>
      </button>
      <button class="px-4 py-1 bg-[#369a6e] text-white text-sm rounded-none hover:bg-[#2d7a5a] focus:outline-none" @click="addTab"
              title="Add New Scenario">＋
      </button>
    </div>
    <div ref="editorElement" class="h-full overflow-x-auto"></div>
  </div>
</template>

<script setup lang="ts">
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api'
import {ref, watch, onBeforeUnmount, nextTick} from 'vue'
import {backendUrl, gatlingConfigs, userStepsResetState, testUuid, testVersion, showOverlay, toggleHelpOverlay} from '../util/global-state-handler.ts'
import {KotlinScenarioModel} from "../model/gatling-work.ts";

const activeTabIndex = ref(0)
const editorElement = ref<HTMLElement | null>(null)
const newTabCounter = ref(0)
const renamingTabIndex = ref<number | null>(null)
const renameInput = ref<HTMLInputElement | null>(null)

let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null
let resizeObserver: ResizeObserver | null = null

const loadConfig = async () => {
  const response = await fetch(`${backendUrl}/experiment/${testUuid.value}/${testVersion.value}/gatlingConfig`)
  const dtoList = await response.json()
  const list: Array<{ fileName: string; workFileContent: string; workModel: KotlinScenarioModel, userSteps: number[] }> = []

  dtoList.forEach((item: {
    fileName: string,
    encodedWorkFileContent: string,
    encodedUserStepsFileContent: string
  }) => {
    let work = atob(item.encodedWorkFileContent)
    list.push({
      fileName: item.fileName,
      workFileContent: work,
      workModel: KotlinScenarioModel.parse(work),
      userSteps: atob(item.encodedUserStepsFileContent).split('\n').map(line => parseInt(line.trim(), 10)).filter(Number.isFinite)
    })
  })

  userStepsResetState.value = list.map(cfg => ({fileName: cfg.fileName, userSteps: [...cfg.userSteps]}))
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
  const workFileContent = 'package org.misarch\n\n' +
      'import io.gatling.javaapi.core.CoreDsl.*\n' +
      'import io.gatling.javaapi.http.HttpDsl.http\n' +
      'import java.time.Duration\n\n' +
      `val newScenario${newTabCounter.value} = scenario("newScenario${newTabCounter.value}")\n`

  const newTab = {
    fileName: `newScenario${newTabCounter.value}`,
    workFileContent: workFileContent,
    workModel: KotlinScenarioModel.parse(workFileContent),
    userSteps: Array.from(
        {length: Math.max(0, ...gatlingConfigs.value.map(cfg => cfg.userSteps.length))},
        () => 3
    ),
  }
  gatlingConfigs.value.push(newTab)
  userStepsResetState.value.push(({
    fileName: newTab.fileName,
    userSteps: [...newTab.userSteps]
  }))

  switchTab(gatlingConfigs.value.length - 1)
}

const removeTab = (index: number) => {
  if (index < 0 || index >= gatlingConfigs.value.length) return

  gatlingConfigs.value.splice(index, 1)
  userStepsResetState.value.splice(index, 1)

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

const startRenaming = (index: number) => {
  renamingTabIndex.value = index
  nextTick(() => {
    renameInput.value?.focus()
    renameInput.value?.select()
  })
}

const finishRenaming = (index: number, event?: Event) => {
  if (event && event.target) {
    const input = event.target as HTMLInputElement
    if (input.value.trim()) {
      gatlingConfigs.value[index].fileName = input.value.trim()
    }
  }
  renamingTabIndex.value = null
}

watch(showOverlay, async (newValue, oldValue) => {
  if (newValue !== oldValue && !newValue && editorElement.value) {
    await loadConfig()
    if (editorInstance?.getEditorType() !== undefined && editorInstance?.getEditorType() !== null) {
      editorInstance?.setValue(gatlingConfigs.value[activeTabIndex.value].workFileContent)
    } else {
      editorInstance = monaco.editor.create(editorElement.value, {
        value: gatlingConfigs.value[activeTabIndex.value].workFileContent,
        language: 'kotlin',
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
        let content = editorInstance?.getValue() || ''
        gatlingConfigs.value[activeTabIndex.value].workFileContent = content
        gatlingConfigs.value[activeTabIndex.value].workModel = KotlinScenarioModel.parse(content)
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