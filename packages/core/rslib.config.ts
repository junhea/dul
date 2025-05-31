import { defineConfig } from '@rslib/core'

export default defineConfig({
  lib: [{ format: 'esm', dts: true }],
  output: {
    target: 'web',
  },
  source: {
    tsconfigPath: './tsconfig.json',
  },
})
