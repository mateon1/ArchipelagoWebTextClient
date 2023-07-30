<script setup lang="ts">
  import TextClient from './components/TextClient.vue'
  import ReceivedItems from './components/ReceivedItems.vue'
  import ShowHints from './components/ShowHints.vue'
  import {provide, ref, computed, type Ref} from 'vue'

  const inputName = ref("SneakiRoR")
  const inputServerInfo = ref("archipelago.gg:53033")
  const authenticate = ref(false)
  const errorMessage = ref("")
  const viewPage = ref("")
  const arr: [{item: string, amount: number, type: number}] = [{item: '', amount: 0, type: 0}]
  const jsonData: [{word: string}]= [{word: ""}]
  const receivedItems = ref(arr)
  const receivedHints = ref(jsonData)

  const itemClassification = {
    progression: 'progressiveItem',
    useful: 'usefulItem',
    filler: 'normalItem',
    trap: 'trapItem'
  }

  function OnConnect() {
    authenticate.value = true
    errorMessage.value = ""
    viewPage.value = 'textClient'
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
        <TextClient :slotName=inputName :serverInfo=inputServerInfo :item-type=itemClassification
        @authenticted="(payload) => { authenticate = payload.authenticate; errorMessage = payload.err}"
        @onRecievedItemsChanged="(payload) => receivedItems = payload"
        @onRecievedHintChanged="(payload) => receivedHints = payload"
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
      <ReceivedItems :receivedItems="receivedItems" :item-type="itemClassification"/>
    </div>
    <div v-if="viewPage === 'Hints'" class="wrapper">
      <ShowHints :receivedHints="receivedHints"/>
    </div>
  </div>

  <main>
  </main>
</template>