<script setup lang="ts">
import getItemType from "../helpers/GetItemTypeHelper";
import {
  Client,
  ITEMS_HANDLING_FLAGS,
  type JSONSerializableData,
} from "archipelago.js";
import { computed, ref, onMounted } from "vue";
const props = defineProps<{
  slotName: string;
  serverInfo: string;
}>();
console.log(getItemType(1));
// const emit = defineEmits<{
//   (
//     ...args:
//       | [
//           e: "onRecievedItemsChanged",
//           itemName: [{ item: string; amount: number; type: number }]
//         ]
//       | [
//           e: "authenticated",
//           authenticate: { err: string; authenticate: boolean }
//         ]
//       | [e: "onRecievedHintChanged", hints: [{ word: string }]]
//   ): void;
// }>();
// const emit = defineEmits<{
//   (e: "change", id: number): void;
//   (e: "update", value: string): void;
// }>();
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
}>();
const serverURI = props.serverInfo.split(":");
console.log(serverURI[0]);

const client = new Client();
const connectionInfo = {
  hostname: serverURI[0],
  port: Number(serverURI[1]),
  game: "",
  name: props.slotName,
  items_handling: ITEMS_HANDLING_FLAGS.REMOTE_ALL,
  tags: ["TextOnly"],
};
const game = ref("");
let lastKnownScrollLocation = 0;

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

Connect();

function Connect() {
  // Set up the AP client.
  // Connect to the Archipelago server.
  client
    .connect(connectionInfo)
    .then(() => {
      plusText.value = [
        `<span class="default">Connected to room with ${
          client.players.all.length - 1
        } players.</span>`,
      ];
      connected.value = true;
      console.log("connected");

      // game = client.data.games.
    })
    .catch(() => {
      emit("authenticated", {
        err: "Couldn't connect for some reason",
        authenticate: false,
      });
      client.disconnect();
      connected.value = false;
      client.removeListener("PrintJSON", () => {});
      client.removeListener("ReceivedItems", () => {});
      client.removeListener("RoomInfo", () => {});
    });
  RecieveText();
  RecievedItems();
  GetRoomInfo();
}

function Disconnect() {
  client.disconnect();
  connected.value = false;
  client.removeListener("PrintJSON", () => {});
  client.removeListener("ReceivedItems", () => {});
  client.removeListener("RoomInfo", () => {});
  emit("authenticated", { err: "Disconnected", authenticate: false });
}
function RecieveText() {
  console.log("text");
  // Listen for packet events.
  client.addListener("PrintJSON", (packet) => {
    let word = "";
    if (text.value.length >= 500) {
      text.value.shift();
    }
    console.log(text.value.length + " length");
    packet.data.forEach((text) => {
      switch (text.type) {
        case "player_id":
          // word += client.players.name(Number(text.text));
          if (client.players.name(Number(text.text)) === connectionInfo.name) {
            word += `<span class="currentPlayer"> ${client.players.alias(
              Number(text.text)
            )}</span>`;
          } else {
            word += `<span class="otherPlayer"> ${client.players.alias(
              Number(text.text)
            )}</span>`;
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
    console.log(word);
    plusText.value = [word];
  });
}

function RecievedItems() {
  client.addListener("ReceivedItems", (packet) => {
    console.log(packet);
    let packetItems: [{ item: string; amount: number; type: number }] = [
      { item: "", amount: 0, type: 0 },
    ];
    packet.items.forEach((i) => {
      // console.log(client.items.name(game.value, i.item))
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
    console.log(packetItems);
    emit("onRecievedItemsChanged", packetItems);
  });
}
function GetRoomInfo() {
  client.addListener("RoomInfo", (packet) => {
    console.log(packet);
  });
  client.addListener("PacketReceived", (packet) => {
    console.log(packet);
    if (packet.cmd === "Connected") {
      for (const key in packet.slot_info) {
        if (packet.slot_info[key].name === props.slotName) {
          game.value = packet.slot_info[key].game;
        }
      }
    } else if (packet.cmd === "SetReply") {
      parseText(packet.value);
    } else if (packet.cmd === "DataPackage") {
      //console.log(packet.data.games);
      // for (const game in packet.data.games) {
      //   //console.log(packet.data.games[game]);
      //   for (const itemName in packet.data.games[game]) {
      //     if (itemName === 'item_name_to_id') {
      //       console.log(game);
      //       console.log(packet.data.games[game][itemName]);
      //     }
      //   }
      // }
    }
  });
  client.addListener("Retrieved", (packet) => {
    console.log(packet);
    let player, hintArray: any;
    for (player in packet.keys) {
      hintArray = packet.keys[player];
    }
    if (hintArray) {
      updateHints(hintArray);
      parseText(hintArray);
    }
  });
  client.addListener("RoomUpdate", (packet) => {
    console.log(packet);
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
function updateHints(hint: JSONSerializableData) {
  console.log(hint);
  //emit("onRecievedHintChanged", hint)
}
function parseText(data: any) {
  let word = "";
  let hint: [{ word: string }] = [{ word: "" }];
  data.forEach((text: any) => {
    word = "";
    word += `<span class="default"> [${text.class}]: </span>`;
    if (
      client.players.name(Number(text.receiving_player)) === connectionInfo.name
    ) {
      word += `<span class="currentPlayer"> ${client.players.alias(
        Number(text.receiving_player)
      )}</span>`;
    } else {
      word += `<span class="otherPlayer"> ${client.players.alias(
        Number(text.receiving_player)
      )}</span>`;
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
      client.players.name(Number(text.finding_player)) === connectionInfo.name
    ) {
      word += `<span class="currentPlayer"> ${client.players.alias(
        Number(text.finding_player)
      )}</span>`;
    } else {
      word += `<span class="otherPlayer"> ${client.players.alias(
        Number(text.finding_player)
      )}</span>`;
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
  <button class="disconnect_button" v-on:click="Disconnect()">
    Disconnect
  </button>

  <form onsubmit="return false;" class="chat_form">
    <input type="text" name="Input Text" v-model="inputText" />
    <button v-on:click="sendText">Send</button>
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
