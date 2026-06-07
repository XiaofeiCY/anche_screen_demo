<template>
  <canvas ref="canvasRef" id="particles-canvas" />
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let rafId = null
let particles = []
let onResize = null
const PARTICLE_COUNT = 50

class Particle {
  constructor(w, h) {
    this.x = Math.random() * w
    this.y = Math.random() * h
    this.vx = (Math.random() - 0.5) * 0.4
    this.vy = (Math.random() - 0.5) * 0.4
    this.radius = Math.random() * 1.5 + 0.5
    this.opacity = Math.random() * 0.5 + 0.1
  }

  update(w, h) {
    this.x += this.vx
    this.y += this.vy
    if (this.x < 0) this.x = w
    if (this.x > w) this.x = 0
    if (this.y < 0) this.y = h
    if (this.y > h) this.y = 0
  }

  draw(ctx) {
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(101, 232, 255, ${this.opacity})`
    ctx.fill()
  }
}

function init() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  onResize = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  }
  onResize()
  window.addEventListener('resize', onResize)

  // 创建粒子
  particles = Array.from({ length: PARTICLE_COUNT },
    () => new Particle(canvas.width, canvas.height))

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // 更新 + 绘制粒子
    particles.forEach(p => {
      p.update(canvas.width, canvas.height)
      p.draw(ctx)
    })

    // 绘制粒子间连线（限定距离避免杂乱）
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x
        const dy = particles[i].y - particles[j].y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) {
          ctx.beginPath()
          ctx.moveTo(particles[i].x, particles[i].y)
          ctx.lineTo(particles[j].x, particles[j].y)
          ctx.strokeStyle = `rgba(101, 232, 255, ${0.08 * (1 - dist / 120)})`
          ctx.lineWidth = 0.5
          ctx.stroke()
        }
      }
    }

    rafId = requestAnimationFrame(animate)
  }

  animate()
}

onMounted(() => init())

onUnmounted(() => {
  if (rafId) cancelAnimationFrame(rafId)
  if (onResize) window.removeEventListener('resize', onResize)
  particles = []
})
</script>
