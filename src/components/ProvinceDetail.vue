<template>
  <div v-if="province" class="province-detail glass-panel">
    <div class="detail-header">
      <span class="detail-icon">◆</span>
      <span class="detail-name">{{ province.name }}</span>
      <span class="detail-rank">#{{ province.activeRank }}</span>
    </div>
    <div class="detail-body">
      <div class="detail-row">
        <span class="detail-label">活跃站点</span>
        <span class="detail-value accent">{{ fmt(province.activeSites) }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">上线站点</span>
        <span class="detail-value">{{ fmt(province.onlineSites) }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">订单数</span>
        <span class="detail-value">{{ fmt(province.orderCount) }}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">订单金额</span>
        <span class="detail-value">¥{{ fmtMoney(province.orderAmount) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  province: { type: Object, default: null }
})

function fmt(n) {
  if (n == null) return '--'
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

function fmtMoney(n) {
  if (n == null) return '--'
  if (n >= 100000000) return (n / 100000000).toFixed(2) + '亿'
  if (n >= 10000) return (n / 10000).toFixed(1) + '万'
  return n.toLocaleString()
}
</script>

<style scoped>
.province-detail {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  min-width: 240px;
  padding: 12px 18px;
  background: rgba(2, 11, 22, 0.92);
  border: 1px solid rgba(0, 212, 255, 0.35);
  border-radius: 6px;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  animation: detail-in 0.25s ease-out;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(0, 212, 255, 0.2);
}

.detail-icon {
  color: #00d4ff;
  font-size: 10px;
}

.detail-name {
  font-family: 'Orbitron', 'Consolas', 'Monaco', monospace;
  font-size: 15px;
  color: #e0e6ed;
  text-shadow: 0 0 8px rgba(0, 212, 255, 0.3);
  flex: 1;
}

.detail-rank {
  font-family: 'Orbitron', 'Consolas', 'Monaco', monospace;
  font-size: 18px;
  font-weight: 700;
  color: #00d4ff;
  text-shadow: 0 0 12px rgba(0, 212, 255, 0.5);
}

.detail-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 12px;
  color: rgba(180, 200, 220, 0.7);
}

.detail-value {
  font-family: 'Orbitron', 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: #c8dcf0;
}

.detail-value.accent {
  color: #00d4ff;
  text-shadow: 0 0 6px rgba(0, 212, 255, 0.3);
}

@keyframes detail-in {
  from { opacity: 0; transform: translateX(-50%) translateY(8px); }
  to { opacity: 1; transform: translateX(-50%) translateY(0); }
}
</style>
