import { Coord, DulRenderer, Object2D, RayCaster } from '@duljs/core'
import { ref, ShallowRef, watchEffect } from 'vue'

export type Object2DWithEventHandlers = Object2D &
  Partial<Object2DPointerEvents>

export interface DulPointerEventProps {
  pointerEvent?: PointerEvent
  renderer: DulRenderer
  object: Object2D
  rayCaster: RayCaster
}
export class DulPointerEvent implements DulPointerEventProps {
  pointerEvent?: PointerEvent
  renderer: DulRenderer
  object: Object2D
  rayCaster: RayCaster
  eventStopped: boolean = false

  constructor({
    object,
    renderer,
    rayCaster,
    pointerEvent,
  }: DulPointerEventProps) {
    this.object = object
    this.renderer = renderer
    this.rayCaster = rayCaster
    this.pointerEvent = pointerEvent
  }

  stopEvent() {
    this.eventStopped = true
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
  })
  return { pos }
}

export interface Object2DPointerEvents {
  onPointerDown: (event: DulPointerEvent) => void
  onPointerUp: (event: DulPointerEvent) => void
  onPointerEnter: (event: DulPointerEvent) => void
  onPointerLeave: (event: DulPointerEvent) => void
}

const eventObjectBuilder =
  (renderer: DulRenderer, rayCaster: RayCaster) =>
  (object: Object2D, pointerEvent?: PointerEvent) =>
    new DulPointerEvent({
      renderer,
      rayCaster,
      pointerEvent,
      object,
    })

export function usePointerEvents(
  canvasRef: ShallowRef<HTMLCanvasElement | null>,
  rendererRef: ShallowRef<DulRenderer | null>
) {
  watchEffect((cleanup) => {
    if (!canvasRef.value || !rendererRef.value) return
    const canvas = canvasRef.value
    const renderer = rendererRef.value
    const rayCaster = new RayCaster()

    let pointerPos: Coord | null = null
    let prevHoveringObjects: Set<Object2D> = new Set()

    const createEventObject = eventObjectBuilder(renderer, rayCaster)

    const pointerEventHandler =
      (eventName: keyof Object2DPointerEvents) => (e: PointerEvent) => {
        const pos = renderer.screenToRendererCoords({
          x: e.clientX,
          y: e.clientY,
        })
        rayCaster.setRayCoord(pos)
        const targets = rayCaster.intersectObjects(
          renderer.scene.rendererdObjects.toReversed()
        )
        targets.some((v) => {
          const event = createEventObject(v, e)
          ;(v as Object2DWithEventHandlers)[eventName]?.(event)
          // check event stop flag
          return event?.eventStopped
        })
      }

    const onPointerUp = pointerEventHandler('onPointerUp')
    const onPointerDown = pointerEventHandler('onPointerDown')
    const onPointerMove = (e: PointerEvent) => {
      pointerPos = renderer.screenToRendererCoords({
        x: e.clientX,
        y: e.clientY,
      })
    }
    const onBeforeRender = () => {
      if (!pointerPos) return
      rayCaster.setRayCoord(pointerPos)

      const targets = rayCaster.intersectObjects(
        renderer.scene.rendererdObjects.toReversed()
      )
      const currentHoveringObjects = new Set(targets)

      const pointerLeaveTargets = prevHoveringObjects.difference(
        currentHoveringObjects
      )
      pointerLeaveTargets.forEach((v) =>
        (v as Object2DWithEventHandlers).onPointerLeave?.(createEventObject(v))
      )

      const pointerEnterTargets =
        currentHoveringObjects.difference(prevHoveringObjects)
      pointerEnterTargets.forEach((v) =>
        (v as Object2DWithEventHandlers).onPointerEnter?.(createEventObject(v))
      )

      prevHoveringObjects = currentHoveringObjects
    }

    renderer.addCallback('onBeforeRender', onBeforeRender)
    canvas.addEventListener('pointerup', onPointerUp)
    canvas.addEventListener('pointerdown', onPointerDown)
    canvas.addEventListener('pointermove', onPointerMove)

    cleanup(() => {
      renderer.removeCallback('onBeforeRender', onBeforeRender)
      canvas.removeEventListener('pointerup', onPointerUp)
      canvas.removeEventListener('pointerdown', onPointerDown)
      canvas.removeEventListener('pointermove', onPointerMove)
    })
  })
}
