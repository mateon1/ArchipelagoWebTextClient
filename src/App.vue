<script setup lang="ts">
import TextClient from './components/TextClient.vue'
import ReceivedItems from './components/ReceivedItems.vue';
import {provide, ref, computed} from 'vue'
import { walkIdentifiers } from '@vue/compiler-core'
const count = ref(0)
const inputName = ref("SneakiRoR")
const inputServerInfo = ref("archipelago.gg:53033")
const authenticate = ref(false)
const showTextClient = ref(false)
const showHints = ref(false)
const toggleRecieved = ref(false)
const receivedItems = ref([""])
const plusCount = computed({
  get: () => count.value,
  set: (val) => {
    count.value = val
  }
})
provide('count', count)

for (let i = 0; i < 8; i++) {
  setTimeout(() => {
    plusCount.value += 1
  }, 1000 * i)
}
function OnConnect() {
  authenticate.value = true
}
function ToggleItemsRecieved() {
  toggleRecieved.value = true
  showTextClient.value = false
  showHints.value = false
}
function ShowTextClient() {
  showTextClient.value = true
  toggleRecieved.value = false
  showHints.value = false
}
function ShowHints() {
  showHints.value = true
  showTextClient.value = false
  toggleRecieved.value = false
}
</script>

<template>
  <header>
    <button v-on:click="ToggleItemsRecieved">Items Recieved</button>
    <button v-on:click="ShowTextClient">Show Text Client</button>
    <button v-on:click="ShowHints">Show Hints</button>
  </header>
  <div>
    <div class="wrapper" v-if="authenticate">
      <div v-show="showTextClient">
        <TextClient :slotName=inputName :serverInfo=inputServerInfo @onRecievedItemsChanged="(payload) => {
            receivedItems = payload;
          }"/>
      </div>
    </div>
    <div v-show="!authenticate">
      <div>
        <input type="text" name="Server Info" placeholder="Server Info" v-model="inputServerInfo">
      </div>
      <div>
        <input type="text" name="Slot" placeholder="Slot Name" v-model="inputName">
      </div>
      <div>
        <button v-on:click="OnConnect">Connect</button>
      </div>
    </div>
    <div v-show="toggleRecieved">
      <ReceivedItems :receivedItems="receivedItems"/>
    </div>
  </div>

  <main>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: block;
    /* place-items: flex-start;
    flex-wrap: wrap; */
  }
}
</style>
