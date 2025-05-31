import { Object2D, object2DPrimitives } from '@duljs/core'
import { RendererOptions } from 'vue'

type Object2DKey = keyof typeof object2DPrimitives
const object2DKeys = Object.keys(object2DPrimitives) as Object2DKey[]

export const isObject2DKey = (key: string): key is Object2DKey =>
  object2DKeys.includes(key as Object2DKey)

const parsePropKey = (maybeKebab: string) =>
  maybeKebab
    .split('-')
    .map((s, i) => {
      if (i === 0) return s
      return s.charAt(0).toUpperCase() + s.slice(1)
    })
    .join('')

export const nodeops: () => RendererOptions<
  Object2D,
  Object2D | null
> = () => ({
  createElement(type, _namespace, _isCustomizedBuiltIn, vnodeProps) {
    if (type === 'template' || type === 'BASE') {
      return null
    }
    if (!type.startsWith('Dul')) {
      return null
    }
    const name = type.replace('Dul', '')
    if (!isObject2DKey(name)) {
      return null
    }
    const targetObj = object2DPrimitives[name]
    if (!targetObj) {
      return null
    }
    return new targetObj(vnodeProps as any)
  },
  insert(el, parent) {
    if (!el) {
      return
    }
    parent?.addChild(el)
  },
  remove(el) {
    if (!el) {
      return
    }
    el.destroy()
  },
  patchProp(el, key, _prevValue, nextValue, _namespace, _parentComponent) {
    if (!el) {
      return
    }
    ;(el as any)[parsePropKey(key)] = nextValue
  },
  parentNode(node) {
    if (!node) {
      return null
    }
    return node.parent
  },
  nextSibling(node) {
    if (!node) {
      return null
    }
    const parent = node.parent
    const siblings = parent?.children ?? []
    const index = siblings.indexOf(node)
    if (index < 0 || index >= siblings.length - 1) {
      return null
    }
    return siblings[index + 1]
  },
  createComment() {
    const el = new Object2D({})
    el.__type = 'COMMENT'
    return el
  },
  createText() {
    const el = new Object2D({})
    el.__type = 'TEXT'
    return el
  },
  setText() {},
  setElementText() {},
})
