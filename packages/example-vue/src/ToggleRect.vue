<template>
  <DulRect
    :x="x"
    :y="y"
    :w="w"
    :h="w"
    :fill-style="highlight ? 'red' : 'transparent'"
    @pointer-down="onPointerDown"
  />
</template>
<script setup lang="ts">
import { ref } from 'vue'

const x = Math.random() * 5000
const y = Math.random() * 5000
const w = Math.random() * 50 + 10
const highlight = ref(false)

const onPointerDown = () => (highlight.value = !highlight.value)
</script>
