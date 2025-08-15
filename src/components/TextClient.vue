<script setup lang="ts">
import { Client, itemsHandlingFlags, Hint, Player, Item } from "archipelago.js";
import type { MessageNode } from "archipelago.js";
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
    e: "onReceivedItemsChanged",
    itemName: { item: string; amount: number; type: number }[]
  ): void;
  (
    e: "authenticated",
    authenticate: { err: string; authenticate: boolean }
  ): void;
  (e: "onReceivedHintChanged", hints: {word: string, found: boolean}[]): void;
  (e: "connected-to-server", connectedToServer: boolean): void;
  (e: "hint_cost", hintCosts: {hintCost: number, percentageCost: number}): void;
  (e: "current_hint_points", hintPoints: number): void;
}>();

const client = new Client();
const connectionInfo = ref({
  uri: "",
  name: "",
  items: itemsHandlingFlags.all,
  tags: [""],
  password: "",
  slotData: false,
});
let lastKnownScrollLocation = 0;

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
      connectionInfo.value = {
        uri: props.serverInfo,
        name: props.slotName,
        items: itemsHandlingFlags.all,
        tags: ["WebClient", "TextOnly"],
        password: props.password,
        slotData: false,
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
// wow, this is cursed code
const plusText = computed({
  get: () => text.value,
  set: (val) => {
    text.value.splice(text.value.length, 1, val.toString());
  },
});
const inputText = ref("");

function Connect() {
  // Set up the AP client.
  // Connect to the Archipelago server.
  console.log(connectionInfo.value);
  client
    .login(connectionInfo.value.uri, connectionInfo.value.name, "", connectionInfo.value)
    .catch((error) => {
      if (typeof error[0] === "string") {
        Disconnect(error[0]);
      } else {
        Disconnect("Couldn't connect for some reason");
      }
    });
}

function Disconnect(error: string): void {
  client.socket.disconnect();
  connected.value = false;
  emit("authenticated", { err: error, authenticate: false });
  text.value = [];
}

client.socket.on("connected", (packet) => {
    plusText.value = [
      `<span class="default">Connected to room with ${
        packet.players.length - 1
      } players.</span>`,
    ];
    connected.value = true;
    emit("connected-to-server", true);
    console.log("connected to " + props.serverInfo);
});

function processNodes(nodes: MessageNode[]) {
  let text = nodes.map((node) => {
    switch(node.type) {
      case "item": return `<span class="${
          node.item.progression ? "progressiveItem" :
          node.item.useful ? "usefulItem" :
          node.item.trap ? "trapItem" : "normalItem"}">${node.item.name}</span>`;
      case "location": return `<span class="location">${node.text}</span>`;
      case "player": return `<span class="player ${node.player.name == client.players.self.name ? "currentPlayer" : "otherPlayer}"}>${node.text}<span class="showGameName">${node.player.game}</span></span>`;
      case "color": return `<span class="color_${node.color}">${node.text}</span>`;
      case "entrance": return `<span class="entrance">${node.text}</span>`;
      case "text": default: return `<span class="default">${node.text}</span>`;
    }
  }).join("");
  plusText.value = [text];
}
client.messages.on("message", (text, nodes) => processNodes(nodes));

client.items.on("itemsReceived", (items, startIndex) => {
  let itemMap: Record<string, number> = {};
  let packetItems: { item: string; amount: number; type: number }[] = [];
  for (let i = client.items.received.length - 1; i >= 0; i--) {
    let item = client.items.received[i];
    if (item.name in itemMap) {
      packetItems[itemMap[item.name]].amount += 1
    } else {
      itemMap[item.name] = packetItems.length;
      packetItems.push({item: item.name, amount: 1, type: item.flags});
    }
  }
  emit("onReceivedItemsChanged", packetItems);
});
client.room.on("hintCostUpdated", (oldCost, newCost, oldPct, newPct) => {
  emit("hint_cost", { hintCost: newCost, percentageCost: newPct });
});
client.room.on("hintPointsUpdated", (oldVal, newVal) => {
  emit("current_hint_points", newVal);
  emit("hint_cost", { hintCost: client.room.hintCost, percentageCost: client.room.hintCostPercentage })
});
client.items.on("hintsInitialized", (hints) => {
  emit("onReceivedHintChanged", client.items.hints.map(renderHint));
})
client.items.on("hintReceived", (hint) => {
  emit("onReceivedHintChanged", client.items.hints.map(renderHint));
})
client.items.on("hintFound", (hint) => {
  emit("onReceivedHintChanged", client.items.hints.map(renderHint));
});

function renderHint(hint: Hint): {word: string, found: boolean} {
  function player(player: Player) {
    return `<span class="player ${player.name == client.players.self.name ? "currentPlayer" : "otherPlayer}"}>${player.alias}<span class="showGameName">${player.game}</span></span>`;
  }
  function item(item: Item) {
    return `<span class="${
          item.progression ? "progressiveItem" :
          item.useful ? "usefulItem" :
          item.trap ? "trapItem" : "normalItem"}">${item.name}</span>`;
  }

  let word = `<span class="default">[Hint]: </span>`;
  word += player(hint.item.receiver);
  word += `<span class="default">'s </span>`;
  word += item(hint.item);
  word += `<span class="default"> is at </span>`;
  word += `<span class="location">${hint.item.locationName}</span>`;
  word += `<span class="default"> in </span>`;
  word += player(hint.item.sender);
  word += `<span class="default">'s World</span>`;
  
  return {word, found: hint.found};
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
function scrollToBottom() {
  let element = document.getElementById("text_body");
  if (element) {
    element.scrollTo(0, element.scrollHeight);
  }
}
function sendText() {
  client.messages.say(inputText.value);
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
:deep(.entrance) {
  color: var(--ap-blue);
}
html {
  scroll-behavior: smooth;
}
</style>
