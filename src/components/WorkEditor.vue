<template>
  <div class="flex flex-col w-full md:w-1/3 overflow-hidden">
    <!-- Header -->
    <div class="flex flex-row items-center justify-between p-3 bg-[#235f43] text-white shadow-md">
      <span class="text-lg font-bold">Work Configuration</span>
      <button
          class="px-4 py-2 bg-[#369a6e] text-white rounded cursor-pointer hover:bg-[#2d7a5a] focus:outline-none"
      >
        Simple View
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex flex-row w-full justify-evenly bg-[#2c2c2c] border-b border-[#444] z-10">
      <button
          v-for="(tab, index) in gatlingConfigs"
          :key="index"
          :title="tab.fileName"
          @click="switchTab(index)"
          :class="[
          'flex-1 min-w-0 overflow-hidden whitespace-nowrap text-ellipsis px-2 py-1 text-white cursor-pointer text-sm border-r border-[#444]',
          { 'bg-[#444] font-bold text-white': activeTabIndex === index, 'hover:bg-[#333]': activeTabIndex !== index }
        ]"
      >
        <span
            class="inline-block cursor-pointer select-none mr-1 "
            @click.stop="removeTab(index)"
            aria-label="Close tab"
            title="Close tab"
        >
          &times;
        </span>
        {{ tab.fileName }}
      </button>

      <button
          class="px-4 py-1 bg-[#369a6e] text-white cursor-pointer text-sm rounded-none hover:bg-[#2d7a5a] focus:outline-none"
          @click="addTab"
      >
        ＋
      </button>
    </div>

    <!-- Editor -->
    <div
        ref="editorElement"
        class="h-full z-10 shadow-[ -2px_0_5px_rgba(0,0,0,0.1) ] bg-[#1e1e1e] text-left overflow-x-auto"
    ></div>
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
let resizeObserver: ResizeObserver | null = null

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