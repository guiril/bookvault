<script setup lang="ts">
import type { UserBook, UserBookWithBook } from '~/types/database';

type DateField = 'started_at' | 'finished_at';

interface DateRow {
  field: DateField;
  label: string;
  displayText: string;
  isEditable: boolean;
  isRequired: boolean;
  min?: string;
  max?: string;
}

const statusLabel: Record<UserBook['status'], string> = {
  reading: '閱讀中',
  finished: '已讀完',
};

const { userBook, isTogglingStatus = false } = defineProps<{
  userBook: UserBookWithBook;
  isTogglingStatus?: boolean;
}>();

const emit = defineEmits<{
  close: [];
  'toggle-status': [userBookId: string];
  removed: [userBookId: string];
  updated: [userBook: UserBookWithBook];
  error: [message: string];
}>();

const isConfirmingRemove = ref(false);
const isRemoving = ref(false);
const editingField = ref<DateField | null>(null);
const draftDate = ref('');
const isSaving = ref(false);

const isEditing = computed(() => editingField.value !== null);

const toggleLabel = computed(() =>
  userBook.status === 'reading' ? '切換為已讀完' : '切換為閱讀中',
);

const removeMessage = computed(
  () => `《${userBook.book.title}》的筆記也會一起刪除，且無法復原。`,
);

const dateRows = computed<DateRow[]>(() => {
  const isFinished = userBook.status === 'finished';

  return [
    {
      field: 'started_at',
      label: '開始閱讀',
      displayText: userBook.started_at ?? '—',
      isEditable: true,
      isRequired: false,
      max: (isFinished && userBook.finished_at) || undefined,
    },
    {
      field: 'finished_at',
      label: '完成閱讀',
      displayText: isFinished
        ? (userBook.finished_at ?? '—')
        : '進行中，尚未完成',
      isEditable: isFinished,
      isRequired: true,
      min: userBook.started_at ?? undefined,
    },
  ];
});

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

const handleStartEditing = (field: DateField) => {
  draftDate.value = userBook[field] ?? '';
  editingField.value = field;
};

const handleSaveDate = async () => {
  if (!editingField.value) return;

  // The other date is sent unchanged, because the API fills a missing
  // finished date with today.
  const nextDates = {
    started_at: userBook.started_at,
    finished_at: userBook.finished_at,
    [editingField.value]: draftDate.value || null,
  };

  isSaving.value = true;

  try {
    const updatedUserBook = await $fetch<UserBookWithBook>(
      `/api/user-books/${userBook.id}`,
      {
        method: 'PATCH',
        body: {
          status: userBook.status,
          started_at: nextDates.started_at,
          finished_at:
            userBook.status === 'finished' ? nextDates.finished_at : undefined,
        },
      },
    );

    emit('updated', updatedUserBook);
    editingField.value = null;
  } catch {
    emit('error', '儲存失敗，請稍後再試');
  } finally {
    isSaving.value = false;
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
    <form class="mt-4 flex flex-col gap-3" @submit.prevent="handleSaveDate">
      <div
        class="flex items-center justify-between gap-3 border-b border-line py-2.25 text-[13px] max-sm:text-[14px]"
      >
        <span class="text-ink-soft">狀態</span>
        <span class="flex items-center gap-2">
          {{ statusLabel[userBook.status] }}
          <button
            v-if="!isEditing"
            type="button"
            class="relative cursor-pointer text-[12px] max-sm:text-[13px] font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:no-underline"
            :disabled="isTogglingStatus"
            :aria-busy="isTogglingStatus"
            @click="emit('toggle-status', userBook.id)"
          >
            <span :class="{ invisible: isTogglingStatus }">
              {{ toggleLabel }}
            </span>
            <span
              v-if="isTogglingStatus"
              class="absolute inset-0 flex items-center justify-center"
            >
              <AppSpinner size="sm" />
            </span>
          </button>
        </span>
      </div>
      <div
        v-for="dateRow in dateRows"
        :key="dateRow.field"
        class="flex items-center justify-between gap-3 border-b border-line py-2.25 text-[13px] max-sm:text-[14px]"
      >
        <span class="text-ink-soft">{{ dateRow.label }}</span>
        <span
          v-if="editingField === dateRow.field"
          class="flex items-center gap-2"
        >
          <input
            v-model="draftDate"
            type="date"
            :aria-label="dateRow.label"
            :min="dateRow.min"
            :max="dateRow.max"
            :required="dateRow.isRequired"
            class="rounded-md border border-line px-2 py-0.5 text-[16px] text-ink pointer-fine:text-[13px] focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            class="cursor-pointer text-[12px] max-sm:text-[13px] font-semibold text-ink-soft hover:underline disabled:cursor-not-allowed disabled:no-underline"
            :disabled="isSaving"
            @click="editingField = null"
          >
            取消
          </button>
          <button
            type="submit"
            class="relative cursor-pointer text-[12px] max-sm:text-[13px] font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:no-underline"
            :disabled="isSaving"
            :aria-busy="isSaving"
          >
            <span :class="{ invisible: isSaving }">儲存</span>
            <span
              v-if="isSaving"
              class="absolute inset-0 flex items-center justify-center"
            >
              <AppSpinner size="sm" />
            </span>
          </button>
        </span>
        <span v-else class="flex items-center gap-2">
          {{ dateRow.displayText }}
          <button
            v-if="dateRow.isEditable && !isEditing"
            type="button"
            class="flex cursor-pointer items-center gap-0.5 text-[12px] max-sm:text-[13px] font-semibold text-primary hover:underline disabled:cursor-not-allowed disabled:no-underline"
            :aria-label="`編輯${dateRow.label}日期`"
            :disabled="isTogglingStatus"
            @click="handleStartEditing(dateRow.field)"
          >
            <Icon name="material-symbols:edit-outline" />
            編輯
          </button>
        </span>
      </div>
    </form>
    <div v-if="!isEditing" class="mt-5 flex justify-end">
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
