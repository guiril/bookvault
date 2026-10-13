<script setup lang="ts">
const supabase = useSupabaseClient();

const handleLogout = async () => {
  await supabase.auth.signOut();
  await navigateTo('/');
};
</script>

<template>
  <div class="flex min-h-screen flex-col bg-bg">
    <header
      class="sticky top-0 z-40 flex justify-center border-b border-border-subtle bg-surface-page px-8 max-sm:px-5"
    >
      <div
        class="flex h-16 max-sm:h-14 w-full max-w-280 items-center justify-between"
      >
        <NuxtLink to="/my-books">
          <img src="/logo.svg" alt="Bookvault" class="h-10 w-auto" />
        </NuxtLink>
        <button
          type="button"
          class="-mr-2 px-2 py-2.5 font-sans text-base leading-6 font-medium text-text-secondary cursor-pointer transition-colors hover:text-text-primary"
          @click="handleLogout"
        >
          登出
        </button>
      </div>
    </header>
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>
