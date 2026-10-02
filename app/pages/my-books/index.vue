<script setup lang="ts">
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue';

import type { UserBookStatus, UserBookWithBook } from '~/types/database';

type TabKey = 'all' | UserBookStatus;

const { data: userBooks, refresh } =
  await useFetch<UserBookWithBook[]>('/api/user-books');

const selectedInfoBookId = ref<string | null>(null);

const toastRef = useTemplateRef('toastRef');

const tabs = computed(() => {
  const books = userBooks.value ?? [];

  return [
    {
      key: 'all' as TabKey,
      label: '全部',
      count: books.length,
      emptyMessage: '書庫裡還沒有書，點右上角「新增書本」開始記錄',
    },
    {
      key: 'reading' as TabKey,
      label: '閱讀中',
      count: books.filter((userBook) => userBook.status === 'reading').length,
      emptyMessage: '目前沒有閱讀中的書',
    },
    {
      key: 'finished' as TabKey,
      label: '已讀完',
      count: books.filter((userBook) => userBook.status === 'finished').length,
      emptyMessage: '還沒有讀完的書',
    },
  ];
});

const selectedInfoBook = computed(
  () =>
    userBooks.value?.find(
      (userBook) => userBook.id === selectedInfoBookId.value,
    ) ?? null,
);

const booksForTab = (tabKey: TabKey) => {
  const books = userBooks.value ?? [];

  if (tabKey === 'all') return books;

  return books.filter((userBook) => userBook.status === tabKey);
};

const handleOpenInfo = (userBookId: string) => {
  selectedInfoBookId.value = userBookId;
};

const handleToggleStatus = async (userBookId: string) => {
  const userBook = userBooks.value?.find((item) => item.id === userBookId);

  if (!userBook) return;

  const nextStatus = userBook.status === 'reading' ? 'finished' : 'reading';

  try {
    await $fetch(`/api/user-books/${userBookId}`, {
      method: 'PATCH',
      body: { status: nextStatus },
    });

    await refresh();
  } catch {
    toastRef.value?.show('切換狀態失敗，請稍後再試');
  }
};
</script>

<template>
  <div class="mx-auto max-w-7xl px-6 py-10 md:px-10">
    <div class="flex justify-end">
      <NuxtLink
        to="/my-books/new"
        class="cursor-pointer rounded-md bg-primary px-4 py-2 font-display text-[13px] font-semibold text-white transition-colors hover:bg-primary-hover"
      >
        + 新增書本
      </NuxtLink>
    </div>
    <TabGroup>
      <TabList
        class="mt-4.5 inline-flex gap-0.5 rounded-[9px] border border-line bg-surface p-0.75"
      >
        <Tab
          v-for="tab in tabs"
          :key="tab.key"
          v-slot="{ selected }"
          as="template"
        >
          <button
            type="button"
            class="cursor-pointer rounded-md px-3.25 py-1.5 font-display text-[12.5px] font-semibold transition-colors focus:outline-none"
            :class="selected ? 'bg-ink text-white' : 'text-ink-soft'"
          >
            {{ tab.label }}（{{ tab.count }}）
          </button>
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel v-for="tab in tabs" :key="tab.key">
          <ul
            v-if="booksForTab(tab.key).length > 0"
            class="mt-5 grid grid-cols-5 gap-5 max-lg:grid-cols-4 max-md:grid-cols-3 max-sm:grid-cols-2 max-sm:gap-3.5"
          >
            <UserBookCard
              v-for="userBook in booksForTab(tab.key)"
              :key="userBook.id"
              :user-book="userBook"
              @open-info="handleOpenInfo"
            />
          </ul>
          <p v-else class="mt-16 text-center text-sm text-ink-soft">
            {{ tab.emptyMessage }}
          </p>
        </TabPanel>
      </TabPanels>
    </TabGroup>
    <BookInfoModal
      v-if="selectedInfoBook"
      :user-book="selectedInfoBook"
      @close="selectedInfoBookId = null"
      @toggle-status="handleToggleStatus"
    />
    <AppToast ref="toastRef" />
  </div>
</template>
