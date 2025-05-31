import { Coord, Object2D } from '@duljs/core'

const createIntersectionFilter = (coord: Coord) => (obj: Object2D) => {
  if (!obj.calculatedBounds) return false
  const { x, y, w, h } = obj.calculatedBounds
  return coord.x >= x && coord.x <= x + w && coord.y >= y && coord.y <= y + h
}

const flattenChildren = <T extends { children: T[] }>(
  acc: T[],
  cur: T
): T[] => [...acc, cur, ...cur.children.reduce(flattenChildren, [] as T[])]

export class RayCaster {
  intersectionFilter?: ReturnType<typeof createIntersectionFilter>
  constructor() {}
  setRayCoord(coord: Coord) {
    this.intersectionFilter = createIntersectionFilter(coord)
  }
  intersectObjects(objects: Object2D[], recursive: boolean = true) {
    if (!this.intersectionFilter) return []
    const targets = recursive
      ? objects.reduce(flattenChildren, [] as Object2D[])
      : objects
    return targets.filter(this.intersectionFilter)
  }
}
