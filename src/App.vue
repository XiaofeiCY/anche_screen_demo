<template>
  <DashboardLayout />
</template>

<script setup>
import { provide } from 'vue'
import DashboardLayout from './components/DashboardLayout.vue'
import { useMockData } from './composables/useMockData.js'

const mockData = useMockData()
provide('mockData', mockData)
</script>

<style>
html, body, #app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
  overflow: hidden;
  background: var(--bg-primary);
}
</style>
