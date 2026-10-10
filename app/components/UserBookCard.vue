<script setup lang="ts">
import type { UserBook } from '~/types/database';

const statusLabel: Record<UserBook['status'], string> = {
  reading: '閱讀中',
  finished: '已讀完',
};

const { userBook } = defineProps<{
  userBook: UserBook;
}>();

const emit = defineEmits<{
  'open-info': [userBookId: string];
  'open-notes': [userBookId: string];
}>();
</script>

<template>
  <li
    class="flex w-full flex-col overflow-hidden rounded-lg border border-line bg-surface"
  >
    <div class="relative">
      <img
        v-if="userBook.cover_url"
        :src="userBook.cover_url"
        :alt="userBook.title"
        class="aspect-2/3 w-full object-cover"
      />
      <div
        v-else
        class="flex aspect-2/3 w-full items-center justify-center bg-tag-bg text-xs text-ink-soft"
      >
        無封面
      </div>
      <span
        class="absolute top-2 left-2 hidden max-sm:block px-1.5 py-1 text-[12px] max-sm:text-[14px] font-semibold whitespace-nowrap rounded-md bg-ink/75 text-surface backdrop-blur-sm"
      >
        {{ statusLabel[userBook.status] }}
      </span>
    </div>
    <div class="flex flex-col px-2 pt-1.5 pb-2.5 gap-5.5">
      <div class="flex flex-col gap-1">
        <span
          class="truncate text-[14px] max-sm:text-base font-semibold text-ink"
        >
          {{ userBook.title }}
        </span>
        <span class="truncate text-[12px] max-sm:text-[14px] text-ink-soft">
          {{ userBook.author || '作者不詳' }}
        </span>
      </div>
      <div class="flex items-center justify-between max-sm:hidden">
        <span
          class="px-1.5 py-1 text-[10px] font-semibold whitespace-nowrap text-tag-ink rounded-md bg-tag-bg"
        >
          {{ statusLabel[userBook.status] }}
        </span>
        <div class="flex items-center">
          <AppTooltip text="資訊">
            <button
              type="button"
              class="group w-6 h-6 flex flex-col justify-center items-center text-ink-soft cursor-pointer transition-colors hover:text-primary"
              aria-label="資訊"
              @click="emit('open-info', userBook.id)"
            >
              <Icon name="material-symbols:info-outline" />
            </button>
          </AppTooltip>
          <AppTooltip text="筆記">
            <button
              type="button"
              class="group w-6 h-6 flex flex-col justify-center items-center text-ink-soft cursor-pointer transition-colors hover:text-primary"
              aria-label="筆記"
              @click="emit('open-notes', userBook.id)"
            >
              <Icon name="material-symbols:edit-note-outline" />
            </button>
          </AppTooltip>
        </div>
      </div>
    </div>
    <div class="mt-auto hidden grid-cols-2 border-t border-line max-sm:grid">
      <button
        type="button"
        class="flex items-center justify-center gap-1.5 py-4 text-[14px] max-sm:text-base text-ink-soft cursor-pointer"
        @click="emit('open-info', userBook.id)"
      >
        <Icon name="material-symbols:info-outline" class="text-[18px]" />
        資訊
      </button>
      <button
        type="button"
        class="flex items-center justify-center gap-1.5 py-4 text-[14px] max-sm:text-base border-l border-line text-ink-soft cursor-pointer"
        @click="emit('open-notes', userBook.id)"
      >
        <Icon name="material-symbols:edit-note-outline" class="text-[18px]" />
        筆記
      </button>
    </div>
  </li>
</template>
