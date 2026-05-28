<template>
  <div
    class="china-map-3d-container"
    @mouseenter="onMapHover"
    @mouseleave="onMapLeave"
  >
    <!-- 星云粒子背景层 -->
    <MapNebula v-if="!loading && !hasError" />

    <!-- 广东省视图返回全国按钮 -->
    <button
      v-if="mapLevel === 'guangdong' && !loading && !hasError"
      class="drill-back-btn"
      @click="returnToNational"
    >
      ← 返回全国
    </button>

    <!-- Loading -->
    <template v-if="loading || guangdongLoading">
      <SkeletonLoader type="map" />
    </template>

    <!-- Error -->
    <template v-else-if="hasError">
      <ErrorDisplay :message="errorMsg" @retry="loadMap" />
    </template>

    <!-- 3D Map -->
    <v-chart
      v-else
      ref="chartRef"
      :key="mapLevel"
      class="china-map-3d-chart"
      :option="currentChartOption"
      :autoresize="true"
      :update-options="{ notMerge: true }"
      @click="onMapClick"
    />

    <!-- 省份/城市详情面板 -->
    <ProvinceDetail :province="detailTarget" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject, watch } from 'vue'
import VChart from 'vue-echarts'

let echartsGL = null
async function ensureEchartsGL() {
  if (!echartsGL) echartsGL = await import('echarts-gl')
  return echartsGL
}
import { loadChinaGeoJSON, loadProvinceGeoJSON } from '../utils/geoJSONLoader.js'
import { guangdongCities } from '../mock/guangdongCityData.js'
import SkeletonLoader from './SkeletonLoader.vue'
import ErrorDisplay from './ErrorDisplay.vue'
import MapNebula from './MapNebula.vue'
import ProvinceDetail from './ProvinceDetail.vue'

const mockData = inject('mockData')
const chartRef = ref(null)
const loading = ref(true)
const mapError = ref(null)
const carouselProvince = ref(null)
let carouselTimer = null
let currentCarouselIndex = 0
let breatheTimer = null
let checkReadyTimer = null

// 下钻状态
const mapLevel = ref('country')
const selectedCity = ref(null)
const guangdongLoaded = ref(false)
const guangdongLoading = ref(false)
const cityCarouselCity = ref(null)
let cityCarouselTimer = null
let cityCarouselIndex = 0

const hasError = computed(() => !!mapError.value)
const errorMsg = computed(() => mapError.value || '地图加载失败')

const provinceStats = computed(() => mockData.provinceStats.value || [])
const selectedProvince = computed(() => mockData.selectedProvince.value)

// 统一详情目标
const detailTarget = computed(() => {
  if (mapLevel.value === 'guangdong') {
    if (!selectedCity.value) return null
    return guangdongCities.find(c => c.name === selectedCity.value) || null
  }
  if (!selectedProvince.value || !provinceStats.value) return null
  return provinceStats.value.find(p => p.name === selectedProvince.value) || null
})

const DRILL_DISTANCE = 60
const DEFAULT_DISTANCE = 140
const GD_DEFAULT_DISTANCE = 160


// 34 省份质心/省会坐标
const PROVINCE_CENTERS = {
  '广东省': [113.28, 23.13],
  '江苏省': [118.78, 32.06],
  '浙江省': [120.15, 30.28],
  '山东省': [117.0, 36.67],
  '河南省': [113.65, 34.76],
  '四川省': [104.07, 30.67],
  '湖北省': [114.30, 30.60],
  '湖南省': [112.98, 28.19],
  '河北省': [114.50, 38.05],
  '福建省': [119.30, 26.08],
  '安徽省': [117.28, 31.86],
  '上海市': [121.47, 31.23],
  '北京市': [116.40, 39.90],
  '辽宁省': [123.43, 41.80],
  '陕西省': [108.95, 34.27],
  '江西省': [115.89, 28.68],
  '重庆市': [106.55, 29.57],
  '广西壮族自治区': [108.33, 22.84],
  '云南省': [102.73, 25.04],
  '贵州省': [106.71, 26.57],
  '山西省': [112.53, 37.87],
  '黑龙江省': [126.63, 45.75],
  '吉林省': [125.35, 43.88],
  '甘肃省': [103.73, 36.03],
  '新疆维吾尔自治区': [87.62, 43.82],
  '内蒙古自治区': [111.65, 40.82],
  '天津市': [117.20, 39.13],
  '海南省': [110.35, 20.02],
  '宁夏回族自治区': [106.27, 38.47],
  '青海省': [101.74, 36.56],
  '西藏自治区': [91.11, 29.97],
  '台湾省': [121.52, 25.03],
  '香港特别行政区': [114.17, 22.28],
  '澳门特别行政区': [113.55, 22.19]
}

