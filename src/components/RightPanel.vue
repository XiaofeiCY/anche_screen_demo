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
  background:
    linear-gradient(145deg, rgba(12, 32, 52, 0.82), rgba(3, 10, 18, 0.90)),
    var(--bg-panel);
  border-radius: var(--panel-radius);
  border: 1px solid rgba(101, 232, 255, 0.16);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
  position: relative;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.07),
    inset 0 -1px 0 rgba(101, 232, 255, 0.07),
    0 12px 34px rgba(0, 0, 0, 0.18);
}

.right-section::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(101, 232, 255, 0.10), transparent 22%),
    repeating-linear-gradient(0deg, transparent 0 23px, rgba(101, 232, 255, 0.025) 24px);
  opacity: 0.65;
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
  color: #d7f8ff;
  padding: 0.62vh 0.8vw;
  border-bottom: 1px solid rgba(101, 232, 255, 0.14);
  flex-shrink: 0;
  letter-spacing: 1px;
  position: relative;
  background: linear-gradient(90deg, rgba(36, 120, 255, 0.20), transparent);
  font-family: 'Orbitron', 'Consolas', 'Monaco', monospace;
}

/* 标题左侧青色指示条 */
.section-title::before {
  content: '';
  position: absolute;
  left: 0; top: 25%; bottom: 25%;
  width: 2px;
  background: var(--accent-amber);
  border-radius: 1px;
  box-shadow: 0 0 10px var(--glow-amber);
}

.section-body {
  flex: 1;
  overflow: hidden;
  position: relative;
  min-height: 0;
}
</style>
