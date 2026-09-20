<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center">
    <h1 class="font-display text-4xl font-bold text-ink">bookvault</h1>
    <p class="max-w-sm text-ink-soft">記錄你正在讀、讀完的書，寫下當下的心得。</p>
    <NuxtLink
      to="/login"
      class="rounded-md bg-primary px-6 py-2.5 font-display font-semibold text-white transition hover:opacity-90"
    >
      登入 / 開始使用
    </NuxtLink>
  </div>
</template>
