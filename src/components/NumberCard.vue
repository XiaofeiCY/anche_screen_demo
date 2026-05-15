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
      </div>
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
  border-radius: var(--panel-radius);
  border: 1px solid var(--border-subtle);
  padding: clamp(6px, 1vh, 12px) clamp(8px, 1vw, 16px);
  cursor: pointer;
  transition: transform var(--transition-normal),
              background var(--transition-normal),
              box-shadow var(--transition-normal),
              border-color var(--transition-normal);
  animation: fadeInUp 0.5s ease both;
  user-select: none;
  -webkit-user-select: none;
}

.number-card:hover {
  background: var(--bg-panel-hover);
  transform: scale(1.02);
  box-shadow: 0 0 16px rgba(29, 112, 224, 0.3);
  border-color: var(--accent);
}

.number-card:active,
.number-card.is-pressed {
  transform: scale(0.98);
  background: rgba(28, 63, 118, 0.8);
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
  color: var(--accent-light);
}

.card-number {
  font-size: clamp(18px, 2.6vh, 28px);
  font-weight: 700;
  color: var(--text-primary);
  font-family: 'DIN', 'Consolas', 'Monaco', monospace;
  letter-spacing: 1px;
}

.is-flash .card-number {
  animation: flash-blue 0.4s ease-out;
}
</style>
