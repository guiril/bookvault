<script setup lang="ts">
definePageMeta({
  layout: false,
});

const {
  email,
  password,
  errorMessage,
  errorField,
  isSubmitting,
  isGuestLoggingIn,
  isBusy,
  handleSubmit,
  handleGuestLogin,
} = useAuthForm('signup');

const showPassword = ref(false);

const emailErrorMessage = computed(() =>
  errorField.value === 'email' ? errorMessage.value : '',
);

const passwordErrorMessage = computed(() =>
  errorField.value === 'password' ? errorMessage.value : '',
);

const formErrorMessage = computed(() =>
  errorField.value ? '' : errorMessage.value,
);
</script>

<template>
  <div class="min-h-screen flex flex-col bg-surface-page">
    <header>
      <div class="page-container pt-8 max-sm:pt-5 pb-3">
        <NuxtLink to="/" class="block w-fit">
          <img src="/logo.svg" alt="Bookvault" class="block h-10 w-auto" />
        </NuxtLink>
      </div>
    </header>
    <main class="flex-1 flex">
      <div class="page-container flex-1 flex gap-24 py-8">
        <div
          class="relative flex-1 overflow-hidden rounded-md bg-surface-raised max-md:hidden"
        >
          <img
            src="/images/signup-photo.jpg"
            alt=""
            class="absolute inset-0 size-full object-cover"
          />
        </div>
        <div
          class="w-100 max-md:w-full max-md:max-w-100 flex flex-col gap-8 max-md:mx-auto pt-20 max-md:pt-8"
        >
          <div class="flex flex-col gap-3">
            <h1
              class="font-serif text-5xl/15 max-sm:text-heading-h2 font-semibold text-text-primary"
            >
              讓讀過的書，留下我們的蹤跡
            </h1>
            <p class="font-sans text-ui-body-lg text-text-secondary">
              記下正在讀的書，寫下讀完還記得的那一句。
            </p>
          </div>
          <form
            class="flex flex-col gap-4 pt-4 border-t border-border-subtle"
            @submit.prevent="handleSubmit"
          >
            <div class="flex flex-col gap-2">
              <label
                for="email"
                class="font-sans text-ui-label-lg text-text-primary"
              >
                Email
              </label>
              <input
                id="email"
                v-model="email"
                type="email"
                autocomplete="email"
                placeholder="name@example.com"
                required
                :aria-invalid="Boolean(emailErrorMessage)"
                :aria-describedby="
                  emailErrorMessage ? 'email-error' : undefined
                "
                class="w-full h-12 px-3 font-sans text-ui-body rounded-sm border bg-transparent text-text-primary placeholder:text-input-placeholder outline-none transition-colors focus:inset-ring"
                :class="
                  emailErrorMessage
                    ? 'border-input-border-error focus:inset-ring-input-border-error'
                    : 'border-input-border hover:border-border-strong focus:border-input-border-focus focus:inset-ring-input-border-focus'
                "
              />
              <p
                v-if="emailErrorMessage"
                id="email-error"
                role="alert"
                class="font-sans text-ui-body-sm text-danger-text"
              >
                {{ emailErrorMessage }}
              </p>
            </div>
            <div class="flex flex-col gap-2">
              <label
                for="password"
                class="font-sans text-ui-label-lg text-text-primary"
              >
                密碼
              </label>
              <div class="relative">
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="new-password"
                  required
                  minlength="8"
                  :aria-invalid="Boolean(passwordErrorMessage)"
                  aria-describedby="password-hint"
                  class="w-full h-12 pr-16 pl-3 font-sans text-ui-body rounded-sm border bg-transparent text-text-primary outline-none transition-colors focus:inset-ring"
                  :class="
                    passwordErrorMessage
                      ? 'border-input-border-error focus:inset-ring-input-border-error'
                      : 'border-input-border hover:border-border-strong focus:border-input-border-focus focus:inset-ring-input-border-focus'
                  "
                />
                <button
                  type="button"
                  :aria-label="showPassword ? '隱藏密碼' : '顯示密碼'"
                  class="absolute inset-y-0 right-0 px-3 font-sans text-ui-label text-text-secondary cursor-pointer transition-colors hover:text-text-primary"
                  @click="showPassword = !showPassword"
                >
                  {{ showPassword ? '隱藏' : '顯示' }}
                </button>
              </div>
              <p
                id="password-hint"
                aria-live="polite"
                class="font-sans text-ui-body-sm"
                :class="
                  passwordErrorMessage
                    ? 'text-danger-text'
                    : 'text-text-secondary'
                "
              >
                {{ passwordErrorMessage || '至少 8 碼，需包含英文字母與數字' }}
              </p>
            </div>
            <div class="flex flex-col gap-3 pt-2">
              <p
                v-if="formErrorMessage"
                role="alert"
                class="font-sans text-ui-body-sm text-danger-text"
              >
                {{ formErrorMessage }}
              </p>
              <AppButton
                type="submit"
                :is-loading="isSubmitting"
                :disabled="isGuestLoggingIn"
                class="w-full"
              >
                建立帳號
              </AppButton>
              <p
                class="font-sans text-ui-caption text-center text-text-secondary"
              >
                建立帳號，表示您同意 Bookvault 的
                <a
                  href="#"
                  class="font-medium text-text-primary underline"
                  @click.prevent
                >
                  使用條款
                </a>
                與
                <a
                  href="#"
                  class="font-medium text-text-primary underline"
                  @click.prevent
                >
                  隱私權政策
                </a>
              </p>
            </div>
          </form>
          <div
            class="flex flex-wrap items-center justify-between gap-y-2 pt-5 border-t border-border-subtle"
          >
            <div class="flex items-center gap-1">
              <span class="font-sans text-ui-body text-text-primary">
                已經有帳號？
              </span>
              <NuxtLink
                to="/login"
                class="font-sans text-ui-label-lg text-text-primary hover:underline"
              >
                登入
              </NuxtLink>
            </div>
            <button
              type="button"
              class="flex items-center gap-1 font-sans text-ui-body text-text-secondary underline cursor-pointer transition-colors enabled:hover:text-text-primary disabled:cursor-not-allowed"
              :disabled="isBusy"
              :aria-busy="isGuestLoggingIn"
              @click="handleGuestLogin"
            >
              <AppSpinner v-if="isGuestLoggingIn" size="sm" />
              先逛逛，不用帳號
            </button>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
