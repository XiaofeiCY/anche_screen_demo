<template>
  <canvas ref="nebulaCanvas" class="map-nebula-canvas" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const nebulaCanvas = ref(null)
let rafId = null
let dustParticles = []
let flowParticles = []
let resizeObserver = null
const DUST_COUNT = 80
const FLOW_COUNT = 15

class DustParticle {
  constructor(w, h) {
    this.x = Math.random() * w
    this.y = Math.random() * h
    this.vx = (Math.random() - 0.5) * 0.15
    this.vy = (Math.random() - 0.5) * 0.15
    this.radius = Math.random() * 1.2 + 0.3
    this.opacity = Math.random() * 0.5 + 0.15
    this.twinkleSpeed = Math.random() * 0.02 + 0.005
    this.twinklePhase = Math.random() * Math.PI * 2
  }

  update(w, h) {
    this.x += this.vx
    this.y += this.vy
    if (this.x < -10) this.x = w + 10
    if (this.x > w + 10) this.x = -10
    if (this.y < -10) this.y = h + 10
    if (this.y > h + 10) this.y = -10
  }

  draw(ctx, time) {
    const twinkle = 0.5 + 0.5 * Math.sin(time * this.twinkleSpeed + this.twinklePhase)
    const alpha = this.opacity * twinkle
    // 发光光晕
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius * 4)
    gradient.addColorStop(0, `rgba(0, 212, 255, ${alpha})`)
    gradient.addColorStop(0.3, `rgba(0, 180, 240, ${alpha * 0.6})`)
    gradient.addColorStop(1, 'rgba(0, 212, 255, 0)')
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius * 4, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()
  }
}

class FlowParticle {
  constructor(w, h) {
    this.reset(w, h)
  }

  reset(w, h) {
    this.x = Math.random() * w
    this.y = Math.random() * h
    this.trail = []
    this.maxTrail = 12
    this.vx = (Math.random() - 0.5) * 0.6
    this.vy = (Math.random() - 0.5) * 0.4 - 0.15 // slight upward drift
    this.life = 0
    this.maxLife = 300 + Math.random() * 500
  }

  update(w, h) {
    this.trail.unshift({ x: this.x, y: this.y })
    if (this.trail.length > this.maxTrail) this.trail.pop()

    this.x += this.vx
    this.y += this.vy
    this.life++

    if (this.x < -20 || this.x > w + 20 || this.y < -20 || this.y > h + 20 || this.life > this.maxLife) {
      this.reset(w, h)
    }
  }

  draw(ctx) {
    if (this.trail.length < 2) return
    for (let i = 0; i < this.trail.length - 1; i++) {
      const alpha = (1 - i / this.trail.length) * 0.3
      ctx.beginPath()
      ctx.moveTo(this.trail[i].x, this.trail[i].y)
      ctx.lineTo(this.trail[i + 1].x, this.trail[i + 1].y)
      ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`
      ctx.lineWidth = 1
      ctx.stroke()
    }
  }
}

function init() {
  const canvas = nebulaCanvas.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  const resize = () => {
    const rect = canvas.parentElement.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height
    // Reset particles on resize
    dustParticles = Array.from({ length: DUST_COUNT }, () => new DustParticle(canvas.width, canvas.height))
    flowParticles = Array.from({ length: FLOW_COUNT }, () => new FlowParticle(canvas.width, canvas.height))
  }
  resize()
  resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(canvas.parentElement)

  let startTime = performance.now()
  function animate(now) {
    const elapsed = now - startTime
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw connection lines between nearby dust particles
    for (let i = 0; i < dustParticles.length; i++) {
      for (let j = i + 1; j < dustParticles.length; j++) {
        const dx = dustParticles[i].x - dustParticles[j].x
        const dy = dustParticles[i].y - dustParticles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 80) {
          const alpha = 0.06 * (1 - dist / 80)
          ctx.beginPath()
          ctx.moveTo(dustParticles[i].x, dustParticles[i].y)
          ctx.lineTo(dustParticles[j].x, dustParticles[j].y)
          ctx.strokeStyle = `rgba(0, 212, 255, ${alpha})`
          ctx.lineWidth = 0.4
          ctx.stroke()
        }
      }
    }

    dustParticles.forEach(p => { p.update(canvas.width, canvas.height); p.draw(ctx, elapsed) })
    flowParticles.forEach(p => { p.update(canvas.width, canvas.height); p.draw(ctx) })

    rafId = requestAnimationFrame(animate)
  }
  rafId = requestAnimationFrame(animate)
}

onMounted(() => init())

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  if (resizeObserver) resizeObserver.disconnect()
  dustParticles = []
  flowParticles = []
})
</script>

<style scoped>
.map-nebula-canvas {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
</style>
