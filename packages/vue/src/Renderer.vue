<template>
  <canvas ref="canvasRef" :width="width" :height="height"></canvas>
</template>

<script setup lang="ts">
import { DulRenderer } from '@duljs/core'
import {
  createRenderer,
  defineComponent,
  Fragment,
  h,
  shallowRef,
  watchEffect,
} from 'vue'
import { nodeops } from './nodeops'
import { usePointerEvents } from './pointer'

defineProps<{ width?: string; height?: string }>()

const slots = defineSlots<{ default: () => any }>()
const canvasRef = shallowRef<HTMLCanvasElement | null>(null)
const rendererRef = shallowRef<DulRenderer | null>(null)

usePointerEvents(canvasRef, rendererRef)

const internalRoot = defineComponent({
  setup() {
    return () => h(Fragment, null, slots.default())
  },
})

watchEffect((cleanup) => {
  if (!canvasRef.value) return
  const renderer = new DulRenderer(canvasRef.value)
  rendererRef.value = renderer
  const { render } = createRenderer(nodeops())
  render(h(internalRoot), renderer.scene)
  cleanup(() => renderer.destroy())
})
</script>
