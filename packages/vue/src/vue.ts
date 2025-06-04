import { isObject2DKey, isPrimitiveKey } from './nodeops'

import { Object2D, object2DPrimitives } from '@duljs/core'
import { DefineComponent } from 'vue'
import { Object2DPointerEvents } from './pointer'

type ObjectClassParams<T extends abstract new (...args: any) => Object2D> =
  Partial<ConstructorParameters<T>[0]>

type VueObject2DComponent = {
  [Name in keyof typeof object2DPrimitives as `Dul${string &
    Name}`]: DefineComponent<
    ObjectClassParams<(typeof object2DPrimitives)[Name]> &
      Partial<Object2DPointerEvents>
  >
} & {
  DulObject2D: DefineComponent<
    Partial<Object2D> & Partial<Object2DPointerEvents>
  >
}

declare module 'vue' {
  export interface GlobalComponents extends VueObject2DComponent {}
}

export const isDulElement = (tag: string): boolean => {
  if (!tag.startsWith('Dul')) return false
  const name = tag.replace('Dul', '')
  return isObject2DKey(name) || isPrimitiveKey(name)
}
