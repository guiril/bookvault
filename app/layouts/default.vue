<script setup lang="ts">
const supabase = useSupabaseClient();

const handleLogout = async () => {
  await supabase.auth.signOut();
  await navigateTo('/');
};
</script>

<template>
  <div class="flex min-h-screen flex-col bg-bg">
    <header class="flex items-center justify-between bg-primary px-6 py-4">
      <NuxtLink to="/my-books" class="p-2">
        <img src="/logo-white.svg" alt="Bookvault" class="h-4.5 w-auto" />
      </NuxtLink>
      <button
        type="button"
        class="cursor-pointer text-sm font-medium text-white/80 transition-colors hover:text-white"
        @click="handleLogout"
      >
        登出
      </button>
    </header>
    <main class="flex-1">
      <slot />
    </main>
  </div>
</template>
