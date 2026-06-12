<script setup lang="ts">
const { isOnline } = useConnectivity()

const showBadge = computed(() => !isOnline.value)
</script>

<template>
  <Transition
    enter-active-class="transition duration-200 ease-out"
    enter-from-class="opacity-0 -translate-y-2"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-150 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 -translate-y-2"
  >
    <div
      v-if="showBadge"
      class="fixed right-4 top-4 z-[70] rounded-full border border-rose-200/80 bg-white/95 px-3 py-2 text-xs font-semibold text-rose-700 shadow-[0_16px_40px_-20px_rgba(15,23,42,0.35)] backdrop-blur dark:border-rose-900/60 dark:bg-slate-950/95 dark:text-rose-300"
    >
      <div class="flex items-center gap-2">
        <UIcon name="i-lucide-wifi-off" class="size-4" />
        <span>No internet</span>
      </div>
    </div>
  </Transition>
</template>
