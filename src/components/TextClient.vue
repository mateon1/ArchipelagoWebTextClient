<script setup lang="ts">
import getItemType from "../helpers/GetItemTypeHelper";
import { Client, ITEMS_HANDLING_FLAGS } from "archipelago.js";
import { computed, ref, onMounted, watch } from "vue";
const props = defineProps<{
  slotName: string;
  serverInfo: string;
  password: string;
  isConnected: boolean;
  connecting: boolean;
}>();
const emit = defineEmits<{
  (
    e: "onRecievedItemsChanged",
    itemName: [{ item: string; amount: number; type: number }]
  ): void;
  (
    e: "authenticated",
    authenticate: { err: string; authenticate: boolean }
  ): void;
  (e: "onRecievedHintChanged", hints: [{ word: string }]): void;
  (e: "connected-to-server", connectedToServer: boolean): void;
  (e: "hint_cost", hintCost: number): void;
  (e: "current_hint_points", hintPoints: number): void;
}>();

const serverURI = ref([""]);
serverURI.value = props.serverInfo.split(":");
const client = new Client();
const connectionInfo = ref({
  hostname: "",
  port: 38281,
  game: "",
  name: "",
  items_handling: 7,
  tags: [""],
  password: "",
  slot_data: false,
});
const game = ref("");
let lastKnownScrollLocation = 0;
const totalLocation = ref(0);
const percentageHintCost = ref(0);

watch(
  () => props.isConnected,
  () => {
    // console.log("prop value changed", props.isConnected);
    if (!props.isConnected) {
      Disconnect("Disconnected");
    }
  }
);
watch(
  () => props.connecting,
  () => {
    // console.log("connecting value changed", props.connecting);
    if (props.connecting) {
      serverURI.value = props.serverInfo.split(":");
      connectionInfo.value = {
        hostname: serverURI.value[0],
        port: Number(serverURI.value[1]),
        game: "",
        name: props.slotName,
        items_handling: ITEMS_HANDLING_FLAGS.REMOTE_ALL,
        tags: ["WebClient", "TextOnly"],
        password: props.password,
        slot_data: false,
      };
      Connect();
    }
  }
);

onMounted(() => {
  const element = document.getElementById("text_body");
  if (element) {
    lastKnownScrollLocation = document.body.scrollHeight;
    element.addEventListener("scroll", () => {
      lastKnownScrollLocation = element.scrollTop + element.offsetHeight;
      //console.log(element.scrollHeight, element.scrollTop, element.clientHeight, element.offsetHeight)
      lastKnownScrollLocation = Math.ceil(lastKnownScrollLocation);
      //console.log(lastKnownScrollLocation)
    });
  }
});

const text = ref(["<span class='default'>Welcome</span>"]);
let connected = ref(false);
const plusText = computed({
  get: () => text.value,
  set: (val) => {
    text.value.splice(text.value.length, 1, val.toString());
  },
});
const inputText = ref("");
// Connect();

function Connect() {
  // Set up the AP client.
  // Connect to the Archipelago server.
  console.log(connectionInfo.value);
  client
    .connect(connectionInfo.value)
    .then(() => {
      plusText.value = [
        `<span class="default">Connected to room with ${
          client.players.all.length - 1
        } players.</span>`,
      ];
      connected.value = true;
      emit("connected-to-server", true);
      console.log("connected to " + serverURI.value);
      // console.log(packet);

      // game = client.data.games.
    })
    .catch((error) => {
      if (typeof error[0] === "string") {
        Disconnect(error[0]);
      } else {
        Disconnect("Couldn't connect for some reason");
      }
    });
  RecieveText();
  RecievedItems();
  GetRoomInfo();
}

