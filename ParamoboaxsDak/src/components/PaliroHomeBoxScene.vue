<script setup>
import { computed } from 'vue'
import PaliroMagicChest from './PaliroMagicChest.vue'
const props = defineProps({ phase: String, vacantSlot: Number, makeStage: String })
const slots = [ [34.93,19], [5.6,31.03], [65.33,26.23], [77.07,37.93], [8,49.01], [69.87,52.09] ]
const slotY = (index) => index === 0 ? 'var(--paliro-top-box-y)' : `${slots[index][1]}%`
// A fixed derangement gives every box a different temporary position, then
// returns it to its original slot without changing matching or selection data.
const shuffleSlots = [3, 2, 4, 0, 5, 1]
function shuffleStyle(index) {
  return {
    '--paliro-home-x': `${slots[index][0]}%`, '--paliro-home-y': slotY(index),
    '--paliro-away-x': `${slots[shuffleSlots[index]][0]}%`, '--paliro-away-y': slotY(shuffleSlots[index]),
    animationDelay: `${index * 30}ms`,
  }
}
const open = computed(() => ['opening','emitting','refill-opening','refill-emitting'].includes(props.phase) || ['forming','flying'].includes(props.makeStage))
const flights = computed(() => props.phase === 'emitting' ? slots.map((_, i) => i) : props.phase === 'refill-emitting' && props.vacantSlot !== null ? [props.vacantSlot] : [])
</script>

<template>
  <div class="paliro-home-box-scene" aria-hidden="true">
    <PaliroMagicChest class="paliro-home-central-chest" :open="open" :spinning="phase === 'spinning'" />
    <img v-for="slot in flights" :key="`${phase}-${slot}`" class="paliro-home-ejected-box" src="/assets/paliro-make-box-flight@2x.png" alt="" :style="{ '--paliro-slot-x': `${slots[slot][0]}%`, '--paliro-slot-y': slotY(slot), animationDelay: phase === 'emitting' ? `${slot * 90}ms` : '0ms' }" />
    <template v-if="phase === 'refill-shuffling'">
      <img v-for="(_, index) in slots" :key="`shuffle-${index}`" class="paliro-home-shuffling-box" :style="shuffleStyle(index)" src="/assets/paliro-make-box-flight@2x.png" alt="" />
    </template>
    <div v-if="makeStage !== 'idle'" :class="['paliro-home-receiving-box', `is-${makeStage}`]">
      <img src="/assets/paliro-make-box-flight@2x.png" alt="" />
    </div>
  </div>
</template>

<style>
.paliro-home-box-scene { position: absolute; inset: 0; pointer-events: none; }
.paliro-home-central-chest { position: absolute; left: 17.6%; top: 30.67%; width: 64.8%; height: 29.93%; }
.paliro-home-ejected-box { position: absolute; z-index: 3; width: 21.07%; aspect-ratio: 1; object-fit: contain; animation: paliro-home-eject .85s cubic-bezier(.2,.65,.25,1) both; }
@keyframes paliro-home-eject {
  0% { left: 39.46%; top: 39%; transform: scale(.12) rotate(-25deg); opacity: 0; }
  12% { opacity: 1; }
  45% { transform: scale(.7) rotate(14deg); }
  100% { left: var(--paliro-slot-x); top: var(--paliro-slot-y); transform: scale(1) rotate(0); opacity: 1; }
}
.paliro-home-shuffling-box { position: absolute; left: var(--paliro-home-x); top: var(--paliro-home-y); z-index: 3; width: 21.07%; aspect-ratio: 1; object-fit: contain; animation: paliro-home-shuffle 1.45s cubic-bezier(.45,0,.25,1) both; }
@keyframes paliro-home-shuffle {
  0%, 100% { left: var(--paliro-home-x); top: var(--paliro-home-y); transform: scale(1) rotate(0); }
  22% { transform: scale(.76) rotate(16deg); }
  45%, 55% { left: var(--paliro-away-x); top: var(--paliro-away-y); transform: scale(.94) rotate(-8deg); }
  77% { transform: scale(.8) rotate(-16deg); }
}
.paliro-home-receiving-box { position: absolute; z-index: 4; left: 39.46%; top: 64%; width: 21.07%; aspect-ratio: 1; }
.paliro-home-receiving-box img { width: 100%; filter: drop-shadow(0 0 16px #96dfff); }
.paliro-home-receiving-box.is-forming { animation: paliro-home-form .35s ease-out both; }
.paliro-home-receiving-box.is-flying { animation: paliro-home-receive .95s cubic-bezier(.4,0,.3,1) both; }
.paliro-home-receiving-box.is-closing { opacity: 0; }
@keyframes paliro-home-form { from { transform: scale(.3); opacity: 0; } to { transform: scale(1); opacity: 1; } }
@keyframes paliro-home-receive { 0% { left: 39.46%; top: 64%; transform: scale(1); } 45% { left: 57%; top: 31%; transform: scale(.8) rotate(22deg); opacity: 1; } 100% { left: 39.46%; top: 39%; transform: scale(.08) rotate(-12deg); opacity: 0; } }
.paliro-home-slot-art { position: relative; display: block; width: 100%; height: 100%; object-fit: contain; animation: paliro-home-slot-float 3.6s ease-in-out infinite alternate; }
.paliro-floating-box-target:nth-of-type(even) .paliro-home-slot-art { animation-delay: -1.8s; }
.paliro-floating-box-target.is-vacant { visibility: hidden; }
.paliro-floating-box-target.is-opening .paliro-home-slot-art { animation: paliro-home-slot-open .8s ease-in both; }
.paliro-home-slot-art img { position: absolute; inset: 0; width: 100%; height: 100%; }
.paliro-slot-lid { opacity: 0; clip-path: polygon(28% 25%, 49% 23%, 66% 39%, 42% 46%); }
.paliro-floating-box-target.is-opening .paliro-slot-body { clip-path: polygon(evenodd, 0 0, 100% 0, 100% 100%, 0 100%, 0 0, 28% 25%, 49% 23%, 66% 39%, 42% 46%, 28% 25%); }
.paliro-floating-box-target.is-opening .paliro-slot-lid { animation: paliro-slot-lift .8s ease-out both; }
.paliro-slot-light { position: absolute; inset: 22%; opacity: 0; border-radius: 50%; background: radial-gradient(circle, #fff, #95faff88 35%, transparent 70%); }
.paliro-floating-box-target.is-opening .paliro-slot-light { animation: paliro-slot-light .8s ease-out both; }
@keyframes paliro-slot-lift { 0% { opacity: 1; transform: none; } 65%,100% { opacity: 0; transform: translateY(-28%) rotate(-18deg); } }
@keyframes paliro-slot-light { 0%,100% { opacity: 0; } 45% { opacity: 1; transform: scale(1.8); } }
@keyframes paliro-home-slot-float { from { transform: translateY(-3%); } to { transform: translateY(3%); } }
@keyframes paliro-home-slot-open { 0% { transform: scale(1); } 45% { transform: scale(1.18) rotate(-12deg); filter: brightness(1.8) drop-shadow(0 0 15px #a6ffff); } 100% { transform: scale(.2) translateY(-40%); opacity: 0; } }
@media (prefers-reduced-motion: reduce) { .paliro-home-shuffling-box, .paliro-home-slot-art, .paliro-floating-box-target.is-opening .paliro-slot-lid, .paliro-floating-box-target.is-opening .paliro-slot-light, .paliro-floating-box-target.is-opening .paliro-home-slot-art, .paliro-home-receiving-box.is-forming, .paliro-home-receiving-box.is-flying { animation: none; } }
</style>
