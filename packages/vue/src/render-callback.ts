import { RenderCallbackMap } from '@duljs/core'
import { watchEffect } from 'vue'
import { useDul } from './context'

export const useRenderCallback = <K extends keyof RenderCallbackMap>(
  type: K,
  callback: RenderCallbackMap[K]
) => {
  const { renderer } = useDul()
  watchEffect((cleanup) => {
    const target = callback
    renderer.value?.addCallback(type, target)
    cleanup(() => renderer.value?.removeCallback(type, target))
  })
}
