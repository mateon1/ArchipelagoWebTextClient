<script setup lang="ts">
const props = defineProps<{
  receivedItems: string[],
}>()
</script>
<template>
    <h1>Recieved Items:</h1>
    <div v-for="r in receivedItems">
        {{ r }},
    </div>
</template>