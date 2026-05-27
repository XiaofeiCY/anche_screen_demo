<template>
  <div
    class="china-map-container"
    @mouseenter="onMapHover"
    @mouseleave="onMapLeave"
  >
    <!-- 星云粒子背景层 — 渲染在 ECharts 下方 -->
    <MapNebula v-if="!loading && !hasError" />

    <!-- Loading -->
    <template v-if="loading">
      <SkeletonLoader type="map" />
    </template>

    <!-- Error -->
    <template v-else-if="hasError">
      <ErrorDisplay :message="errorMsg" @retry="loadMap" />
    </template>

    <!-- Map — 渲染在星云层上方 -->
    <v-chart
      v-else
      ref="chartRef"
      class="china-map-chart"
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
let carouselTimer = null
let currentCarouselIndex = 0
let breatheTimer = null
let checkReadyTimer = null

const hasError = computed(() => !!mapError.value)
const errorMsg = computed(() => mapError.value || '地图加载失败')

const provinceStats = computed(() => mockData.provinceStats.value || [])
const selectedProvince = computed(() => mockData.selectedProvince.value)
const detailProvince = computed(() => {
  if (!selectedProvince.value || !provinceStats.value) return null
  return provinceStats.value.find(p => p.name === selectedProvince.value) || null
})

// 地图数据
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

const maxValue = computed(() =>
  mapData.value.length ? Math.max(...mapData.value.map(d => d.value)) : 100
)

// 涟漪散点（TOP 8 省份）
const scatterData = computed(() => {
  const top8 = [...provinceStats.value]
    .sort((a, b) => b.activeSites - a.activeSites)
    .slice(0, 8)
  // 各省省会经纬度
  const coords = {
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
  }
  return top8.map(p => ({
    name: p.name,
    value: coords[p.name] || [116.4, 39.9]
  }))
})

// 飞线数据（TOP5 省份到北京/上海）
const linesData = computed(() => {
  const top5 = [...provinceStats.value]
    .sort((a, b) => b.activeSites - a.activeSites)
    .slice(0, 5)
  const hubCoords = {
    '广东省': [113.28, 23.13],
    '江苏省': [118.78, 32.06],
    '浙江省': [120.15, 30.28],
    '山东省': [117.0, 36.67],
    '河南省': [113.65, 34.76],
  }
  const beijing = [116.40, 39.90]
  return top5
    .filter(p => hubCoords[p.name])
    .map(p => ({
      coords: [hubCoords[p.name], beijing]
    }))
})

const chartOption = computed(() => ({
  backgroundColor: 'transparent',
  animation: true,
  animationDuration: 1000,
  animationEasing: 'cubicOut',

  // 悬浮提示
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(2, 11, 22, 0.9)',
    borderColor: 'rgba(0, 212, 255, 0.4)',
    textStyle: { color: '#e0e6ed', fontSize: 13 },
    formatter: (params) => {
      if (params.seriesType === 'effectScatter') {
        return `<strong>${params.name}</strong><br/><span style="color:#00d4ff">TOP省份 · 高活跃</span>`
      }
      if (params.seriesType === 'lines') return ''
      if (!params.data) return ''
      const { name, activeSites, onlineSites } = params.data
      return `<div style="padding:4px 8px">
        <strong style="font-size:14px">${name || params.name}</strong><br/>
        <span style="color:#00d4ff">活跃站点：</span>${activeSites ?? '--'}<br/>
        <span style="color:#00d4ff">上线站点：</span>${onlineSites ?? '--'}
      </div>`
    }
  },

  // 底层 geo（阴影投影，制造悬浮立体感）
  geo: {
    map: 'china',
    roam: true,
    scaleLimit: { min: 1, max: 5 },
    layoutCenter: ['50%', '50%'],
    layoutSize: '100%',
    itemStyle: {
      areaColor: '#020f1e',
      borderColor: `rgba(0, 180, 220, 0.35)`,
      borderWidth: 1,
      shadowColor: `rgba(0, 212, 255, 0.28)`,
      shadowOffsetX: 0,
      shadowOffsetY: 8,
      shadowBlur: 20
    },
    emphasis: { disabled: true },
    label: { show: false },
    regions: []
  },

  // 热力视觉映射
  visualMap: {
    min: 0,
    max: maxValue.value,
    left: 20,
    bottom: 20,
    inRange: { color: ['#0a1e3d', '#0a4a8a', '#00a8cc', '#00d4ff'] },
    text: ['高', '低'],
    textStyle: { color: '#7a8fa0' },
    itemWidth: 8,
    itemHeight: 70
  },

  series: [
    // 地图层
    {
      type: 'map',
      map: 'china',
      roam: true,
      selectedMode: 'single',
      scaleLimit: { min: 1, max: 5 },
      geoIndex: 0,
      itemStyle: {
        areaColor: '#0d2a50',
        borderColor: `rgba(0, 180, 220, 0.50)`,
        borderWidth: 1
      },
      emphasis: {
        itemStyle: {
          areaColor: '#1a6090',
          borderColor: '#00d4ff',
          borderWidth: 2,
          shadowBlur: 16,
          shadowColor: 'rgba(0, 212, 255, 0.5)'
        },
        label: { show: true, color: '#fff', fontSize: 12 }
      },
      select: {
        itemStyle: {
          areaColor: '#1a6090',
          borderColor: '#00d4ff',
          borderWidth: 2
        },
        label: { show: true, color: '#fff' }
      },
      label: {
        show: true,
        color: 'rgba(200, 220, 240, 0.7)',
        fontSize: 9
      },
      data: mapData.value
    },

    // 涟漪散点
    {
      type: 'effectScatter',
      coordinateSystem: 'geo',
      geoIndex: 0,
      rippleEffect: {
        number: 4,
        period: 6,
        scale: 4.5,
        brushType: 'stroke'
      },
      symbol: 'circle',
      symbolSize: 7,
      itemStyle: {
        color: '#00d4ff',
        shadowBlur: 18,
        shadowColor: '#00d4ff'
      },
      label: {
        show: true,
        position: 'right',
        color: '#00d4ff',
        fontSize: 9,
        formatter: '{b}'
      },
      data: scatterData.value,
      zlevel: 1
    },

    // 飞线
    {
      type: 'lines',
      coordinateSystem: 'geo',
      geoIndex: 0,
      effect: {
        show: true,
        period: 4,
        trailLength: 0.35,
        symbol: 'arrow',
        symbolSize: 5
      },
      lineStyle: {
        color: '#00d4ff',
        width: 1.2,
        curveness: 0.3,
        opacity: 0.55
      },
      data: linesData.value,
      zlevel: 1
    }
  ]
}))

