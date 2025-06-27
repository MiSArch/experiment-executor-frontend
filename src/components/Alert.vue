<template>
  <div v-if="showAlert" class="flex fixed justify-center items-center z-[1200] text-[#333] w-full h-full overflow-y-auto"
       style="background-color: rgba(20, 20, 20, 0.4)">
    <div class=" flex flex-col max-w-screen-lg">
      <div class="flex flex-col gap-2 bg-white !opacity-100 rounded-lg ">
        <div class="flex flex-row gap-2 z-10 justify-end mt-4 mr-4">
          <button @click="showAlert=false" class="btn-gray-close !bg-[#369a6e] hover:!bg-[#2d7a5a]" aria-label="Close">&times;</button>
        </div>
        <span class="span-header p-16 -mt-12 z-0 " v-html="alertHtml"></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {alertText, showAlert} from "../util/global-state-handler.ts";
import {computed} from "vue";

const urlRegex = /(https?:\/\/\S+)/g;
const alertHtml = computed(() => {
  if (!alertText.value) return '';
  return alertText.value.replace(urlRegex, url =>
      `<br><a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#369a6e;text-decoration:underline;">${url}</a>`
  );
});
</script>

<style/>