const provinceNames = computed(() =>
  provinceStats.value
    .filter(p => p.activeSites > 0)
    .map(p => p.name)
)

// ========== 全国视图 ==========

const scatterData = computed(() => {
  const top5 = [...provinceStats.value]
    .sort((a, b) => b.activeSites - a.activeSites)
    .slice(0, 5)
  return top5
    .filter(p => PROVINCE_CENTERS[p.name])
    .map(p => ({
      name: p.name,
      value: [...PROVINCE_CENTERS[p.name], p.activeSites]
    }))
})

const map3DData = computed(() => {
  const activeName = selectedProvince.value || carouselProvince.value
  if (!activeName) return provinceStats.value
    .filter(p => p.activeSites > 0)
    .map(p => ({ name: p.name, value: p.activeSites }))
  return provinceStats.value
    .filter(p => p.activeSites > 0)
    .map(p => {
      const isActive = p.name === activeName
      return {
        name: p.name,
        value: p.activeSites,
        itemStyle: {
          color: isActive ? '#1a6090' : '#0d2a50',
          borderColor: isActive ? '#00d4ff' : 'rgba(0, 180, 220, 0.35)',
          borderWidth: isActive ? 2 : 1,
          opacity: isActive ? 1 : (selectedProvince.value ? 0.18 : 0.68)
        }
      }
    })
})

const viewDistance = computed(() => {
  return selectedProvince.value ? DRILL_DISTANCE : DEFAULT_DISTANCE
})

const nationalChartOption = computed(() => ({
  backgroundColor: 'transparent',

  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(2, 11, 22, 0.9)',
    borderColor: 'rgba(0, 212, 255, 0.4)',
    textStyle: { color: '#e0e6ed', fontSize: 13 },
    formatter: (params) => {
      if (params.seriesIndex !== 0) return ''
      const stats = provinceStats.value.find(p => p.name === params.name)
      if (!stats) return `<strong>${params.name}</strong>`
      return `<div style="padding:4px 8px">
        <strong style="font-size:14px">${stats.name}</strong><br/>
        <span style="color:#00d4ff">活跃站点：</span>${stats.activeSites ?? '--'}<br/>
        <span style="color:#00d4ff">上线站点：</span>${stats.onlineSites ?? '--'}
      </div>`
    }
  },

  geo3D: {
    map: 'china',
    show: false,
    viewControl: {
      rotateSensitivity: 0,
      panSensitivity: 0,
      zoomSensitivity: 0,
      autoRotate: false
    }
  },

  series: [
    {
      type: 'map3D',
      map: 'china',
      data: map3DData.value,
      regionHeight: 2,
      shading: 'color',
      viewControl: {
        projection: 'perspective',
        autoRotate: false,
        autoRotateSpeed: 2,
        distance: viewDistance.value,
        alpha: 35,
        beta: 0,
        center: [0, 0, 0],
        animation: true,
        animationDurationUpdate: 1200,
        animationEasingUpdate: 'cubicInOut'
      },
      light: {
        main: { intensity: 1.2, shadow: false, alpha: 40, beta: 10 },
        ambient: { intensity: 0.7 }
      },
      groundPlane: {
        show: false
      },
      itemStyle: {
        color: '#0d2a50',
        borderColor: 'rgba(0, 180, 220, 0.35)',
        borderWidth: 1
      },
      emphasis: {
        itemStyle: {
          color: '#1a6090',
          borderColor: '#00d4ff',
          borderWidth: 2
        }
      },
      label: {
        show: true,
        color: 'rgba(200, 220, 240, 0.65)',
        fontSize: 8
      }
    },
    {
      type: 'scatter3D',
      coordinateSystem: 'geo3D',
      data: scatterData.value,
      symbol: 'circle',
      symbolSize: 5,
      itemStyle: { color: '#00d4ff' },
      zlevel: 1
    }
  ]
}))

// ========== 广东省视图 ==========

