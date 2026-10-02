<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue';

const { title, subtitle } = defineProps<{
  title: string;
  subtitle?: string;
}>();

const emit = defineEmits<{
  close: [];
}>();
</script>

<template>
  <TransitionRoot appear :show="true" as="template">
    <Dialog class="relative z-50" @close="emit('close')">
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
            class="max-h-[min(900px,100%)] w-full max-w-240 overflow-y-auto rounded-xl bg-surface px-5.5 pt-5.5 pb-5 text-ink"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <DialogTitle class="font-display text-[17px] font-bold">
                  {{ title }}
                </DialogTitle>
                <p v-if="subtitle" class="mt-0.5 text-[12.5px] text-ink-soft">
                  {{ subtitle }}
                </p>
              </div>
              <button
                type="button"
                class="cursor-pointer px-0.5 text-xl leading-none text-ink-soft hover:text-ink"
                aria-label="關閉"
                @click="emit('close')"
              >
                &times;
              </button>
            </div>
            <slot />
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
