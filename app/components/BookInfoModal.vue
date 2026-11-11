<script setup lang="ts">
import type { UserBook } from '~/types/database';

const { userBook } = defineProps<{
  userBook: UserBook;
}>();

const emit = defineEmits<{
  close: [];
  'open-notes': [userBookId: string];
  removed: [userBookId: string];
  error: [message: string];
}>();

const isConfirmingRemove = ref(false);
const isRemoving = ref(false);

const removeMessage = computed(
  () => `《${userBook.title}》的筆記不會刪除，會移到未分類。`,
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
    :title="userBook.title"
    :subtitle="userBook.author || '作者不詳'"
    @close="emit('close')"
  >
    <p
      v-if="userBook.description"
      class="mt-4 max-sm:mt-5 text-[14px] max-sm:text-base leading-[1.6] text-ink"
    >
      {{ userBook.description }}
    </p>
    <div class="flex items-center justify-between mt-5">
      <button
        type="button"
        class="flex items-center gap-1 text-[14px] max-sm:text-base font-semibold text-primary cursor-pointer hover:underline"
        @click="emit('open-notes', userBook.id)"
      >
        <Icon name="material-symbols:edit-note-outline" />
        查看筆記
      </button>
      <button
        type="button"
        class="text-[14px] max-sm:text-base font-semibold text-danger cursor-pointer hover:underline"
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
