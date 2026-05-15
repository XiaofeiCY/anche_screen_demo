<template>
  <div class="china-map-container" ref="containerRef">
    <!-- Loading state -->
    <template v-if="loading">
      <SkeletonLoader type="map" />
    </template>

    <!-- Error state -->
    <template v-else-if="hasError">
      <ErrorDisplay :message="errorMsg" @retry="loadMap" />
    </template>

    <!-- Map -->
    <template v-else>
      <v-chart
        ref="chartRef"
        class="china-map-chart"
        :option="chartOption"
        :autoresize="true"
        @click="onMapClick"
      />
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, inject } from 'vue'
import VChart from 'vue-echarts'
import { loadChinaGeoJSON } from '../utils/geoJSONLoader.js'
import SkeletonLoader from './SkeletonLoader.vue'
import ErrorDisplay from './ErrorDisplay.vue'

const mockData = inject('mockData')

const loading = ref(true)
const mapError = ref(null)
const chartRef = ref(null)
const containerRef = ref(null)

const hasError = computed(() => !!mapError.value)
const errorMsg = computed(() => mapError.value || '地图加载失败')

const provinceStats = computed(() => mockData.provinceStats.value)

// 过滤掉无数据的省份（如台湾省=0）
const mapData = computed(() => {
  if (!provinceStats.value) return []
  return provinceStats.value
    .filter(p => p.activeSites > 0)
    .map(p => ({
      name: p.name,
      value: p.activeSites,
      activeSites: p.activeSites,
      onlineSites: p.onlineSites
    }))
})

const maxValue = computed(() => {
  if (mapData.value.length === 0) return 100
  return Math.max(...mapData.value.map(d => d.value))
})

const chartOption = computed(() => ({
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(8, 26, 46, 0.9)',
    borderColor: 'rgba(77, 128, 186, 0.6)',
    textStyle: { color: '#e0e6ed', fontSize: 13 },
    formatter: (params) => {
      if (!params.data) return ''
      const { name, activeSites, onlineSites } = params.data
      return `
        <div style="padding:4px 8px">
          <strong style="font-size:14px">${name || params.name}</strong><br/>
          <span style="color:#4fc3f7">活跃站点：</span>${activeSites ?? '--'}<br/>
          <span style="color:#4fc3f7">上线站点：</span>${onlineSites ?? '--'}
        </div>
      `
    }
  },
  visualMap: {
    min: 0,
    max: maxValue.value,
    left: 16,
    bottom: 16,
    inRange: { color: ['#0b3050', '#1c5fa8', '#4fc3f7'] },
    text: ['高', '低'],
    textStyle: { color: '#8899aa' },
    itemWidth: 10,
    itemHeight: 80
  },
  series: [{
    type: 'map',
    map: 'china',
    roam: true,
    selectedMode: 'single',
    scaleLimit: { min: 1, max: 5 },
    emphasis: {
      itemStyle: {
        areaColor: '#4fc3f7',
        borderColor: '#fff',
        borderWidth: 1.5,
        shadowBlur: 12,
        shadowColor: 'rgba(79, 195, 247, 0.5)'
      },
      label: { show: true, color: '#fff', fontSize: 12 }
    },
    select: {
      itemStyle: {
        areaColor: '#1d70e0',
        borderColor: '#fff',
        borderWidth: 2
      },
      label: { show: true, color: '#fff' }
    },
    itemStyle: {
      areaColor: '#1c3f76',
      borderColor: '#2a5a9a',
      borderWidth: 1
    },
    label: {
      show: true,
      color: '#ccc',
      fontSize: 9
    },
    data: mapData.value
  }]
}))

function onMapClick(params) {
  if (!params.data) {
    // 点击空白区域，取消选中
    if (chartRef.value) {
      chartRef.value.dispatchAction({ type: 'unselect', seriesIndex: 0 })
    }
  }
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

/* Show province cursor on map areas */
.china-map-chart :deep(canvas) {
  cursor: pointer;
}
</style>
