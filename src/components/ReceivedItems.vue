<script setup lang="ts">
const props = defineProps<{
  receivedItems: [{item:string, amount:number, type:number}],
  itemType: {
    progression: string,
    useful: string,
    filler: string,
    trap: string
  }
}>()
console.log(props.receivedItems)
function getItemType(flag:number) {
  switch(flag) {
    case 1:
      return props.itemType.progression
      break
    case 2:
      return props.itemType.useful
      break
    case 4:
      return props.itemType.trap
      break
    default:
      return props.itemType.filler
  }
}
</script>
<template>
  <div id="received_body">
    <h1 class="default">Recent Items:</h1>
    <div v-for="r in props.receivedItems" class="receivedItems">
        <span :class="getItemType(r.type)">{{ r.item }}</span>
        <span class="default"> {{ r.amount }} </span>
        <!-- <span :class="props.itemType.progression">{{ props.itemType.progression }} </span> -->
    </div>
  </div>
</template>