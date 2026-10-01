<script setup lang="ts">
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from '@headlessui/vue';

import type { UserBook, UserBookWithBook } from '~/types/database';

const statusLabel: Record<UserBook['status'], string> = {
  reading: '閱讀中',
  finished: '已讀完',
};

const { userBook } = defineProps<{
  userBook: UserBookWithBook;
}>();

const emit = defineEmits<{
  close: [];
  'toggle-status': [userBookId: string];
}>();

const toggleLabel = computed(() =>
  userBook.status === 'reading' ? '切換為已讀完' : '切換為閱讀中',
);
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
                  {{ userBook.book.title }}
                </DialogTitle>
                <p class="mt-0.5 text-[12.5px] text-ink-soft">
                  {{ userBook.book.author || '作者不詳' }}
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
            <p
              v-if="userBook.book.description"
              class="mt-4 text-[13px] leading-[1.6] text-ink"
            >
              {{ userBook.book.description }}
            </p>
            <div class="mt-4 flex flex-col gap-3">
              <div
                class="flex items-center justify-between gap-3 border-b border-line py-2.25 text-[13px]"
              >
                <span class="text-ink-soft">狀態</span>
                <span class="flex items-center gap-2">
                  {{ statusLabel[userBook.status] }}
                  <button
                    type="button"
                    class="cursor-pointer text-[12px] font-semibold text-primary hover:underline"
                    @click="emit('toggle-status', userBook.id)"
                  >
                    {{ toggleLabel }}
                  </button>
                </span>
              </div>
              <div
                class="flex items-center justify-between gap-3 border-b border-line py-2.25 text-[13px]"
              >
                <span class="text-ink-soft">開始閱讀</span>
                <span>{{ userBook.started_at ?? '—' }}</span>
              </div>
              <div
                class="flex items-center justify-between gap-3 border-b border-line py-2.25 text-[13px]"
              >
                <span class="text-ink-soft">完成閱讀</span>
                <span>{{
                  userBook.status === 'finished'
                    ? (userBook.finished_at ?? '—')
                    : '進行中，尚未完成'
                }}</span>
              </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
