<template>
  <div v-if="showHelpOverlay" class="flex fixed bg-[#141414] bg-opacity-70 justify-center z-[1500] text-[#333] w-full h-full overflow-y-auto">
    <div class="flex flex-col w-full max-w-screen-lg m-24 ">
      <div class="flex flex-row gap-2 justify-end bg-[#242424] rounded-t-lg pt-4 pr-4">
        <button @click="showHelpOverlay = false" class="btn-gray-close" aria-label="Close" title="Close Help">&times;</button>
      </div>
      <div v-html="htmlContent" class="markdown-body !bg-[#242424] p-8 rounded-b-lg"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {callingSection, showHelpOverlay} from "../util/global-state-handler.ts";
import {marked} from 'marked';
import {ref, watch} from "vue";

const markdownContent = ref('');
const htmlContent = ref('');

watch(showHelpOverlay, async (newValue, oldValue) => {
  if (newValue !== oldValue && newValue) {
    const response = await fetch(`/frontend/assets/${callingSection.value}.md`);
    markdownContent.value = await response.text();
    htmlContent.value = await marked.parse(markdownContent.value, {gfm: true, breaks: true});
  }
});

</script>

<style/>