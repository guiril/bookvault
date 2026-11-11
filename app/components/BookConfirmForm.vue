<script setup lang="ts">
export interface BookFormValues {
  title: string;
  author: string;
  cover_url: string;
  description: string;
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
