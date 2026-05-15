<template>
  <header class="dashboard-header">
    <h1 class="header-title">马蹄智检运营中心</h1>
    <span class="header-time">{{ currentTime }}</span>
  </header>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const currentTime = ref('')
let timer = null

function updateTime() {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const h = String(now.getHours()).padStart(2, '0')
  const min = String(now.getMinutes()).padStart(2, '0')
  const s = String(now.getSeconds()).padStart(2, '0')
  currentTime.value = `${y}-${m}-${d} ${h}:${min}:${s}`
}

onMounted(() => {
  updateTime()
  timer = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})
</script>

<style scoped>
.dashboard-header {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 5.5vh;
  min-height: 40px;
  padding: 0 2vw;
  background: linear-gradient(180deg,
    rgba(5, 20, 40, 0.95) 0%,
    rgba(8, 32, 64, 0.7) 100%
  );
  backdrop-filter: blur(8px);
  border-bottom: 1px solid var(--border-glow);
  position: relative;
}

/* 底部科技装饰线 */
.dashboard-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 5%;
  width: 90%;
  height: 1px;
  background: linear-gradient(90deg,
    transparent, var(--accent-cyan), transparent
  );
  opacity: 0.5;
}

.header-title {
  font-size: clamp(18px, 2.2vh, 28px);
  font-weight: 600;
  letter-spacing: 0.5vw;
  background: linear-gradient(180deg, #e0f0ff 0%, #80c8ff 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: breathe 3s ease-in-out infinite;
  white-space: nowrap;
}

.header-time {
  position: absolute;
  right: 2vw;
  font-size: clamp(11px, 1.2vh, 14px);
  color: var(--text-secondary);
  font-family: 'Consolas', 'Monaco', monospace;
}
</style>
