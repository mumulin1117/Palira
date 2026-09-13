<script setup>
defineProps({
  value: { type: [Boolean, Number, String], required: true },
  kind: { type: String, default: 'label' },
  positive: Boolean,
})
</script>

<template>
  <span :class="['paliro-state-feedback', `paliro-state-feedback-${kind}`]">
    <Transition :name="`paliro-state-${kind}`" @before-enter="(element) => element.removeAttribute('aria-hidden')" @before-leave="(element) => element.setAttribute('aria-hidden', 'true')">
      <span :key="value" :class="['paliro-state-value', { 'is-positive': positive }]"><slot /></span>
    </Transition>
  </span>
</template>
