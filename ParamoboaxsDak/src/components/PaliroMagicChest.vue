<script setup>
import { onMounted, onBeforeUnmount, ref } from 'vue'
import PaliroChestFace from './PaliroChestFace.vue'
defineProps({ open: Boolean, spinning: Boolean })
const container = ref(null)
const edge = ref(100)
let observer
onMounted(() => {
  const resize = () => {
    const { clientWidth: width, clientHeight: height } = container.value
    edge.value = Math.max(1, Math.min(width, height) * .37)
  }
  resize()
  observer = new ResizeObserver(resize)
  observer.observe(container.value)
})
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div ref="container" :class="['paliro-magic-chest', { 'is-open': open, 'is-spinning': spinning }]" :style="{ '--paliro-chest-edge': `${edge}px` }" aria-hidden="true">
    <span class="paliro-chest-ground-shadow"></span>
    <span class="paliro-chest-aura"></span>
    <svg class="paliro-chest-halo" viewBox="0 0 320 240" preserveAspectRatio="none" aria-hidden="true">
      <g transform="rotate(-12 160 132)" fill="none">
        <ellipse class="paliro-halo-bloom" cx="160" cy="132" rx="134" ry="49" />
        <ellipse class="paliro-halo-ring" cx="160" cy="132" rx="134" ry="49" />
        <ellipse class="paliro-halo-flow" cx="160" cy="132" rx="134" ry="49" pathLength="100" />
      </g>
      <g transform="rotate(10 160 132)" fill="none">
        <ellipse class="paliro-halo-ring is-inner" cx="160" cy="132" rx="122" ry="42" />
        <ellipse class="paliro-halo-flow is-inner" cx="160" cy="132" rx="122" ry="42" pathLength="100" />
      </g>
    </svg>
    <div class="paliro-chest-camera">
      <div class="paliro-chest-turn">
        <div class="paliro-chest-wall is-front"><PaliroChestFace /><span class="paliro-chest-face-light"></span></div>
        <div class="paliro-chest-wall is-right"><PaliroChestFace face="right" /><span class="paliro-chest-face-light"></span></div>
        <div class="paliro-chest-wall is-back"><PaliroChestFace /><span class="paliro-chest-face-light"></span></div>
        <div class="paliro-chest-wall is-left"><PaliroChestFace face="right" /><span class="paliro-chest-face-light"></span></div>
        <div class="paliro-chest-floor"></div>
        <div class="paliro-chest-inner is-front"></div>
        <div class="paliro-chest-inner is-back"></div>
        <div class="paliro-chest-inner is-left"></div>
        <div class="paliro-chest-inner is-right"></div>
        <div class="paliro-chest-rim"></div>
        <div class="paliro-chest-lid-hinge">
          <div class="paliro-chest-lid-top"><PaliroChestFace face="top" /><span class="paliro-chest-lid-sheen"></span></div>
          <div class="paliro-chest-lid-under"><span></span></div>
          <div class="paliro-chest-lid-edge is-front"></div>
          <div class="paliro-chest-lid-edge is-back"></div>
          <div class="paliro-chest-lid-edge is-left"></div>
          <div class="paliro-chest-lid-edge is-right"></div>
        </div>
      </div>
    </div>
    <span class="paliro-chest-magic-light"></span>
  </div>
</template>

