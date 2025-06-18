<script setup lang="ts">
import Header from './components/Header.vue'
import Graph from "./components/Graph.vue";
import WorkEditor from "./components/WorkEditor.vue";
import ChaosToolkitEditor from "./components/ChaosToolkitEditor.vue";
import MiSArchConfigEditor from "./components/MiSArchConfigEditor.vue";
import GoalEditor from "./components/GoalEditor.vue";
import Overlay from "./components/Overlay.vue";
</script>

<template>
  <div class="flex flex-col w-full h-full justify-stretch overflow-hidden">
    <Overlay/>
    <div class="w-full h-2/32">
      <Header/>
    </div>
    <div class="flex flex-col w-full h-full">
      <div class="flex flex-col md:flex-row items-stretch w-full min-h-15/32 h-15/32 max-h-15/32">
        <Graph/>
        <WorkEditor/>
      </div>
      <div class="flex flex-col md:flex-row items-stretch w-full min-h-15/32 h-15/32 max-h-15/32" >
        <ChaosToolkitEditor/>
        <MiSArchConfigEditor/>
        <GoalEditor/>
      </div>
    </div>
  </div>
</template>

<style>
@media (orientation: landscape) {
  html,
  body {
    overflow: hidden !important;
    height: 100%;
    width: 100%;
    position: fixed;
    overscroll-behavior: none;
  }
}
</style>