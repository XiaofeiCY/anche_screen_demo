import { createApp } from 'vue'
import App from './App.vue'
import './assets/styles/global.css'

async function initApp() {
  // 创建并挂载 Vue 应用（地图在 ChinaMap 组件内按需加载）
  const app = createApp(App)
  app.mount('#app')
}

initApp()
