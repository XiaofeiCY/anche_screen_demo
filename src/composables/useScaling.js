import { ref, onMounted, onUnmounted } from 'vue'

export function useScaling(designWidth = 1920, designHeight = 1080) {
  const scale = ref(1)
  let rafId = null

  const update = () => {
    if (rafId) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
      const sx = window.innerWidth / designWidth
      const sy = window.innerHeight / designHeight
      // cover 模式：填满整个视口，不出现黑边
      scale.value = Math.max(sx, sy)
    })
  }

  onMounted(() => {
    update()
    window.addEventListener('resize', update)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', update)
    if (rafId) cancelAnimationFrame(rafId)
  })

  return { scale }
}
