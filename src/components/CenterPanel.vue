<template>
  <div class="center-panel">
    <!-- 2D/3D 切换按钮 -->
    <div class="map-toggle">
      <button
        class="toggle-btn"
        :class="{ active: mapMode === '2d' }"
        @click="switchMode('2d')"
      >
        2D 平面
      </button>
      <button
        class="toggle-btn"
        :class="{ active: mapMode === '3d' }"
        @click="switchMode('3d')"
      >
        3D 立体
      </button>
    </div>
    <ChinaMap v-if="mapMode === '2d'" />
    <ChinaMap3D v-else />
  </div>
</template>

<script setup>
import { ref, defineAsyncComponent, inject } from 'vue'
import ChinaMap from './ChinaMap.vue'

const ChinaMap3D = defineAsyncComponent(() => import('./ChinaMap3D.vue'))

const mockData = inject('mockData')

const mapMode = ref('2d')

function switchMode(mode) {
  mockData.clearSelection()
  mapMode.value = mode
}
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

.map-toggle {
  position: absolute;
  top: 8px;
  right: 12px;
  z-index: 2;
  display: flex;
  gap: 2px;
  background: rgba(2, 11, 22, 0.7);
  border-radius: 4px;
  padding: 2px;
  border: 1px solid rgba(0, 180, 220, 0.25);
}

.toggle-btn {
  padding: 3px 10px;
  font-size: 11px;
  font-family: 'Orbitron', 'Consolas', 'Monaco', monospace;
  color: rgba(200, 220, 240, 0.6);
  background: transparent;
  border: none;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.25s ease;
  letter-spacing: 1px;
}

.toggle-btn:hover {
  color: rgba(200, 220, 240, 0.9);
}

.toggle-btn.active {
  background: rgba(0, 180, 220, 0.25);
  color: #00d4ff;
  text-shadow: 0 0 6px #00d4ff;
  box-shadow: inset 0 0 6px rgba(0, 212, 255, 0.15);
}
</style>
