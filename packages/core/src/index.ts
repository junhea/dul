import { Object2D, Scene } from './object'

export * from './util'
export * from './camera'
export * from './renderer'
export * from './object'
export * from './raycaster'

export interface Coord {
  x: number
  y: number
}

export interface Dimension {
  w: number
  h: number
}

export interface FrameContext {
  anchor?: Coord
  time: DOMHighResTimeStamp
  scene: Scene
  object: Object2D
}
