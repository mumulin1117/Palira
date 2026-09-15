import { computed, ref } from 'vue'

// Visual state only: quota, matching and publishing stay in the existing flow.
export function createPaliroHomeBoxMotion({ reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches } = {}) {
  const phase = ref('pending')
  const vacantSlot = ref(null)
  const introPlayed = ref(false)
  const timers = new Set()
  const busy = computed(() => phase.value !== 'idle')
  function clear() {
    timers.forEach(clearTimeout)
    timers.clear()
  }
  function step(delay, callback) {
    const timer = setTimeout(() => { timers.delete(timer); callback() }, delay)
    timers.add(timer)
  }
  function settle() {
    clear()
    phase.value = 'idle'
    vacantSlot.value = null
  }
  function enter() {
    if (introPlayed.value || phase.value !== 'pending') return
    introPlayed.value = true
    if (reducedMotion()) { settle(); return }
    phase.value = 'spinning'
    step(1000, () => { phase.value = 'opening' })
    step(1500, () => { phase.value = 'emitting' })
    step(2850, () => { phase.value = 'closing' })
    step(3300, settle)
  }
  function refill(index) {
    clear()
    vacantSlot.value = index
    if (index === null || reducedMotion()) { settle(); return }
    phase.value = 'refill-opening'
    step(500, () => { phase.value = 'refill-emitting' })
    step(1400, () => { phase.value = 'refill-closing'; vacantSlot.value = null })
    step(1850, () => { phase.value = 'refill-shuffling' })
    step(3500, settle)
  }
  function leave() {
    // Finish visual replenishment offscreen; never leave an invisible hit target.
    if (introPlayed.value) settle()
    else clear()
  }
  function reset() {
    clear()
    phase.value = 'pending'
    vacantSlot.value = null
    introPlayed.value = false
  }
  return { phase, vacantSlot, introPlayed, busy, enter, refill, leave, reset, dispose: clear }
}
