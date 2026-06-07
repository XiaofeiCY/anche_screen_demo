<template>
  <div class="dashboard-layout">
    <DashboardHeader class="layout-header" />
    <div class="layout-left"><LeftPanel /></div>
    <div class="layout-center"><CenterPanel /></div>
    <div class="layout-right"><RightPanel /></div>
  </div>
</template>

<script setup>
import DashboardHeader from './DashboardHeader.vue'
import LeftPanel from './LeftPanel.vue'
import CenterPanel from './CenterPanel.vue'
import RightPanel from './RightPanel.vue'
</script>

<style scoped>
.dashboard-layout {
  display: grid;
  grid-template-columns: 0.96fr 2fr 1.36fr;
  grid-template-rows: auto 1fr;
  gap: 0.58vw;
  width: 100%;
  height: 100%;
  padding: 0.48vw;
  box-sizing: border-box;
  position: relative;
}

.dashboard-layout::before {
  content: '';
  position: absolute;
  inset: 0.48vw;
  pointer-events: none;
  border: 1px solid rgba(101, 232, 255, 0.08);
  box-shadow: inset 0 0 70px rgba(36, 120, 255, 0.08);
}

.layout-header {
  grid-column: 1 / -1;
  grid-row: 1;
  animation: fadeInUp 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) both;
}

.layout-left {
  grid-column: 1;
  grid-row: 2;
  overflow: hidden;
  min-height: 0;
  min-width: 0;
  animation: fadeInUp 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) 0.1s both;
}

.layout-center {
  grid-column: 2;
  grid-row: 2;
  overflow: hidden;
  min-height: 0;
  min-width: 0;
  animation: fadeInUp 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) 0.2s both;
}

.layout-right {
  grid-column: 3;
  grid-row: 2;
  overflow: hidden;
  min-height: 0;
  min-width: 0;
  animation: fadeInUp 0.6s cubic-bezier(0.25, 0.8, 0.25, 1) 0.3s both;
}
</style>
