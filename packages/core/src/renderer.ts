import { DulCamera } from './camera'
import { Coord, Dimension, Scene } from '.'

export type RenderCallback = (
  time: DOMHighResTimeStamp,
  timeDelta: DOMHighResTimeStamp,
  renderer: DulRenderer
) => void

export interface RenderCallbackMap {
  onBeforeRender: RenderCallback
  onAfterRender: RenderCallback
}

type RenderCallbacks = {
  [x in keyof RenderCallbackMap]: Set<RenderCallbackMap[x]>
}

export interface DulRendererOptions {
  callbacks?: RenderCallbacks
}

const defaultCallbacks = () =>
  ({
    onBeforeRender: new Set(),
    onAfterRender: new Set(),
  } satisfies RenderCallbacks)

export class DulRenderer {
  ctx: CanvasRenderingContext2D
  scene: Scene
  camera: DulCamera
  canvas: HTMLCanvasElement
  callbacks: RenderCallbacks
  prevTime: DOMHighResTimeStamp = 0
  private resizeObserver: ResizeObserver

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    const ctx = canvas.getContext('2d')
    if (!ctx) throw 'current browser does not support canvas2d'
    this.ctx = ctx
    this.scene = new Scene()
    this.camera = new DulCamera(canvas)
    this.resizeObserver = new ResizeObserver(this.resizeHandler)
    this.resizeObserver.observe(canvas)
    this.callbacks = defaultCallbacks()
    this.requestRender()
  }

  resizeHandler = (entries: ResizeObserverEntry[]) => {
    entries.forEach((e) => {
      this.canvas.width = e.contentRect.width
      this.canvas.height = e.contentRect.height
    })
  }

  getCoordMultiplier() {
    return this.camera.zoom
  }

  screenToRendererCoords({ x, y }: Coord): Coord {
    const canvasDimensions = this.canvas.getBoundingClientRect()
    return {
      x:
        (x - canvasDimensions.x - this.canvas.width / 2) / this.camera.zoom -
        this.camera.pos.x,
      y:
        (y - canvasDimensions.y - this.canvas.height / 2) / this.camera.zoom -
        this.camera.pos.y,
    }
  }

  rendererToCanvasCoords({ x, y }: Coord): Coord {
    return {
      x: (x + this.camera.pos.x) * this.camera.zoom + this.canvas.width / 2,
      y: (y + this.camera.pos.y) * this.camera.zoom + this.canvas.height / 2,
    }
  }

  rendererToScreenCoords(coords: Coord): Coord {
    const canvasDimensions = this.canvas.getBoundingClientRect()
    const { x, y } = this.rendererToCanvasCoords(coords)
    return {
      x: x + canvasDimensions.x,
      y: y + canvasDimensions.y,
    }
  }

  addCallback<K extends keyof RenderCallbacks>(
    type: K,
    callback: RenderCallbackMap[K]
  ) {
    this.callbacks[type].add(callback)
  }

  removeCallback<K extends keyof RenderCallbacks>(
    type: K,
    callback: RenderCallbackMap[K]
  ) {
    this.callbacks[type].delete(callback)
  }

  translateCoordDimension(
    { x, y, w, h }: Coord & Dimension,
    anchor: Coord = { x: 0, y: 0 }
  ) {
    const multiplier = this.getCoordMultiplier()
    return {
      ...this.rendererToCanvasCoords({ x: x + anchor.x, y: y + anchor.y }),
      w: w * multiplier,
      h: h * multiplier,
      multiplier,
    }
  }

  render(time: DOMHighResTimeStamp) {
    const timeDelta = time - this.prevTime
    this.callbacks?.onBeforeRender?.forEach((v) => v?.(time, timeDelta, this))
    this.scene.render(this, { time, object: this.scene, scene: this.scene })
    this.callbacks?.onAfterRender?.forEach((v) => v?.(time, timeDelta, this))
    this.prevTime = time
  }

  requestRender() {
    requestAnimationFrame((time) => {
      this.render(time)
      this.requestRender()
    })
  }

  destroy() {
    this.camera.destroy()
    this.resizeObserver.disconnect()
  }
}
