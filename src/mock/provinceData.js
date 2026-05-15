/** 34个省级行政区基准数据 */
const PROVINCE_BASE = [
  { name: '广东省', activeSites: 5280, onlineSites: 4950, orderCount: 152300, orderAmount: 45678900 },
  { name: '江苏省', activeSites: 4820, onlineSites: 4600, orderCount: 138200, orderAmount: 39876500 },
  { name: '浙江省', activeSites: 4560, onlineSites: 4320, orderCount: 125600, orderAmount: 37234000 },
  { name: '山东省', activeSites: 3980, onlineSites: 3750, orderCount: 118900, orderAmount: 34567000 },
  { name: '河南省', activeSites: 3620, onlineSites: 3400, orderCount: 105400, orderAmount: 31234000 },
  { name: '四川省', activeSites: 3450, onlineSites: 3200, orderCount: 98700, orderAmount: 29876000 },
  { name: '湖北省', activeSites: 3280, onlineSites: 3050, orderCount: 92300, orderAmount: 27543000 },
  { name: '湖南省', activeSites: 3100, onlineSites: 2880, orderCount: 87600, orderAmount: 26123000 },
  { name: '河北省', activeSites: 2950, onlineSites: 2720, orderCount: 83400, orderAmount: 24876000 },
  { name: '福建省', activeSites: 2780, onlineSites: 2580, orderCount: 78900, orderAmount: 23456000 },
  { name: '安徽省', activeSites: 2600, onlineSites: 2400, orderCount: 74500, orderAmount: 22134000 },
  { name: '上海市', activeSites: 2450, onlineSites: 2300, orderCount: 71200, orderAmount: 21230000 },
  { name: '北京市', activeSites: 2380, onlineSites: 2250, orderCount: 69800, orderAmount: 20876000 },
  { name: '辽宁省', activeSites: 2200, onlineSites: 2050, orderCount: 65400, orderAmount: 19543000 },
  { name: '陕西省', activeSites: 2050, onlineSites: 1900, orderCount: 61200, orderAmount: 18234000 },
  { name: '江西省', activeSites: 1920, onlineSites: 1780, orderCount: 57800, orderAmount: 17234000 },
  { name: '重庆市', activeSites: 1850, onlineSites: 1720, orderCount: 55600, orderAmount: 16543000 },
  { name: '广西壮族自治区', activeSites: 1700, onlineSites: 1580, orderCount: 52300, orderAmount: 15678000 },
  { name: '云南省', activeSites: 1580, onlineSites: 1450, orderCount: 48900, orderAmount: 14567000 },
  { name: '贵州省', activeSites: 1420, onlineSites: 1300, orderCount: 44500, orderAmount: 13234000 },
  { name: '山西省', activeSites: 1350, onlineSites: 1220, orderCount: 41200, orderAmount: 12345000 },
  { name: '黑龙江省', activeSites: 1280, onlineSites: 1150, orderCount: 39800, orderAmount: 11876000 },
  { name: '吉林省', activeSites: 1200, onlineSites: 1080, orderCount: 36700, orderAmount: 10987000 },
  { name: '甘肃省', activeSites: 1050, onlineSites: 950, orderCount: 33400, orderAmount: 9876000 },
  { name: '新疆维吾尔自治区', activeSites: 980, onlineSites: 880, orderCount: 31200, orderAmount: 9345000 },
  { name: '内蒙古自治区', activeSites: 920, onlineSites: 820, orderCount: 29800, orderAmount: 8765000 },
  { name: '天津市', activeSites: 850, onlineSites: 780, orderCount: 27800, orderAmount: 8234000 },
  { name: '海南省', activeSites: 780, onlineSites: 700, orderCount: 25600, orderAmount: 7654000 },
  { name: '宁夏回族自治区', activeSites: 650, onlineSites: 580, orderCount: 22300, orderAmount: 6543000 },
  { name: '青海省', activeSites: 520, onlineSites: 460, orderCount: 18900, orderAmount: 5432000 },
  { name: '西藏自治区', activeSites: 380, onlineSites: 320, orderCount: 13400, orderAmount: 3987000 },
  { name: '福建省', activeSites: 2780, onlineSites: 2580, orderCount: 78900, orderAmount: 23456000 },
  { name: '台湾省', activeSites: 0, onlineSites: 0, orderCount: 0, orderAmount: 0 },
  { name: '香港特别行政区', activeSites: 420, onlineSites: 380, orderCount: 15600, orderAmount: 4654000 },
  { name: '澳门特别行政区', activeSites: 180, onlineSites: 160, orderCount: 7800, orderAmount: 2345000 }
]

// Deduplicate (accidentally had 福建省 twice)
const deduped = []
const seen = new Set()
for (const p of PROVINCE_BASE) {
  if (seen.has(p.name)) continue
  seen.add(p.name)
  deduped.push(p)
}

/**
 * 生成省份统计数据
 * 随机微调数值（±3%）和排名变动
 */
export function generateProvinceStats() {
  const shuffled = [...deduped]
    .map(p => ({
      ...p,
      activeSites: Math.round(p.activeSites * (1 + (Math.random() - 0.5) * 0.06)),
      onlineSites: Math.round(p.onlineSites * (1 + (Math.random() - 0.5) * 0.06)),
      orderCount: Math.round(p.orderCount * (1 + (Math.random() - 0.5) * 0.06)),
      orderAmount: Math.round(p.orderAmount * (1 + (Math.random() - 0.5) * 0.06))
    }))

  // 按活跃站点数排序，生成排名
  shuffled.sort((a, b) => b.activeSites - a.activeSites)

  const result = shuffled.map((p, idx) => ({
    ...p,
    activeRank: idx + 1,
    prevActiveRank: p.prevActiveRank || idx + 1
  }))

  // 随机调换相邻排名（模拟排名变化）
  const swapCount = 3 + Math.floor(Math.random() * 5)
  for (let i = 0; i < swapCount; i++) {
    const a = Math.floor(Math.random() * 10) // 前10名变动
    const b = a + (Math.random() > 0.5 ? 1 : -1)
    if (b >= 0 && b < result.length && Math.abs(a - b) === 1) {
      const temp = result[a].activeRank
      result[a].activeRank = result[b].activeRank
      result[b].activeRank = temp
      // 交换位置
      const t = result[a]
      result[a] = result[b]
      result[b] = t
    }
  }

  // 更新 prevActiveRank（保存本次结果以便下次对比）
  result.forEach(p => {
    p.prevActiveRank = p.activeRank
  })

  return result
}

/** 获取 TOP n 活跃度排名 */
export function getTopActiveProvinces(stats, n = 10) {
  return [...stats]
    .sort((a, b) => b.activeSites - a.activeSites)
    .slice(0, n)
}

/** 获取订单排名表数据（按订单金额排序） */
export function getOrderRanking(stats) {
  return [...stats]
    .filter(p => p.orderAmount > 0) // 过滤无数据省份（如台湾）
    .sort((a, b) => b.orderAmount - a.orderAmount)
}
