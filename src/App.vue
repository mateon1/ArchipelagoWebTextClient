<script setup lang="ts">
import TextClient from './components/TextClient.vue'
import ReceivedItems from './components/ReceivedItems.vue';
import {provide, ref, computed} from 'vue'
import { walkIdentifiers } from '@vue/compiler-core'
const count = ref(0)
const inputName = ref("SneakiRoR")
const inputServerInfo = ref("archipelago.gg:53033")
const authenticate = ref(false)
const errorMessage = ref("")
const viewPage = ref("")
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
  errorMessage.value = ""
}
</script>

<template>
  <header class="ap_header">
    <button v-on:click="viewPage = 'itemRecieved'">Items Recieved</button>
    <button v-on:click="viewPage = 'textClient'">Show Text Client</button>
    <button v-on:click="viewPage = 'Hints'">Show Hints</button>
  </header>
  <div class="ap_body">
    <div v-if="authenticate">
      <span v-show="viewPage === 'textClient'" class="wrapper" >
        <TextClient :slotName=inputName :serverInfo=inputServerInfo 
        @authenticted="(payload) => { authenticate = payload.authenticate; errorMessage = payload.err}"
        @onRecievedItemsChanged="(payload) => {receivedItems = payload;}"
          />
      </span>
    </div>
    <div v-show="!authenticate" class="connection_info">
        <form onsubmit="return false;" class="server_info">
          <input type="text" name="Server Info" placeholder="Server Info" v-model="inputServerInfo">
          <input type="text" name="Slot" placeholder="Slot Name" v-model="inputName">
          <div>
            <button v-on:click="OnConnect">Connect</button>
          </div>
        </form>
      <div class="error_message">
        <p>{{ errorMessage }}</p>
      </div>
    </div>
    <div v-if="viewPage === 'itemRecieved'" class="wrapper">
      <ReceivedItems :receivedItems="receivedItems"/>
    </div>
  </div>

  <main>
  </main>
</template>