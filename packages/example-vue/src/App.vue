<template>
  <div class="content">
    <h1>Click the Square to toggle state</h1>
    <Dul width="100%" height="100%" style="border: 1px solid black">
      <ToggleRect v-for="_ in 1000" />
    </Dul>
  </div>
</template>

<script setup lang="ts">
import { Dul } from '@duljs/vue'
import ToggleRect from './ToggleRect.vue'
</script>

<style scoped>
.content {
  display: flex;
  min-height: 100vh;
  text-align: center;
  flex-direction: column;
  justify-content: center;
}
</style>
