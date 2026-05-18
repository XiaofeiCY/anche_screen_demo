<template>
  <div
    class="china-map-3d-container"
    @mouseenter="onMapHover"
    @mouseleave="onMapLeave"
  >
    <!-- 星云粒子背景层 -->
    <MapNebula v-if="!loading && !hasError" />

    <!-- Loading -->
    <template v-if="loading">
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
      class="china-map-3d-chart"
      :option="chartOption"
      :autoresize="true"
      @click="onMapClick"
    />

    <!-- 省份详情面板 -->
    <ProvinceDetail :province="detailProvince" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject, watch } from 'vue'
import 'echarts-gl'
import VChart from 'vue-echarts'
import { loadChinaGeoJSON } from '../utils/geoJSONLoader.js'
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

const hasError = computed(() => !!mapError.value)
const errorMsg = computed(() => mapError.value || '地图加载失败')

const provinceStats = computed(() => mockData.provinceStats.value || [])
const selectedProvince = computed(() => mockData.selectedProvince.value)
const detailProvince = computed(() => {
  if (!selectedProvince.value || !provinceStats.value) return null
  return provinceStats.value.find(p => p.name === selectedProvince.value) || null
})

const DRILL_DISTANCE = 60
const DEFAULT_DISTANCE = 140

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

const scatterData = computed(() => {
  const top8 = [...provinceStats.value]
    .sort((a, b) => b.activeSites - a.activeSites)
    .slice(0, 8)
  return top8
    .filter(p => PROVINCE_CENTERS[p.name])
    .map(p => ({
      name: p.name,
      value: [...PROVINCE_CENTERS[p.name], p.activeSites]
    }))
})

const linesData = computed(() => {
  const top5 = [...provinceStats.value]
    .sort((a, b) => b.activeSites - a.activeSites)
    .slice(0, 5)
  const beijing = [116.40, 39.90]
  return top5
    .filter(p => PROVINCE_CENTERS[p.name])
    .map(p => ({
      coords: [PROVINCE_CENTERS[p.name], beijing]
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
        height: isActive ? 14 : 1,
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

const chartOption = computed(() => ({
  backgroundColor: 'transparent',

  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(2, 11, 22, 0.9)',
    borderColor: 'rgba(0, 212, 255, 0.4)',
    textStyle: { color: '#e0e6ed', fontSize: 13 }
  },

  // geo3D 仅作坐标系（不渲染视觉、不接管交互）
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
    // map3D 作为唯一视觉层 + 点击事件源 + 视图交互
    {
      type: 'map3D',
      map: 'china',
      data: map3DData.value,
      regionHeight: 2,
      shading: 'color',
      viewControl: {
        projection: 'perspective',
        autoRotate: !selectedProvince.value,
        autoRotateSpeed: 6,
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
        show: true,
        color: '#010a18'
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
        fontSize: 10
      }
    },
    {
      type: 'scatter3D',
      coordinateSystem: 'geo3D',
      data: scatterData.value,
      symbol: 'circle',
      symbolSize: 8,
      itemStyle: { color: '#00d4ff' },
      zlevel: 1
    },
    {
      type: 'lines3D',
      coordinateSystem: 'geo3D',
      polyline: false,
      blendMode: 'lighter',
      effect: {
        show: true,
        period: 4,
        trailWidth: 2,
        trailLength: 0.3,
        trailColor: '#00d4ff',
        trailOpacity: 0.6
      },
      lineStyle: {
        color: '#00d4ff',
        width: 1,
        opacity: 0.5
      },
      data: linesData.value,
      zlevel: 1
    }
  ]
}))

// 地图交互事件
function onMapClick(params) {
  if (!params.data && !params.name) {
    // 点击空白 → 返回全国
    if (selectedProvince.value) {
      returnToNational()
    }
    return
  }
  // geo3D 点击：params.name 是省份名
  const name = params.name || params.data?.name
  if (!name) return
  if (selectedProvince.value === name) {
    returnToNational()
    return
  }
  mockData.selectProvince(name)
  stopCarousel()
}

function returnToNational() {
  mockData.clearSelection()
  startCarousel()
}

const isHovering = ref(false)

function onMapHover() {
  isHovering.value = true
  stopCarousel()
}
function onMapLeave() {
  isHovering.value = false
  if (!selectedProvince.value) startCarousel()
}

// 轮播高亮通过 regions 响应式更新，避免 geo3D dispatchAction 在 GL 初始化期抛错
function startCarousel() {
  stopCarousel()
  const provinces = provinceNames.value
  if (provinces.length === 0) return

  const advanceCarousel = () => {
    if (selectedProvince.value) return
    carouselProvince.value = provinces[currentCarouselIndex]
    currentCarouselIndex = (currentCarouselIndex + 1) % provinces.length
  }

  advanceCarousel()
  carouselTimer = setInterval(advanceCarousel, 3000)
}

function stopCarousel() {
  if (carouselTimer) { clearInterval(carouselTimer); carouselTimer = null }
  carouselProvince.value = null
}

// 边界呼吸辉光 — 直接 setOption 局部更新，不参与 chartOption computed 反应链路
function startBorderBreathe() {
  stopBorderBreathe()
  let phase = 0
  breatheTimer = setInterval(() => {
    if (isHovering.value || selectedProvince.value || !chartRef.value) return
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

async function loadMap() {
  loading.value = true
  mapError.value = null
  const result = await loadChinaGeoJSON()
  if (!result.success) {
    mapError.value = result.error
    loading.value = false
    return
  }
  loading.value = false
}

// 监听省份选择变化，暂停/恢复轮播
watch(selectedProvince, (val) => {
  if (val) {
    stopCarousel()
  } else {
    startCarousel()
  }
})

onMounted(() => {
  loadMap()
  const checkReady = setInterval(() => {
    if (chartRef.value && !loading.value) {
      clearInterval(checkReady)
      startBorderBreathe()
      startCarousel()
    }
  }, 200)
})

onUnmounted(() => {
  stopCarousel()
  stopBorderBreathe()
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

</style>
