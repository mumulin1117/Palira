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
      <div class="paliro-call-orbit" aria-hidden="true">
        <template v-if="isWaiting">
          <span v-for="ring in 3" :key="ring" class="paliro-call-wave" :style="{ animationDelay: `${(ring - 1) * -.8}s` }"></span>
        </template>
        <div class="paliro-call-photo"><img :src="avatar" alt="" /></div>
      </div>
      <h1>{{ member.name }}</h1>
      <p role="status" aria-live="polite">{{ t(statusKey) }}</p>
    </div>
    <footer class="paliro-call-footer">
      <button type="button" class="paliro-call-hangup" @click="close">
        <span><PaliroChatIcon name="phone" /></span>
        <strong>{{ t('decline') }}</strong>
      </button>
    </footer>
  </section>
</template>

<style scoped>
.paliro-video-call { display: flex; flex-direction: column; align-items: center; padding: env(safe-area-inset-top, 0px) 24px env(safe-area-inset-bottom, 0px); background: radial-gradient(circle at 50% 28%, rgba(0, 194, 211, .08), transparent 29%), #020b20; overflow-y: auto; font-family: 'Paliro Montserrat', Montserrat, sans-serif; }
.paliro-video-call:focus { outline: none; }
.paliro-call-person { width: 100%; margin-top: clamp(28px, 6.2dvh, 52px); text-align: center; }
.paliro-call-orbit { position: relative; isolation: isolate; width: min(200px, 56vw); aspect-ratio: 1; margin-inline: auto; border: 2px solid rgba(0, 174, 191, .85); border-radius: 50%; display: grid; place-items: center; background: radial-gradient(circle, rgba(0, 226, 239, .03) 36%, rgba(0, 226, 239, .17) 53%, rgba(0, 226, 239, .03) 70%); box-shadow: 0 0 24px rgba(0, 226, 239, .08); }
.paliro-call-wave { position: absolute; inset: 12%; border: 2px solid rgba(31, 255, 251, .82); border-radius: 50%; box-shadow: 0 0 17px rgba(0, 226, 239, .28), inset 0 0 12px rgba(0, 226, 239, .1); pointer-events: none; will-change: opacity, transform; animation: paliro-call-wave 2.4s cubic-bezier(.2, .48, .35, 1) infinite; }
.paliro-call-photo { position: relative; z-index: 1; width: 75%; aspect-ratio: 1; display: grid; place-items: center; border: 3px solid rgba(0, 174, 191, .92); border-radius: 50%; background: #052333; box-shadow: 0 0 18px rgba(0, 226, 239, .2); }
.paliro-call-photo img { width: 88%; aspect-ratio: 1; object-fit: cover; object-position: center; border-radius: 50%; }
.paliro-call-person h1 { margin: clamp(24px, 5dvh, 40px) 0 8px; color: rgba(255,255,255,1); font-size: 28px; font-weight: 800; line-height: 34px; letter-spacing: normal; overflow-wrap: anywhere; }
.paliro-call-person p { margin: 0 auto; max-width: 320px; color: rgba(138,141,159,1); font-size: 15px; font-weight: 400; line-height: 1.5; }
.paliro-call-footer { margin-top: auto; padding-top: 32px; padding-bottom: clamp(24px, 4.9dvh, 40px); }
.paliro-call-hangup { display: flex; flex-direction: column; align-items: center; gap: 9px; background: none; border: 0; padding: 0 16px; color: rgba(138,141,159,1); }
.paliro-call-hangup > span { width: 60px; height: 60px; display: grid; place-items: center; border-radius: 50%; background: #f54449; box-shadow: 0 7px 20px rgba(245, 68, 73, .22); color: #fff; }
.paliro-call-hangup svg { width: 24px; height: 24px; }
.paliro-call-hangup strong { font-size: 13px; font-weight: 700; line-height: 16px; }
.paliro-call-hangup:focus-visible { outline: 2px solid #1ffffb; outline-offset: 6px; border-radius: 12px; }
@keyframes paliro-call-wave {
  0% { transform: scale(.96); opacity: 0; }
  14% { opacity: .86; }
  68% { opacity: .24; }
  100% { transform: scale(1.62); opacity: 0; }
}
@media (max-height: 700px) {
  .paliro-call-person { margin-top: 22px; }
  .paliro-call-orbit { width: min(174px, 52vw); }
  .paliro-call-person h1 { margin-top: 20px; font-size: 25px; line-height: 31px; }
  .paliro-call-footer { padding-top: 20px; padding-bottom: 20px; }
}
@media (prefers-reduced-motion: reduce) {
  .paliro-call-wave { animation: none; display: none; }
  .is-waiting .paliro-call-orbit { box-shadow: 0 0 24px rgba(0, 226, 239, .2); }
}
</style>
