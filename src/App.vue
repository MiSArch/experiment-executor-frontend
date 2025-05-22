<script setup lang="ts">
import StartExperiment from './components/StartExperiment.vue'
import Graph from "./components/Graph.vue";
import WorkEditor from "./components/WorkEditor.vue";
import ChaosToolkitEditor from "./components/ChaosToolkitEditor.vue";
import MiSArchConfigEditor from "./components/MiSArchConfigEditor.vue";
</script>

<template>
  <StartExperiment/>
  <Graph/>
  <WorkEditor/>
  <ChaosToolkitEditor/>
  <MiSArchConfigEditor/>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
