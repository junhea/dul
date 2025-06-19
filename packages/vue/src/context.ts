import { DulRenderer } from '@duljs/core'
import { inject, InjectionKey, provide, ShallowRef } from 'vue'

interface DulContext {
  renderer: ShallowRef<DulRenderer | null>
}

const DulContextKey: InjectionKey<DulContext> = Symbol()

export const provideDulContext = (renderer: ShallowRef<DulRenderer | null>) => {
  provide(DulContextKey, { renderer })
}

export const useDul = (): DulContext => {
  const context = inject(DulContextKey)
  if (!context) throw 'useDul must be used inside DulRenderer'
  return context
}
