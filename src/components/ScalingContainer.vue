<template>
  <div class="scaling-wrapper">
    <div class="scaling-content" :style="contentStyle">
      <slot />
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useScaling } from '../composables/useScaling.js'

const { scale } = useScaling(1920, 1080)

const contentStyle = computed(() => ({
  width: '1920px',
  height: '1080px',
  transform: `scale(${scale.value})`,
  transformOrigin: 'center center'
}))
</script>

<style scoped>
.scaling-wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.scaling-content {
  flex-shrink: 0;
  will-change: transform;
}
</style>
