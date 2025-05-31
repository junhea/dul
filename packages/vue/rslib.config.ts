import { defineConfig } from '@rslib/core'
import { pluginUnpluginVue } from 'rsbuild-plugin-unplugin-vue'

export default defineConfig({
  lib: [{ format: 'esm', bundle: false }],
  output: {
    target: 'web',
  },
  plugins: [pluginUnpluginVue()],
  source: {
    tsconfigPath: './tsconfig.json',
  },
})
