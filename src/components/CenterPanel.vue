<template>
  <div class="center-panel">
    <ChinaMap />
  </div>
</template>

<script setup>
import ChinaMap from './ChinaMap.vue'
</script>

<style scoped>
.center-panel {
  width: 100%;
  height: 100%;
  border-radius: var(--panel-radius);
  border: 1px solid var(--border-panel);
  overflow: hidden;
  background: var(--bg-panel);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  position: relative;
}
</style>
