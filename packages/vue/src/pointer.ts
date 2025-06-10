import { Coord, DulRenderer, Object2D, RayCaster } from '@duljs/core'
import { ref, ShallowRef, watchEffect } from 'vue'

export type Object2DWithEventHandlers = Object2D &
  Partial<Object2DPointerEvents>

export interface DulPointerEvent {
  pointerEvent: PointerEvent
  renderer: DulRenderer
  object: Object2D
  rayCaster: RayCaster
}

export const getRelativePointer = (
  canvas: HTMLCanvasElement,
  renderer: DulRenderer,
  pointerClientX: number,
  pointerClientY: number
): Coord => {
  const canvasDimensions = canvas.getBoundingClientRect()
  return {
    x:
      (pointerClientX - canvasDimensions.x) / renderer.camera.zoom -
      renderer.camera.pos.x,
    y:
      (pointerClientY - canvasDimensions.y) / renderer.camera.zoom -
      renderer.camera.pos.y,
  }
}

export function useRelativePointer(
  canvasRef: ShallowRef<HTMLCanvasElement | null>,
  rendererRef: ShallowRef<DulRenderer | null>
) {
  const pos = ref<Coord | null>(null)
  watchEffect((cleanup) => {
    if (!canvasRef.value || !rendererRef.value) return
    const canvas = canvasRef.value
    const renderer = rendererRef.value

    const onPointerMove = (e: PointerEvent) => {
      const canvasDimensions = canvas.getBoundingClientRect()
      pos.value = {
        x:
          (e.clientX - canvasDimensions.x) / renderer.camera.zoom -
          renderer.camera.pos.x,
        y:
          (e.clientY - canvasDimensions.y) / renderer.camera.zoom -
          renderer.camera.pos.y,
      }
    }

    canvas.addEventListener('pointermove', onPointerMove)
    cleanup(() => {
      canvas.removeEventListener('pointermove', onPointerMove)
    })

    return { pos }
  })
}

export interface Object2DPointerEvents {
  onPointerDown: (event: DulPointerEvent) => void
  onPointerUp: (event: DulPointerEvent) => void
}

export function usePointerEvents(
  canvasRef: ShallowRef<HTMLCanvasElement | null>,
  rendererRef: ShallowRef<DulRenderer | null>
) {
  watchEffect((cleanup) => {
    if (!canvasRef.value || !rendererRef.value) return
    const canvas = canvasRef.value
    const renderer = rendererRef.value
    const rayCaster = new RayCaster()

    const pointerEventHandler =
      (eventName: keyof Object2DPointerEvents) => (e: PointerEvent) => {
        const pos = getRelativePointer(canvas, renderer, e.clientX, e.clientY)
        rayCaster.setRayCoord(pos)
        const targets = rayCaster.intersectObjects(renderer.scene.children)
        targets.forEach((v) =>
          (v as Object2DWithEventHandlers)[eventName]?.({
            pointerEvent: e,
            object: v,
            renderer,
            rayCaster,
          })
        )
      }

    const onPointerUp = pointerEventHandler('onPointerUp')
    const onPointerDown = pointerEventHandler('onPointerDown')

    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointerdown', onPointerDown)

    cleanup(() => {
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointerdown', onPointerDown)
    })
  })
}