const cityMapData = computed(() => {
  const activeName = selectedCity.value || cityCarouselCity.value
  return guangdongCities.map(city => {
    const isActive = city.name === activeName
    return {
      name: city.name,
      value: city.activeSites,
      itemStyle: {
        color: isActive ? '#1a6090' : '#0d2a50',
        borderColor: isActive ? '#00d4ff' : 'rgba(0, 180, 220, 0.35)',
        borderWidth: isActive ? 2 : 1,
        opacity: isActive ? 1 : (selectedCity.value ? 0.18 : 0.68)
      }
    }
  })
})

const cityViewDistance = computed(() => {
  return GD_DEFAULT_DISTANCE
})


const guangdongChartOption = computed(() => ({
  backgroundColor: 'transparent',

  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(2, 11, 22, 0.9)',
    borderColor: 'rgba(0, 212, 255, 0.4)',
    textStyle: { color: '#e0e6ed', fontSize: 13 },
    formatter: (params) => {
      if (params.seriesIndex !== 0) return ''
      const city = guangdongCities.find(c => c.name === params.name)
      if (!city) return `<strong>${params.name}</strong>`
      return `<div style="padding:4px 8px">
        <strong style="font-size:14px">${city.name}</strong><br/>
        <span style="color:#00d4ff">活跃站点：</span>${city.activeSites}<br/>
        <span style="color:#00d4ff">上线站点：</span>${city.onlineSites}<br/>
        <span style="color:#00d4ff">订单数：</span>${city.orderCount.toLocaleString()}<br/>
        <span style="color:#00d4ff">订单金额：</span>¥${city.orderAmount.toLocaleString()}
      </div>`
    }
  },

  geo3D: {
    map: 'guangdong',
    show: false,
    viewControl: {
      rotateSensitivity: 0,
      panSensitivity: 0,
      zoomSensitivity: 0,
      autoRotate: false
    }
  },

  series: [
    {
      type: 'map3D',
      map: 'guangdong',
      data: cityMapData.value,
      regionHeight: 1.5,
      shading: 'color',
      viewControl: {
        projection: 'perspective',
        autoRotate: false,
        autoRotateSpeed: 2,
        distance: cityViewDistance.value,
        alpha: 75,
        beta: 0,
        center: [0, 0, 0],
        animation: true,
        animationDurationUpdate: 1200,
        animationEasingUpdate: 'cubicInOut'
      },
      light: {
        main: { intensity: 1.2, shadow: false, alpha: 40, beta: 10 },
        ambient: { intensity: 0.7 }
      },
      groundPlane: {
        show: false
      },
      itemStyle: {
        color: '#0d2a50',
        borderColor: 'rgba(0, 180, 220, 0.35)',
        borderWidth: 1
      },
      emphasis: {
        itemStyle: {
          color: '#1a6090',
          borderColor: '#00d4ff',
          borderWidth: 2
        }
      },
      label: {
        show: true,
        color: 'rgba(200, 220, 240, 0.65)',
        fontSize: 9
      }
    }
  ]
}))

const currentChartOption = computed(() => {
  return mapLevel.value === 'guangdong' ? guangdongChartOption.value : nationalChartOption.value
})

// ========== 地图交互 ==========

function onMapClick(params) {
  if (mapLevel.value === 'guangdong') {
    handleCityClick(params)
    return
  }
  handleNationalClick(params)
}

function handleNationalClick(params) {
  if (!params.data && !params.name) {
    if (selectedProvince.value) {
      returnToNational()
    }
    return
  }
  const name = params.name || params.data?.name
  if (!name) return
  if (selectedProvince.value === name) {
    returnToNational()
    return
  }
  mockData.selectProvince(name)
  stopCarousel()

  if (name === '广东省') {
    drillToGuangdong()
  }
}

function handleCityClick(params) {
  if (!params.name) {
    if (selectedCity.value) {
      selectedCity.value = null
      startCityCarousel()
    }
    return
  }
  const name = params.name
  if (selectedCity.value === name) {
    selectedCity.value = null
    startCityCarousel()
    return
  }
  selectedCity.value = name
  stopCityCarousel()
}

async function drillToGuangdong() {
  if (!guangdongLoaded.value) {
    guangdongLoading.value = true
    const result = await loadProvinceGeoJSON('440000', 'guangdong')
    if (!result.success) {
      mapError.value = result.error || '广东省地图加载失败'
      guangdongLoading.value = false
      return
    }
    guangdongLoaded.value = true
    guangdongLoading.value = false
  }
  stopCarousel()
  mapLevel.value = 'guangdong'
  startCityCarousel()
}

function returnToNational() {
  mockData.clearSelection()
}

