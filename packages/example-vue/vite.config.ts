import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import { isDulElement } from '@duljs/vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue({
      // commented out since vite configs cannot import ts (It is run by node, which doesnt support ts natively: https://github.com/vitejs/vite/issues/5370)
      // should work in normal cases
      // template: { compilerOptions: { isCustomElement: isDulElement } }
    }),
  ],
})
