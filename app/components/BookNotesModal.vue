<script setup lang="ts">
import type { Note, UserBookWithBook } from '~/types/database';

const noteDateFormatter = new Intl.DateTimeFormat('zh-TW', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
});

const { userBook } = defineProps<{
  userBook: UserBookWithBook;
}>();

const emit = defineEmits<{
  close: [];
  error: [message: string];
}>();

const { data: notes, status: loadStatus } = useLazyFetch<Note[]>(
  `/api/user-books/${userBook.id}/notes`,
);

const draftTextarea = useTemplateRef('draftTextarea');
const draftContent = ref('');
const isSubmitting = ref(false);
const pendingDeleteNoteId = ref<string | null>(null);
const isDeleting = ref(false);

const canSubmit = computed(
  () => draftContent.value.trim() !== '' && !isSubmitting.value,
);

const formatNoteDate = (createdAt: string) =>
  noteDateFormatter.format(new Date(createdAt));

const handleAddNote = async () => {
  if (!canSubmit.value) return;

  isSubmitting.value = true;

  try {
    const createdNote = await $fetch<Note>('/api/notes', {
      method: 'POST',
      body: {
        user_book_id: userBook.id,
        content: draftContent.value,
      },
    });

    notes.value = [createdNote, ...(notes.value ?? [])];
    draftContent.value = '';
  } catch {
    emit('error', '新增筆記失敗，請稍後再試');
  } finally {
    isSubmitting.value = false;
  }
};

const handleRequestDelete = (noteId: string) => {
  pendingDeleteNoteId.value = noteId;
};

const handleCancelDelete = () => {
  if (isDeleting.value) return;

  pendingDeleteNoteId.value = null;
};

const handleConfirmDelete = async () => {
  const noteId = pendingDeleteNoteId.value;

  if (!noteId) return;

  isDeleting.value = true;

  try {
    await $fetch(`/api/notes/${noteId}`, { method: 'DELETE' });

    notes.value = (notes.value ?? []).filter((note) => note.id !== noteId);
  } catch {
    emit('error', '刪除筆記失敗，請稍後再試');
  } finally {
    isDeleting.value = false;
    pendingDeleteNoteId.value = null;
  }
};
</script>

<template>
  <AppModal
    :title="userBook.book.title"
    subtitle="筆記"
    :initial-focus="draftTextarea"
    @close="emit('close')"
  >
    <form class="mt-4 flex flex-col" @submit.prevent="handleAddNote">
      <textarea
        ref="draftTextarea"
        v-model="draftContent"
        placeholder="寫下這本書帶給你的想法..."
        class="min-h-17 w-full resize-y rounded-lg border border-line px-3 py-2.5 text-[13px] text-ink focus:outline-2 focus:outline-offset-1 focus:outline-primary"
      />
      <button
        type="submit"
        class="relative mt-2.5 cursor-pointer self-end rounded-lg bg-primary px-4 py-2.25 font-display text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-ink-soft"
        :disabled="!canSubmit"
        :aria-busy="isSubmitting"
      >
        <span :class="{ invisible: isSubmitting }">新增筆記</span>
        <span
          v-if="isSubmitting"
          class="absolute inset-0 flex items-center justify-center"
        >
          <AppSpinner size="sm" />
        </span>
      </button>
    </form>
    <div
      v-if="loadStatus === 'pending'"
      class="mt-6 flex justify-center text-ink-soft"
    >
      <AppSpinner label="載入中" />
    </div>
    <p
      v-else-if="loadStatus === 'error'"
      class="mt-4 text-[13px] text-ink-soft"
    >
      筆記載入失敗，請關閉後再試一次
    </p>
    <ul v-else-if="notes?.length" class="mt-4 flex flex-col gap-2.5">
      <li
        v-for="note in notes"
        :key="note.id"
        class="flex items-start justify-between gap-3 rounded-lg border border-line px-3 py-2.5"
      >
        <div class="min-w-0">
          <p
            class="text-[14px] leading-[1.55] wrap-break-word whitespace-pre-wrap"
          >
            {{ note.content }}
          </p>
          <time
            :datetime="note.created_at"
            class="mt-1.5 block text-[11px] text-ink-soft"
          >
            {{ formatNoteDate(note.created_at) }}
          </time>
        </div>
        <AppTooltip text="刪除">
          <button
            type="button"
            class="flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center text-ink-soft transition-colors hover:text-primary"
            aria-label="刪除"
            @click="handleRequestDelete(note.id)"
          >
            <Icon name="material-symbols:delete-outline" />
          </button>
        </AppTooltip>
      </li>
    </ul>
    <p v-else class="mt-4 text-[13px] text-ink-soft">
      還沒有筆記，寫下第一則吧。
    </p>
    <AppConfirmModal
      :open="pendingDeleteNoteId !== null"
      title="刪除這則筆記？"
      message="刪除後就無法復原。"
      confirm-label="刪除"
      variant="danger"
      :is-confirming="isDeleting"
      @confirm="handleConfirmDelete"
      @cancel="handleCancelDelete"
    />
  </AppModal>
</template>
