import { ref, computed, onMounted, onUnmounted } from 'vue'

/**
 * 统一交互 composable
 * - 防抖：防止快速重复点击
 * - 触屏检测
 * - 按压态管理
 */
export function useInteraction(options = {}) {
  const { debounceMs = 500 } = options
  let lastClick = 0
  const isTouchDevice = ref(false)
  const isPressed = ref(false)

  const detectTouch = () => {
    isTouchDevice.value = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0)
  }

  onMounted(() => {
    detectTouch()
  })

  /** 防抖包装函数：debounceMs 内的重复调用被忽略 */
  function debounce(fn) {
    return (...args) => {
      const now = Date.now()
      if (now - lastClick < debounceMs) return
      lastClick = now
      return fn(...args)
    }
  }

  /** 节流包装函数 */
  function throttle(fn, ms = 100) {
    let last = 0
    return (...args) => {
      const now = Date.now()
      if (now - last < ms) return
      last = now
      return fn(...args)
    }
  }

  /** 触屏按压处理 */
  function touchHandlers() {
    return {
      onTouchstart: () => { isPressed.value = true },
      onTouchend: () => { isPressed.value = false },
      onTouchcancel: () => { isPressed.value = false }
    }
  }

  return {
    debounce,
    throttle,
    isTouchDevice: computed(() => isTouchDevice.value),
    isPressed: computed(() => isPressed.value),
    touchHandlers
  }
}
