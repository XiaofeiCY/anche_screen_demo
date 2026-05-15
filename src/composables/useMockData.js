import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  generateOrderSummary,
  getIndicatorLabels,
  getIndicatorFormats,
  generateProvinceStats,
  generateTrendData
} from '../mock/index.js'

/**
 * 统一 Mock 数据管理 composable
 * - 四态管理：loading / error / empty / normal
 * - 支持模拟错误（~3% 概率）
 * - 定时轮询刷新
 */
export function useMockData() {
  // --- 状态 ---
  const loading = ref(true)
  const error = ref(null)

  // 汇总指标
  const orderSummary = ref(null)
  const summaryError = ref(null)

  // 省份数据
  const provinceStats = ref(null)
  const provinceError = ref(null)

  // 趋势数据
  const trendData = ref(null)
  const trendError = ref(null)

  // --- 定时器 ---
  let summaryTimer = null
  let provinceTimer = null
  let trendTimer = null

  // --- 异常模拟 ---
  const SIMULATE_ERROR_RATE = 0.03 // 3% 概率模拟异常
  let refreshCount = 0
  const simulateErrorEnabled = ref(true)

  function shouldSimulateError() {
    if (!simulateErrorEnabled.value) return false
    refreshCount++
    return refreshCount % 30 === 0 || Math.random() < SIMULATE_ERROR_RATE
  }

  // --- 数据刷新 ---
  function refreshSummary() {
    try {
      if (shouldSimulateError()) {
        throw new Error('模拟数据异常 - 汇总指标加载失败')
      }
      orderSummary.value = generateOrderSummary()
      summaryError.value = null
    } catch (e) {
      summaryError.value = e.message
    }
  }

  function refreshProvinceStats() {
    try {
      if (shouldSimulateError()) {
        throw new Error('模拟数据异常 - 省份数据加载失败')
      }
      provinceStats.value = generateProvinceStats()
      provinceError.value = null
    } catch (e) {
      provinceError.value = e.message
    }
  }

  function refreshTrendData() {
    try {
      if (shouldSimulateError()) {
        throw new Error('模拟数据异常 - 趋势数据加载失败')
      }
      trendData.value = generateTrendData()
      trendError.value = null
    } catch (e) {
      trendError.value = e.message
    }
  }

  // --- 全量刷新（首次加载） ---
  function loadAll() {
    loading.value = true
    error.value = null

    try {
      refreshSummary()
      refreshProvinceStats()
      refreshTrendData()
      loading.value = false
    } catch (e) {
      error.value = e.message
      loading.value = false
    }

    // 启动定时刷新
    startPolling()
  }

  // --- 定时轮询 ---
  function startPolling() {
    stopPolling()
    summaryTimer = setInterval(refreshSummary, 5000)
    provinceTimer = setInterval(refreshProvinceStats, 15000)
    trendTimer = setInterval(refreshTrendData, 10000)
  }

  function stopPolling() {
    if (summaryTimer) clearInterval(summaryTimer)
    if (provinceTimer) clearInterval(provinceTimer)
    if (trendTimer) clearInterval(trendTimer)
  }

  // --- 手动重试 ---
  function retryAll() {
    error.value = null
    summaryError.value = null
    provinceError.value = null
    trendError.value = null
    loading.value = true
    loadAll()
  }

  // --- 计算属性 ---
  const indicators = computed(() => {
    if (!orderSummary.value) return []
    const labels = getIndicatorLabels()
    const formats = getIndicatorFormats()
    return Object.keys(labels).map(key => ({
      key,
      title: labels[key],
      value: orderSummary.value[key],
      prefix: formats[key].prefix || '',
      suffix: formats[key].suffix || '',
      decimals: formats[key].decimals || 0
    }))
  })

  const hasError = computed(() => {
    return error.value || summaryError.value || provinceError.value || trendError.value
  })

  // --- 生命周期 ---
  onMounted(() => {
    loadAll()
  })

  onUnmounted(() => {
    stopPolling()
  })

  return {
    // 状态
    loading,
    error,
    hasError,
    // 数据
    orderSummary,
    provinceStats,
    trendData,
    // 派生
    indicators,
    // 模块级错误
    summaryError,
    provinceError,
    trendError,
    // 操作
    retryAll,
    retrySummary: refreshSummary,
    retryProvince: refreshProvinceStats,
    retryTrend: refreshTrendData,
    // 异常模拟开关
    simulateErrorEnabled
  }
}
