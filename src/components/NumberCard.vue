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
      <div class="card-meta">
        <span class="card-status" :class="'is-' + statusTone">{{ status }}</span>
        <span class="card-delta" :class="{ 'is-negative': numericDelta < 0 }">
          {{ deltaText }}
        </span>
      </div>
      <div class="card-value" @click="handleClick">
        <span class="card-prefix" v-if="prefix">{{ prefix }}</span>
        <span class="card-number">{{ displayText }}</span>
        <span class="card-suffix" v-if="suffix">{{ suffix }}</span>
        <span class="card-phantom">{{ displayText }}</span>
      </div>
      <div class="card-sparkline" aria-hidden="true">
        <span
          v-for="(point, index) in normalizedTrend"
          :key="index"
          class="spark-bar"
          :style="{ height: point + '%' }"
        />
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
  error: { type: String, default: null },
  delta: { type: Number, default: 0 },
  status: { type: String, default: '稳定' },
  trend: { type: Array, default: () => [] }
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

const numericDelta = computed(() => Number(props.delta) || 0)
const deltaText = computed(() => {
  const sign = numericDelta.value >= 0 ? '+' : ''
  return `${sign}${numericDelta.value.toFixed(1)}%`
})

const statusTone = computed(() => {
  if (props.status.includes('关注') || props.status.includes('异常')) return 'warn'
  if (props.status.includes('高位') || props.status.includes('增长')) return 'hot'
  return 'stable'
})

const normalizedTrend = computed(() => {
  const values = props.trend.length ? props.trend.map(Number) : [42, 48, 45, 58, 62, 68, 72]
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  return values.map(v => 24 + ((v - min) / range) * 62)
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
  background:
    linear-gradient(135deg, rgba(101, 232, 255, 0.08), transparent 34%),
    linear-gradient(180deg, rgba(10, 26, 43, 0.88), rgba(3, 10, 18, 0.92));
  border-radius: var(--panel-radius);
  border: 1px solid rgba(101, 232, 255, 0.16);
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
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 -1px 0 rgba(101, 232, 255, 0.08),
    0 12px 32px rgba(0, 0, 0, 0.20);
}

/* 科技角标 */
.number-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0;
  width: 42%;
  height: 1px;
  border: 0;
  background: linear-gradient(90deg, var(--accent-cyan), transparent);
  opacity: 0.58;
  transition: opacity var(--transition-fast);
}

.number-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  right: 0;
  width: 28%;
  height: 2px;
  border: 0;
  background: linear-gradient(90deg, transparent, var(--accent-amber));
  opacity: 0.52;
  transition: opacity var(--transition-fast);
}

.number-card:hover::before,
.number-card:hover::after {
  opacity: 0.9;
}

.number-card:hover {
  background:
    linear-gradient(135deg, rgba(101, 232, 255, 0.12), rgba(255, 184, 77, 0.04) 46%, transparent),
    var(--bg-panel-hover);
  transform: translateY(-2px) scale(1.006);
  box-shadow:
    0 0 24px rgba(101, 232, 255, 0.20),
    inset 0 0 24px rgba(101, 232, 255, 0.05);
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
  margin-bottom: 0.36vh;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 0.12vh;
  min-height: 18px;
}

.card-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--text-secondary);
  font-size: clamp(9px, 0.95vh, 11px);
}

.card-status::before {
  content: '';
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--accent-mint);
  box-shadow: 0 0 9px rgba(52, 245, 181, 0.55);
}

.card-status.is-hot::before {
  background: var(--accent-amber);
  box-shadow: 0 0 9px var(--glow-amber);
}

.card-status.is-warn::before {
  background: var(--danger);
  box-shadow: 0 0 9px rgba(255, 93, 108, 0.55);
}

.card-delta {
  color: var(--accent-mint);
  font-size: clamp(10px, 1vh, 12px);
  font-family: 'Orbitron', 'Consolas', 'Monaco', monospace;
}

.card-delta.is-negative {
  color: var(--danger);
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
  font-size: clamp(17px, 2.35vh, 27px);
  font-weight: 700;
  color: #effcff;
  font-family: 'Orbitron', 'Consolas', 'Monaco', monospace;
  letter-spacing: 1.2px;
  animation: number-glow-breathe 3s ease-in-out infinite;
  position: relative;
  z-index: 1;
}

.card-sparkline {
  display: flex;
  align-items: end;
  gap: 3px;
  height: clamp(12px, 1.5vh, 18px);
  margin-top: 0.38vh;
  max-width: 46%;
}

.spark-bar {
  width: 4px;
  min-height: 3px;
  border-radius: 999px 999px 0 0;
  background: linear-gradient(180deg, var(--accent-amber), var(--accent-cyan));
  opacity: 0.78;
  box-shadow: 0 0 8px rgba(101, 232, 255, 0.16);
}

/* 背景暗影数字 — HUD 头盔反射 */
.card-phantom {
  position: absolute;
  right: clamp(8px, 1vw, 16px);
  bottom: 2px;
  font-size: clamp(28px, 4.5vh, 50px);
  font-weight: 900;
  font-family: 'Orbitron', 'Consolas', monospace;
  color: rgba(101, 232, 255, 0.035);
  letter-spacing: 2px;
  pointer-events: none;
  z-index: 0;
  white-space: nowrap;
}

/* 底部发光槽 */
.card-glow-bar {
  position: absolute;
  bottom: 3px;
  left: 12%;
  width: 76%;
  height: 1.5px;
  background: linear-gradient(90deg,
    transparent 0%,
    rgba(101, 232, 255, 0.24) 15%,
    rgba(255, 184, 77, 0.9) 50%,
    rgba(101, 232, 255, 0.28) 85%,
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
