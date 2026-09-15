import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        // Bootstrap 5.3's own SCSS still uses the legacy @import system and
        // old color functions; these deprecations can't be fixed from our
        // side until Bootstrap migrates (planned for v6).
        // https://sass-lang.com/documentation/breaking-changes/
        silenceDeprecations: ['import', 'global-builtin', 'color-functions', 'if-function'],
      },
    },
  },
})
