import { DulRenderer } from '../renderer'
import type { Coord, Dimension } from '..'

interface Metadata {
  __type: string
  children: Object2D[]
  parent: Object2D | null
  calculatedBounds: (Coord & Dimension) | null
}

interface Renderable {
  render: (renderer: DulRenderer, anchor: Coord) => void
}

export type Object2DProps = Coord & Dimension

export const defaultObject2DProps = {
  x: 0,
  y: 0,
  w: 0,
  h: 0,
} satisfies Object2DProps

export class Object2D implements Metadata, Object2DProps, Renderable {
  x: number
  y: number
  w: number
  h: number
  __type = 'BASE'
  children: Object2D[] = []
  parent: Object2D | null = null
  calculatedBounds: (Coord & Dimension) | null = null

  constructor(props: Partial<Object2DProps>) {
    const { x, y, w, h } = { ...defaultObject2DProps, ...props }
    this.x = x
    this.y = y
    this.w = w
    this.h = h
  }

  addChild(obj: Object2D) {
    this.children.push(obj)
    obj.parent = this
  }

  render(renderer: DulRenderer, anchor?: Coord) {
    this.renderSelf(renderer, anchor)
    this.renderChildren(renderer, anchor)
    this.calculatedBounds = {
      x: (anchor?.x ?? 0) + this.x,
      y: (anchor?.y ?? 0) + this.y,
      w: this.w,
      h: this.h,
    }
  }

  renderChildren(renderer: DulRenderer, anchor?: Coord) {
    const newAnchor = this.getAnchor(anchor)
    this.children.forEach((v) => v.render(renderer, newAnchor))
  }

  // @ts-ignore: unused variable
  renderSelf(renderer: DulRenderer, anchor?: Coord) {
    // empty
  }

  getAnchor(anchor?: Coord) {
    if (anchor) {
      return { x: this.x + anchor.x, y: this.y + anchor.y }
    }
    return { x: this.x, y: this.y }
  }

  destroy() {
    // remove self from parent
    if (!this.parent) return
    const index = this.parent.children.indexOf(this)
    if (index > -1) {
      this.parent.children.splice(index, 1)
    }
  }
}