// 省份自动轮播高亮
function startCarousel() {
  stopCarousel()
  const provinces = mapData.value.map(d => d.name)
  if (provinces.length === 0) return

  carouselTimer = setInterval(() => {
    if (!chartRef.value) return
    // 取消所有高亮
    chartRef.value.dispatchAction({ type: 'downplay', seriesIndex: 0 })
    // 高亮当前省份
    chartRef.value.dispatchAction({
      type: 'highlight',
      seriesIndex: 0,
      name: provinces[currentCarouselIndex]
    })
    currentCarouselIndex = (currentCarouselIndex + 1) % provinces.length
  }, 3000)
}

function stopCarousel() {
  if (carouselTimer) { clearInterval(carouselTimer); carouselTimer = null }
}

function onMapClick(params) {
  // 获取省份名
  const name = params.name || params.data?.name
  if (!name) {
    // 点击空白区域 → 返回全国
    if (selectedProvince.value) {
      mockData.clearSelection()
    }
    return
  }
  // 点击已选中省份 → 取消选中
  if (selectedProvince.value === name) {
    mockData.clearSelection()
    return
  }
  // 点击省份 → 选中/下钻
  mockData.selectProvince(name)
  stopCarousel()
}

const isHovering = ref(false)

function onMapHover() {
  isHovering.value = true
  if (!selectedProvince.value) stopCarousel()
}
function onMapLeave() {
  isHovering.value = false
  if (!selectedProvince.value) startCarousel()
}

// 同步 selectedProvince → ECharts 选中态
watch(selectedProvince, (name) => {
  if (!chartRef.value) return
  if (name) {
    chartRef.value.dispatchAction({ type: 'select', seriesIndex: 0, name })
  } else {
    chartRef.value.dispatchAction({ type: 'unselect', seriesIndex: 0 })
  }
})

function startBorderBreathe() {
  stopBorderBreathe()
  let phase = 0
  breatheTimer = setInterval(() => {
    if (isHovering.value || !chartRef.value) return
    phase += 0.03
    const alpha = 0.25 + 0.2 * (0.5 + 0.5 * Math.sin(phase))
    chartRef.value.setOption({
      geo: {
        itemStyle: { borderColor: `rgba(0, 180, 220, ${alpha})` }
      },
      series: [{
        itemStyle: { borderColor: `rgba(0, 180, 220, ${alpha + 0.15})` }
      }]
    })
  }, 100)
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

onMounted(() => {
  loadMap()
  checkReadyTimer = setInterval(() => {
    if (chartRef.value && !loading.value) {
      clearInterval(checkReadyTimer)
      checkReadyTimer = null
      startBorderBreathe()
      startCarousel()
    }
  }, 200)
})

onUnmounted(() => {
  stopCarousel()
  stopBorderBreathe()
  if (checkReadyTimer) { clearInterval(checkReadyTimer); checkReadyTimer = null }
})
</script>

<style scoped>
.china-map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.china-map-chart {
  width: 100%;
  height: 100%;
  position: relative;
  z-index: 1;
}

.china-map-chart :deep(canvas) {
  cursor: pointer;
}
</style>

