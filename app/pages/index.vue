<template>
  <div
    class="flex min-h-screen flex-col items-center justify-center gap-4 bg-bg px-6 text-center"
  >
    <h1 class="mb-2">
      <img src="/logo.svg" alt="Bookvault" class="h-16 w-auto" />
    </h1>
    <p class="mb-10 text-ink-soft">記錄你的閱讀里程，寫下當下的心得。</p>
    <NuxtLink
      to="/login"
      class="cursor-pointer rounded-md bg-primary px-6 py-2.5 font-display font-semibold text-white transition-colors hover:bg-primary-hover"
    >
      登入 / 開始使用
    </NuxtLink>
  </div>
</template>
