<script setup lang="ts">
import TextClient from './components/TextClient.vue'
import {provide, ref, computed} from 'vue'
import { walkIdentifiers } from '@vue/compiler-core'
const count = ref(0)
let inputName = ref("SneakiRoR")
let inputGame = ref("Risk of Rain 2")
let inputServerInfo = ref("archipelago.gg:38281")
let authenticate = ref(false)
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
  authenticate.value = true;
}
</script>

<template>
  <header>

    <div class="wrapper" v-if="authenticate">
      <TextClient :slotName=inputName :slotGame=inputGame :serverInfo=inputServerInfo />
    </div>
    <div v-else>
      <div>
        <input type="text" name="Server Info" placeholder="Server Info" v-model="inputServerInfo">
      </div>
      <div>
        <input type="text" name="Game" placeholder="Game" v-model="inputGame">
      </div>
      <div>
        <input type="text" name="Slot" placeholder="Slot Name" v-model="inputName">
      </div>
      <div>
        <button v-on:click="OnConnect">Connect</button>
      </div>
    </div>
  </header>

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
