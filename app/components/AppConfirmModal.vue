<script setup lang="ts">
type ConfirmVariant = 'primary' | 'danger';

const confirmVariantClass: Record<ConfirmVariant, string> = {
  primary: 'bg-primary hover:bg-primary-hover',
  danger: 'bg-danger hover:bg-danger-hover',
};

const {
  open,
  title,
  message,
  confirmLabel = '確認',
  isConfirming = false,
  variant = 'primary',
} = defineProps<{
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  isConfirming?: boolean;
  variant?: ConfirmVariant;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <AppModal :open="open" :title="title" size="sm" @close="emit('cancel')">
    <p class="mt-3 text-[13px] max-sm:text-[14px] leading-[1.6] text-ink-soft">
      {{ message }}
    </p>
    <div class="mt-5 flex justify-end gap-2">
      <button
        type="button"
        class="cursor-pointer rounded-md border border-line px-3.5 py-1.5 font-display text-[14px] font-semibold text-ink transition-colors hover:bg-bg disabled:cursor-not-allowed"
        :disabled="isConfirming"
        @click="emit('cancel')"
      >
        取消
      </button>
      <button
        type="button"
        class="relative cursor-pointer rounded-md px-3.5 py-1.5 font-display text-[14px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-ink-soft"
        :class="confirmVariantClass[variant]"
        :disabled="isConfirming"
        :aria-busy="isConfirming"
        @click="emit('confirm')"
      >
        <span :class="{ invisible: isConfirming }">{{ confirmLabel }}</span>
        <span
          v-if="isConfirming"
          class="absolute inset-0 flex items-center justify-center"
        >
          <AppSpinner size="sm" />
        </span>
      </button>
    </div>
  </AppModal>
</template>
