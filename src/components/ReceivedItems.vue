<script setup lang="ts">
const props = defineProps<{
  receivedItems: [{item:string, amount:number, type:number}],
}>()
console.log(props.receivedItems)
</script>
<template>
  <div id="received_body">
    <h1>Recent Items:</h1>
    <div v-for="r in props.receivedItems">
        {{ r.item }} {{ r.amount }}
    </div>
  </div>
</template>