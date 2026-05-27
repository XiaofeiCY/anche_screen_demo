import { ref, onMounted, onUnmounted } from 'vue'

export function useScaling(designWidth = 1920, designHeight = 1080, mode = 'none') {
  const scale = ref(1)
  let rafId = null

  const update = () => {
    if (mode === 'none') {
      scale.value = 1
      return
    }
    if (rafId) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
      const sx = window.innerWidth / designWidth
      const sy = window.innerHeight / designHeight
      scale.value = mode === 'contain' ? Math.min(sx, sy) : Math.max(sx, sy)
    })
  }

  onMounted(() => {
    update()
    if (mode !== 'none') {
      window.addEventListener('resize', update)
    }
  })

  onUnmounted(() => {
    if (mode !== 'none') {
      window.removeEventListener('resize', update)
    }
    if (rafId) cancelAnimationFrame(rafId)
  })

  return { scale }
}
