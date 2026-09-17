<template>
  <div class="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 px-6 text-center">
    <h1 class="text-4xl font-bold text-slate-900">bookvault</h1>
    <p class="max-w-sm text-slate-600">記錄你正在讀、讀完的書，寫下當下的心得。</p>
    <NuxtLink
      to="/login"
      class="rounded-lg bg-slate-900 px-6 py-2.5 font-medium text-white transition hover:bg-slate-700"
    >
      登入 / 開始使用
    </NuxtLink>
  </div>
</template>
