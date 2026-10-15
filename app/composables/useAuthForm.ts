type AuthMode = 'login' | 'signup';

interface AuthErrorDetail {
  code?: string;
  message: string;
}

const authErrorMessages: Record<string, string> = {
  weak_password: '密碼需至少 8 碼，並包含英文字母與數字',
  user_already_exists: '這個信箱已經註冊，請直接登入',
  email_address_invalid: '信箱格式不正確',
  email_provider_disabled: '目前暫停開放註冊，請稍後再試',
  signup_disabled: '目前暫停開放註冊，請稍後再試',
  invalid_credentials: '帳號或密碼不正確',
  anonymous_provider_disabled: '目前暫停開放訪客模式，請稍後再試',
};

const translateAuthError = (error: AuthErrorDetail) => {
  if (!error.code) {
    return error.message;
  }
  return authErrorMessages[error.code] ?? error.message;
};

export const useAuthForm = (mode: AuthMode) => {
  const supabase = useSupabaseClient();

  const email = ref('');
  const password = ref('');
  const errorMessage = ref('');
  const isSubmitting = ref(false);
  const isGuestLoggingIn = ref(false);

  const isBusy = computed(() => isSubmitting.value || isGuestLoggingIn.value);

  const handleSubmit = async () => {
    if (isBusy.value) return;

    errorMessage.value = '';
    isSubmitting.value = true;

    const credentials = { email: email.value, password: password.value };
    const { error } =
      mode === 'signup'
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

  return {
    email,
    password,
    errorMessage,
    isSubmitting,
    isGuestLoggingIn,
    isBusy,
    handleSubmit,
    handleGuestLogin,
  };
};
