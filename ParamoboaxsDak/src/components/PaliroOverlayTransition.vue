<script setup>
defineProps({ kind: { type: String, default: 'dialog' } })

function prepareOverlay(element) {
  element.inert = false
  element.removeAttribute('aria-hidden')
}

function retireOverlay(element) {
  if (element.contains(document.activeElement)) document.activeElement.blur()
  element.inert = true
  element.setAttribute('aria-hidden', 'true')
}
</script>

<template>
  <Transition :name="`paliro-overlay-${kind}`" @before-enter="prepareOverlay" @before-leave="retireOverlay" @leave-cancelled="prepareOverlay">
    <slot />
  </Transition>
</template>
