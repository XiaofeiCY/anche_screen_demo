import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  base: '/anche_screen_demo/',
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
