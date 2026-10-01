<script setup lang="ts">
import type { BookFormValues } from '~/components/BookConfirmForm.vue';
import type { NewBook } from '~/types/database';

const createBlankBookForm = (): BookFormValues => ({
  title: '',
  author: '',
  cover_url: '',
  description: '',
  status: 'reading',
  started_at: '',
  finished_at: '',
});

const bookForm = ref<BookFormValues>(createBlankBookForm());
const isSubmitting = ref(false);
const submitErrorMessage = ref('');

const searchQuery = ref('');
const searchResults = ref<NewBook[]>([]);
const isSearching = ref(false);
const hasSearched = ref(false);
const searchErrorMessage = ref('');
const selectedGoogleBooksId = ref<string | null>(null);

const toastRef = useTemplateRef('toastRef');

const handleSearch = async () => {
  const trimmedQuery = searchQuery.value.trim();

  if (!trimmedQuery) return;

  isSearching.value = true;
  searchErrorMessage.value = '';

  try {
    searchResults.value = await $fetch<NewBook[]>('/api/books/search', {
      query: { q: trimmedQuery },
    });
  } catch {
    searchErrorMessage.value = '搜尋失敗，請稍後再試';
  } finally {
    isSearching.value = false;
    hasSearched.value = true;
  }
};

const selectBook = (book: NewBook) => {
  selectedGoogleBooksId.value = book.google_books_id;
  searchQuery.value = '';
  searchResults.value = [];
  hasSearched.value = false;

  bookForm.value = {
    title: book.title,
    author: book.author,
    cover_url: book.cover_url ?? '',
    description: book.description ?? '',
    status: 'reading',
    started_at: '',
    finished_at: '',
  };

  toastRef.value?.show('已帶入搜尋結果的資料');
};

const resetForm = () => {
  selectedGoogleBooksId.value = null;
  bookForm.value = createBlankBookForm();
};

const handleFormSubmit = async () => {
  isSubmitting.value = true;
  submitErrorMessage.value = '';

  try {
    await $fetch('/api/user-books', {
      method: 'POST',
      body: {
        google_books_id: selectedGoogleBooksId.value ?? undefined,
        title: bookForm.value.title,
        author: bookForm.value.author,
        cover_url: bookForm.value.cover_url || undefined,
        description: bookForm.value.description || undefined,
        status: bookForm.value.status,
        started_at: bookForm.value.started_at || undefined,
        finished_at:
          bookForm.value.status === 'finished'
            ? bookForm.value.finished_at || undefined
            : undefined,
      },
    });

    await navigateTo('/my-books');
  } catch {
    submitErrorMessage.value = '新增失敗，請稍後再試';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <div class="mx-auto max-w-2xl px-6 py-10">
    <h1 class="font-display text-2xl font-bold text-ink">新增書本</h1>
    <form class="mt-6 flex gap-2" @submit.prevent="handleSearch">
      <input
        v-model="searchQuery"
        type="search"
        placeholder="搜尋書名、作者，或直接在下方手動輸入..."
        class="flex-1 rounded-md border border-line px-3 py-2 text-ink focus:border-primary focus:outline-none"
      />
      <button
        type="submit"
        :disabled="isSearching"
        class="cursor-pointer rounded-md bg-primary px-4 py-2 font-display font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
      >
        搜尋
      </button>
    </form>
    <p v-if="searchErrorMessage" class="mt-4 text-sm text-red-600">
      {{ searchErrorMessage }}
    </p>
    <p v-if="isSearching" class="mt-6 text-sm text-ink-soft">搜尋中...</p>
    <p
      v-else-if="hasSearched && searchResults.length === 0"
      class="mt-6 text-sm text-ink-soft"
    >
      沒有找到符合的書籍
    </p>
    <ul v-else-if="searchResults.length > 0" class="mt-6 flex flex-col gap-3">
      <li v-for="(book, index) in searchResults" :key="index">
        <button
          type="button"
          class="flex w-full cursor-pointer items-center gap-4 rounded-md border border-line bg-surface p-3 text-left transition-colors hover:border-primary"
          @click="selectBook(book)"
        >
          <img
            v-if="book.cover_url"
            :src="book.cover_url"
            :alt="book.title"
            class="h-16 w-11 shrink-0 rounded-sm object-cover"
          />
          <div
            v-else
            class="flex h-16 w-11 shrink-0 items-center justify-center rounded-sm bg-tag-bg text-center text-xs text-ink-soft"
          >
            無封面
          </div>
          <div class="flex flex-col gap-1">
            <p class="font-medium text-ink">{{ book.title }}</p>
            <p class="text-sm text-ink-soft">
              {{ book.author || '作者不詳' }}
            </p>
          </div>
        </button>
      </li>
    </ul>
    <BookConfirmForm
      v-model="bookForm"
      class="mt-6"
      :is-submitting="isSubmitting"
      @submit="handleFormSubmit"
      @reset="resetForm"
    />
    <p v-if="submitErrorMessage" class="mt-4 text-sm text-red-600">
      {{ submitErrorMessage }}
    </p>
    <Toast ref="toastRef" />
  </div>
</template>
