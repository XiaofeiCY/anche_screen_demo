<template>
  <div class="trend-chart-container">
    <!-- Loading -->
    <SkeletonLoader v-if="loading" type="chart" />

    <!-- Error -->
    <ErrorDisplay
      v-else-if="hasError"
      :message="errorMsg"
      @retry="onRetry"
    />

    <!-- Empty -->
    <div v-else-if="isEmpty" class="empty-state">暂无趋势数据</div>

    <!-- Normal -->
    <v-chart
      v-else
      class="trend-chart"
      :option="chartOption"
      :autoresize="true"
    />
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
      backgroundColor: 'rgba(8, 26, 46, 0.9)',
      borderColor: 'rgba(77, 128, 186, 0.6)',
      textStyle: { color: '#e0e6ed', fontSize: 12 },
      axisPointer: {
        type: 'cross',
        crossStyle: { color: '#8899aa' }
      }
    },
    legend: {
      data: ['订单金额', '订单量'],
      top: 0,
      textStyle: { color: '#8899aa', fontSize: 11 }
    },
    animation: true,
    animationDuration: 800,
    animationEasing: 'cubicOut',
    grid: {
      left: 52,
      right: 52,
      top: 30,
      bottom: 40
    },
    xAxis: {
      type: 'category',
      data: data.categories,
      axisLine: { lineStyle: { color: 'rgba(77, 128, 186, 0.4)' } },
      axisLabel: { color: '#8899aa', fontSize: 10, margin: 10 },
      axisTick: { show: false }
    },
    yAxis: [
      {
        type: 'value',
        name: '金额(万元)',
        nameLocation: 'middle',
        nameGap: 36,
        nameTextStyle: { color: '#8899aa', fontSize: 10 },
        axisLabel: {
          color: '#8899aa',
          fontSize: 10,
          formatter: (v) => (v / 10000).toFixed(0)
        },
        splitLine: { lineStyle: { color: 'rgba(77, 128, 186, 0.15)' } }
      },
      {
        type: 'value',
        name: '订单量(单)',
        nameLocation: 'middle',
        nameGap: 36,
        nameTextStyle: { color: '#8899aa', fontSize: 10 },
        axisLabel: { color: '#8899aa', fontSize: 10 },
        splitLine: { show: false }
      }
    ],
    series: [
      {
        name: '订单金额',
        type: 'bar',
        data: data.orderAmount,
        itemStyle: {
          color: 'rgba(29, 112, 224, 0.8)',
          borderRadius: [3, 3, 0, 0]
        },
        emphasis: {
          itemStyle: { color: '#4fc3f7' },
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
        symbolSize: 5,
        lineStyle: { color: '#4fc3f7', width: 2 },
        itemStyle: { color: '#4fc3f7' },
        emphasis: { focus: 'series' },
        yAxisIndex: 1
      }
    ]
  }
})

function onRetry() {
  mockData.retryTrend()
}
</script>

<style scoped>
.trend-chart-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.trend-chart {
  width: 100%;
  height: 100%;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: var(--text-secondary);
  font-size: 13px;
}
</style>
