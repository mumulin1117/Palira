<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
defineOptions({ inheritAttrs: false })

const props = defineProps({ target: Object, busy: Boolean, enabled: Boolean, failed: Boolean, t: Function })
const emit = defineEmits(['refresh'])
const distance = ref(0)
const threshold = 64
const label = computed(() => props.busy ? props.t('listRefreshing') : props.failed ? props.t('listRetry')
  : distance.value >= threshold ? props.t('listRelease') : props.t('listPull'))
let cleanup = () => {}

watch(() => [props.target, props.enabled], ([target, enabled]) => {
  cleanup()
  distance.value = 0
  if (!target || !enabled) return
  let start = null
  let pulled = false
  let suppressClickUntil = 0
  function begin(event) {
    if (props.busy || event.touches.length !== 1 || target.scrollTop > 1
      || event.target.closest('input, textarea, a')) return
    const touch = event.touches[0]
    start = { x: touch.clientX, y: touch.clientY }
    pulled = false
  }
  function move(event) {
    if (!start) return
    if (event.touches.length !== 1) { cancel(); return }
    const dx = event.touches[0].clientX - start.x
    const dy = event.touches[0].clientY - start.y
    if (!pulled && (Math.abs(dx) > Math.abs(dy) || dy < -5 || target.scrollTop > 1)) { cancel(); return }
    if (dy <= 8 && !pulled) return
    if (event.cancelable) event.preventDefault()
    pulled = true
    distance.value = Math.min(96, Math.max(0, dy * .45))
  }
  function end() {
    if (pulled) suppressClickUntil = Date.now() + 400
    const refresh = distance.value >= threshold
    cancel()
    if (refresh && !props.busy) emit('refresh')
  }
  function cancel() { start = null; distance.value = 0; pulled = false }
  function click(event) {
    if (Date.now() < suppressClickUntil) { event.preventDefault(); event.stopImmediatePropagation() }
  }
  target.addEventListener('touchstart', begin, { passive: true })
  target.addEventListener('touchmove', move, { passive: false })
  target.addEventListener('touchend', end)
  target.addEventListener('touchcancel', cancel)
  target.addEventListener('click', click, true)
  cleanup = () => {
    target.removeEventListener('touchstart', begin)
    target.removeEventListener('touchmove', move)
    target.removeEventListener('touchend', end)
    target.removeEventListener('touchcancel', cancel)
    target.removeEventListener('click', click, true)
  }
}, { immediate: true })
onBeforeUnmount(() => cleanup())
</script>

<template>
  <div v-bind="$attrs" class="paliro-pull" :class="{ 'is-visible': distance > 0 || busy || failed, 'is-busy': busy }"
    :style="{ '--pull-distance': Math.min(distance, 64) + 'px' }" role="status" aria-live="polite">
    <span class="paliro-list-spinner" aria-hidden="true"></span><button v-if="failed && !busy" @click="emit('refresh')">{{ label }}</button><span v-else>{{ label }}</span>
  </div>
  <button v-if="enabled" class="paliro-refresh-accessible" :disabled="busy" @click="emit('refresh')">{{ t('listRefresh') }}</button>
</template>
