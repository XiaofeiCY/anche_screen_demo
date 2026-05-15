<template>
  <div class="skeleton" :class="[`skeleton--${type}`]">
    <!-- Card skeleton -->
    <template v-if="type === 'card'">
      <div class="sk-line sk-line--title" />
      <div class="sk-line sk-line--value" />
    </template>

    <!-- Chart skeleton -->
    <template v-else-if="type === 'chart'">
      <div class="sk-chart-area">
        <div class="sk-bar" v-for="i in 7" :key="i" :style="{ height: (30 + Math.random() * 60) + '%' }" />
      </div>
      <div class="sk-line sk-line--xaxis" />
    </template>

    <!-- Table skeleton -->
    <template v-else-if="type === 'table'">
      <div class="sk-row" v-for="i in rows" :key="i">
        <div class="sk-cell" v-for="j in cols" :key="j" :style="{ width: (60 + Math.random() * 30) + '%' }" />
      </div>
    </template>

    <!-- Map skeleton -->
    <template v-else-if="type === 'map'">
      <div class="sk-map-placeholder">
        <div class="sk-map-icon" />
        <div class="sk-line sk-line--map-text" />
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  type: {
    type: String,
    default: 'card',
    validator: v => ['card', 'chart', 'table', 'map'].includes(v)
  },
  rows: { type: Number, default: 5 },
  cols: { type: Number, default: 4 }
})
</script>

<style scoped>
.skeleton {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
}

.sk-line {
  background: rgba(77, 128, 186, 0.2);
  border-radius: 3px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

.sk-line--title { height: 14px; width: 60%; }
.sk-line--value { height: 24px; width: 80%; margin-top: 4px; }
.sk-line--xaxis { height: 12px; width: 100%; margin-top: auto; }
.sk-line--map-text { height: 14px; width: 40%; margin: 8px auto 0; }

/* Chart skeleton */
.sk-chart-area {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 8px 0;
}
.sk-bar {
  flex: 1;
  background: rgba(77, 128, 186, 0.2);
  border-radius: 2px 2px 0 0;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

/* Table skeleton */
.sk-row {
  display: flex;
  gap: 8px;
}
.sk-cell {
  height: 12px;
  background: rgba(77, 128, 186, 0.2);
  border-radius: 2px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}

/* Map skeleton */
.skeleton--map {
  align-items: center;
  justify-content: center;
}
.sk-map-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}
.sk-map-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(77, 128, 186, 0.15);
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
</style>
