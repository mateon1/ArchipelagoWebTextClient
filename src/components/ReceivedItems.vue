<script setup lang="ts">
const props = defineProps<{
  receivedItems: string[],
}>()
console.log(props.receivedItems)
</script>
<template>
  <div id="received_body">
    <h1>Recent Items:</h1>
    <div v-for="r in props.receivedItems">
        {{ r }}
    </div>
  </div>
</template>