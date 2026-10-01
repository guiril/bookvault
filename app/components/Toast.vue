<script setup lang="ts">
const message = ref('');
const isVisible = ref(false);

let hideTimeoutId: ReturnType<typeof setTimeout> | undefined;

const show = (toastMessage: string, durationMs = 2000) => {
  message.value = toastMessage;
  isVisible.value = true;

  clearTimeout(hideTimeoutId);
  hideTimeoutId = setTimeout(() => {
    isVisible.value = false;
  }, durationMs);
};

defineExpose({ show });
</script>

<template>
  <Transition
    enter-active-class="transition-opacity duration-200"
    enter-from-class="opacity-0"
    leave-active-class="transition-opacity duration-500"
    leave-to-class="opacity-0"
  >
    <p
      v-if="isVisible"
      class="fixed bottom-6 z-60 left-1/2 -translate-x-1/2 rounded-md bg-ink px-4 py-2 text-sm font-medium text-white shadow-lg"
    >
      {{ message }}
    </p>
  </Transition>
</template>
