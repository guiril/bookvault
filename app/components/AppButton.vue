<script setup lang="ts">
import type { RouteLocationRaw } from 'vue-router';

type ButtonSize = 'md' | 'lg';

const sizeClasses: Record<ButtonSize, string> = {
  md: 'h-10 px-4 text-ui-label max-sm:text-ui-label-lg',
  lg: 'h-12 px-5 text-ui-label-lg',
};

const {
  to,
  size = 'lg',
  type = 'button',
} = defineProps<{
  to?: RouteLocationRaw;
  size?: ButtonSize;
  type?: 'button' | 'submit';
}>();
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    class="flex items-center justify-center gap-2 font-sans rounded-sm bg-button-primary-bg text-button-primary-text outline-offset-2 outline-button-focus transition-colors hover:bg-button-primary-bg-hover focus-visible:outline-2 active:bg-button-primary-bg-pressed"
    :class="sizeClasses[size]"
  >
    <slot />
  </NuxtLink>
  <button
    v-else
    :type="type"
    class="flex items-center justify-center gap-2 font-sans rounded-sm bg-button-primary-bg text-button-primary-text outline-offset-2 outline-button-focus cursor-pointer transition-colors hover:bg-button-primary-bg-hover focus-visible:outline-2 active:bg-button-primary-bg-pressed"
    :class="sizeClasses[size]"
  >
    <slot />
  </button>
</template>
