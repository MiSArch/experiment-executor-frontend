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
  <div class="flex flex-col w-full h-full justify-stretch">
    <Overlay/>
    <Header/>
    <div class="flex flex-col w-full h-full">
      <div class="flex flex-col md:flex-row items-stretch w-full h-1/2 max-h-1/2">
        <Graph/>
        <WorkEditor/>
      </div>
      <div class="flex flex-col md:flex-row items-stretch w-full h-1/2 max-h-1/2" >
        <ChaosToolkitEditor/>
        <MiSArchConfigEditor/>
        <GoalEditor/>
      </div>
    </div>
  </div>
</template>

<style/>