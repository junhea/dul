import { DulRenderer } from '../renderer'
import type { Coord, Dimension, FrameContext } from '..'

interface Metadata {
  __type: string
  children: Object2D[]
  parent: Object2D | null
  calculatedBounds: (Coord & Dimension) | null
}

interface Renderable {
  render: (renderer: DulRenderer, context: FrameContext) => void
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

  render(renderer: DulRenderer, context: FrameContext) {
    this.renderSelf(renderer, context)
    this.renderChildren(renderer, context)
    this.calculatedBounds = {
      x: (context.anchor?.x ?? 0) + this.x,
      y: (context.anchor?.y ?? 0) + this.y,
      w: this.w,
      h: this.h,
    }
    context.scene.onAfterObjectRender(this)
  }

  renderChildren(renderer: DulRenderer, context: FrameContext) {
    const anchor = this.getAnchor(context.anchor)
    this.children.forEach((v) => v.render(renderer, { ...context, anchor }))
  }

  // @ts-ignore: unused variable
  renderSelf(renderer: DulRenderer, context: FrameContext) {
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
