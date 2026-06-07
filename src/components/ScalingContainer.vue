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

const props = defineProps({
  mode: { type: String, default: 'none' }
})

const { scale } = useScaling(1920, 1080, props.mode)

const contentStyle = computed(() => {
  if (props.mode === 'none') {
    return { width: '100%', height: '100%' }
  }
  return {
    width: '1920px',
    height: '1080px',
    transform: `scale(${scale.value})`,
    transformOrigin: 'center center'
  }
})
</script>

<style scoped>
.scaling-wrapper {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 4;
}

.scaling-content {
  flex-shrink: 0;
}
</style>