function Disconnect(error: string): void {
  client.disconnect();
  connected.value = false;
  client.removeListener("PrintJSON", () => {});
  client.removeListener("ReceivedItems", () => {});
  client.removeListener("RoomInfo", () => {});
  client.removeListener("Retrieved", () => {});
  client.removeListener("PacketReceived", () => {});
  emit("authenticated", { err: error, authenticate: false });
  text.value = [];
}
function RecieveText() {
  // console.log("text");
  // Listen for packet events.
  client.addListener("PrintJSON", (packet) => {
    let word = "";
    if (text.value.length >= 500) {
      text.value.splice(0, 20);
    }
    // console.log(text.value.length + " length");
    packet.data.forEach((text) => {
      switch (text.type) {
        case "player_id":
          // word += client.players.name(Number(text.text));
          if (
            client.players.name(Number(text.text)) === connectionInfo.value.name
          ) {
            word += `<span class="currentPlayer"> ${client.players.alias(
              Number(text.text)
            )}</span>`;
          } else {
            word += `<span class="otherPlayer"> ${client.players.alias(
              Number(text.text)
            )}<span class="showGameName">${client.players.game(
              Number(text.text)
            )}</span></span>`;
          }
          break;
        case "item_id":
          word += `<span class="${getItemType(text.flags)}">
             ${client.items.name(text.player, Number(text.text))}</span>`;
          break;
        case "location_id":
          word += `<span class="location"> ${client.locations.name(
            text.player,
            Number(text.text)
          )}</span>`;
          break;
        case "color":
          word += `<span style="color: ${text.color}"> ${text.text}</span>`;
          break;
        case "entrance_name":
          word += `<span class="entrance"> ${text.text}</span>`;
          break;
        default:
          word += `<span class="default"> ${text.text} </span>`;
          break;
      }
    });
    plusText.value = [word];
  });
}

function RecievedItems() {
  client.addListener("ReceivedItems", (packet) => {
    // console.log(packet);
    let packetItems: [{ item: string; amount: number; type: number }] = [
      { item: "", amount: 0, type: 0 },
    ];
    packet.items.forEach((i) => {
      const name: string = client.items.name(game.value, i.item);
      let noItems: boolean = true;
      for (let k = 0; k < packetItems.length; k++) {
        if (name === packetItems[k].item) {
          packetItems[k].amount += 1;
          packetItems[k].type = i.flags;
          noItems = false;
          break;
        }
      }
      if (noItems) {
        packetItems.push({ item: name, amount: 1, type: i.flags });
      }
    });
    packetItems.splice(0, 1);
    // console.log(packetItems);
    emit("onRecievedItemsChanged", packetItems);
  });
}
function GetRoomInfo() {
  client.addListener("RoomInfo", (packet) => {
    // console.log(packet);
    percentageHintCost.value = packet.hint_cost;
  });
  client.addListener("RoomUpdate", (packet) => {
    if (packet.hint_cost) {
      percentageHintCost.value = packet.hint_cost;
      const percentageCost = getHintCost();
      // console.log(percentageCost);
      emit("hint_cost", percentageCost);
    }
    if (packet.hint_points) {
      emit("current_hint_points", packet.hint_points);
    }
  });
  client.addListener("Connected", (packet) => {
    totalLocation.value =
      packet.checked_locations.length + packet.missing_locations.length;
    const percentageCost = getHintCost();
    emit("hint_cost", percentageCost);
    for (const key in packet.slot_info) {
      if (packet.slot_info[key].name === props.slotName) {
        game.value = packet.slot_info[key].game;
      }
    }
    emit("current_hint_points", packet.hint_points);
  });
  client.addListener("SetReply", (packet) => {
    parseHintText(packet.value);
  });
  // client.addListener("PacketReceived", (packet) => {
  //   console.log(packet);
  // });
  client.addListener("Retrieved", (packet) => {
    //console.log(packet);
    let player, hintArray: any;
    for (player in packet.keys) {
      hintArray = packet.keys[player];
    }
    if (hintArray) {
      parseHintText(hintArray);
    }
  });
}

