<script setup lang="ts">
type SpinnerSize = 'sm' | 'md';

const spinnerSizeClass: Record<SpinnerSize, string> = {
  sm: 'text-[18px]',
  md: 'text-[24px]',
};

const { size = 'md', label } = defineProps<{
  size?: SpinnerSize;
  label?: string;
}>();
</script>

<template>
  <span :role="label ? 'status' : undefined" class="inline-flex">
    <Icon
      name="material-symbols:progress-activity"
      class="animate-spin"
      :class="spinnerSizeClass[size]"
    />
    <span v-if="label" class="sr-only">{{ label }}</span>
  </span>
</template>