<style>
.paliro-magic-chest { pointer-events: none; --paliro-chest-half: calc(var(--paliro-chest-edge) / 2); --paliro-chest-rim: calc(var(--paliro-chest-edge) * .035); }
.paliro-chest-camera { position: absolute; z-index: 2; inset: 0; perspective: calc(var(--paliro-chest-edge) * 7); perspective-origin: 50% 44%; }
.paliro-chest-turn { position: absolute; width: var(--paliro-chest-edge); height: var(--paliro-chest-edge); left: calc(50% - var(--paliro-chest-half)); top: calc(52% - var(--paliro-chest-half)); transform-style: preserve-3d; transform: rotateZ(-10deg) rotateX(-40deg) rotateY(-35deg); }
.paliro-chest-wall, .paliro-chest-inner, .paliro-chest-floor, .paliro-chest-rim { position: absolute; inset: 0; backface-visibility: hidden; }
.paliro-chest-wall { border: 1px solid #e9d7a4; background: #132f85; box-shadow: inset 0 0 0 1px #8b99d5; }
.paliro-chest-wall.is-front { transform: translateZ(var(--paliro-chest-half)); }
.paliro-chest-wall.is-right { transform: rotateY(90deg) translateZ(var(--paliro-chest-half)); }
.paliro-chest-wall.is-back { transform: rotateY(180deg) translateZ(var(--paliro-chest-half)); }
.paliro-chest-wall.is-left { transform: rotateY(-90deg) translateZ(var(--paliro-chest-half)); }
.paliro-chest-face-light { position: absolute; inset: 0; background: linear-gradient(135deg, #e9f4ff38, transparent 45%, #05072342); box-shadow: inset 0 1px 2px #f7edca, inset 0 -3px 8px #070e454d; }
.paliro-chest-wall.is-right .paliro-chest-face-light { background: linear-gradient(115deg, #03104216, #010c305c); }
.paliro-chest-wall.is-back .paliro-chest-face-light, .paliro-chest-wall.is-left .paliro-chest-face-light { background: linear-gradient(130deg, #badfff28, #00092b70); }
.paliro-chest-floor { background: radial-gradient(ellipse at 50% 48%, #d8ffff 0%, #589ee7 9%, #253c79 27%, #060b29 65%); transform: rotateX(90deg) translateZ(calc(0px - var(--paliro-chest-half) + 2px)); box-shadow: inset 0 0 18px #000922; }
.paliro-chest-inner { background: linear-gradient(#1a2452, #080d29 57%, #3478ae); border: 1px solid #717bac; }
.paliro-chest-inner.is-front { transform: translateZ(calc(var(--paliro-chest-half) - 2px)) rotateY(180deg); }
.paliro-chest-inner.is-back { transform: translateZ(calc(2px - var(--paliro-chest-half))); }
.paliro-chest-inner.is-left { transform: rotateY(90deg) translateZ(calc(2px - var(--paliro-chest-half))); }
.paliro-chest-inner.is-right { transform: rotateY(-90deg) translateZ(calc(2px - var(--paliro-chest-half))); }
.paliro-chest-rim { border: var(--paliro-chest-rim) solid #cebda2; box-shadow: inset 0 0 0 1px #8b84b0, 0 0 0 1px #f0dcb5; transform: rotateX(90deg) translateZ(var(--paliro-chest-half)); }
.paliro-chest-lid-hinge { position: absolute; left: 0; top: 0; width: 100%; height: 0; transform-style: preserve-3d; transform-origin: 50% 0; transform: translateZ(calc(0px - var(--paliro-chest-half))) rotateX(0deg); transition: transform .48s cubic-bezier(.22,.7,.24,1); }
.paliro-chest-lid-top, .paliro-chest-lid-under { position: absolute; left: 0; top: 0; width: var(--paliro-chest-edge); height: var(--paliro-chest-edge); transform-origin: 50% 0; backface-visibility: hidden; }
.paliro-chest-lid-top { border: 1px solid #f7e7ba; background: #235aaf; transform: translateY(calc(0px - var(--paliro-chest-rim))) rotateX(90deg); }
.paliro-chest-lid-under { transform: rotateX(90deg) rotateY(180deg); background: radial-gradient(ellipse at 50% 50%, #43518e, #151f48 60%, #09112e); border: calc(var(--paliro-chest-rim) * 1.4) solid #c7b594; box-shadow: inset 0 0 0 1px #f8deaf, inset 0 0 12px #040c2c; }
.paliro-chest-lid-under span { position: absolute; inset: 24%; border: 1px solid #8cb9de66; transform: rotate(45deg); box-shadow: inset 0 0 12px #517dbc33; }
.paliro-chest-lid-sheen { position: absolute; inset: 0; background: linear-gradient(125deg, #ffffff30, transparent 48%, #04174422); box-shadow: inset 0 0 2px #fff6db; }
.paliro-chest-lid-edge { position: absolute; width: var(--paliro-chest-edge); height: var(--paliro-chest-rim); top: calc(0px - var(--paliro-chest-rim)); left: 0; background: linear-gradient(#fff1cc, #a4947d 35%, #4d5278 65%, #ddc7a2); backface-visibility: hidden; }
.paliro-chest-lid-edge.is-front { transform: translateZ(var(--paliro-chest-edge)); }
.paliro-chest-lid-edge.is-back { transform: rotateY(180deg); }
.paliro-chest-lid-edge.is-left { transform-origin: 0 50%; transform: rotateY(-90deg); }
.paliro-chest-lid-edge.is-right { left: 100%; transform-origin: 0 50%; transform: rotateY(-90deg) rotateX(180deg); }
/* Halo stays outside the preserve-3d tree: no masked bitmaps, blending or
   intersecting translucent planes in the WebView compositor. */
.paliro-chest-halo { position: absolute; z-index: 1; inset: 0; width: 100%; height: 100%; overflow: visible; pointer-events: none; }
.paliro-halo-bloom { stroke: #8bafff; stroke-width: 10; opacity: .14; }
.paliro-halo-ring { stroke: #bdd7ff; stroke-width: 1.3; opacity: .7; }
.paliro-halo-ring.is-inner { stroke: #8deaff; stroke-width: .9; opacity: .52; }
.paliro-halo-flow { stroke: #edfaff; stroke-width: 2; stroke-linecap: round; stroke-dasharray: 9 39 2 50; animation: paliro-halo-travel 6s linear infinite; }
.paliro-halo-flow.is-inner { stroke: #acf7ff; stroke-width: 1.5; stroke-dasharray: 6 58 1 35; animation-duration: 8s; animation-direction: reverse; }
@keyframes paliro-halo-travel { to { stroke-dashoffset: -100; } }
.paliro-chest-aura { position: absolute; z-index: 0; inset: -8%; border-radius: 50%; background: radial-gradient(ellipse, #b6dfff66 0%, #729bff44 28%, #6b70f524 46%, transparent 70%); transition: opacity .48s; opacity: .75; }
.paliro-chest-ground-shadow { position: absolute; left: 24%; top: 78%; width: 52%; height: 10%; border-radius: 50%; background: radial-gradient(ellipse, #020921a6, #09144233 50%, transparent 72%);  }
.paliro-chest-magic-light { position: absolute; z-index: 3; left: 30%; top: 20%; width: 40%; height: 42%; opacity: 0; background: radial-gradient(ellipse at 50% 80%, #a8eaff66, #78afff12 50%, transparent 72%); transition: opacity .48s; }
.paliro-magic-chest.is-open .paliro-chest-lid-hinge { transform: translateZ(calc(0px - var(--paliro-chest-half))) rotateX(72deg); }
.paliro-magic-chest.is-open .paliro-chest-aura { opacity: 1; }
.paliro-magic-chest.is-open .paliro-chest-magic-light { opacity: 1; }
.paliro-magic-chest.is-spinning .paliro-chest-turn { animation: paliro-chest-turn 1s cubic-bezier(.35,.05,.25,1) both; }
@keyframes paliro-chest-turn { 0% { transform: rotateZ(-10deg) rotateX(-40deg) rotateY(-395deg); } 100% { transform: rotateZ(-10deg) rotateX(-40deg) rotateY(-35deg); } }
@media (prefers-reduced-motion: reduce) { .paliro-chest-lid-hinge, .paliro-chest-aura, .paliro-chest-magic-light { transition: none; } .paliro-magic-chest.is-spinning .paliro-chest-turn, .paliro-halo-flow { animation: none; } }
</style>
