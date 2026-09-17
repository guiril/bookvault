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
  <div class="flex min-h-screen items-center justify-center bg-slate-50 px-6">
    <form
      class="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-slate-200 bg-white p-8 shadow-sm"
      @submit.prevent="handleLogin"
    >
      <h1 class="text-2xl font-bold text-slate-900">登入</h1>

      <div class="flex flex-col gap-1">
        <label for="email" class="text-sm font-medium text-slate-700">Email</label>
        <input
          id="email"
          v-model="email"
          type="email"
          required
          class="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none"
        />
      </div>

      <div class="flex flex-col gap-1">
        <label for="password" class="text-sm font-medium text-slate-700">密碼</label>
        <input
          id="password"
          v-model="password"
          type="password"
          required
          class="rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none"
        />
      </div>

      <p v-if="errorMessage" class="text-sm text-red-600">{{ errorMessage }}</p>

      <button
        type="submit"
        class="rounded-lg bg-slate-900 py-2.5 font-medium text-white transition hover:bg-slate-700"
      >
        登入
      </button>
    </form>
  </div>
</template>
