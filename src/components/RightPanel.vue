<template>
  <div class="right-panel">
    <div class="right-section right-section--chart">
      <div class="section-title">近七天全国订单趋势</div>
      <div class="section-body">
        <TrendChart />
      </div>
    </div>
    <div class="right-section right-section--ranking">
      <div class="section-title">近七天TOP10省份活跃度</div>
      <div class="section-body">
        <ProvinceRanking />
      </div>
    </div>
    <div class="right-section right-section--table">
      <div class="section-title">省份订单排名</div>
      <div class="section-body">
        <ProvinceTable />
      </div>
    </div>
  </div>
</template>

<script setup>
import TrendChart from './TrendChart.vue'
import ProvinceRanking from './ProvinceRanking.vue'
import ProvinceTable from './ProvinceTable.vue'
</script>

<style scoped>
.right-panel {
  display: flex;
  flex-direction: column;
  gap: clamp(4px, 0.8vh, 10px);
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.right-section {
  background: var(--bg-panel);
  border-radius: var(--panel-radius);
  border: 1px solid var(--border-subtle);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.right-section--chart {
  flex: 0 0 38%;
}

.right-section--ranking {
  flex: 0 0 28%;
}

.right-section--table {
  flex: 1;
  min-height: 0;
}

.section-title {
  font-size: clamp(10px, 1.1vh, 12px);
  color: var(--text-secondary);
  padding: 0.5vh 0.8vw;
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.section-body {
  flex: 1;
  overflow: hidden;
  position: relative;
  min-height: 0;
}
</style>
