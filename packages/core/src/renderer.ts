import { DulCamera } from './camera'
import { Coord, Dimension, Scene } from '.'

type RenderCallback = (time: DOMHighResTimeStamp, renderer: DulRenderer) => void

export interface RenderCallbacks {
  onBeforeRender?: RenderCallback
  onAfterRender?: RenderCallback
}

export interface DulRendererOptions {
  callbacks?: RenderCallbacks
}

const defaultDulRendererOptions: Required<DulRendererOptions> = {
  callbacks: {},
}

export class DulRenderer {
  ctx: CanvasRenderingContext2D
  scene: Scene
  camera: DulCamera
  canvas: HTMLCanvasElement
  callbacks: RenderCallbacks
  private resizeObserver: ResizeObserver

  constructor(canvas: HTMLCanvasElement, options?: DulRendererOptions) {
    const { callbacks } = { ...defaultDulRendererOptions, ...options }
    this.canvas = canvas
    this.callbacks = callbacks
    const ctx = canvas.getContext('2d')
    if (!ctx) throw 'current browser does not support canvas2d'
    this.ctx = ctx
    this.scene = new Scene()
    this.camera = new DulCamera(canvas)
    this.resizeObserver = new ResizeObserver(this.resizeHandler)
    this.resizeObserver.observe(canvas)
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

  translateCoordDimension(
    { x, y, w, h }: Coord & Dimension,
    anchor: Coord = { x: 0, y: 0 }
  ) {
    const multiplier = this.getCoordMultiplier()
    return {
      x:
        (x + anchor.x + this.camera.pos.x) * multiplier + this.canvas.width / 2,
      y:
        (y + anchor.y + this.camera.pos.y) * multiplier +
        this.canvas.height / 2,
      w: w * multiplier,
      h: h * multiplier,
      multiplier,
    }
  }

  render(time: DOMHighResTimeStamp) {
    this.callbacks?.onBeforeRender?.(time, this)
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.scene.children.forEach((object) =>
      object.render(this, { time, object })
    )
    this.callbacks?.onAfterRender?.(time, this)
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
