<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { PALIRO_INTRO_DURATION } from '../services/paliroFirstLaunch'

defineProps({ artwork: Object, label: String })
const emit = defineEmits(['complete'])
const leaving = ref(false)
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
let exitTimer
let finishTimer

function enterWelcome() {
  leaving.value = true
}

onMounted(() => {
  exitTimer = setTimeout(enterWelcome, reduced ? 250 : 2500)
  finishTimer = setTimeout(() => emit('complete'), reduced ? 650 : PALIRO_INTRO_DURATION)
})
onBeforeUnmount(() => {
  clearTimeout(exitTimer)
  clearTimeout(finishTimer)
})
</script>

<template>
  <section class="paliro-intro" :class="{ 'is-leaving': leaving, 'is-reduced': reduced }" role="status" :aria-label="label">
    <img alt="" class="paliro-intro-space" :src="artwork.src" fetchpriority="high" aria-hidden="true" />
    <div class="paliro-intro-logo-stage" aria-hidden="true">
      <span class="paliro-intro-logo-glow"></span>
      <img class="paliro-intro-logo" alt="" :src="artwork.logoSrc" :srcset="artwork.logoSrcset" fetchpriority="high" />
    </div>
  </section>
</template>

<style>
.paliro-intro { position: fixed; inset: 0; z-index: 10000; overflow: hidden; isolation: isolate; pointer-events: auto; background: #050a21; }
.paliro-intro-space { position: absolute; z-index: -1; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: .22; }
.paliro-intro-logo-stage { position: absolute; top: 33.75%; left: 50%; width: 18.6667vw; aspect-ratio: 1; transform: translate(-50%, -50%); animation: paliro-intro-logo-arrive 1.15s cubic-bezier(.16, 1, .3, 1) both; }
.paliro-intro-logo { position: relative; display: block; width: 100%; height: 100%; border-radius: 28.571%; object-fit: cover; filter: drop-shadow(0 0 20px rgba(121, 102, 255, .34)); }
.paliro-intro-logo-glow { position: absolute; inset: -24%; border-radius: 36%; background: radial-gradient(circle, rgba(99, 88, 255, .3), rgba(255, 65, 203, .12) 43%, transparent 70%); animation: paliro-intro-logo-glow 2s ease-in-out infinite alternate; }
.paliro-intro.is-leaving { opacity: 0; transform: scale(1.012); transition: opacity .62s ease, transform .72s cubic-bezier(.22, 1, .36, 1); }
@keyframes paliro-intro-logo-arrive { from { opacity: 0; transform: translateY(12px) scale(.78); } to { opacity: 1; transform: none; } }
@keyframes paliro-intro-logo-glow { from { opacity: .42; transform: scale(.82); } to { opacity: .9; transform: scale(1.08); } }
.paliro-intro.is-reduced * { animation: none; }
.paliro-intro.is-reduced.is-leaving { opacity: 0; transition: opacity .3s; }
@media (prefers-reduced-motion: reduce) { .paliro-intro * { animation: none !important; } }
</style>
