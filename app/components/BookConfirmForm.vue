<script setup lang="ts">
import type { UserBookStatus } from '~/types/database';

export interface BookFormValues {
  title: string;
  author: string;
  cover_url: string;
  description: string;
  status: UserBookStatus;
  started_at: string;
  finished_at: string;
}

const { isSubmitting = false } = defineProps<{
  isSubmitting?: boolean;
}>();

const formValues = defineModel<BookFormValues>({
  required: true,
});

const emit = defineEmits<{
  submit: [];
  reset: [];
}>();

watch(
  () => formValues.value.status,
  (status) => {
    if (status === 'finished' && !formValues.value.finished_at) {
      formValues.value.finished_at = getLocalTodayDateString();
    }
  },
);
</script>

<template>
  <form class="flex flex-col gap-4" @submit.prevent="emit('submit')">
    <div class="flex flex-col gap-1">
      <label for="title" class="text-sm font-medium text-ink">書名</label>
      <input
        id="title"
        v-model="formValues.title"
        type="text"
        required
        class="rounded-md border border-line px-3 py-2 text-ink focus:border-primary focus:outline-none"
      />
    </div>
    <div class="flex flex-col gap-1">
      <label for="author" class="text-sm font-medium text-ink">作者</label>
      <input
        id="author"
        v-model="formValues.author"
        type="text"
        class="rounded-md border border-line px-3 py-2 text-ink focus:border-primary focus:outline-none"
      />
    </div>
    <div class="flex flex-col gap-1">
      <label for="cover_url" class="text-sm font-medium text-ink">
        封面網址
      </label>
      <input
        id="cover_url"
        v-model="formValues.cover_url"
        type="url"
        class="rounded-md border border-line px-3 py-2 text-ink focus:border-primary focus:outline-none"
      />
    </div>
    <div class="flex flex-col gap-1">
      <label for="description" class="text-sm font-medium text-ink">簡介</label>
      <textarea
        id="description"
        v-model="formValues.description"
        rows="4"
        class="rounded-md border border-line px-3 py-2 text-ink focus:border-primary focus:outline-none"
      />
    </div>
    <div class="flex flex-col gap-2">
      <span class="text-sm font-medium text-ink">閱讀狀態</span>
      <div class="flex gap-4">
        <label class="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            v-model="formValues.status"
            type="radio"
            name="status"
            value="reading"
          />
          閱讀中
        </label>
        <label class="flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input
            v-model="formValues.status"
            type="radio"
            name="status"
            value="finished"
          />
          已讀完
        </label>
      </div>
    </div>
    <div class="flex flex-col gap-1">
      <label for="started_at" class="text-sm font-medium text-ink">
        開始日期
      </label>
      <input
        id="started_at"
        v-model="formValues.started_at"
        type="date"
        class="rounded-md border border-line px-3 py-2 text-ink focus:border-primary focus:outline-none"
      />
    </div>
    <div v-if="formValues.status === 'finished'" class="flex flex-col gap-1">
      <label for="finished_at" class="text-sm font-medium text-ink">
        完成日期
      </label>
      <input
        id="finished_at"
        v-model="formValues.finished_at"
        type="date"
        :min="formValues.started_at || undefined"
        required
        class="rounded-md border border-line px-3 py-2 text-ink focus:border-primary focus:outline-none"
      />
    </div>
    <div class="flex items-center gap-3">
      <button
        type="submit"
        :disabled="isSubmitting"
        class="flex-1 cursor-pointer rounded-md bg-primary py-2.5 font-display font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        確認新增
      </button>
      <button
        type="button"
        class="cursor-pointer text-sm text-ink-soft hover:text-primary"
        @click="emit('reset')"
      >
        清空表單
      </button>
    </div>
  </form>
</template>
