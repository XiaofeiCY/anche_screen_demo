import * as echarts from 'echarts'

const GEOJSON_LOCAL_URL = `${import.meta.env.BASE_URL}geojson/china.json`
const GEOJSON_CDN_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json'
const STORAGE_KEY = 'anche_china_geojson'

/**
 * 中国 GeoJSON 加载器
 * 降级策略：本地 → 重试2次 → CDN → localStorage → 报错
 */
export async function loadChinaGeoJSON() {
  // 1. 尝试从 localStorage 加载缓存
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      const geoJSON = JSON.parse(cached)
      echarts.registerMap('china', geoJSON)
      return { success: true, source: 'cache' }
    }
  } catch (e) { /* 缓存解析失败，继续正常流程 */ }

  // 2. 尝试从本地加载（含重试）
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const resp = await fetch(GEOJSON_LOCAL_URL)
      if (resp.ok) {
        const geoJSON = await resp.json()
        saveAndRegister(geoJSON)
        return { success: true, source: 'local' }
      }
    } catch (e) { /* 重试 */ }
    if (attempt < 2) await sleep(2000)
  }

  // 3. 降级到 CDN
  try {
    const resp = await fetch(GEOJSON_CDN_URL)
    if (resp.ok) {
      const geoJSON = await resp.json()
      saveAndRegister(geoJSON)
      return { success: true, source: 'cdn' }
    }
  } catch (e) { /* CDN 也失败 */ }

  // 4. 全部失败
  return { success: false, error: '地图数据加载失败，请检查网络后重试' }
}

function saveAndRegister(geoJSON) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(geoJSON))
  } catch (e) { /* localStorage 可能满了 */ }
  echarts.registerMap('china', geoJSON)
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
