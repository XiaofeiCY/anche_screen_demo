<template>
  <div class="left-panel">
    <!-- 省份详情模式 -->
    <template v-if="selectedProvince">
      <button class="back-btn" @click="mockData.clearSelection()">
        ← 返回全国
      </button>
      <div class="province-header">{{ selectedProvince }}</div>
      <NumberCard
        v-for="item in provinceIndicators"
        :key="item.key"
        :title="item.title"
        :value="item.value"
        :prefix="item.prefix"
        :suffix="item.suffix"
        :decimals="item.decimals"
        :error="item.value == null ? '--' : null"
      />
    </template>

    <!-- 全国视图 -->
    <template v-else-if="loading">
      <NumberCard
        v-for="i in 7"
        :key="i"
        title="加载中..."
        :loading="true"
      />
    </template>

    <template v-else-if="panelError">
      <ErrorDisplay
        :message="panelError"
        @retry="mockData.retrySummary()"
      />
    </template>

    <template v-else>
      <NumberCard
        v-for="indicator in mockData.indicators.value"
        :key="indicator.key"
        :title="indicator.title"
        :value="indicator.value"
        :prefix="indicator.prefix"
        :suffix="indicator.suffix"
        :decimals="indicator.decimals"
        :error="indicator.value == null ? '数据异常' : null"
        @click="onCardClick"
      />
    </template>

  </div>
</template>

<script setup>
import { inject, computed } from 'vue'
import NumberCard from './NumberCard.vue'
import ErrorDisplay from './ErrorDisplay.vue'
import { formatCurrency } from '../utils/numberFormat.js'

const mockData = inject('mockData')

const loading = computed(() => mockData.loading.value)
const panelError = computed(() => mockData.summaryError.value || mockData.error.value)
const selectedProvince = computed(() => mockData.selectedProvince.value)

const provinceIndicators = computed(() => {
  const name = selectedProvince.value
  if (!name) return []
  const stats = mockData.provinceStats.value
  if (!stats) return []
  const p = stats.find(s => s.name === name)
  if (!p) return []
  return [
    { key: 'active', title: '活跃站点', value: p.activeSites, prefix: '', suffix: '个', decimals: 0 },
    { key: 'online', title: '上线站点', value: p.onlineSites, prefix: '', suffix: '个', decimals: 0 },
    { key: 'orders', title: '订单数', value: p.orderCount, prefix: '', suffix: '单', decimals: 0 },
    { key: 'amount', title: '订单金额', value: p.orderAmount, prefix: '¥', suffix: '', decimals: 0 }
  ]
})

function onCardClick({ title, value }) {
  // 预留：以后可以扩展点击卡片弹详情等交互
}
</script>

<style scoped>
.left-panel {
  display: flex;
  flex-direction: column;
  gap: clamp(4px, 0.8vh, 10px);
  height: 100%;
  overflow-y: auto;
}

.back-btn {
  padding: 5px 12px;
  font-size: 12px;
  font-family: 'Orbitron', 'Consolas', 'Monaco', monospace;
  color: #00d4ff;
  background: rgba(2, 11, 22, 0.7);
  border: 1px solid rgba(0, 212, 255, 0.4);
  border-radius: 4px;
  cursor: pointer;
  text-shadow: 0 0 6px #00d4ff;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.15);
  transition: all 0.25s ease;
  align-self: flex-start;
  letter-spacing: 1px;
}

.back-btn:hover {
  border-color: #00d4ff;
  box-shadow: 0 0 18px rgba(0, 212, 255, 0.35), inset 0 0 10px rgba(0, 212, 255, 0.08);
}

.province-header {
  font-family: 'Orbitron', 'Consolas', 'Monaco', monospace;
  font-size: 18px;
  font-weight: 700;
  color: #00d4ff;
  text-shadow: 0 0 6px #00d4ff, 0 0 16px #00a8cc;
  text-align: center;
  padding: 4px 0 8px;
  letter-spacing: 2px;
}
</style>
