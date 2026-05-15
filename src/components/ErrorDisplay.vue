<template>
  <div class="error-display" :class="{ 'error-display--compact': compact }" @click.stop>
    <template v-if="compact">
      <span class="error-icon-compact" :title="message">!</span>
    </template>
    <template v-else>
      <div class="error-icon">&#x26A0;</div>
      <p class="error-message">{{ message }}</p>
      <button class="error-retry-btn" :disabled="retrying" @click="handleRetry">
        {{ retrying ? '重试中...' : '点击重试' }}
      </button>
    </template>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useInteraction } from '../composables/useInteraction.js'

const props = defineProps({
  message: { type: String, default: '数据加载失败' },
  compact: { type: Boolean, default: false }
})

const emit = defineEmits(['retry'])

const { debounce } = useInteraction({ debounceMs: 3000 })
const retrying = ref(false)

const handleRetry = debounce(() => {
  retrying.value = true
  emit('retry')
  setTimeout(() => { retrying.value = false }, 1000)
})
</script>

<style scoped>
.error-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  height: 100%;
  color: var(--text-secondary);
}

.error-display--compact {
  padding: 0;
}

.error-icon {
  font-size: 28px;
  color: var(--danger);
  opacity: 0.8;
}

.error-icon-compact {
  color: var(--danger);
  font-weight: bold;
  font-size: 14px;
  cursor: default;
}

.error-message {
  font-size: 13px;
  text-align: center;
  line-height: 1.5;
}

.error-retry-btn {
  margin-top: 4px;
  padding: 6px 20px;
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  background: rgba(29, 112, 224, 0.2);
  color: var(--accent-cyan);
  font-size: 13px;
  cursor: pointer;
  transition: background var(--transition-fast);
}

.error-retry-btn:hover:not(:disabled) {
  background: rgba(29, 112, 224, 0.4);
}

.error-retry-btn:active:not(:disabled) {
  background: rgba(29, 112, 224, 0.6);
}

.error-retry-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
