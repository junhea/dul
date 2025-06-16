<template>
  <canvas ref="canvasRef" :width="width" :height="height"></canvas>
</template>

<script setup lang="ts">
import { DulRenderer } from '@duljs/core'
import {
  createRenderer,
  defineComponent,
  getCurrentInstance,
  h,
  provide,
  renderSlot,
  shallowRef,
  watchEffect,
} from 'vue'
import { nodeops } from './nodeops'
import { usePointerEvents } from './pointer'

defineProps<{ width?: string; height?: string }>()

const slots = defineSlots<{ default: () => any }>()
const canvasRef = shallowRef<HTMLCanvasElement | null>(null)
const rendererRef = shallowRef<DulRenderer | null>(null)

defineExpose({ canvasRef, rendererRef })

usePointerEvents(canvasRef, rendererRef)

const currentInstance = getCurrentInstance()

const internalRoot = defineComponent({
  setup() {
    const provides: { [k: string | symbol]: any } = {}
    // clone app context provides
    Object.assign(provides, currentInstance?.appContext.provides)

    // recursively get all provides
    function mergeProvides(instance: any) {
      if (!instance) {
        return
      }
      if (instance.parent) {
        mergeProvides(instance.parent)
      }
      if (instance.provides) {
        Object.assign(provides, instance.provides)
      }
    }
    mergeProvides(currentInstance?.parent)
    Object.entries(provides).forEach(([k, v]) => provide(k, v))
    return () => renderSlot(slots, 'default')
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
