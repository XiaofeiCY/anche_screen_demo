<template>
  <div class="china-map-container">
    <!-- Loading -->
    <template v-if="loading">
      <SkeletonLoader type="map" />
    </template>

    <!-- Error -->
    <template v-else-if="hasError">
      <ErrorDisplay :message="errorMsg" @retry="loadMap" />
    </template>

    <!-- Map -->
    <v-chart
      v-else
      ref="chartRef"
      class="china-map-chart"
      :option="chartOption"
      :autoresize="true"
      @click="onMapClick"
      @zr:mouseover="onMapHover"
      @zr:mouseout="onMapLeave"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, inject } from 'vue'
import VChart from 'vue-echarts'
import { loadChinaGeoJSON } from '../utils/geoJSONLoader.js'
import SkeletonLoader from './SkeletonLoader.vue'
import ErrorDisplay from './ErrorDisplay.vue'

const mockData = inject('mockData')
const chartRef = ref(null)
const loading = ref(true)
const mapError = ref(null)
let carouselTimer = null
let currentCarouselIndex = 0

const hasError = computed(() => !!mapError.value)
const errorMsg = computed(() => mapError.value || '地图加载失败')

const provinceStats = computed(() => mockData.provinceStats.value || [])

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
      borderColor: 'rgba(0, 180, 220, 0.4)',
      borderWidth: 1,
      shadowColor: 'rgba(0, 212, 255, 0.25)',
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
        borderColor: 'rgba(0, 180, 220, 0.5)',
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
        number: 3,
        period: 5,
        scale: 3,
        brushType: 'stroke'
      },
      symbol: 'circle',
      symbolSize: 6,
      itemStyle: {
        color: '#00d4ff',
        shadowBlur: 12,
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
        period: 6,
        trailLength: 0.2,
        symbol: 'arrow',
        symbolSize: 6
      },
      lineStyle: {
        color: '#00d4ff',
        width: 1.5,
        curveness: 0.3,
        opacity: 0.6
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
  if (!params.data) {
    chartRef.value?.dispatchAction({ type: 'unselect', seriesIndex: 0 })
  }
}

function onMapHover() { stopCarousel() }
function onMapLeave() { startCarousel() }

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
})

onUnmounted(() => {
  stopCarousel()
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
}

.china-map-chart :deep(canvas) {
  cursor: pointer;
}
</style>
