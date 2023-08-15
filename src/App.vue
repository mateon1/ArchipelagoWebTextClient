<script setup lang="ts">
import TextClient from "./components/TextClient.vue";
import ReceivedItems from "./components/ReceivedItems.vue";
import ShowHints from "./components/ShowHints.vue";
import { mergeProps, ref } from "vue";

const inputName = ref("SneakiRoR");
const inputServerInfo = ref("localhost:61507");
const authenticate = ref(false);
const errorMessage = ref("");
const viewPage = ref("");
const connecting = ref(false);
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
  connecting.value = true;
}
function Disconnect() {
  authenticate.value = false;
  viewPage.value = "";
  connecting.value = false;
}
</script>

<template>
  <header class="ap_header">
    <span v-if="authenticate">
      <button v-on:click="viewPage = 'itemRecieved'" class="ap_button">
        Items Recieved
      </button>
      <button v-on:click="viewPage = 'textClient'" class="ap_button">
        Show Text Client
      </button>
      <button v-on:click="viewPage = 'Hints'" class="ap_button">
        Show Hints
      </button>
    </span>
    <span v-else>
      <h1>AP Web Text Client</h1>
    </span>
  </header>
  <div class="ap_body">
    <div v-show="authenticate">
      <span v-show="viewPage === 'textClient'" class="wrapper">
        <TextClient
          :slotName="inputName"
          :serverInfo="inputServerInfo"
          :isConnected="authenticate"
          :connecting="connecting"
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
          class="ap_input"
          name="Server Info"
          placeholder="Server Info address:port"
          v-model="inputServerInfo"
        />
        <input
          type="text"
          class="ap_input"
          name="Slot"
          placeholder="Slot Name"
          v-model="inputName"
        />
        <div class="ap_connect_button">
          <button v-on:click="OnConnect" class="ap_button">Connect</button>
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
    <div class="ap_disconnect_button" v-show="authenticate">
      <button class="ap_button" v-on:click="Disconnect()">Disconnect</button>
    </div>
  </div>

  <main></main>
</template>
