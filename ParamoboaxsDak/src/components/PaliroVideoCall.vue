<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { createPaliroVideoCall } from '../services/paliroVideoCall'
import PaliroChatIcon from './PaliroChatIcon.vue'

const props = defineProps({ member: Object, avatar: String, t: Function, requestPermissions: Function, canCall: Function })
const emit = defineEmits(['close'])
const status = ref({ state: 'idle', error: '' })
const callView = ref(null)
const call = createPaliroVideoCall({ requestPermissions: props.requestPermissions, canCall: props.canCall, onState: (value) => { status.value = value } })
const statusKey = computed(() => status.value.error || ({ idle: 'callRequesting', requesting: 'callRequesting', ringing: 'callWaiting', unanswered: 'callUnanswered' }[status.value.state] ?? 'callEnded'))
const isWaiting = computed(() => status.value.state === 'ringing')
function close() { call.end(); emit('close') }
function visibilityChanged() {
  // System permission alerts can briefly background the WebView; do not cancel those requests.
  if (document.hidden && isWaiting.value) close()
}
onMounted(() => {
  callView.value?.focus({ preventScroll: true })
  document.addEventListener('visibilitychange', visibilityChanged)
  void call.start()
})
onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', visibilityChanged)
  call.end()
})
</script>

<template>
  <section ref="callView" tabindex="-1" class="paliro-video-call paliro-view" :class="{ 'is-waiting': isWaiting }" :aria-label="t('chatVideoCall')" @keydown.esc="close">
    <div class="paliro-call-person">
      <div class="paliro-call-orbit" aria-hidden="true"><div class="paliro-call-photo"><img :src="avatar" alt="" /></div></div>
      <h1>{{ member.name }}</h1>
      <p role="status" aria-live="polite">{{ t(statusKey) }}</p>
    </div>
    <footer class="paliro-call-footer">
      <button type="button" class="paliro-call-hangup" @click="close">
        <span><PaliroChatIcon name="phone" /></span>
        <strong>{{ t(['failed', 'unanswered'].includes(status.state) ? 'back' : 'callHangUp') }}</strong>
      </button>
    </footer>
  </section>
</template>

<style scoped>
.paliro-video-call { display: flex; flex-direction: column; align-items: center; padding: env(safe-area-inset-top, 0px) 24px env(safe-area-inset-bottom, 0px); background: #020b20; overflow-y: auto; font-family: 'Paliro Montserrat', Montserrat, sans-serif; }
.paliro-video-call:focus { outline: none; }
.paliro-call-person { width: 100%; margin-top: clamp(32px, 9.7dvh, 79px); text-align: center; }
.paliro-call-orbit { width: min(200px, 56vw); aspect-ratio: 1; margin-inline: auto; border: 2px solid #078b99; border-radius: 50%; display: grid; place-items: center; background: radial-gradient(circle, transparent 40%, rgba(0, 226, 239, .17) 52%, transparent 73%); }
.paliro-call-photo { width: 75%; aspect-ratio: 1; display: grid; place-items: center; border: 3px solid #078b99; border-radius: 50%; }
.paliro-call-photo img { width: 88%; aspect-ratio: 1; object-fit: cover; border-radius: 50%; }
.paliro-call-person h1 { margin: clamp(20px, 5.2dvh, 42px) 0 8px; color: rgba(255,255,255,1); font-size: 28px; font-weight: 800; line-height: 34px; letter-spacing: normal; overflow-wrap: anywhere; }
.paliro-call-person p { margin: 0 auto; max-width: 320px; color: rgba(138,141,159,1); font-size: 15px; font-weight: 400; line-height: 1.5; }
.paliro-call-footer { margin-top: auto; padding-top: 32px; padding-bottom: clamp(24px, 4.9dvh, 40px); }
.paliro-call-hangup { display: flex; flex-direction: column; align-items: center; gap: 8px; background: none; border: 0; padding: 0 16px; color: rgba(138,141,159,1); }
.paliro-call-hangup > span { width: 60px; height: 60px; display: grid; place-items: center; border-radius: 50%; background: #f13f43; color: #fff; }
.paliro-call-hangup svg { width: 24px; height: 24px; }
.paliro-call-hangup strong { font-size: 12px; font-weight: 700; line-height: 15px; }
.paliro-call-hangup:focus-visible { outline: 2px solid #1ffffb; outline-offset: 6px; border-radius: 12px; }
.is-waiting .paliro-call-orbit { animation: paliro-call-pulse 2s ease-in-out infinite; }
@keyframes paliro-call-pulse { 50% { box-shadow: 0 0 28px rgba(0,226,239,.25); } }
@media (prefers-reduced-motion: reduce) { .is-waiting .paliro-call-orbit { animation: none; } }
</style>
