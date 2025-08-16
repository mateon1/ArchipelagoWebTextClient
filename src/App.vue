<script setup lang="ts">
import TextClient from "./components/TextClient.vue";
import ReceivedItems from "./components/ReceivedItems.vue";
import ShowHints from "./components/ShowHints.vue";
import { ref, useTemplateRef } from "vue";

const textClientRef = useTemplateRef("textClient");
const inputName = ref("");
const inputServerInfo = ref("archipelago.gg:38281");
const inputPassword = ref("");
const connecting = ref(false);
const authenticated = ref(false);
const connectionError = ref(false);
const connectMessage = ref("");
const viewPage = ref("");
const receivedItems = ref<{ item: string; amount: number; type: number }[]>([]);
const receivedHints = ref<{ word: string, found: boolean }[]>([]);
const hintCost = ref({hintCost: 0, percentageCost: 0});
const hintPoints = ref(0);
const url = location.protocol;

function OnConnect() {
  connectMessage.value = "";
  viewPage.value = "textClient";
  textClientRef.value?.connect();
}
function SwitchProtocol() {
  if (url == "http:") {
    console.log(url + " connected");
    location.href = "https://" + location.hostname;
  } else {
    console.log(url);
    location.href = "http://" + location.hostname;
  }
}
function Disconnect() {
  textClientRef.value?.disconnect("Disconnected");
  //authenticated.value = false;
  viewPage.value = "";
}
</script>

<template>
  <header class="ap_header">
    <span v-if="authenticated">
      <button v-on:click="viewPage = 'itemReceived'" class="ap_button">
        Items Received
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
    <div v-show="authenticated">
      <span v-show="viewPage === 'textClient'" class="wrapper">
        <TextClient ref="textClient"
          :slotName="inputName"
          :serverInfo="inputServerInfo"
          :password="inputPassword"
          @connectionStatus="(payload) => {
            connecting = payload.connected;
            authenticated = payload.authenticated;
            connectionError = payload.error ?? false;
            connectMessage = payload.message ?? '';
          }"
          @onReceivedItemsChanged="(payload) => (receivedItems = payload)"
          @onReceivedHintChanged="(payload) => (receivedHints = payload)"
          @hint_cost="(payload) => (hintCost = payload)"
          @current_hint_points="(payload) => (hintPoints = payload)"
        />
      </span>
    </div>
    <div v-show="!authenticated" class="connection_info">
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
        <input
          type="text"
          class="ap_input"
          name="Password"
          id="input_password"
          placeholder="Password (Optional)"
          v-model="inputPassword"
        />

        <div class="ap_connect_button">
          <button v-on:click="OnConnect" class="ap_button">Connect</button>
          <button v-on:click="SwitchProtocol" class="ap_switch_href ap_button">
            <span v-if="url == 'https:'">Switch to HTTP</span>
            <span v-else>Switch to HTTPS</span>
          </button>
        </div>
      </form>
      <div class="error_message" v-if="connectionError">
        <p>{{ connectMessage ?? "Unknown connection error" }}</p>
      </div>
      <div class="connecting_message" v-else-if="!authenticated && connecting">
        <p>Connecting<span v-if="connectMessage">: {{ connectMessage }}</span></p>
      </div>
    </div>
    <div v-show="viewPage === 'itemReceived'" class="wrapper">
      <ReceivedItems :receivedItems="receivedItems" />
    </div>
    <div v-show="viewPage === 'Hints'" class="wrapper">
      <ShowHints
        :receivedHints="receivedHints"
        :hintCost="hintCost"
        :currentHintPoints="hintPoints"
      />
    </div>
    <div class="ap_disconnect_button" v-show="authenticated">
      <button class="ap_button" v-on:click="Disconnect()">Disconnect</button>
    </div>
  </div>

  <main></main>
</template>
