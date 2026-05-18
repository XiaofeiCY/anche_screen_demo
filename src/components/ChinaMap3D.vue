<template>
  <div class="china-map-3d-container">
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
      :echarts="echarts"
      @click="onMapClick"
      @zr:mouseover="onMapHover"
      @zr:mouseout="onMapLeave"
    />

    <!-- 返回全国按钮（省份选中时显示） -->
    <button
      v-if="selectedProvince"
      class="return-btn"
      @click="returnToNational"
    >
      ← 返回全国
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject, watch } from 'vue'
import * as echarts from 'echarts'
import 'echarts-gl'
import VChart from 'vue-echarts'
import { loadChinaGeoJSON } from '../utils/geoJSONLoader.js'
import SkeletonLoader from './SkeletonLoader.vue'
import ErrorDisplay from './ErrorDisplay.vue'
import MapNebula from './MapNebula.vue'

const mockData = inject('mockData')
const chartRef = ref(null)
const loading = ref(true)
const mapError = ref(null)
const borderAlpha = ref(0.35)
let carouselTimer = null
let currentCarouselIndex = 0
let breatheTimer = null

const hasError = computed(() => !!mapError.value)
const errorMsg = computed(() => mapError.value || '地图加载失败')

const provinceStats = computed(() => mockData.provinceStats.value || [])
const selectedProvince = computed(() => mockData.selectedProvince.value)

const CHINA_CENTER = [104.5, 35.5]
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

const mapData = computed(() =>
  provinceStats.value
    .filter(p => p.activeSites > 0)
    .map(p => ({
      name: p.name,
      value: p.activeSites,
      activeSites: p.activeSites,
      onlineSites: p.onlineSites
    }))
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

const geoRegions = computed(() => {
  if (!selectedProvince.value) return []
  return provinceStats.value
    .filter(p => p.activeSites > 0)
    .map(p => ({
      name: p.name,
      height: p.name === selectedProvince.value ? 14 : 1,
      itemStyle: {
        opacity: p.name === selectedProvince.value ? 1 : 0.18
      }
    }))
})

const viewCenter = computed(() => {
  if (selectedProvince.value && PROVINCE_CENTERS[selectedProvince.value]) {
    return PROVINCE_CENTERS[selectedProvince.value]
  }
  return CHINA_CENTER
})

const viewDistance = computed(() => {
  return selectedProvince.value ? DRILL_DISTANCE : DEFAULT_DISTANCE
})

const chartOption = computed(() => {
  // 暂时最简配置：只用 geo3D 渲染基础地图
  return {
    backgroundColor: 'transparent',

    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(2, 11, 22, 0.9)',
      borderColor: 'rgba(0, 212, 255, 0.4)',
      textStyle: { color: '#e0e6ed', fontSize: 13 }
    },

    geo3D: {
      map: 'china',
      regionHeight: 2,
      shading: 'color',
      viewControl: {
        projection: 'perspective',
        autoRotate: !selectedProvince.value,
        autoRotateSpeed: 6,
        distance: viewDistance.value,
        alpha: 35,
        beta: 0,
        center: viewCenter.value,
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
        areaColor: '#0d2a50',
        borderColor: `rgba(0, 180, 220, ${borderAlpha.value})`,
        borderWidth: 1
      },
      emphasis: {
        itemStyle: {
          areaColor: '#1a6090',
          borderColor: '#00d4ff',
          borderWidth: 2
        }
      },
      label: {
        show: true,
        color: 'rgba(200, 220, 240, 0.65)',
        fontSize: 10
      },
      regions: geoRegions.value
    },

    series: [
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
  }
})

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

function onMapHover() { stopCarousel() }
function onMapLeave() {
  if (!selectedProvince.value) startCarousel()
}

// 轮播高亮（geo3D 用 dispatchAction 模拟）
function startCarousel() {
  stopCarousel()
  const provinces = provinceNames.value
  if (provinces.length === 0) return

  carouselTimer = setInterval(() => {
    if (!chartRef.value || selectedProvince.value) return
    // geo3D 的 highlight/downplay 通过 componentType 触发
    if (currentCarouselIndex > 0) {
      chartRef.value.dispatchAction({
        type: 'downplay',
        componentType: 'geo3D',
        name: provinces[currentCarouselIndex - 1]
      })
    }
    chartRef.value.dispatchAction({
      type: 'highlight',
      componentType: 'geo3D',
      name: provinces[currentCarouselIndex]
    })
    currentCarouselIndex = (currentCarouselIndex + 1) % provinces.length
  }, 3000)
}

function stopCarousel() {
  if (carouselTimer) { clearInterval(carouselTimer); carouselTimer = null }
}

// 边界呼吸辉光
function startBorderBreathe() {
  stopBorderBreathe()
  let phase = 0
  breatheTimer = setInterval(() => {
    phase += 0.03
    borderAlpha.value = 0.25 + 0.2 * (0.5 + 0.5 * Math.sin(phase))
    if (chartRef.value) {
      chartRef.value.setOption({
        geo3D: {
          itemStyle: { borderColor: `rgba(0, 180, 220, ${borderAlpha.value})` }
        }
      })
    }
  }, 50)
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

.return-btn {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 2;
  padding: 6px 16px;
  font-size: 13px;
  font-family: 'Orbitron', 'Consolas', 'Monaco', monospace;
  color: #00d4ff;
  background: rgba(2, 11, 22, 0.85);
  border: 1px solid rgba(0, 212, 255, 0.5);
  border-radius: 4px;
  cursor: pointer;
  text-shadow: 0 0 6px #00d4ff;
  box-shadow: 0 0 12px rgba(0, 212, 255, 0.2), inset 0 0 8px rgba(0, 212, 255, 0.05);
  transition: all 0.3s ease;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.return-btn:hover {
  border-color: #00d4ff;
  box-shadow: 0 0 20px rgba(0, 212, 255, 0.4), inset 0 0 12px rgba(0, 212, 255, 0.1);
  text-shadow: 0 0 12px #00d4ff;
}
</style>
