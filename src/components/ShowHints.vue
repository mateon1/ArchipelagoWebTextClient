<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  receivedHints: {word: string, found: boolean}[];
  hintCost: {hintCost: number, percentageCost: number};
  currentHintPoints: number;
}>();
const hintToggle = ref(false);

// console.log(props.receivedHints);
</script>
<template>
  <div id="received_body">
    <h1 class="default">Hints:</h1>
    <span class="foundHints default">
      Toggle found hints
      <label class="toggle">
        <input type="checkbox" v-model="hintToggle" />
        <span class="slider round"></span>
      </label>
    </span>
    <div class="default">
      A hint costs {{ hintCost.hintCost }}. You have {{ currentHintPoints }} points.
    </div>
    <div v-for="r in props.receivedHints" :key="r.word" class="received_hints">
      <span v-html="r.word" v-if="!hintToggle || !r.found"></span>
      <span v-if="r.found && !hintToggle" style="color: green"> (found)</span>
      <span v-else-if="!r.found && !hintToggle" style="color: red"> (not found)</span>
    </div>
  </div>
</template>
<style scoped>
.toggle {
  position: relative;
  display: inline-block;
  height: 20px;
  width: 37px;
}
.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}
.slider:before {
  position: absolute;
  content: "";
  height: 14px;
  width: 14px;
  left: 4px;
  bottom: 3px;
  background-color: white;
  -webkit-transition: 0.4s;
  transition: 0.4s;
}

input:checked + .slider {
  background-color: var(--ap-plum);
}

input:focus + .slider {
  box-shadow: 0 0 1px var(--ap-plum);
}

input:checked + .slider:before {
  -webkit-transform: translateX(14px);
  -ms-transform: translateX(14px);
  transform: translateX(14px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}
.foundHints {
  text-align: right;
  width: 75vw;
  display: inline-block;
  position: absolute;
  top: 0vh;
}
.foundHints label {
  display: flex;
  left: 90%;
}
</style>
