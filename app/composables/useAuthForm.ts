type AuthMode = 'login' | 'signup';

type AuthErrorField = 'email' | 'password';

interface AuthErrorDetail {
  code?: string;
  message: string;
}

interface AuthErrorMessage {
  message: string;
  field?: AuthErrorField;
}

const authErrorMessages: Record<string, AuthErrorMessage> = {
  weak_password: {
    message: '密碼需至少 8 碼，並包含英文字母與數字',
    field: 'password',
  },
  user_already_exists: {
    message: '這個信箱已經註冊，請直接登入',
    field: 'email',
  },
  email_address_invalid: {
    message: '信箱格式不正確',
    field: 'email',
  },
  email_provider_disabled: { message: '目前暫停開放註冊，請稍後再試' },
  signup_disabled: { message: '目前暫停開放註冊，請稍後再試' },
  invalid_credentials: { message: '帳號或密碼不正確' },
  anonymous_provider_disabled: {
    message: '目前暫停開放訪客模式，請稍後再試',
  },
};

const translateAuthError = (error: AuthErrorDetail): AuthErrorMessage => {
  if (!error.code) {
    return { message: error.message };
  }
  return authErrorMessages[error.code] ?? { message: error.message };
};

export const useAuthForm = (mode: AuthMode) => {
  const supabase = useSupabaseClient();

  const email = ref('');
  const password = ref('');
  const errorMessage = ref('');
  const errorField = ref<AuthErrorField | null>(null);
  const isSubmitting = ref(false);
  const isGuestLoggingIn = ref(false);

  const isBusy = computed(() => isSubmitting.value || isGuestLoggingIn.value);

  const showError = (error: AuthErrorDetail) => {
    const authErrorMessage = translateAuthError(error);

    errorMessage.value = authErrorMessage.message;
    errorField.value = authErrorMessage.field ?? null;
  };

  const clearError = () => {
    errorMessage.value = '';
    errorField.value = null;
  };

  const handleSubmit = async () => {
    if (isBusy.value) return;

    clearError();
    isSubmitting.value = true;

    const credentials = { email: email.value, password: password.value };
    const { error } =
      mode === 'signup'
        ? await supabase.auth.signUp(credentials)
        : await supabase.auth.signInWithPassword(credentials);

    if (error) {
      showError(error);
      isSubmitting.value = false;
      return;
    }

    await navigateTo('/my-books');
  };

  const handleGuestLogin = async () => {
    if (isBusy.value) return;

    clearError();
    isGuestLoggingIn.value = true;

    const { error } = await supabase.auth.signInAnonymously();

    if (error) {
      showError(error);
      isGuestLoggingIn.value = false;
      return;
    }

    await navigateTo('/my-books');
  };

  return {
    email,
    password,
    errorMessage,
    errorField,
    isSubmitting,
    isGuestLoggingIn,
    isBusy,
    handleSubmit,
    handleGuestLogin,
  };
};
