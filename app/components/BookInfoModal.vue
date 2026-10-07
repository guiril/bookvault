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
  removed: [userBookId: string];
  error: [message: string];
}>();

const isConfirmingRemove = ref(false);
const isRemoving = ref(false);

const toggleLabel = computed(() =>
  userBook.status === 'reading' ? '切換為已讀完' : '切換為閱讀中',
);

const removeMessage = computed(
  () => `《${userBook.book.title}》的筆記也會一起刪除，且無法復原。`,
);

const handleCancelRemove = () => {
  if (isRemoving.value) return;

  isConfirmingRemove.value = false;
};

const handleConfirmRemove = async () => {
  isRemoving.value = true;

  try {
    await $fetch(`/api/user-books/${userBook.id}`, { method: 'DELETE' });

    emit('removed', userBook.id);
  } catch {
    emit('error', '移除失敗，請稍後再試');
  } finally {
    isRemoving.value = false;
    isConfirmingRemove.value = false;
  }
};
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
    <div class="mt-5 flex justify-end">
      <button
        type="button"
        class="cursor-pointer text-[13px] max-sm:text-[14px] font-semibold text-danger hover:underline"
        @click="isConfirmingRemove = true"
      >
        從書庫移除
      </button>
    </div>
    <AppConfirmModal
      :open="isConfirmingRemove"
      title="從書庫移除這本書？"
      :message="removeMessage"
      confirm-label="移除"
      variant="danger"
      :is-confirming="isRemoving"
      @confirm="handleConfirmRemove"
      @cancel="handleCancelRemove"
    />
  </AppModal>
</template>
