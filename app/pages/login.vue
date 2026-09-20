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
  <div class="flex min-h-screen items-center justify-center bg-bg px-6">
    <form
      class="flex w-full max-w-sm flex-col gap-4 rounded-lg border border-line bg-surface p-8 shadow-sm"
      @submit.prevent="handleLogin"
    >
      <h1 class="font-display text-2xl font-bold text-ink">登入</h1>

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
        <label for="password" class="text-sm font-medium text-ink">密碼</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="rounded-md border border-line px-3 py-2 text-ink focus:border-primary focus:outline-none"
        />
      </div>

      <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

      <button
        type="submit"
        class="rounded-md bg-primary py-2.5 font-display font-semibold text-white transition hover:opacity-90"
      >
        登入
      </button>
    </form>
  </div>
</template>
