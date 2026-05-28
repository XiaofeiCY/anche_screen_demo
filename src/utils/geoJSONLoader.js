import * as echarts from 'echarts'

const GEOJSON_LOCAL_URL = `${import.meta.env.BASE_URL}geojson/china.json`
const GEOJSON_CDN_URL = 'https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json'
const STORAGE_KEY = 'anche_china_geojson'

function isMapRegistered(name) {
  try {
    return !!echarts.getMap(name)
  } catch (e) {
    return false
  }
}

/**
 * 中国 GeoJSON 加载器
 * 降级策略：本地 → 重试2次 → localStorage → CDN → 报错
 */
export async function loadChinaGeoJSON() {
  if (isMapRegistered('china')) {
    return { success: true, source: 'existing' }
  }

  // 1. 本地文件（含重试）
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const resp = await fetch(GEOJSON_LOCAL_URL)
      if (resp.ok) {
        const geoJSON = await resp.json()
        saveAndRegister('china', geoJSON, STORAGE_KEY)
        return { success: true, source: 'local' }
      }
    } catch (e) { /* 重试 */ }
    if (attempt < 2) await sleep(2000)
  }

  // 2. localStorage 缓存
  try {
    const cached = localStorage.getItem(STORAGE_KEY)
    if (cached) {
      echarts.registerMap('china', JSON.parse(cached))
      return { success: true, source: 'cache' }
    }
  } catch (e) { /* 缓存解析失败 */ }

  // 3. CDN 降级
  try {
    const resp = await fetch(GEOJSON_CDN_URL)
    if (resp.ok) {
      const geoJSON = await resp.json()
      saveAndRegister('china', geoJSON, STORAGE_KEY)
      return { success: true, source: 'cdn' }
    }
  } catch (e) { /* CDN 也失败 */ }

  return { success: false, error: '地图数据加载失败，请检查网络后重试' }
}

/**
 * 省级/市级 GeoJSON 加载器
 * @param {string} adcode - 行政区划代码 (如 '440000' 表示广东省)
 * @param {string} mapName - 注册到 echarts 的地图名称 (如 'guangdong')
 * 降级策略：本地文件 → localStorage → CDN（本地优先，离线可用）
 */
export async function loadProvinceGeoJSON(adcode, mapName) {
  if (isMapRegistered(mapName)) {
    return { success: true, source: 'existing' }
  }

  const cacheKey = `anche_geojson_${adcode}`

  // 1. 本地文件（优先，确保 GitHub Pages 离线可用）
  const localUrl = `${import.meta.env.BASE_URL}geojson/provinces/${adcode}_full.json`
  try {
    const resp = await fetch(localUrl)
    if (resp.ok) {
      const geoJSON = await resp.json()
      saveAndRegister(mapName, geoJSON, cacheKey)
      return { success: true, source: 'local' }
    }
  } catch (e) { /* 本地文件失败，尝试缓存 */ }

  // 2. localStorage 缓存
  try {
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      echarts.registerMap(mapName, JSON.parse(cached))
      return { success: true, source: 'cache' }
    }
  } catch (e) { /* 缓存解析失败 */ }

  // 3. CDN 降级
  const cdnUrl = `https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`
  try {
    const resp = await fetch(cdnUrl)
    if (resp.ok) {
      const geoJSON = await resp.json()
      saveAndRegister(mapName, geoJSON, cacheKey)
      return { success: true, source: 'cdn' }
    }
  } catch (e) { /* CDN 也失败 */ }

  return { success: false, error: '地图数据加载失败，请检查网络后重试' }
}

function saveAndRegister(mapName, geoJSON, storageKey) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(geoJSON))
  } catch (e) { /* localStorage 可能满了 */ }
  if (!isMapRegistered(mapName)) {
    echarts.registerMap(mapName, geoJSON)
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
