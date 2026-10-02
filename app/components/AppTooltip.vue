<script setup lang="ts">
type TooltipPlacement = 'top' | 'bottom';
type TooltipAlign = 'start' | 'center' | 'end';

const placementClass: Record<TooltipPlacement, string> = {
  top: 'bottom-full mb-1',
  bottom: 'top-full mt-1',
};

const alignClass: Record<TooltipAlign, string> = {
  start: 'left-0',
  center: 'left-1/2 -translate-x-1/2',
  end: 'right-0',
};

const {
  text,
  placement = 'top',
  align = 'center',
} = defineProps<{
  text: string;
  placement?: TooltipPlacement;
  align?: TooltipAlign;
}>();
</script>

<template>
  <span class="group/tooltip relative inline-flex">
    <slot />
    <span
      role="tooltip"
      class="absolute z-10 rounded bg-ink px-2 py-1 text-[12px] whitespace-nowrap text-surface opacity-0 pointer-events-none transition-opacity group-hover/tooltip:opacity-100 group-focus-within/tooltip:opacity-100"
      :class="[placementClass[placement], alignClass[align]]"
    >
      {{ text }}
    </span>
  </span>
</template>
