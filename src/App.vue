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
  <header>
    <button v-on:click="viewPage = 'itemRecieved'">Items Recieved</button>
    <button v-on:click="viewPage = 'textClient'">Show Text Client</button>
    <button v-on:click="viewPage = 'Hints'">Show Hints</button>
  </header>
  <div>
    <div class="wrapper" v-if="authenticate">
      <div v-show="viewPage === 'textClient'">
        <TextClient :slotName=inputName :serverInfo=inputServerInfo 
        @authenticted="(payload) => { authenticate = payload.authenticate; errorMessage = payload.err}"
          />
      </div>
    </div>
    <div v-show="!authenticate">
      <div>
        <input type="text" name="Server Info" placeholder="Server Info" v-model="inputServerInfo">
      </div>
      <div>
        <input type="text" name="Slot" placeholder="Slot Name" v-model="inputName">
      </div>
      <div>
        <button v-on:click="OnConnect">Connect</button>
      </div>
      <div>
        <p>{{ errorMessage }}</p>
      </div>
    </div>
    <div v-show="viewPage === 'itemRecieved'">
      <ReceivedItems :receivedItems="receivedItems"/>
    </div>
  </div>

  <main>
  </main>
</template>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: block;
    /* place-items: flex-start;
    flex-wrap: wrap; */
  }
}
</style>
