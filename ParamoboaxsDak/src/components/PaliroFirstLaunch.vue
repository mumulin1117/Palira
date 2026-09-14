<script setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { PALIRO_INTRO_DURATION } from '../services/paliroFirstLaunch'

defineProps({ title: String, copy: String })
const emit = defineEmits(['complete'])
const art = ref(null)
const leaving = ref(false)
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const stars = Array.from({ length: 14 }, (_, i) => ({
  x: `${50 + Math.cos(i * 2.399) * (27 + i % 3 * 7)}%`,
  y: `${44 + Math.sin(i * 2.399) * (23 + i % 4 * 5)}%`,
  delay: `${i * 45}ms`,
}))
let exitTimer
let finishTimer
let movement

function enterWelcome() {
  const target = document.querySelector('.paliro-welcome-art img')
  if (!reduced && target && art.value) {
    const from = art.value.getBoundingClientRect()
    const to = target.getBoundingClientRect()
    if (from.width && to.width) {
      movement = art.value.animate([
        { transform: 'translate(0, 0) scale(1)' },
        { transform: `translate(${to.x + to.width / 2 - from.x - from.width / 2}px, ${to.y + to.height / 2 - from.y - from.height / 2}px) scale(${to.width / from.width})` },
      ], { duration: 800, easing: 'cubic-bezier(.22, 1, .36, 1)', fill: 'forwards' })
    }
  }
  leaving.value = true
}

onMounted(() => {
  exitTimer = setTimeout(enterWelcome, reduced ? 250 : 2500)
  finishTimer = setTimeout(() => emit('complete'), reduced ? 650 : PALIRO_INTRO_DURATION)
})
onBeforeUnmount(() => {
  clearTimeout(exitTimer)
  clearTimeout(finishTimer)
  movement?.cancel()
})
</script>

<template>
  <section class="paliro-intro" :class="{ 'is-leaving': leaving, 'is-reduced': reduced }" role="status" :aria-label="title">
    <div class="paliro-intro-space" aria-hidden="true"></div>
    <div class="paliro-intro-glow" aria-hidden="true"></div>
    <div class="paliro-intro-stars" aria-hidden="true">
      <i v-for="(star, i) in stars" :key="i" :style="{ left: star.x, top: star.y, animationDelay: star.delay }"></i>
    </div>
    <div class="paliro-intro-stage" aria-hidden="true">
      <div class="paliro-intro-orbit"></div>
      <img ref="art" class="paliro-intro-art" alt="" src="/assets/paliro-welcome-hero@2x.png" fetchpriority="high" />
    </div>
    <div class="paliro-intro-copy"><span aria-hidden="true">✦</span><h1>{{ title }}</h1><p>{{ copy }}</p></div>
  </section>
</template>

<style>
.paliro-intro { position: fixed; inset: 0; z-index: 10000; overflow: hidden; isolation: isolate; pointer-events: auto; }
.paliro-intro-space { position: absolute; inset: 0; z-index: -2; background: #050b21 url('/assets/paliro-welcome-space-background@2x.png') center / cover no-repeat; }
.paliro-intro-glow { position: absolute; inset: 8% -20% 15%; z-index: -1; background: radial-gradient(ellipse at 50% 45%, #55dbf82b, #6d86f414 32%, transparent 60%); animation: paliro-intro-glow 2.5s ease-out both; }
.paliro-intro-stage { position: absolute; top: 38%; left: 50%; width: min(68vw, 278px); transform: translate(-50%, -50%); }
.paliro-intro-art { display: block; width: 100%; height: auto; filter: drop-shadow(0 0 24px #1ffffb38); animation: paliro-intro-arrive 1.3s cubic-bezier(.16, 1, .3, 1) both; }
.paliro-intro-orbit { position: absolute; width: 130%; height: 46%; left: -15%; bottom: -4%; border: 1px solid #8dfaff45; border-top-color: transparent; border-radius: 50%; box-shadow: 0 6px 26px #1ffffb12; transform: rotate(-17deg); animation: paliro-intro-orbit 2.5s ease-out both; }
.paliro-intro-stars { position: absolute; inset: 0; }
.paliro-intro-stars i { position: absolute; width: 4px; height: 4px; background: #d3f9ff; border-radius: 50%; box-shadow: 0 0 12px #9ff3ff; animation: paliro-intro-star 1.8s ease-in-out both; }
.paliro-intro-stars i:nth-child(3n) { width: 7px; height: 7px; clip-path: polygon(50% 0, 64% 36%, 100% 50%, 64% 64%, 50% 100%, 36% 64%, 0 50%, 36% 36%); }
.paliro-intro-copy { position: absolute; top: 62%; left: 24px; right: 24px; color: #e5e9ff; text-align: center; animation: paliro-intro-copy 1s .4s both; }
.paliro-intro-copy > span { color: #98e8f1; font-size: 16px; }
.paliro-intro-copy h1 { margin: 14px 0 10px; font-size: clamp(28px, 8vw, 36px); letter-spacing: .025em; font-weight: 700; }
.paliro-intro-copy p { margin: 0 auto; max-width: 290px; font-size: 12px; line-height: 1.7; color: #b2bfd9; }
.paliro-intro.is-leaving .paliro-intro-space { opacity: 0; transition: opacity .7s .1s ease; }
.paliro-intro.is-leaving .paliro-intro-glow, .paliro-intro.is-leaving .paliro-intro-stars,
.paliro-intro.is-leaving .paliro-intro-copy, .paliro-intro.is-leaving .paliro-intro-orbit { animation: none; opacity: 0; transition: opacity .35s ease; }
.paliro-intro.is-leaving .paliro-intro-art { animation: none; }
.paliro-shell.is-first-launch .paliro-welcome-art img { visibility: hidden; }
@keyframes paliro-intro-arrive { from { opacity: 0; transform: translateY(18px) scale(.86); } to { opacity: 1; transform: translateY(0) scale(1); } }
@keyframes paliro-intro-glow { 0% { opacity: 0; transform: scale(.75); } 65% { opacity: 1; } 100% { opacity: .85; transform: scale(1.1); } }
@keyframes paliro-intro-orbit { from { opacity: 0; transform: rotate(-35deg) scale(.7); } to { opacity: 1; transform: rotate(-17deg) scale(1); } }
@keyframes paliro-intro-star { 0% { opacity: 0; transform: translateY(15px) scale(.4); } 50% { opacity: .95; } 100% { opacity: .4; transform: translateY(-10px) scale(.7); } }
@keyframes paliro-intro-copy { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
.paliro-intro.is-reduced *, .paliro-intro.is-reduced .paliro-intro-art { animation: none; }
.paliro-intro.is-reduced.is-leaving { opacity: 0; transition: opacity .3s; }
.paliro-intro.is-reduced.is-leaving .paliro-intro-space { transition: none; opacity: 1; }
@media (prefers-reduced-motion: reduce) { .paliro-intro * { animation: none !important; } }
</style>
