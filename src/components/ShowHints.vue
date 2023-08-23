<script setup lang="ts">
const props = defineProps<{
  receivedHints: [{ word: string }];
  hintCost: number;
  currentHintPoints: number;
}>();
// console.log(props.receivedHints);
</script>
<template>
  <div id="received_body">
    <h1 class="default">Hints:</h1>
    <div class="default">
      A hint costs {{ hintCost }}. You have {{ currentHintPoints }} points.
    </div>
    <div v-for="r in props.receivedHints" :key="r.word" class="received_hints">
      <span v-html="r.word"></span>
    </div>
  </div>
</template>
