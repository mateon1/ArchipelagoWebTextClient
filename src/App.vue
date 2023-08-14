<script setup lang="ts">
import TextClient from "./components/TextClient.vue";
import ReceivedItems from "./components/ReceivedItems.vue";
import ShowHints from "./components/ShowHints.vue";
import { ref } from "vue";

const inputName = ref("SneakiRoR");
const inputServerInfo = ref("localhost:58446");
const authenticate = ref(false);
const errorMessage = ref("");
const viewPage = ref("");
const items: [{ item: string; amount: number; type: number }] = [
  { item: "", amount: 0, type: 0 },
];
const jsonData: [{ word: string }] = [{ word: "" }];
const receivedItems = ref(items);
const receivedHints = ref(jsonData);

function OnConnect() {
  authenticate.value = true;
  errorMessage.value = "";
  viewPage.value = "textClient";
}
</script>

<template>
  <header class="ap_header">
    <span v-if="authenticate">
      <button v-on:click="viewPage = 'itemRecieved'">Items Recieved</button>
      <button v-on:click="viewPage = 'textClient'">Show Text Client</button>
      <button v-on:click="viewPage = 'Hints'">Show Hints</button>
    </span>
  </header>
  <div class="ap_body">
    <div v-if="authenticate">
      <span v-show="viewPage === 'textClient'" class="wrapper">
        <TextClient
          :slotName="inputName"
          :serverInfo="inputServerInfo"
          @authenticated="
            (payload) => {
              authenticate = payload.authenticate;
              errorMessage = payload.err;
            }
          "
          @onRecievedItemsChanged="(payload) => (receivedItems = payload)"
          @onRecievedHintChanged="(payload) => (receivedHints = payload)"
        />
      </span>
    </div>
    <div v-show="!authenticate" class="connection_info">
      <form onsubmit="return false;" class="server_info">
        <input
          type="text"
          name="Server Info"
          placeholder="Server Info"
          v-model="inputServerInfo"
        />
        <input
          type="text"
          name="Slot"
          placeholder="Slot Name"
          v-model="inputName"
        />
        <div>
          <button v-on:click="OnConnect">Connect</button>
        </div>
      </form>
      <div class="error_message">
        <p>{{ errorMessage }}</p>
      </div>
    </div>
    <div v-if="viewPage === 'itemRecieved'" class="wrapper">
      <ReceivedItems :receivedItems="receivedItems" />
    </div>
    <div v-if="viewPage === 'Hints'" class="wrapper">
      <ShowHints :receivedHints="receivedHints" />
    </div>
  </div>

  <main></main>
</template>
