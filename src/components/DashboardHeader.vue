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
  background: linear-gradient(180deg, rgba(28, 63, 118, 0.9) 0%, rgba(28, 63, 118, 0.4) 100%);
  border-bottom: 1px solid var(--border-subtle);
  position: relative;
}

.header-title {
  font-size: clamp(18px, 2.2vh, 28px);
  font-weight: 600;
  letter-spacing: 0.3vw;
  color: var(--text-primary);
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
