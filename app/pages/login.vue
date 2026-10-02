<script setup lang="ts">
definePageMeta({
  layout: false,
});

const authErrorMessages: Record<string, string> = {
  weak_password: '密碼需至少 8 碼，並包含英文字母與數字',
  user_already_exists: '這個信箱已經註冊，請直接登入',
  email_address_invalid: '信箱格式不正確',
  email_provider_disabled: '目前暫停開放註冊，請稍後再試',
  signup_disabled: '目前暫停開放註冊，請稍後再試',
  invalid_credentials: '帳號或密碼不正確',
  anonymous_provider_disabled: '目前暫停開放訪客模式，請稍後再試',
};

const translateAuthError = (error: { code?: string; message: string }) => {
  if (!error.code) {
    return error.message;
  }
  return authErrorMessages[error.code] ?? error.message;
};

const supabase = useSupabaseClient();

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const isRegisterMode = ref(false);
const showPassword = ref(false);
const isSubmitting = ref(false);
const isGuestLoggingIn = ref(false);

const isBusy = computed(() => isSubmitting.value || isGuestLoggingIn.value);

const toggleMode = () => {
  isRegisterMode.value = !isRegisterMode.value;
  errorMessage.value = '';
  email.value = '';
  password.value = '';
};

const handleSubmit = async () => {
  if (isBusy.value) return;

  errorMessage.value = '';
  isSubmitting.value = true;

  const credentials = { email: email.value, password: password.value };
  const { error } = isRegisterMode.value
    ? await supabase.auth.signUp(credentials)
    : await supabase.auth.signInWithPassword(credentials);

  if (error) {
    errorMessage.value = translateAuthError(error);
    isSubmitting.value = false;
    return;
  }

  await navigateTo('/my-books');
};

const handleGuestLogin = async () => {
  if (isBusy.value) return;

  errorMessage.value = '';
  isGuestLoggingIn.value = true;

  const { error } = await supabase.auth.signInAnonymously();

  if (error) {
    errorMessage.value = translateAuthError(error);
    isGuestLoggingIn.value = false;
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
        @submit.prevent="handleSubmit"
      >
        <h1 class="font-display text-2xl font-bold text-ink text-center">
          {{ isRegisterMode ? '建立帳號' : '登入' }}
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
          <div class="relative">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              required
              :minlength="isRegisterMode ? 8 : undefined"
              class="w-full rounded-md border border-line px-3 py-2 pr-10 text-ink focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              :aria-label="showPassword ? '隱藏密碼' : '顯示密碼'"
              :title="showPassword ? '隱藏密碼' : '顯示密碼'"
              class="absolute inset-y-0 right-0 flex cursor-pointer items-center px-3 text-ink-soft hover:text-primary"
              @click="showPassword = !showPassword"
            >
              <Icon
                :name="
                  showPassword
                    ? 'material-symbols:visibility-off-outline'
                    : 'material-symbols:visibility-outline'
                "
                class="size-5"
                aria-hidden="true"
              />
            </button>
          </div>
          <p v-if="isRegisterMode" class="text-xs text-ink-soft">
            至少 8 碼，需包含英文字母與數字
          </p>
        </div>
        <p v-if="errorMessage" class="text-sm text-red-600">
          {{ errorMessage }}
        </p>
        <button
          type="submit"
          class="relative cursor-pointer rounded-md bg-primary py-2.5 font-display font-semibold text-white transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:bg-ink-soft"
          :disabled="isBusy"
          :aria-busy="isSubmitting"
        >
          <span :class="{ invisible: isSubmitting }">
            {{ isRegisterMode ? '建立帳號' : '登入' }}
          </span>
          <span
            v-if="isSubmitting"
            class="absolute inset-0 flex items-center justify-center"
          >
            <AppSpinner size="sm" />
          </span>
        </button>
        <button
          type="button"
          class="cursor-pointer text-sm text-ink-soft enabled:hover:text-primary disabled:cursor-not-allowed"
          :disabled="isBusy"
          @click="toggleMode"
        >
          {{ isRegisterMode ? '已經有帳號？直接登入' : '還沒有帳號？建立帳號' }}
        </button>
        <div class="flex items-center gap-3">
          <div class="h-px flex-1 bg-line" />
          <span class="text-xs text-ink-soft">或</span>
          <div class="h-px flex-1 bg-line" />
        </div>
        <button
          type="button"
          class="relative cursor-pointer rounded-md border border-line py-2.5 font-display font-semibold text-ink transition-colors enabled:hover:border-primary enabled:hover:text-primary disabled:cursor-not-allowed disabled:text-ink-soft"
          :disabled="isBusy"
          :aria-busy="isGuestLoggingIn"
          @click="handleGuestLogin"
        >
          <span :class="{ invisible: isGuestLoggingIn }">以訪客身分試用</span>
          <span
            v-if="isGuestLoggingIn"
            class="absolute inset-0 flex items-center justify-center"
          >
            <AppSpinner size="sm" />
          </span>
        </button>
      </form>
    </div>
  </div>
</template>
