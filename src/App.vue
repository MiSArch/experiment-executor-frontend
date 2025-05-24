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
    <Overlay/>
    <Header/>
    <Graph/>
    <WorkEditor/>
    <ChaosToolkitEditor/>
    <MiSArchConfigEditor/>
    <GoalEditor/>
</template>

<style/>