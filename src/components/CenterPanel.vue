<template>
  <div class="center-panel">
    <div class="center-stage" />
    <div class="operation-rail operation-rail--top">
      <span>NODE HEALTH 98.7%</span>
      <span>SYNC 12ms</span>
      <span>ACTIVE ROUTES 286</span>
    </div>
    <div class="operation-rail operation-rail--bottom">
      <span>INSPECTION GRID</span>
      <span>REALTIME FLOW</span>
      <span>ANOMALY WATCH</span>
    </div>
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
  border-radius: calc(var(--panel-radius) + 2px);
  border: 1px solid rgba(101, 232, 255, 0.20);
  overflow: hidden;
  background:
    radial-gradient(circle at 50% 47%, rgba(36, 120, 255, 0.18), transparent 36%),
    linear-gradient(180deg, rgba(7, 19, 34, 0.70), rgba(2, 8, 15, 0.76));
  position: relative;
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 0 90px rgba(36, 120, 255, 0.12),
    0 18px 70px rgba(0, 0, 0, 0.28);
}

.center-panel::before,
.center-panel::after {
  content: '';
  position: absolute;
  inset: 10px;
  pointer-events: none;
  border: 1px solid rgba(101, 232, 255, 0.10);
  z-index: 2;
}

.center-panel::after {
  inset: auto 12% 3.8% 12%;
  height: 1px;
  border: 0;
  background: linear-gradient(90deg, transparent, rgba(101, 232, 255, 0.28), rgba(255, 184, 77, 0.42), rgba(101, 232, 255, 0.28), transparent);
  box-shadow: 0 0 18px rgba(101, 232, 255, 0.32);
}

.center-stage {
  position: absolute;
  left: 50%;
  top: 52%;
  width: min(62vw, 900px);
  aspect-ratio: 1 / 0.42;
  transform: translate(-50%, -50%) perspective(720px) rotateX(64deg);
  border-radius: 50%;
  background:
    repeating-radial-gradient(ellipse at center,
      rgba(101, 232, 255, 0.22) 0 1px,
      transparent 1px 42px),
    radial-gradient(ellipse at center, rgba(101, 232, 255, 0.16), transparent 66%);
  opacity: 0.34;
  filter: blur(0.2px);
  z-index: 0;
  pointer-events: none;
}

.operation-rail {
  position: absolute;
  left: 24px;
  right: 24px;
  display: flex;
  justify-content: space-between;
  z-index: 3;
  pointer-events: none;
  color: rgba(143, 167, 186, 0.76);
  font-family: 'Orbitron', 'Consolas', 'Monaco', monospace;
  font-size: 10px;
  letter-spacing: 1.4px;
}

.operation-rail--top {
  top: 12px;
  padding-right: 150px;
}

.operation-rail--bottom {
  bottom: 18px;
}

.operation-rail span {
  position: relative;
  padding-left: 12px;
}

.operation-rail span::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  transform: translateY(-50%);
  background: var(--accent-amber);
  box-shadow: 0 0 12px var(--glow-amber);
}

.map-toggle {
  position: absolute;
  top: 11px;
  right: 14px;
  z-index: 2;
  display: flex;
  gap: 2px;
  background: rgba(2, 8, 15, 0.78);
  border-radius: 999px;
  padding: 3px;
  border: 1px solid rgba(101, 232, 255, 0.22);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
}

.toggle-btn {
  padding: 4px 12px;
  font-size: 11px;
  font-family: 'Orbitron', 'Consolas', 'Monaco', monospace;
  color: rgba(200, 220, 240, 0.6);
  background: transparent;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.25s ease;
  letter-spacing: 1px;
}

.toggle-btn:hover {
  color: rgba(200, 220, 240, 0.9);
}

.toggle-btn.active {
  background: linear-gradient(135deg, rgba(101, 232, 255, 0.22), rgba(255, 184, 77, 0.18));
  color: #ecfbff;
  text-shadow: 0 0 8px rgba(101, 232, 255, 0.8);
  box-shadow:
    inset 0 0 8px rgba(101, 232, 255, 0.16),
    0 0 18px rgba(101, 232, 255, 0.18);
}
</style>
