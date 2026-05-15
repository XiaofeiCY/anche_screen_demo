import { ref, watch } from 'vue'

/**
 * 数字滚动动画 composable
 * ease-out cubic 缓动函数驱动，使用共享 RAF 循环
 */
const activeAnimations = new Set()
let sharedRafId = null

function sharedLoop() {
  if (activeAnimations.size === 0) {
    if (sharedRafId) cancelAnimationFrame(sharedRafId)
    sharedRafId = null
    return
  }

  const now = performance.now()
  for (const anim of activeAnimations) {
    anim.tick(now)
  }

  sharedRafId = requestAnimationFrame(sharedLoop)
}

function registerAnimation(anim) {
  activeAnimations.add(anim)
  if (!sharedRafId) {
    sharedRafId = requestAnimationFrame(sharedLoop)
  }
}

function unregisterAnimation(anim) {
  activeAnimations.delete(anim)
}

export function useCountUp(options = {}) {
  const { duration = 1000, decimals = 0 } = options
  const displayValue = ref('--')
  let targetValue = null
  let startValue = 0
  let startTime = 0
  let active = false

  /** ease-out cubic */
  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3)
  }

  const anim = {
    tick(now) {
      if (!active) return
      const elapsed = now - startTime
      const progress = Math.min(elapsed / duration, 1)
      const easedProgress = easeOutCubic(progress)
      const current = startValue + (targetValue - startValue) * easedProgress
      displayValue.value = current.toFixed(decimals)

      if (progress >= 1) {
        displayValue.value = targetValue.toFixed(decimals)
        active = false
        unregisterAnimation(anim)
      }
    }
  }

  /** 触发动画到新值 */
  function animateTo(newValue) {
    if (newValue == null || isNaN(newValue)) {
      displayValue.value = '--'
      return
    }
    const prev = active ? targetValue : (parseFloat(displayValue.value) || 0)
    startValue = prev
    targetValue = Number(newValue)
    startTime = performance.now()
    if (!active) {
      active = true
      registerAnimation(anim)
    }
  }

  return { displayValue, animateTo }
}
