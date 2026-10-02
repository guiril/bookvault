<script setup lang="ts">
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
  <AppModal
    :title="userBook.book.title"
    :subtitle="userBook.book.author || '作者不詳'"
    @close="emit('close')"
  >
    <p
      v-if="userBook.book.description"
      class="mt-4 text-[13px] max-sm:text-[14px] leading-[1.6] text-ink"
    >
      {{ userBook.book.description }}
    </p>
    <div class="mt-4 flex flex-col gap-3">
      <div
        class="flex items-center justify-between gap-3 border-b border-line py-2.25 text-[13px] max-sm:text-[14px]"
      >
        <span class="text-ink-soft">狀態</span>
        <span class="flex items-center gap-2">
          {{ statusLabel[userBook.status] }}
          <button
            type="button"
            class="cursor-pointer text-[12px] max-sm:text-[13px] font-semibold text-primary hover:underline"
            @click="emit('toggle-status', userBook.id)"
          >
            {{ toggleLabel }}
          </button>
        </span>
      </div>
      <div
        class="flex items-center justify-between gap-3 border-b border-line py-2.25 text-[13px] max-sm:text-[14px]"
      >
        <span class="text-ink-soft">開始閱讀</span>
        <span>{{ userBook.started_at ?? '—' }}</span>
      </div>
      <div
        class="flex items-center justify-between gap-3 border-b border-line py-2.25 text-[13px] max-sm:text-[14px]"
      >
        <span class="text-ink-soft">完成閱讀</span>
        <span>{{
          userBook.status === 'finished'
            ? (userBook.finished_at ?? '—')
            : '進行中，尚未完成'
        }}</span>
      </div>
    </div>
  </AppModal>
</template>
