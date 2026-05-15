/**
 * 近7天趋势数据
 * orderAmount: 每日订单金额（柱状图，单位：万元）
 * orderCount: 每日订单量（折线图，单位：单）
 */
function formatDate(offset) {
  const d = new Date()
  d.setDate(d.getDate() - offset)
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${m}-${day}`
}

export function generateTrendData() {
  const categories = []
  const orderAmount = []
  const orderCount = []

  for (let i = 6; i >= 0; i--) {
    categories.push(formatDate(i))
    // 每日订单金额：120-210 万元之间波动
    orderAmount.push(Math.round(1200000 + Math.random() * 900000))
    // 每日订单量：5000-9000 单之间波动
    orderCount.push(Math.round(5000 + Math.random() * 4000))
  }

  return { categories, orderAmount, orderCount }
}
