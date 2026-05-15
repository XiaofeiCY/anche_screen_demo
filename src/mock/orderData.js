/** 7项汇总指标基准数据 */
const BASE = {
  totalOrderAmount: 12567890,
  companyOrderAmount: 9876543,
  totalOrderCount: 56789,
  companyOrderCount: 43210,
  splitRevenue: 3456789,
  valueAddedRevenue: 1234567,
  activeStations: 1234
}

const LABELS = {
  totalOrderAmount: '近七天马蹄订单总额',
  companyOrderAmount: '近7天运营公司订单总额',
  totalOrderCount: '近7天订单总量',
  companyOrderCount: '近7天运营公司订单总量',
  splitRevenue: '近7天分账营收',
  valueAddedRevenue: '近7天增值业务营收',
  activeStations: '近7天活跃站点总量'
}

const FORMATS = {
  totalOrderAmount: { prefix: '¥', decimals: 0 },
  companyOrderAmount: { prefix: '¥', decimals: 0 },
  totalOrderCount: { decimals: 0 },
  companyOrderCount: { decimals: 0 },
  splitRevenue: { prefix: '¥', decimals: 0 },
  valueAddedRevenue: { prefix: '¥', decimals: 0 },
  activeStations: { decimals: 0 }
}

/**
 * 生成汇总指标数据（基准值 ±2% 随机浮动）
 */
export function generateOrderSummary() {
  const result = {}
  for (const [key, baseVal] of Object.entries(BASE)) {
    const drift = 1 + (Math.random() - 0.5) * 0.04 // ±2%
    result[key] = Math.round(baseVal * drift)
  }
  return result
}

export function getIndicatorLabels() {
  return LABELS
}

export function getIndicatorFormats() {
  return FORMATS
}