const isHovering = ref(false)

function onMapHover() {
  isHovering.value = true
  if (mapLevel.value === 'guangdong') {
    stopCityCarousel()
  } else {
    stopCarousel()
  }
}
function onMapLeave() {
  isHovering.value = false
  if (mapLevel.value === 'guangdong') {
    if (!selectedCity.value) startCityCarousel()
  } else {
    if (!selectedProvince.value) startCarousel()
  }
}

// ========== 全国轮播 ==========

function startCarousel() {
  stopCarousel()
  const provinces = provinceNames.value
  if (provinces.length === 0) return

  const advance = () => {
    if (selectedProvince.value) return
    carouselProvince.value = provinces[currentCarouselIndex]
    currentCarouselIndex = (currentCarouselIndex + 1) % provinces.length
  }

  advance()
  carouselTimer = setInterval(advance, 3000)
}

function stopCarousel() {
  if (carouselTimer) { clearInterval(carouselTimer); carouselTimer = null }
  carouselProvince.value = null
}

// ========== 广东省城市轮播 ==========

function startCityCarousel() {
  stopCityCarousel()
  const cities = guangdongCities.map(c => c.name)
  if (cities.length === 0) return

  const advance = () => {
    if (selectedCity.value) return
    cityCarouselCity.value = cities[cityCarouselIndex]
    cityCarouselIndex = (cityCarouselIndex + 1) % cities.length
  }

  advance()
  cityCarouselTimer = setInterval(advance, 3000)
}

function stopCityCarousel() {
  if (cityCarouselTimer) { clearInterval(cityCarouselTimer); cityCarouselTimer = null }
  cityCarouselCity.value = null
}

// ========== 边界呼吸（仅全国视图） ==========

function startBorderBreathe() {
  stopBorderBreathe()
  let phase = 0
  breatheTimer = setInterval(() => {
    if (isHovering.value || selectedProvince.value || !chartRef.value) return
    if (mapLevel.value !== 'country') return
    phase += 0.03
    const alpha = 0.25 + 0.2 * (0.5 + 0.5 * Math.sin(phase))
    chartRef.value.setOption({
      series: [{
        itemStyle: { borderColor: `rgba(0, 180, 220, ${alpha})` }
      }]
    })
  }, 150)
}

function stopBorderBreathe() {
  if (breatheTimer) { clearInterval(breatheTimer); breatheTimer = null }
}

// ========== 地图加载 ==========

async function loadMap() {
  loading.value = true
  mapError.value = null
  await ensureEchartsGL()
  const result = await loadChinaGeoJSON()
  if (!result.success) {
    mapError.value = result.error
    loading.value = false
    return
  }
  loading.value = false
}

// ========== 监听器 ==========

watch(selectedProvince, (val) => {
  if (val) {
    stopCarousel()
    return
  }

  if (mapLevel.value === 'guangdong') {
    mapLevel.value = 'country'
    selectedCity.value = null
    stopCityCarousel()
  }

  startCarousel()
})

onMounted(() => {
  loadMap()
  checkReadyTimer = setInterval(() => {
    if (chartRef.value && !loading.value) {
      clearInterval(checkReadyTimer)
      checkReadyTimer = null
      startCarousel()
    }
  }, 200)
})

onUnmounted(() => {
  stopCarousel()
  stopBorderBreathe()
  stopCityCarousel()
  if (checkReadyTimer) { clearInterval(checkReadyTimer); checkReadyTimer = null }
})
</script>

<style scoped>
.china-map-3d-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.china-map-3d-chart {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.china-map-3d-chart :deep(canvas) {
  cursor: pointer;
}

/* 广东省视图返回全国按钮 */
.drill-back-btn {
  position: absolute;
  top: 8px;
  left: 12px;
  z-index: 3;
  padding: 5px 12px;
  font-size: 12px;
  font-family: 'Orbitron', 'Consolas', 'Monaco', monospace;
  color: #00d4ff;
  background: rgba(2, 11, 22, 0.7);
  border: 1px solid rgba(0, 212, 255, 0.4);
  border-radius: 4px;
  cursor: pointer;
  text-shadow: 0 0 6px #00d4ff;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.15);
  transition: all 0.25s ease;
  letter-spacing: 1px;
}

.drill-back-btn:hover {
  border-color: #00d4ff;
  box-shadow: 0 0 18px rgba(0, 212, 255, 0.35), inset 0 0 10px rgba(0, 212, 255, 0.08);
}
</style>
