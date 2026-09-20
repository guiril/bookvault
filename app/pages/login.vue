<script setup lang="ts">
const supabase = useSupabaseClient();

const email = ref('');
const password = ref('');
const errorMessage = ref('');

const handleLogin = async () => {
  errorMessage.value = '';

  const { error } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });

  if (error) {
    errorMessage.value = error.message;
    return;
  }

  await navigateTo('/my-books');
};
</script>

<template>
  <div class="flex min-h-screen flex-col bg-bg">
    <header class="flex items-center bg-primary px-6 py-4">
      <NuxtLink to="/" class="p-2">
        <img src="/logo-white.svg" alt="Bookvault" class="h-4.5 w-auto" />
      </NuxtLink>
    </header>
    <div class="flex flex-1 items-center justify-center px-6">
      <form
        class="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-line bg-surface p-8 shadow-sm"
        @submit.prevent="handleLogin"
      >
        <h1 class="font-display text-2xl font-bold text-ink text-center">
          登入
        </h1>
        <div class="flex flex-col gap-1">
          <label for="email" class="text-sm font-medium text-ink">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            class="rounded-md border border-line px-3 py-2 text-ink focus:border-primary focus:outline-none"
          />
        </div>
        <div class="flex flex-col gap-1">
          <label for="password" class="text-sm font-medium text-ink">
            密碼
          </label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="rounded-md border border-line px-3 py-2 text-ink focus:border-primary focus:outline-none"
          />
        </div>
        <p v-if="errorMessage" class="text-sm text-red-600">
          {{ errorMessage }}
        </p>
        <button
          type="submit"
          class="cursor-pointer rounded-md bg-primary py-2.5 font-display font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          登入
        </button>
      </form>
    </div>
  </div>
</template>
