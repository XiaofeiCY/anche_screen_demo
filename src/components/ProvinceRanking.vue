<template>
  <div class="ranking-container">
    <!-- Loading -->
    <SkeletonLoader v-if="loading" type="table" :rows="10" :cols="3" />

    <!-- Error -->
    <ErrorDisplay
      v-else-if="hasError"
      :message="errorMsg"
      @retry="onRetry"
    />

    <!-- Empty -->
    <div v-else-if="isEmpty" class="empty-state">暂无排名数据</div>

    <!-- Normal -->
    <div v-else class="ranking-list" ref="listRef">
      <div class="ranking-header">
        <span class="col-rank">#</span>
        <span class="col-name">省份</span>
        <span class="col-bar">活跃度</span>
        <span class="col-count">站点数</span>
        <span class="col-change">趋势</span>
      </div>
      <div
        v-for="(item, idx) in topProvinces"
        :key="item.name"
        class="ranking-row"
        :class="{ 'is-selected': selectedProvince === item.name, 'is-touched': touchedRow === item.name }"
        @click="selectProvince(item)"
        @touchstart="touchedRow = item.name"
        @touchend="touchedRow = null"
        @touchcancel="touchedRow = null"
      >
        <span class="col-rank" :class="'rank-' + (idx + 1)">
          {{ idx + 1 }}
        </span>
        <span class="col-name">{{ item.name }}</span>
        <span class="col-bar">
          <span class="progress-track">
            <span
              class="progress-fill"
              :style="{ width: (item.activeSites / maxSites * 100) + '%' }"
            />
          </span>
        </span>
        <span class="col-count">{{ item.activeSites.toLocaleString() }}</span>
        <span class="col-change">
          <template v-if="item.activeRank < item.prevActiveRank">
            <span class="arrow arrow-up">&#9650;</span>
          </template>
          <template v-else-if="item.activeRank > item.prevActiveRank">
            <span class="arrow arrow-down">&#9660;</span>
          </template>
          <template v-else>
            <span class="arrow arrow-flat">&#8212;</span>
          </template>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { getTopActiveProvinces } from '../mock/provinceData.js'
import { useInteraction } from '../composables/useInteraction.js'
import SkeletonLoader from './SkeletonLoader.vue'
import ErrorDisplay from './ErrorDisplay.vue'

const mockData = inject('mockData')
const { debounce } = useInteraction({ debounceMs: 300 })

const touchedRow = ref(null)
const listRef = ref(null)

const loading = computed(() => mockData.loading.value)
const hasError = computed(() => !!mockData.provinceError.value)
const errorMsg = computed(() => mockData.provinceError.value || '排名数据加载失败')
const isEmpty = computed(() => !mockData.provinceStats.value || mockData.provinceStats.value.length === 0)
const selectedProvince = computed(() => mockData.selectedProvince.value)

const topProvinces = computed(() => {
  if (!mockData.provinceStats.value) return []
  return getTopActiveProvinces(mockData.provinceStats.value, 10)
})

const maxSites = computed(() => {
  if (topProvinces.value.length === 0) return 1
  return Math.max(...topProvinces.value.map(p => p.activeSites))
})

const selectProvince = debounce((item) => {
  if (selectedProvince.value === item.name) {
    mockData.clearSelection()
  } else {
    mockData.selectProvince(item.name)
  }
})

function onRetry() {
  mockData.retryProvince()
}
</script>

<style scoped>
.ranking-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.ranking-list {
  height: 100%;
  overflow-y: auto;
}

.ranking-header {
  display: flex;
  align-items: center;
  padding: 7px 10px;
  font-size: 11px;
  color: var(--text-secondary);
  border-bottom: 1px solid var(--border-subtle);
  position: sticky;
  top: 0;
  background: rgba(28, 63, 118, 0.95);
  z-index: 1;
}

.ranking-row {
  display: flex;
  align-items: center;
  padding: 7px 10px;
  cursor: pointer;
  transition: background var(--transition-fast);
  border-bottom: 1px solid rgba(77, 128, 186, 0.1);
}

.ranking-row:hover {
  background: rgba(77, 128, 186, 0.15);
}

.ranking-row:active,
.ranking-row.is-touched {
  background: rgba(77, 128, 186, 0.25);
}

.ranking-row.is-selected {
  background: rgba(29, 112, 224, 0.2);
  border-left: 3px solid var(--accent-cyan);
}

.col-rank {
  flex: 0 0 32px;
  width: 32px; height: 20px;
  font-size: 12px;
  font-weight: 700;
  text-align: center;
  line-height: 20px;
  color: var(--text-secondary);
  border-radius: 3px;
}

.col-rank.rank-1 { background: rgba(255, 215, 0, 0.2); color: #ffd700; }
.col-rank.rank-2 { background: rgba(192, 192, 192, 0.15); color: #c0c0c0; }
.col-rank.rank-3 { background: rgba(205, 127, 50, 0.2); color: #cd7f32; }

.col-name {
  flex: 0 0 68px;
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-bar {
  flex: 1;
  padding: 0 8px;
}

.progress-track {
  display: block;
  height: 8px;
  background: rgba(77, 128, 186, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, var(--accent-blue), var(--accent-cyan));
  border-radius: 4px;
  transition: width 1s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.col-count {
  flex: 0 0 56px;
  font-size: 12px;
  text-align: right;
  font-family: 'Consolas', 'Monaco', monospace;
}

.col-change {
  flex: 0 0 30px;
  text-align: center;
  font-size: 12px;
}

.arrow { font-size: 12px; }
.arrow-up { color: var(--success); }
.arrow-down { color: var(--danger); }
.arrow-flat { color: var(--text-secondary); }

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  font-size: 13px;
}
</style>
