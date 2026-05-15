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
  grid-template-columns: 1fr 2fr 1.4fr;
  grid-template-rows: auto 1fr;
  gap: 0.5vw;
  width: 100vw;
  height: 100vh;
  padding: 0.5vw;
  box-sizing: border-box;
  background: var(--bg-primary);
}

.layout-header {
  grid-column: 1 / -1;
  grid-row: 1;
}

.layout-left {
  grid-column: 1;
  grid-row: 2;
  overflow: hidden;
  min-height: 0;
  min-width: 0;
}

.layout-center {
  grid-column: 2;
  grid-row: 2;
  overflow: hidden;
  min-height: 0;
  min-width: 0;
}

.layout-right {
  grid-column: 3;
  grid-row: 2;
  overflow: hidden;
  min-height: 0;
  min-width: 0;
}
</style>
