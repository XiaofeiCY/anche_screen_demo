<template>
  <header class="dashboard-header">
    <div class="header-kicker">
      <span class="signal-dot" />
      LIVE OPS
    </div>
    <h1 class="header-title">马蹄智检运营中心</h1>
    <div class="header-subtitle">NATIONAL INSPECTION COMMAND</div>
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
  height: 6.3vh;
  min-height: 54px;
  padding: 0 2vw;
  background:
    linear-gradient(180deg, rgba(6, 16, 27, 0.92) 0%, rgba(2, 7, 13, 0.62) 100%),
    linear-gradient(90deg, rgba(101, 232, 255, 0.08), rgba(255, 184, 77, 0.08), rgba(101, 232, 255, 0.08));
  border: 1px solid rgba(101, 232, 255, 0.16);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    0 14px 48px rgba(0, 0, 0, 0.26);
  position: relative;
  overflow: hidden;
}

.dashboard-header::before {
  content: '';
  position: absolute;
  inset: 0 22%;
  background: linear-gradient(90deg, transparent, rgba(101, 232, 255, 0.12), transparent);
  transform: skewX(-22deg);
  pointer-events: none;
}

.dashboard-header::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 8%;
  width: 84%;
  height: 1px;
  background: linear-gradient(90deg,
    transparent, var(--accent-cyan), var(--accent-amber), var(--accent-cyan), transparent
  );
  opacity: 0.72;
}

.header-kicker,
.header-subtitle,
.header-time {
  position: absolute;
  z-index: 1;
  font-family: 'Orbitron', 'Consolas', 'Monaco', monospace;
}

.header-kicker {
  left: 2vw;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--accent-mint);
  font-size: clamp(10px, 1.1vh, 12px);
  letter-spacing: 2px;
}

.signal-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent-mint);
  box-shadow: 0 0 14px var(--accent-mint);
  animation: signal-pulse 1.6s cubic-bezier(0.32, 0.72, 0, 1) infinite;
}

.header-title {
  font-size: clamp(18px, 2.2vh, 28px);
  font-weight: 700;
  letter-spacing: 0.5vw;
  background: linear-gradient(180deg, #ffffff 0%, #9fefff 54%, #ffcf83 120%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: breathe 3s ease-in-out infinite;
  white-space: nowrap;
  position: relative;
  z-index: 1;
}

.header-subtitle {
  bottom: 7px;
  left: 50%;
  transform: translateX(-50%);
  color: rgba(143, 167, 186, 0.72);
  font-size: clamp(8px, 0.85vh, 10px);
  letter-spacing: 3px;
}

.header-time {
  right: 2vw;
  font-size: clamp(11px, 1.2vh, 14px);
  color: var(--text-secondary);
  letter-spacing: 1px;
}

@keyframes signal-pulse {
  0%, 100% { opacity: 0.45; transform: scale(0.86); }
  50% { opacity: 1; transform: scale(1.18); }
}
</style>