function changeHeight(el: any) {
  let element = document.getElementById("text_body");
  if (el != null && element != null) {
    //console.log(Math.ceil(element.offsetHeight), element.scrollTop, lastKnownScrollLocation, element.scrollHeight)
    if (Math.ceil(element.scrollHeight) <= lastKnownScrollLocation) {
      element.scrollTo(0, element.scrollHeight + el.clientHeight);
      lastKnownScrollLocation += el.clientHeight;
    }
  }
}
function getHintCost() {
  return Math.max(
    0,
    Math.floor((percentageHintCost.value * totalLocation.value) / 100)
  );
}
function scrollToBottom() {
  let element = document.getElementById("text_body");
  if (element) {
    element.scrollTo(0, element.scrollHeight);
  }
}
function parseHintText(data: any) {
  let word = "";
  let hint: [{ word: string }] = [{ word: "" }];
  data.forEach((text: any) => {
    word = "";
    word += `<span class="default"> [${text.class}]: </span>`;
    if (
      client.players.name(Number(text.receiving_player)) ===
      connectionInfo.value.name
    ) {
      word += `<span class="currentPlayer"> ${client.players.alias(
        Number(text.receiving_player)
      )}</span>`;
    } else {
      word += `<span class="otherPlayer"> ${client.players.alias(
        Number(text.receiving_player)
      )}<span class="showGameName">${client.players.game(
        Number(text.receiving_player)
      )}</span></span>`;
    }
    word += "<span class=default>'s </span>";
    word += `<span class="${getItemType(text.item_flags)}"> ${client.items.name(
      text.receiving_player,
      Number(text.item)
    )}</span>`;
    word += "<span class=default> is at </span>";
    word += `<span class="location"> ${client.locations.name(
      text.finding_player,
      Number(text.location)
    )}</span>`;
    word += `<span class="default"> in </span>`;
    if (
      client.players.name(Number(text.finding_player)) ===
      connectionInfo.value.name
    ) {
      word += `<span class="currentPlayer"> ${client.players.alias(
        Number(text.finding_player)
      )}</span>`;
    } else {
      word += `<span class="otherPlayer"> ${client.players.alias(
        Number(text.finding_player)
      )}<span class="showGameName">${client.players.game(
        Number(text.finding_player)
      )}</span></span>`;
    }
    word += `<span class="default">'s World </span>`;
    if (text.found) {
      word += `<span style="color: green"> (found) </span>`;
    } else {
      word += `<span style="color: red"> (not found) </span> \n`;
    }
    hint.push({ word: word });
  });
  emit("onRecievedHintChanged", hint);
}
function sendText() {
  client.say(inputText.value);
  inputText.value = "";
}
</script>

<template>
  <div id="text_body">
    <span v-if="connected">
      <div
        class="text_loop"
        v-for="(t, index) in text"
        :key="index"
        :data="index"
        :ref="(el) => changeHeight(el)"
      >
        <span v-html="t"></span>
      </div>
    </span>
  </div>
  <!-- <div class="ap_disconnect_button">
    <button class="ap_button" v-on:click="Disconnect('Disconnected')">Disconnect</button>
  </div> -->
  <svg
    xmlns="http://www.w3.org/2000/svg"
    height="1em"
    viewBox="0 0 448 512"
    class="scroll_button"
    v-on:click="scrollToBottom()"
  >
    <!--! Font Awesome Free 6.4.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. -->
    <path
      d="M246.6 470.6c-12.5 12.5-32.8 12.5-45.3 0l-160-160c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L224 402.7 361.4 265.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3l-160 160zm160-352l-160 160c-12.5 12.5-32.8 12.5-45.3 0l-160-160c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L224 210.7 361.4 73.4c12.5-12.5 32.8-12.5 45.3 0s12.5 32.8 0 45.3z"
    />
  </svg>
  <form onsubmit="return false;" class="chat_form">
    <input type="text" name="Input Text" v-model="inputText" />
    <button v-on:click="sendText" class="ap_button">Send</button>
  </form>
</template>

<style scoped>
:deep(.currentPlayer) {
  color: var(--ap-magenta);
}
:deep(.otherPlayer) {
  color: var(--ap-yellow);
}
:deep(.location) {
  color: var(--ap-green);
}
:deep(.default) {
  color: var(--ap-white);
  white-space: pre-line;
}
:deep(.normalItem) {
  color: var(--ap-cyan);
}
:deep(.trapItem) {
  color: var(--ap-salmon);
}
:deep(.progressiveItem) {
  color: var(--ap-plum);
}
:deep(.usefulItem) {
  color: var(--ap-slateblue);
}
html {
  scroll-behavior: smooth;
}
</style>
