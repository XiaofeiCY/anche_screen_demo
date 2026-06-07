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
        v-for="(indicator, idx) in mockData.indicators.value"
        :key="indicator.key"
        :title="indicator.title"
        :value="indicator.value"
        :prefix="indicator.prefix"
        :suffix="indicator.suffix"
        :decimals="indicator.decimals"
        :delta="getKpiMeta(indicator.key, idx).delta"
        :status="getKpiMeta(indicator.key, idx).status"
        :trend="getKpiMeta(indicator.key, idx).trend"
        :error="indicator.value == null ? '数据异常' : null"
        @click="onCardClick"
      />
      <div class="ops-summary">
        <div class="ops-summary__title">实时运营脉冲</div>
        <div class="ops-summary__grid">
          <div class="ops-chip">
            <span class="ops-chip__label">峰值省份</span>
            <strong>{{ topProvince?.name || '--' }}</strong>
          </div>
          <div class="ops-chip">
            <span class="ops-chip__label">站点热度</span>
            <strong>{{ topProvince ? topProvince.activeSites.toLocaleString() : '--' }}</strong>
          </div>
          <div class="ops-chip ops-chip--warn">
            <span class="ops-chip__label">异常观察</span>
            <strong>3</strong>
          </div>
        </div>
      </div>
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

const topProvince = computed(() => {
  const stats = mockData.provinceStats.value || []
  return [...stats]
    .filter(p => p.activeSites > 0)
    .sort((a, b) => b.activeSites - a.activeSites)[0]
})

const KPI_META = {
  totalOrderAmount: { delta: 8.7, status: '高位运行', trend: [52, 58, 61, 57, 66, 72, 78] },
  companyOrderAmount: { delta: 6.2, status: '增长', trend: [48, 50, 55, 59, 63, 61, 70] },
  totalOrderCount: { delta: 3.8, status: '稳定', trend: [44, 47, 45, 49, 54, 55, 57] },
  companyOrderCount: { delta: 2.9, status: '稳定', trend: [42, 43, 46, 44, 48, 49, 51] },
  splitRevenue: { delta: 9.4, status: '高位运行', trend: [40, 46, 53, 56, 62, 68, 76] },
  valueAddedRevenue: { delta: -1.6, status: '需关注', trend: [66, 62, 64, 57, 55, 52, 49] },
  activeStations: { delta: 4.1, status: '稳定', trend: [51, 52, 54, 55, 58, 59, 62] }
}

function getKpiMeta(key, idx) {
  return KPI_META[key] || {
    delta: 1.8 + idx,
    status: '稳定',
    trend: [42, 45, 49, 48, 52, 56, 58]
  }
}

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

.ops-summary {
  margin-top: auto;
  padding: clamp(8px, 1vh, 12px);
  border: 1px solid rgba(101, 232, 255, 0.14);
  border-radius: var(--panel-radius);
  background:
    linear-gradient(135deg, rgba(255, 184, 77, 0.08), transparent 42%),
    rgba(3, 10, 18, 0.82);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.06),
    0 12px 32px rgba(0, 0, 0, 0.18);
}

.ops-summary__title {
  color: #dff9ff;
  font-size: clamp(10px, 1.1vh, 12px);
  letter-spacing: 1.4px;
  font-family: 'Orbitron', 'Consolas', 'Monaco', monospace;
  margin-bottom: 8px;
}

.ops-summary__grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
}

.ops-chip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 28px;
  padding: 0 9px;
  border: 1px solid rgba(101, 232, 255, 0.10);
  background: rgba(101, 232, 255, 0.045);
}

.ops-chip__label {
  color: var(--text-secondary);
  font-size: 11px;
}

.ops-chip strong {
  color: var(--accent-cyan);
  font-family: 'Orbitron', 'Consolas', 'Monaco', monospace;
  font-size: 13px;
}

.ops-chip--warn strong {
  color: var(--accent-amber);
  text-shadow: 0 0 10px var(--glow-amber);
}
</style>
