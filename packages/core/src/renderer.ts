import { DulCamera } from './camera'
import { Coord, Dimension, Scene } from '.'

export class DulRenderer {
  ctx: CanvasRenderingContext2D
  scene: Scene
  camera: DulCamera
  canvas: HTMLCanvasElement
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

  translateCoordDimension(
    { x, y, w, h }: Coord & Dimension,
    anchor: Coord = { x: 0, y: 0 }
  ) {
    const multiplier = this.getCoordMultiplier()
    return {
      x: (x + anchor.x + this.camera.pos.x) * multiplier,
      y: (y + anchor.y + this.camera.pos.y) * multiplier,
      w: w * multiplier,
      h: h * multiplier,
      multiplier,
    }
  }

  render(time: DOMHighResTimeStamp) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.scene.children.forEach((object) =>
      object.render(this, { time, object })
    )
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
