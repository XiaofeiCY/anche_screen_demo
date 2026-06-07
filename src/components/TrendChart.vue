<template>
  <div class="trend-chart-container">
    <SkeletonLoader v-if="loading" type="chart" />
    <ErrorDisplay v-else-if="hasError" :message="errorMsg" @retry="onRetry" />
    <div v-else-if="isEmpty" class="empty-state">暂无趋势数据</div>
    <v-chart v-else class="trend-chart" :option="chartOption" :autoresize="true" />
  </div>
</template>

<script setup>
import { computed, inject } from 'vue'
import VChart from 'vue-echarts'
import SkeletonLoader from './SkeletonLoader.vue'
import ErrorDisplay from './ErrorDisplay.vue'

const mockData = inject('mockData')

const loading = computed(() => mockData.loading.value)
const hasError = computed(() => !!mockData.trendError.value)
const errorMsg = computed(() => mockData.trendError.value || '趋势数据加载失败')
const isEmpty = computed(() => !mockData.trendData.value)

const chartOption = computed(() => {
  const data = mockData.trendData.value
  if (!data) return {}

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(2, 8, 15, 0.92)',
      borderColor: 'rgba(101, 232, 255, 0.36)',
      textStyle: { color: '#e0e6ed', fontSize: 12 },
      axisPointer: {
        type: 'line',
        lineStyle: { color: 'rgba(255, 184, 77, 0.48)', width: 1 }
      }
    },
    legend: {
      data: ['订单金额', '订单量'],
      top: 2,
      right: 10,
      itemWidth: 16,
      itemHeight: 7,
      textStyle: { color: '#8fa7ba', fontSize: 11 }
    },
    animation: true,
    animationDuration: 800,
    animationEasing: 'cubicOut',
    grid: { left: 48, right: 48, top: 34, bottom: 34 },
    xAxis: {
      type: 'category',
      data: data.categories,
      axisLine: { lineStyle: { color: 'rgba(101, 232, 255, 0.12)' } },
      axisLabel: { color: '#8fa7ba', fontSize: 10, margin: 10 },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: '金额(万元)',
        nameLocation: 'middle',
        nameGap: 36,
        nameTextStyle: { color: '#8fa7ba', fontSize: 10 },
        axisLabel: { color: '#8fa7ba', fontSize: 10, formatter: (v) => (v / 10000).toFixed(0) },
        splitLine: { lineStyle: { color: 'rgba(101, 232, 255, 0.07)', type: 'dashed' } }
      },
      {
        type: 'value',
        name: '订单量(单)',
        nameLocation: 'middle',
        nameGap: 36,
        nameTextStyle: { color: '#8fa7ba', fontSize: 10 },
        axisLabel: { color: '#8fa7ba', fontSize: 10 },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '订单金额',
        type: 'bar',
        data: data.orderAmount,
        itemStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(255, 184, 77, 0.92)' },
              { offset: 0.45, color: 'rgba(101, 232, 255, 0.68)' },
              { offset: 1, color: 'rgba(36, 120, 255, 0.26)' }
            ]
          },
          borderRadius: [3, 3, 0, 0]
        },
        emphasis: {
          itemStyle: { color: '#ffb84d', shadowBlur: 18, shadowColor: 'rgba(255, 184, 77, 0.52)' },
          focus: 'series'
        },
        barMaxWidth: 20,
        yAxisIndex: 0
      },
      {
        name: '订单量',
        type: 'line',
        data: data.orderCount,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#65e8ff', width: 2.4, shadowBlur: 8, shadowColor: 'rgba(101,232,255,0.46)' },
        itemStyle: { color: '#65e8ff', borderColor: '#fff', borderWidth: 1 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(101, 232, 255, 0.24)' },
              { offset: 1, color: 'rgba(36, 120, 255, 0.02)' }
            ]
          }
        },
        emphasis: { focus: 'series' },
        yAxisIndex: 1
      }
    ]
  }
})

function onRetry() { mockData.retryTrend() }
</script>

<style scoped>
.trend-chart-container { width: 100%; height: 100%; position: relative; }
.trend-chart { width: 100%; height: 100%; }
.empty-state {
  display: flex; align-items: center; justify-content: center;
  height: 100%; color: var(--text-secondary); font-size: 13px;
}
</style>
