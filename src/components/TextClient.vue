<script setup lang="ts">
import { ArchipelagoClient, ClientStatus, CommandPacketType, ItemsHandlingFlags } from "archipelago.js";
import { computed, defineComponent, reactive, ref, inject} from "vue";
const props = defineProps<{
  slotName: string,
  slotGame: string,
  serverInfo: string,
}>()
console.log(props.slotGame)
console.log(props.slotName)
interface AppConfig {
  globalClient: ArchipelagoClient
}
const client = new ArchipelagoClient(props.serverInfo)
let lastKnownScrollLocation = document.body.clientHeight
let totalHeight = document.body.clientHeight
document.addEventListener("scroll", () => {
  lastKnownScrollLocation = window.scrollY + window.innerHeight
  lastKnownScrollLocation = Math.ceil(lastKnownScrollLocation)
})
const text = ref(["<span class='default'>Welcome</span>"])
const count = inject<Number>('count')
let connected = ref(false)
const plusText = computed({
  get: () => text.value,
  set: (val) => {
    text.value.splice(text.value.length, 1, val.toString())
  }
})


let credentials = {
      name: props.slotName,
      game: props.slotGame,
      uuid: "8da62081-7213-4543-97f6-b54d40e2fe52",
      version: { major: 0, minor: 3, build: 7 },
      items_handling: ItemsHandlingFlags.REMOTE_ALL,
      tags: ["Text Client", "AP"]
  };
Connect();


function Connect() {
    // Set up the AP client.
  // Connect to the Archipelago server.
  client
      .connect(credentials)
      .then(() => {
          plusText.value = [`<span class="default">Connected to room with ${client.data.players.size} players.</span>`]
          connected.value = true;
      })
      .catch(console.error)
  if(connected) {
    console.log("connected")
    RecieveText()
    RecievedItems()
  }
}

function Disconnect() {
  client.disconnect()
  connected.value = false
  client.removeListener('printJSON', () => {})
  client.removeListener('receivedItems', () => {})
  
}
function RecieveText() {
  // Listen for packet events.
  client.addListener("printJSON", (packet) => {
    let word = "";
    packet.data.forEach(text => {
      switch(text.type) {
        case "player_id":
          // word += client.players.name(Number(text.text));
          if (client.players.name(Number(text.text)) === credentials.name) {
            word += `<span class="currentPlayer"> ${client.players.alias(Number(text.text))}</span>`
          }
          else {
            word += `<span class="otherPlayer"> ${client.players.alias(Number(text.text))}</span>`
          }
          break;
        case "item_id":
          // normal items
          if (text.flags === 0) {
            word += `<span class="normalItem"> ${client.items.name(Number(text.text))}</span>`
          } 
          // trap items
          else if( text.flags === 4) {
            word += `<span class="trapItem"> ${client.items.name(Number(text.text))}</span>`
          } 
          // progressive items
          else if( text.flags === 1) {
            word += `<span class="progressiveItem"> ${client.items.name(Number(text.text))}</span>`
          } 
          // everything else.. aka useful items
          else {
            word += `<span class="usefulItem"> ${client.items.name(Number(text.text))}</span>`
          }
          break;
        case "location_id":
          word += `<span class="location"> ${client.locations.name(Number(text.text))}</span>`
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
    totalHeight = document.body.clientHeight
  });
}

function RecievedItems() {
  client.addListener('receivedItems', (packet) => {
    packet.items.forEach(i => {
      console.log(client.items.name(i.item))
    })
  })
  
}

function changeHeight(el:any) {
  if (totalHeight === lastKnownScrollLocation) {
    window.scrollTo(0, Math.ceil(window.scrollY) + el.clientHeight)
  }
}
</script>

<template>
<div class = "forloop" v-for="t in text" :ref="el => changeHeight(el)"> <span v-html = t></span></div>
<div>{{ count }}</div>
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
