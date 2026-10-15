<script setup lang="ts">
import type { UserBook } from '~/types/database';

const { userBook } = defineProps<{
  userBook: UserBook;
}>();

const emit = defineEmits<{
  'open-info': [userBookId: string];
}>();
</script>

<template>
  <li>
    <button
      type="button"
      class="w-full flex flex-col gap-2 text-left rounded-xs outline-offset-2 outline-button-focus cursor-pointer focus-visible:outline-2"
      @click="emit('open-info', userBook.id)"
    >
      <span
        class="relative block w-full aspect-73/99 overflow-hidden rounded-xs bg-surface-raised after:absolute after:inset-0 after:rounded-xs after:border after:border-border-cover"
      >
        <img
          v-if="userBook.cover_url"
          :src="userBook.cover_url"
          alt=""
          class="block size-full object-cover"
        />
        <span
          v-else
          class="size-full flex items-center justify-center font-sans text-ui-caption text-text-secondary"
        >
          無封面
        </span>
      </span>
      <span class="w-full flex flex-col">
        <span class="truncate font-serif text-heading-h6 text-text-primary">
          {{ userBook.title }}
        </span>
        <span
          class="truncate font-sans text-ui-caption max-sm:text-sm text-text-secondary"
        >
          {{ userBook.author || '作者不詳' }}
        </span>
      </span>
    </button>
  </li>
</template>
