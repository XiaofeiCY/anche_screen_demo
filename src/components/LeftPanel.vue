<template>
  <div class="left-panel">
    <template v-if="loading">
      <NumberCard
        v-for="i in 7"
        :key="i"
        title="加载中..."
        :loading="true"
      />
    </template>

    <template v-else-if="panelError">
      <ErrorDisplay
        :message="panelError"
        @retry="mockData.retrySummary()"
      />
    </template>

    <template v-else>
      <NumberCard
        v-for="indicator in mockData.indicators.value"
        :key="indicator.key"
        :title="indicator.title"
        :value="indicator.value"
        :prefix="indicator.prefix"
        :suffix="indicator.suffix"
        :decimals="indicator.decimals"
        :error="indicator.value == null ? '数据异常' : null"
        @click="onCardClick"
      />
    </template>
  </div>
</template>

<script setup>
import { inject, computed } from 'vue'
import NumberCard from './NumberCard.vue'
import ErrorDisplay from './ErrorDisplay.vue'

const mockData = inject('mockData')

const loading = computed(() => mockData.loading.value)
const panelError = computed(() => mockData.summaryError.value || mockData.error.value)

function onCardClick({ title, value }) {
  // 预留：以后可以扩展点击卡片弹详情等交互
}
</script>

<style scoped>
.left-panel {
  display: flex;
  flex-direction: column;
  gap: clamp(4px, 0.8vh, 10px);
  height: 100%;
  overflow-y: auto;
}
</style>
