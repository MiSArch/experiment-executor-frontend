<template>
  <div class="header">
    <span>Experiment Goals</span>
  </div>
  <div class="list-container">
    <button @click="addLine" class="add-button">+</button>
    <div v-for="(line, index) in lines" :key="index" class="line">
      <select v-model="line.dropdown" class="dropdown">
        <option value="option1">Option 1</option>
        <option value="option2">Option 2</option>
        <option value="option3">Option 3</option>
      </select>
      <input type="color" v-model="line.color" class="color-picker"/>
      <input type="number" v-model="line.value" class="number-input"/>
      <button @click="removeLine(index)" class="delete-button">x</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref} from 'vue'

interface Line {
  dropdown: string
  color: string
  value: number | null
}

const lines = ref<Line[]>([])

const addLine = () => {
  lines.value.push({dropdown: 'option1', color: '#000000', value: null})
}

const removeLine = (index: number) => {
  lines.value.splice(index, 1)
}
</script>

<style scoped>
.list-container {
  display: flex;
  flex-direction: column;
  gap: 1em;
  position: fixed;
  right: 35%;
  top: 9em;
  max-height: calc(8 * 3em); /* Adjust based on the approximate height of each line */
  overflow-y: auto;
}

.line {
  display: flex;
  align-items: center;
  gap: 0.5em;
}

.add-button,
.delete-button {
  padding: 0.5em;
  background-color: #42b883;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.add-button:hover,
.delete-button:hover {
  background-color: #369a6e;
}

.dropdown,
.color-picker,
.number-input {
  padding: 0.5em;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.header {
  position: fixed;
  top: 4em;
  right: 33%;
  height: 6%;
  width: 18%;
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
</style>