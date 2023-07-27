<script setup lang="ts">
const props = defineProps<{
  receivedHints: [{word:string}],
}>()
console.log(props.receivedHints)
</script>
<template>
  <div id="received_body">
    <h1>Hints:</h1>
    <div v-for="r in props.receivedHints">
        <span v-html=r.word></span>
    </div>
  </div>
</template>
<style scoped>
:deep(.currentPlayer), .currentPlayer {
  color: var(--ap-magenta);
}
:deep(.otherPlayer), .otherPlayer {
  color: var(--ap-yellow);
}
:deep(.location), .location {
  color: var(--ap-green);
}
:deep(.default), .default {
  color: var(--ap-white);
  white-space: pre-line;
}
:deep(.normalItem), .normalItem {
  color: var(--ap-cyan);
}
:deep(.trapItem), .trapItem {
  color: var(--ap-salmon);
}
:deep(.progressiveItem), .progressiveItem {
  color: var(--ap-plum);
}
:deep(.usefulItem), .usefulItem {
  color: var(--ap-slateblue);
}
</style>