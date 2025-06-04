import { DulRenderer } from '../renderer'
import type { Coord } from '..'
import { defaultObject2DProps, Object2D, Object2DProps } from './base'

// Scene
export class Scene extends Object2D {
  __type = 'SCENE'
  constructor() {
    super({})
  }
}

// Fragment : Object2d but with a different name
export class Fragment extends Object2D {
  __type = 'FRAGMENT'
}

// Rect : rectangle
export interface RectProps extends Object2DProps {
  fillStyle: string
  strokeStyle: string | CanvasGradient | CanvasPattern
  lineWidth: number
}

export const defaultRectProps = {
  ...defaultObject2DProps,
  fillStyle: 'transparent',
  strokeStyle: 'black',
  lineWidth: 1,
} satisfies RectProps

export class Rect extends Object2D implements RectProps {
  fillStyle: string
  strokeStyle: string | CanvasGradient | CanvasPattern
  lineWidth: number
  __type = 'RECT'

  constructor(props: Partial<RectProps>) {
    const { x, y, w, h, fillStyle, strokeStyle, lineWidth } = {
      ...defaultRectProps,
      ...props,
    }
    super({ x, y, w, h })
    this.fillStyle = fillStyle
    this.strokeStyle = strokeStyle
    this.lineWidth = lineWidth
  }

  renderSelf(renderer: DulRenderer, anchor?: Coord): void {
    const { x, y, w, h, multiplier } = renderer.translateCoordDimension(
      this,
      anchor
    )
    renderer.ctx.fillStyle = this.fillStyle
    renderer.ctx.fillRect(x, y, w, h)
    if (this.strokeStyle !== '') {
      renderer.ctx.lineWidth = this.lineWidth * multiplier
      renderer.ctx.strokeStyle = this.strokeStyle
      renderer.ctx.strokeRect(x, y, w, h)
    }
  }
}

// Text
export interface TextProps extends Object2DProps {
  fillStyle: string
  text: string
  fontSize: number
  textAlign: CanvasTextAlign
  textBaseline: CanvasTextBaseline
}

export const defaultTextProps = {
  ...defaultObject2DProps,
  fillStyle: 'black',
  text: '',
  fontSize: 10,
  textAlign: 'center',
  textBaseline: 'middle',
} satisfies TextProps

export class Text extends Object2D implements TextProps {
  fillStyle: string
  text: string
  fontSize: number
  textAlign: CanvasTextAlign
  textBaseline: CanvasTextBaseline
  __type = 'TEXT'

  constructor(props: Partial<TextProps>) {
    const { x, y, w, h, fillStyle, fontSize, text, textAlign, textBaseline } = {
      ...defaultTextProps,
      ...props,
    }
    super({ x, y, w, h })
    this.fillStyle = fillStyle
    this.fontSize = fontSize
    this.text = text
    this.textAlign = textAlign
    this.textBaseline = textBaseline
  }

  renderSelf(renderer: DulRenderer, anchor?: Coord): void {
    const { x, y, w, h, multiplier } = renderer.translateCoordDimension(
      this,
      anchor
    )
    renderer.ctx.fillStyle = this.fillStyle
    renderer.ctx.textAlign = this.textAlign
    renderer.ctx.textBaseline = this.textBaseline
    renderer.ctx.font = `${this.fontSize * multiplier}px sans-serif`
    renderer.ctx.fillText(this.text, x + w / 2, y + h / 2 + w)
  }
}

// Line
export interface LineProps extends Object2DProps {
  path: Coord[]
  strokeStyle: string
  lineWidth: number
  lineCap: CanvasLineCap
  lineJoin: CanvasLineJoin
}

export const defaultLineProps = {
  ...defaultObject2DProps,
  path: [],
  strokeStyle: 'black',
  lineWidth: 1,
  lineCap: 'round',
  lineJoin: 'round',
} satisfies LineProps

export class Line extends Object2D implements LineProps {
  path: Coord[]
  strokeStyle: string
  lineCap: CanvasLineCap
  lineJoin: CanvasLineJoin
  lineWidth: number
  __type = 'LINE'

  constructor(props: Partial<LineProps>) {
    const { x, y, w, h, lineWidth, path, strokeStyle, lineCap, lineJoin } = {
      ...defaultLineProps,
      ...props,
    }
    super({ x, y, w, h })
    this.lineWidth = lineWidth
    this.path = path
    this.strokeStyle = strokeStyle
    this.lineCap = lineCap
    this.lineJoin = lineJoin
  }

  renderSelf(renderer: DulRenderer, anchor?: Coord): void {
    const newAnchor = this.getAnchor(anchor)
    renderer.ctx.beginPath()
    renderer.ctx.lineCap = this.lineCap
    renderer.ctx.lineJoin = this.lineJoin
    renderer.ctx.strokeStyle = this.strokeStyle
    renderer.ctx.lineWidth = this.lineWidth * renderer.getCoordMultiplier()
    this.path.forEach((coord, i) => {
      const { x, y } = renderer.translateCoordDimension(
        { ...coord, w: 0, h: 0 },
        newAnchor
      )
      if (i === 0) {
        renderer.ctx.moveTo(x, y)
      } else {
        renderer.ctx.lineTo(x, y)
      }
    })
    renderer.ctx.stroke()
  }
}

// List : basic list renderer, overrides renderChildren function to put gaps between items
export interface ListProps extends Object2DProps {
  direction: 'row' | 'column'
  gap: number
}

export const defaultListProps = {
  ...defaultObject2DProps,
  direction: 'row',
  gap: 0,
} satisfies ListProps

export class List extends Object2D implements ListProps {
  direction: 'row' | 'column'
  gap: number
  __type = 'LIST'

  constructor(props: Partial<ListProps>) {
    const { x, y, w, h, direction, gap } = { ...defaultListProps, ...props }
    super({ x, y, w, h })
    this.direction = direction
    this.gap = gap
  }

  renderChildren(renderer: DulRenderer, anchor?: Coord) {
    const newAnchor = this.getAnchor(anchor)
    let offset = 0
    for (const child of this.children) {
      if (this.direction === 'row') {
        child.render(renderer, { ...newAnchor, x: newAnchor.x + offset })
        this.h = Math.max(this.h, child.h)
        offset += child.w
      } else if (this.direction === 'column') {
        child.render(renderer, { ...newAnchor, y: newAnchor.y + offset })
        this.w = Math.max(this.w, child.w)
        offset += child.h
      }
      offset += this.gap
    }
    if (this.direction === 'row') {
      this.w = offset
    } else if (this.direction === 'column') {
      this.h = offset
    }
  }
}
