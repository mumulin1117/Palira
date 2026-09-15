<script setup>
import { computed, useId } from 'vue'
const props = defineProps({ face: { type: String, default: 'front' } })
const id = useId().replace(/:/g, '')
// Map each original artwork face onto a square plane. The browser projects these
// planes in 3D, so the artwork keeps its details without rotating a flat cutout.
const corners = {
  front: [[95,220], [286,259], [295,390], [132,347]],
  right: [[286,259], [360,121], [382,273], [295,390]],
  top: [[191,100], [360,121], [286,259], [95,220]],
}
function affine(source, target) {
  const [p, q, r] = source
  const det = (q[0]-p[0])*(r[1]-p[1])-(r[0]-p[0])*(q[1]-p[1])
  const axis = (index) => {
    const u = target[1][index]-target[0][index]
    const v = target[2][index]-target[0][index]
    const a = (u*(r[1]-p[1])-v*(q[1]-p[1]))/det
    const b = (v*(q[0]-p[0])-u*(r[0]-p[0]))/det
    return [a,b,target[0][index]-a*p[0]-b*p[1]]
  }
  const x=axis(0), y=axis(1)
  return `matrix(${x[0]} ${y[0]} ${x[1]} ${y[1]} ${x[2]} ${y[2]})`
}
const triangles = computed(() => {
  const p = corners[props.face] || corners.front
  return [
    { points: '0,0 100,0 100,100', transform: affine([p[0],p[1],p[2]], [[0,0],[100,0],[100,100]]) },
    { points: '0,0 100,100 0,100', transform: affine([p[0],p[2],p[3]], [[0,0],[100,100],[0,100]]) },
  ]
})
</script>

<template>
  <svg class="paliro-chest-texture" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
    <defs>
      <clipPath v-for="(triangle, index) in triangles" :id="`${id}-${index}`" :key="index">
        <polygon :points="triangle.points" />
      </clipPath>
    </defs>
    <g v-for="(triangle, index) in triangles" :key="index" :clip-path="`url(#${id}-${index})`">
      <image href="/assets/paliro-home-chest@4x.png" width="486" height="486" :transform="triangle.transform" />
    </g>
  </svg>
</template>

<style>
.paliro-chest-texture { display: block; width: 100%; height: 100%; }
</style>
