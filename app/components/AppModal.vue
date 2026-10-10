<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue';

type ModalSize = 'sm' | 'md';

const sizeClass: Record<ModalSize, string> = {
  sm: 'max-w-90',
  md: 'max-w-240',
};

const {
  title,
  subtitle,
  size = 'md',
  open = true,
  initialFocus = null,
} = defineProps<{
  title: string;
  subtitle?: string;
  size?: ModalSize;
  open?: boolean;
  initialFocus?: HTMLElement | null;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <TransitionRoot appear :show="open" as="template">
    <Dialog
      class="relative z-50"
      :initial-focus="initialFocus"
      @close="emit('close')"
    >
      <TransitionChild
        as="template"
        enter="duration-150 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-100 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/45" />
      </TransitionChild>
      <div class="fixed inset-0 flex items-center justify-center p-5">
        <TransitionChild
          as="template"
          enter="duration-150 ease-out"
          enter-from="scale-95 opacity-0"
          enter-to="scale-100 opacity-100"
          leave="duration-100 ease-in"
          leave-from="scale-100 opacity-100"
          leave-to="scale-95 opacity-0"
        >
          <DialogPanel
            class="flex max-h-[min(900px,100%)] w-full flex-col rounded-xl bg-surface text-ink"
            :class="sizeClass[size]"
          >
            <div
              class="flex items-start justify-between gap-3 px-5.5 pt-5.5 pb-2"
            >
              <div>
                <DialogTitle
                  class="font-display text-[18px] max-sm:text-[20px] font-bold"
                >
                  {{ title }}
                </DialogTitle>
                <p
                  v-if="subtitle"
                  class="mt-0.5 text-[14px] max-sm:text-base text-ink-soft"
                >
                  {{ subtitle }}
                </p>
              </div>
              <button
                type="button"
                class="-my-1.5 p-1.5 text-xl max-sm:text-2xl leading-none text-ink-soft cursor-pointer hover:text-ink"
                aria-label="關閉"
                @click="emit('close')"
              >
                &times;
              </button>
            </div>
            <div class="overflow-y-auto px-5.5 pb-5">
              <slot />
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
