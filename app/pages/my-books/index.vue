<script setup lang="ts">
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/vue';

import type { UserBookWithNoteCount } from '~/types/database';

const { data: userBooks, refresh } =
  await useFetch<UserBookWithNoteCount[]>('/api/user-books');

const selectedInfoBookId = ref<string | null>(null);
const selectedNotesBookId = ref<string | null>(null);

const toastRef = useTemplateRef('toastRef');

const hasBooks = computed(() => (userBooks.value ?? []).length > 0);

const tabs = computed(() => {
  const books = userBooks.value ?? [];

  return [
    {
      key: 'all',
      label: '全部',
      books,
    },
    {
      key: 'with-notes',
      label: '有筆記',
      books: books.filter((userBook) => userBook.note_count > 0),
      emptyMessage: '還沒有寫過筆記的書',
    },
    {
      key: 'without-notes',
      label: '還沒有筆記',
      books: books.filter((userBook) => userBook.note_count === 0),
      emptyMessage: '每本書都有筆記了',
    },
  ];
});

const selectedInfoBook = computed(
  () =>
    userBooks.value?.find(
      (userBook) => userBook.id === selectedInfoBookId.value,
    ) ?? null,
);

const selectedNotesBook = computed(
  () =>
    userBooks.value?.find(
      (userBook) => userBook.id === selectedNotesBookId.value,
    ) ?? null,
);

const handleOpenInfo = (userBookId: string) => {
  selectedInfoBookId.value = userBookId;
};

const handleOpenNotes = (userBookId: string) => {
  selectedInfoBookId.value = null;
  selectedNotesBookId.value = userBookId;
};

// Notes may have been added or deleted, so the note counts are reloaded.
const handleNotesClose = async () => {
  selectedNotesBookId.value = null;
  await refresh();
};

const handleNotesError = (message: string) => {
  toastRef.value?.show(message);
};

const handleBookRemoved = (userBookId: string) => {
  selectedInfoBookId.value = null;
  userBooks.value = (userBooks.value ?? []).filter(
    (userBook) => userBook.id !== userBookId,
  );
  toastRef.value?.show('已從書庫移除');
};

const handleInfoError = (message: string) => {
  toastRef.value?.show(message);
};
</script>

<template>
  <div class="page-container pt-10 max-sm:pt-6 pb-16">
    <div class="flex items-center justify-between py-1">
      <h1
        class="font-serif text-heading-h2 max-sm:text-heading-h3 text-text-primary"
      >
        書庫
      </h1>
      <AppButton v-if="hasBooks" to="/my-books/new" size="md" class="pr-5!">
        <img class="size-4 p-0.5" src="/images/icons/add.svg" alt="" />
        <span>新增一本書</span>
      </AppButton>
    </div>
    <TabGroup>
      <TabList
        class="flex gap-6 mt-5"
        :class="{ 'border-b border-border-subtle': hasBooks }"
      >
        <Tab
          v-for="tab in tabs"
          :key="tab.key"
          v-slot="{ selected }"
          as="template"
        >
          <button
            type="button"
            class="relative flex gap-1 pb-1.5 font-sans text-ui-label-lg cursor-pointer transition-colors hover:text-text-primary focus:outline-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-border-strong after:origin-left after:transition-transform"
            :class="
              selected
                ? 'text-text-primary after:scale-x-100'
                : 'text-text-secondary after:scale-x-0 hover:after:scale-x-100'
            "
          >
            <span>{{ tab.label }}</span>
            <span>{{ tab.books.length }}</span>
          </button>
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel
          v-for="tab in tabs"
          :key="tab.key"
          class="rounded-xs outline-offset-4 outline-button-focus focus-visible:outline-2"
        >
          <ul
            v-if="tab.books.length > 0"
            class="grid grid-cols-7 max-lg:grid-cols-6 max-md:grid-cols-4 max-sm:grid-cols-2 gap-4 mt-8"
          >
            <UserBookCard
              v-for="userBook in tab.books"
              :key="userBook.id"
              :user-book="userBook"
              @open-info="handleOpenInfo"
            />
          </ul>
          <div
            v-else-if="tab.key === 'all'"
            class="flex flex-col items-center gap-10 mt-18 max-sm:mt-12"
          >
            <img
              src="/images/vault-empty.svg"
              alt=""
              width="320"
              height="323"
              class="max-sm:w-60 max-sm:h-auto"
            />
            <div class="w-80 max-sm:w-full flex flex-col items-center gap-6">
              <div class="flex flex-col gap-1 text-center">
                <h2 class="font-serif text-heading-h3 text-text-primary">
                  目前您的書櫃還沒有書
                </h2>
                <p class="font-sans text-ui-label-lg text-text-secondary">
                  點擊新增一本書立即加入手中正在閱讀的書
                </p>
              </div>
              <AppButton to="/my-books/new" class="w-full">
                <img class="size-4 p-0.5" src="/images/icons/add.svg" alt="" />
                <span>新增一本書</span>
              </AppButton>
            </div>
          </div>
          <p
            v-else
            class="mt-16 text-center font-sans text-base leading-6 text-text-secondary"
          >
            {{ tab.emptyMessage }}
          </p>
        </TabPanel>
      </TabPanels>
    </TabGroup>
    <BookInfoModal
      v-if="selectedInfoBook"
      :user-book="selectedInfoBook"
      @close="selectedInfoBookId = null"
      @open-notes="handleOpenNotes"
      @removed="handleBookRemoved"
      @error="handleInfoError"
    />
    <BookNotesModal
      v-if="selectedNotesBook"
      :user-book="selectedNotesBook"
      @close="handleNotesClose"
      @error="handleNotesError"
    />
    <AppToast ref="toastRef" />
  </div>
</template>
