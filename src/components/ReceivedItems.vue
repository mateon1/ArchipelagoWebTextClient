<script setup lang="ts">
import getItemType from "../helpers/GetItemTypeHelper";
const props = defineProps<{
  receivedItems: [{ item: string; amount: number; type: number }];
}>();
</script>
<template>
  <div id="received_body">
    <h1 class="default">Recent Items:</h1>
    <div v-for="r in props.receivedItems" :key="r.item" class="received_items">
      <span :class="getItemType(r.type)">{{ r.item }}</span>
      <span class="default"> {{ r.amount }} </span>
      <!-- <span :class="props.itemType.progression">{{ props.itemType.progression }} </span> -->
    </div>
  </div>
</template>
