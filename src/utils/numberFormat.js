/**
 * 数字格式化工具
 * - 千分位逗号分隔
 * - ¥ 前缀（可选）
 * - 单位缩写（万、亿）
 */
export function formatNumber(value, options = {}) {
  if (value == null || isNaN(value)) return '--'

  const { prefix = '', suffix = '', decimals = 0, abbreviated = false } = options
  let num = Number(value)

  if (abbreviated) {
    if (Math.abs(num) >= 100000000) {
      return prefix + (num / 100000000).toFixed(2) + '亿' + suffix
    }
    if (Math.abs(num) >= 10000) {
      return prefix + (num / 10000).toFixed(2) + '万' + suffix
    }
  }

  const formatted = num.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return prefix + formatted + suffix
}

/**
 * 金额格式化（¥ 前缀 + 千分位 + 保留2位小数）
 */
export function formatCurrency(value) {
  return formatNumber(value, { prefix: '¥', decimals: 0 })
}

/**
 * 百分比格式化
 */
export function formatPercent(value) {
  if (value == null || isNaN(value)) return '--'
  return (Number(value) * 100).toFixed(2) + '%'
}
