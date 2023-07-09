<script setup lang="ts">
import { Client, SERVER_PACKET_TYPE, ITEMS_HANDLING_FLAGS, PlayersManager } from "archipelago.js";
import { computed, defineComponent, reactive, ref, inject, onMounted} from "vue";
const props = defineProps<{
  slotName: string,
  serverInfo: string,
}>()
const emit = defineEmits <{
  (e: 'onRecievedItemsChanged', itemName: string[]): void
  (e: 'authenticted', authenticate: {err: string, authenticate: boolean}): void
}>()
const serverURI = props.serverInfo.split(':')
console.log(serverURI[0])
interface AppConfig {
  globalClient: Client
}
const client = new Client()
const connectionInfo = {
  hostname: serverURI[0],
  port: Number(serverURI[1]),
  game: '',
  name: props.slotName,
  items_handling: ITEMS_HANDLING_FLAGS.REMOTE_ALL,
  tags: ["TextOnly"]
  
}
const game = ref('')
let lastKnownScrollLocation = 0

onMounted(() => {
  const element = document.getElementById("text_body")
  if (element) {
    lastKnownScrollLocation = document.body.scrollHeight
    element.addEventListener("scroll", () => {
      lastKnownScrollLocation = element.scrollTop + element.offsetHeight
      //console.log(element.scrollHeight, element.scrollTop, element.clientHeight, element.offsetHeight)
      lastKnownScrollLocation = Math.ceil(lastKnownScrollLocation)
      //console.log(lastKnownScrollLocation)
    })
  }
})

const text = ref(["<span class='default'>Welcome</span>"])
let connected = ref(false)
const plusText = computed({
  get: () => text.value,
  set: (val) => {
    text.value.splice(text.value.length, 1, val.toString())
    if (text.value.length >= 600) {
      text.value.shift()
    }
  }
})
const inputText = ref("")

// let credentials = {
//       name: props.slotName,
//       game: '',
//       uuid: "8da62081-7213-4543-97f6-b54d40e2fe52",
//       version: { major: 0, minor: 3, build: 7 },
//       items_handling: ItemsHandlingFlags.REMOTE_ALL,
//       tags: ["TextOnly", "Mobile Text Client"]
//   };
Connect();


function Connect() {
    // Set up the AP client.
  // Connect to the Archipelago server.
  client
      .connect(connectionInfo)
      .then(() => {
          plusText.value = [`<span class="default">Connected to room with ${client.players.all.length - 1} players.</span>`]
          connected.value = true;
          // game = client.data.games.
      }).catch(() => {
        emit("authenticted", {err: "Couldn't connect for some reason", authenticate: false})
        client.disconnect()
        connected.value = false
        client.removeListener('PrintJSON', () => {})
        client.removeListener('ReceivedItems', () => {})
        client.removeListener('RoomInfo', () => {})
      }) 
  if(connected) {
    console.log("connected")
    RecieveText()
    RecievedItems()
    GetRoomInfo()
  } else {
    console.log("failed to connect")
  }
}

function Disconnect() {
  client.disconnect()
  connected.value = false
  client.removeListener('PrintJSON', () => {})
  client.removeListener('ReceivedItems', () => {})
  client.removeListener('RoomInfo', () => {})
  emit("authenticted", {err: "Disconnected", authenticate: false})
}
function RecieveText() {
  console.log("text")
  // Listen for packet events.
  client.addListener("PrintJSON", (packet) => {
    let word = "";
    packet.data.forEach(text => {
      switch(text.type) {
        case "player_id":
          // word += client.players.name(Number(text.text));
          if (client.players.name(Number(text.text)) === connectionInfo.name) {
            word += `<span class="currentPlayer"> ${client.players.alias(Number(text.text))}</span>`
          }
          else {
            word += `<span class="otherPlayer"> ${client.players.alias(Number(text.text))}</span>`
          }
          break;
        case "item_id":
          // normal items
          if (text.flags === 0) {
            word += `<span class="normalItem"> ${client.items.name(text.player, Number(text.text))}</span>`
          } 
          // trap items
          else if( text.flags === 4) {
            word += `<span class="trapItem"> ${client.items.name(text.player, Number(text.text))}</span>`
          } 
          // progressive items
          else if( text.flags === 1) {
            word += `<span class="progressiveItem"> ${client.items.name(text.player, Number(text.text))}</span>`
          } 
          // everything else.. aka useful items
          else {
            word += `<span class="usefulItem"> ${client.items.name(text.player, Number(text.text))}</span>`
          }
          break;
        case "location_id":
          word += `<span class="location"> ${client.locations.name(text.player, Number(text.text))}</span>`
          break;
        case "color":
          word += `<span style="color: ${text.color}"> ${text.text}</span>`
          break;
        case "entrance_name":
          word += `<span class="entrance"> ${text.text}</span>`
        default:
          word += `<span class="default"> ${text.text} </span>`
          break;
      }
    })
    plusText.value = [word];
  });
}

function RecievedItems() {
  client.addListener('ReceivedItems', (packet) => {
    let packetItems: string[] = []
    packet.items.forEach(i => {
      console.log(client.items.name(game.value, i.item))
      const id = i.item
      const name = client.items.name(game.value, i.item)
      packetItems.push(name)
    })
    console.log(packetItems)
    emit("onRecievedItemsChanged", packetItems)
  })
  
}
function GetRoomInfo() {
  client.addListener('RoomInfo', (packet) => {
    console.log(packet)
  })
  client.addListener('PacketReceived', (packet) => {
    //console.log(packet)
    if( packet.cmd === "Connected") {
      for (const key in packet.slot_info) {
        if (packet.slot_info[key].name === props.slotName) {
          game.value = packet.slot_info[key].game
        }
      }
    }
  })
  client.addListener('Retrieved', (packet) => {
    console.log(packet)
  })
  client.addListener('RoomUpdate', (packet) => {
    console.log(packet)
  })
}

function changeHeight(el:any, index:number, length:number) {
  let element = document.getElementById("text_body")
  if (el != null && element != null) {
    //console.log(Math.ceil(element.offsetHeight), element.scrollTop, lastKnownScrollLocation, element.scrollHeight)
    if (Math.ceil(element.scrollHeight) <= lastKnownScrollLocation) {
      element.scrollTo(0, element.scrollHeight + el.clientHeight)
      lastKnownScrollLocation += el.clientHeight
    }
  }
}

function sendText() {
  console.log(inputText.value)
  client.say(inputText.value)
}
</script>

<template>
<div id="text_body">
  <div v-if="connected" class="forloop" v-for="(t, index) in text" :data="index" :ref="el => changeHeight(el, index, text.length)"><span v-html = t></span></div>
</div>
<button class="disconnect_button" v-on:click="Disconnect()">Disconnect</button>

<form onsubmit="return false;" class="chat_form">
  <input type="text" name="Input Text" v-model="inputText"/>
  <button v-on:click="sendText">Send</button>
</form>

</template>

<style scoped>

:deep(.currentPlayer) {
  color: var(--ap-magenta)
}

:deep(.otherPlayer) {
  color: var(--ap-yellow)
}
:deep(.location) {
  color: var(--ap-green)
}
:deep(.default) {
  color: var(--ap-white)
}
:deep(.normalItem) {
  color: var(--ap-cyan)
}
:deep(.trapItem) {
  color: var(--ap-salmon)
}
:deep(.progressiveItem) {
  color: var(--ap-plum)
}
:deep(.usefulItem) {
  color: var(--ap-slateblue)
}
html {
  scroll-behavior: smooth;
}
</style>
