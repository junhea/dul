import { Coord } from '.'
import { boundNumber } from './util'

export type PointerState =
  | { status: 'down'; prevPos: Coord; startPos: Coord }
  | { status: 'up' }

const pointerStateInitializer = (): PointerState => ({ status: 'up' })

export class DulCamera {
  public pos: Coord
  public zoom: number
  private canvas: HTMLCanvasElement
  public pointer: PointerState
  deltaBound: ReturnType<typeof boundNumber>
  zoomBound: ReturnType<typeof boundNumber>

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas
    this.pos = { x: 0, y: 0 }
    this.zoom = 1
    this.pointer = pointerStateInitializer()
    this.deltaBound = boundNumber(-10, 10)
    this.zoomBound = boundNumber(0.1, 20)

    window.addEventListener('pointerup', this.pointerupHandler)
    canvas.addEventListener('pointermove', this.pointermoveHandler)
    canvas.addEventListener('pointerdown', this.pointerdownHandler)
    canvas.addEventListener('wheel', this.wheelHandler)
  }

  pointermoveHandler = (e: PointerEvent) => {
    if (this.pointer.status !== 'down') return
    const currentPos: Coord = { x: e.clientX, y: e.clientY }
    const delta: Coord = {
      x: currentPos.x - this.pointer.prevPos.x,
      y: currentPos.y - this.pointer.prevPos.y,
    }
    const viewportMultiplier: Coord = {
      x: this.canvas.clientWidth / this.canvas.width,
      y: this.canvas.clientHeight / this.canvas.height,
    }

    this.pos.x += delta.x / this.zoom / viewportMultiplier.x
    this.pos.y += delta.y / this.zoom / viewportMultiplier.y
    this.pointer.prevPos = currentPos
  }

  pointerupHandler = () => {
    this.pointer = { status: 'up' }
  }

  pointerdownHandler = (e: PointerEvent) => {
    const currentPos: Coord = { x: e.clientX, y: e.clientY }
    this.pointer = {
      prevPos: currentPos,
      startPos: currentPos,
      status: 'down',
    }
  }

  wheelHandler = (e: WheelEvent) => {
    e.preventDefault()
    this.zoom = this.zoomBound(
      this.zoom - (this.deltaBound(e.deltaY) * this.zoom) / 100
    )
  }

  destroy() {
    window.removeEventListener('pointerup', this.pointerupHandler)
    this.canvas.removeEventListener('pointermove', this.pointermoveHandler)
    this.canvas.removeEventListener('pointerdown', this.pointerdownHandler)
    this.canvas.removeEventListener('wheel', this.wheelHandler)
  }
}
