<template>
  <div class="table-container">
    <!-- Loading -->
    <SkeletonLoader v-if="loading" type="table" :rows="8" :cols="4" />

    <!-- Error -->
    <ErrorDisplay
      v-else-if="hasError"
      :message="errorMsg"
      @retry="onRetry"
    />

    <!-- Empty -->
    <div v-else-if="isEmpty" class="empty-state">暂无订单数据</div>

    <!-- Normal -->
    <div
      v-else
      class="table-wrapper"
      @mouseenter="pauseScroll"
      @mouseleave="resumeScroll"
    >
      <div class="table-header">
        <span class="th-rank">#</span>
        <span class="th-state">态势</span>
        <span class="th-name">省份</span>
        <span class="th-count">订单数</span>
        <span class="th-amount">订单金额</span>
      </div>
      <div class="table-body">
        <div class="table-scroll-inner" :style="{ transform: `translateY(-${scrollOffset}px)` }">
          <div
            v-for="(item, idx) in displayRows"
            :key="item.name + '-' + idx"
            class="table-row"
            :class="{ 'is-selected': selectedProvince === item.name }"
            @click="selectRow(item)"
          >
            <span class="th-rank">{{ item.orderRank }}</span>
            <span class="th-state">
              <img
                v-if="getRowState(item).type === 'watch'"
                class="state-alert"
                src="../assets/images/hud/alert-beacon.png"
                alt=""
                aria-hidden="true"
              />
              <span
                v-else
                class="state-dot"
                :class="'is-' + getRowState(item).type"
              />
            </span>
            <span class="th-name">{{ item.name }}</span>
            <span class="th-count">{{ item.orderCount.toLocaleString() }}</span>
            <span class="th-amount">{{ formatCurrency(item.orderAmount) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, onMounted, onUnmounted } from 'vue'
import { getOrderRanking } from '../mock/provinceData.js'
import { useInteraction } from '../composables/useInteraction.js'
import { formatCurrency } from '../utils/numberFormat.js'
import SkeletonLoader from './SkeletonLoader.vue'
import ErrorDisplay from './ErrorDisplay.vue'

const mockData = inject('mockData')
const { debounce } = useInteraction({ debounceMs: 300 })

const selectedProvince = computed(() => mockData.selectedProvince.value)
const isPaused = ref(false)
const scrollOffset = ref(0)
let rafId = null
let lastTime = 0
const rowHeight = 31 // matches CSS
const SCROLL_SPEED = 30 // px per second

const loading = computed(() => mockData.loading.value)
const hasError = computed(() => !!mockData.provinceError.value)
const errorMsg = computed(() => mockData.provinceError.value || '订单数据加载失败')
const isEmpty = computed(() => !mockData.provinceStats.value || mockData.provinceStats.value.length === 0)

const sortedRows = computed(() => {
  if (!mockData.provinceStats.value) return []
  return getOrderRanking(mockData.provinceStats.value).map((p, idx) => ({
    ...p,
    orderRank: idx + 1
  }))
})

// 复制一份用于无缝滚动
const displayRows = computed(() => {
  const rows = sortedRows.value
  if (rows.length === 0) return []
  return [...rows, ...rows]
})

function scrollStep(timestamp) {
  if (lastTime === 0) lastTime = timestamp
  const delta = (timestamp - lastTime) / 1000
  lastTime = timestamp

  if (!isPaused.value) {
    scrollOffset.value += SCROLL_SPEED * delta
    const singleListHeight = sortedRows.value.length * rowHeight
    if (scrollOffset.value >= singleListHeight) {
      scrollOffset.value -= singleListHeight
    }
  }

  rafId = requestAnimationFrame(scrollStep)
}

function startScroll() {
  stopScroll()
  lastTime = 0
  rafId = requestAnimationFrame(scrollStep)
}

function stopScroll() {
  if (rafId) {
    cancelAnimationFrame(rafId)
    rafId = null
  }
}

function pauseScroll() {
  isPaused.value = true
}

function resumeScroll() {
  isPaused.value = false
}

function getRowState(item) {
  if (item.orderRank <= 3) return { type: 'hot', label: '增长' }
  if (item.orderRank % 7 === 0) return { type: 'watch', label: '关注' }
  if (item.orderRank % 5 === 0) return { type: 'cool', label: '回落' }
  return { type: 'stable', label: '稳定' }
}

const selectRow = debounce((item) => {
  if (selectedProvince.value === item.name) {
    mockData.clearSelection()
  } else {
    mockData.selectProvince(item.name)
  }
})

function onRetry() {
  mockData.retryProvince()
}

onMounted(() => {
  startScroll()
})

onUnmounted(() => {
  stopScroll()
})
</script>

<style scoped>
.table-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.table-wrapper {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.table-header {
  display: flex;
  align-items: center;
  padding: 7px 10px;
  font-size: 11px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-subtle);
  background: rgba(14, 31, 52, 0.94);
  flex-shrink: 0;
  font-family: 'Orbitron', 'Consolas', 'Monaco', monospace;
}

.table-body {
  flex: 1;
  overflow: hidden;
  position: relative;
}

.table-scroll-inner {
  will-change: transform;
}

.table-row {
  display: flex;
  align-items: center;
  height: 31px;
  padding: 0 10px;
  cursor: pointer;
  transition: background var(--transition-fast), transform var(--transition-fast);
  border-bottom: 1px solid rgba(101, 232, 255, 0.06);
}

.table-row:hover {
  background: linear-gradient(90deg, rgba(101, 232, 255, 0.10), rgba(255, 184, 77, 0.035), transparent);
  transform: translateX(2px);
}

.table-row:active {
  background: rgba(0, 212, 255, 0.2);
}

.table-row.is-selected {
  background: rgba(101, 232, 255, 0.12);
  box-shadow: inset 2px 0 0 var(--accent-amber);
}

.th-rank {
  flex: 0 0 28px;
  font-size: 12px;
  color: var(--text-secondary);
  text-align: center;
}

.th-state {
  flex: 0 0 34px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.th-name {
  flex: 0 0 68px;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.th-count {
  flex: 0 0 76px;
  font-size: 13px;
  text-align: right;
  font-family: 'Consolas', 'Monaco', monospace;
}

.th-amount {
  flex: 1;
  font-size: 13px;
  text-align: right;
  font-family: 'Consolas', 'Monaco', monospace;
  color: #9cf2ff;
}

.state-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--accent-mint);
  box-shadow: 0 0 10px rgba(52, 245, 181, 0.55);
}

.state-dot.is-hot {
  background: var(--accent-amber);
  box-shadow: 0 0 12px var(--glow-amber);
}

.state-dot.is-cool {
  background: var(--accent-blue);
  box-shadow: 0 0 10px rgba(36, 120, 255, 0.55);
}

.state-alert {
  width: 20px;
  height: 20px;
  object-fit: contain;
  filter: saturate(0.92);
  opacity: 0.82;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  font-size: 13px;
}
</style>
