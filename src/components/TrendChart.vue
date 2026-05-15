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
      backgroundColor: 'rgba(2, 11, 22, 0.85)',
      borderColor: 'rgba(0, 212, 255, 0.4)',
      textStyle: { color: '#e0e6ed', fontSize: 12 },
      axisPointer: { type: 'cross', crossStyle: { color: 'rgba(0, 212, 255, 0.5)' } }
    },
    legend: {
      data: ['订单金额', '订单量'],
      top: 2,
      textStyle: { color: '#7a8fa0', fontSize: 11 }
    },
    animation: true,
    animationDuration: 800,
    animationEasing: 'cubicOut',
    grid: { left: 52, right: 52, top: 30, bottom: 40 },
    xAxis: {
      type: 'category',
      data: data.categories,
      axisLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.15)' } },
      axisLabel: { color: '#7a8fa0', fontSize: 10, margin: 10 },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: '金额(万元)',
        nameLocation: 'middle',
        nameGap: 36,
        nameTextStyle: { color: '#7a8fa0', fontSize: 10 },
        axisLabel: { color: '#7a8fa0', fontSize: 10, formatter: (v) => (v / 10000).toFixed(0) },
        splitLine: { lineStyle: { color: 'rgba(0, 212, 255, 0.06)' } }
      },
      {
        type: 'value',
        name: '订单量(单)',
        nameLocation: 'middle',
        nameGap: 36,
        nameTextStyle: { color: '#7a8fa0', fontSize: 10 },
        axisLabel: { color: '#7a8fa0', fontSize: 10 },
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
              { offset: 0, color: 'rgba(0, 212, 255, 0.9)' },
              { offset: 1, color: 'rgba(10, 110, 255, 0.4)' }
            ]
          },
          borderRadius: [3, 3, 0, 0]
        },
        emphasis: {
          itemStyle: { color: '#00d4ff', shadowBlur: 12, shadowColor: 'rgba(0, 212, 255, 0.6)' },
          focus: 'series'
        },
        barMaxWidth: 24,
        yAxisIndex: 0
      },
      {
        name: '订单量',
        type: 'line',
        data: data.orderCount,
        smooth: true,
        symbol: 'circle',
        symbolSize: 6,
        lineStyle: { color: '#00d4ff', width: 2, shadowBlur: 6, shadowColor: 'rgba(0,212,255,0.4)' },
        itemStyle: { color: '#00d4ff', borderColor: '#fff', borderWidth: 1 },
        areaStyle: {
          color: {
            type: 'linear', x: 0, y: 0, x2: 0, y2: 1,
            colorStops: [
              { offset: 0, color: 'rgba(0, 212, 255, 0.2)' },
              { offset: 1, color: 'rgba(0, 212, 255, 0.02)' }
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
