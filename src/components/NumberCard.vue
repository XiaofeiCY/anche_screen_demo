<template>
  <div
    class="number-card"
    :class="{
      'is-pressed': isPressed,
      'is-flash': flashing,
      'is-loading': loading,
      'is-error': hasError
    }"
    v-bind="touchHandlers()"
    @mouseenter="onHover"
    @mouseleave="onLeave"
  >
    <!-- Loading state -->
    <template v-if="loading">
      <SkeletonLoader type="card" />
    </template>

    <!-- Error state -->
    <template v-else-if="hasError">
      <div class="card-title">{{ title }}</div>
      <ErrorDisplay :message="errorMsg" compact />
    </template>

    <!-- Empty state -->
    <template v-else-if="isEmpty">
      <div class="card-title">{{ title }}</div>
      <div class="card-value">--</div>
    </template>

    <!-- Normal state -->
    <template v-else>
      <div class="card-title">{{ title }}</div>
      <div class="card-value" @click="handleClick">
        <span class="card-prefix" v-if="prefix">{{ prefix }}</span>
        <span class="card-number">{{ displayText }}</span>
        <span class="card-suffix" v-if="suffix">{{ suffix }}</span>
        <span class="card-phantom">{{ displayText }}</span>
      </div>
      <div class="card-glow-bar" />
      <div class="card-scanlines" />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useCountUp } from '../composables/useCountUp.js'
import { useInteraction } from '../composables/useInteraction.js'
import { formatNumber } from '../utils/numberFormat.js'
import SkeletonLoader from './SkeletonLoader.vue'
import ErrorDisplay from './ErrorDisplay.vue'

const props = defineProps({
  title: { type: String, required: true },
  value: { type: [Number, String], default: null },
  prefix: { type: String, default: '' },
  suffix: { type: String, default: '' },
  decimals: { type: Number, default: 0 },
  loading: { type: Boolean, default: false },
  error: { type: String, default: null }
})

const emit = defineEmits(['click'])

const { debounce, isPressed, touchHandlers } = useInteraction({ debounceMs: 500 })
const { displayValue, animateTo } = useCountUp({ duration: 1000, decimals: props.decimals })

const flashing = ref(false)

const hasError = computed(() => !!props.error)
const isEmpty = computed(() => props.value == null || isNaN(props.value))
const errorMsg = computed(() => props.error || '数据异常')

const displayText = computed(() => {
  if (isEmpty.value) return '--'
  return formatNumber(parseFloat(displayValue.value), {
    prefix: '',
    suffix: '',
    decimals: props.decimals
  })
})

// 监听 value 变化触发动画
watch(() => props.value, (newVal) => {
  if (newVal != null && !isNaN(newVal)) {
    animateTo(Number(newVal))
  }
}, { immediate: true })

const handleClick = debounce(() => {
  flashing.value = true
  emit('click', { title: props.title, value: props.value })
  setTimeout(() => { flashing.value = false }, 400)
})

function onHover() { /* hover handled by CSS */ }
function onLeave() { /* leave handled by CSS */ }
</script>

<style scoped>
.number-card {
  background: var(--bg-panel);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: var(--panel-radius);
  border: 1px solid var(--border-panel);
  padding: clamp(6px, 1vh, 12px) clamp(8px, 1vw, 16px);
  cursor: pointer;
  position: relative;
  transition: transform var(--transition-normal),
              background var(--transition-normal),
              box-shadow var(--transition-normal),
              border-color var(--transition-normal);
  animation: fadeInUp 0.5s cubic-bezier(0.25, 0.8, 0.25, 1) both;
  user-select: none;
  -webkit-user-select: none;
  overflow: hidden;
}

/* 科技角标 */
.number-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 10px; height: 10px;
  border-top: 2px solid var(--accent-cyan);
  border-left: 2px solid var(--accent-cyan);
  opacity: 0.4;
  transition: opacity var(--transition-fast);
}

.number-card::after {
  content: '';
  position: absolute;
  bottom: 0; right: 0;
  width: 10px; height: 10px;
  border-bottom: 2px solid var(--accent-cyan);
  border-right: 2px solid var(--accent-cyan);
  opacity: 0.4;
  transition: opacity var(--transition-fast);
}

.number-card:hover::before,
.number-card:hover::after {
  opacity: 0.9;
}

.number-card:hover {
  background: var(--bg-panel-hover);
  transform: translateY(-2px);
  box-shadow: 0 0 20px var(--glow-cyan), inset 0 0 20px rgba(0, 212, 255, 0.05);
  border-color: var(--accent-cyan);
}

.number-card:active,
.number-card.is-pressed {
  transform: translateY(0) scale(0.98);
  box-shadow: 0 0 10px var(--glow-cyan);
}

.number-card.is-loading {
  cursor: default;
  pointer-events: none;
}

.number-card.is-error {
  border-color: var(--danger);
}

.card-title {
  font-size: clamp(10px, 1.2vh, 13px);
  color: var(--text-secondary);
  margin-bottom: 0.3vh;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-value {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.card-prefix,
.card-suffix {
  font-size: clamp(12px, 1.5vh, 16px);
  color: var(--accent-cyan);
}

.card-number {
  font-size: clamp(18px, 2.6vh, 28px);
  font-weight: 700;
  color: #e0f0ff;
  font-family: 'Orbitron', 'Consolas', 'Monaco', monospace;
  letter-spacing: 2px;
  animation: number-glow-breathe 3s ease-in-out infinite;
  position: relative;
  z-index: 1;
}

/* 背景暗影数字 — HUD 头盔反射 */
.card-phantom {
  position: absolute;
  right: clamp(8px, 1vw, 16px);
  bottom: 2px;
  font-size: clamp(28px, 4.5vh, 50px);
  font-weight: 900;
  font-family: 'Orbitron', 'Consolas', monospace;
  color: rgba(0, 212, 255, 0.04);
  letter-spacing: 2px;
  pointer-events: none;
  z-index: 0;
  white-space: nowrap;
}

/* 底部发光槽 */
.card-glow-bar {
  position: absolute;
  bottom: 2px;
  left: 10%;
  width: 80%;
  height: 1.5px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(0, 212, 255, 0.3) 15%,
    rgba(0, 212, 255, 0.8) 50%,
    rgba(0, 212, 255, 0.3) 85%,
    transparent 100%
  );
  border-radius: 1px;
  animation: card-bar-glow 2.5s ease-in-out infinite;
  z-index: 1;
  pointer-events: none;
}

/* CRT 扫描线纹理 */
.card-scanlines {
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.03) 2px,
    rgba(0, 0, 0, 0.03) 4px
  );
  pointer-events: none;
  z-index: 2;
  border-radius: var(--panel-radius);
}

.is-flash .card-number {
  animation: flash-cyan 0.4s ease-out, number-glow-breathe 3s ease-in-out infinite;
}

.is-flash .card-glow-bar {
  opacity: 1;
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.8);
  transition: all 0.2s ease;
}
</style>
