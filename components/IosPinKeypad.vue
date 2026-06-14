<script setup lang="ts">
const modelValue = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<{
  disabled?: boolean
  length?: number
  error?: boolean
}>(), {
  disabled: false,
  length: 6,
  error: false
})

const emit = defineEmits<{
  complete: [value: string]
  clear: []
}>()

const digitRows = [
  { digit: '1', letters: '' },
  { digit: '2', letters: 'ABC' },
  { digit: '3', letters: 'DEF' },
  { digit: '4', letters: 'GHI' },
  { digit: '5', letters: 'JKL' },
  { digit: '6', letters: 'MNO' },
  { digit: '7', letters: 'PQRS' },
  { digit: '8', letters: 'TUV' },
  { digit: '9', letters: 'WXYZ' }
] as const

const pinSlots = computed(() => Array.from({ length: props.length }, (_, index) => ({
  active: Boolean(modelValue.value[index]),
  error: props.error
})))
const isDisabled = computed(() => props.disabled)

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  return target.tagName === 'INPUT'
    || target.tagName === 'TEXTAREA'
    || target.isContentEditable
}

function updateValue(nextValue: string) {
  const sanitized = nextValue.replace(/\D/g, '').slice(0, props.length)
  modelValue.value = sanitized

  if (sanitized.length === props.length) {
    emit('complete', sanitized)
  }
}

function pressDigit(digit: string) {
  if (isDisabled.value || modelValue.value.length >= props.length) return
  updateValue(modelValue.value + digit)
}

function backspace() {
  if (isDisabled.value || !modelValue.value) return
  updateValue(modelValue.value.slice(0, -1))
}

function clearValue() {
  if (isDisabled.value || !modelValue.value) return
  modelValue.value = ''
  emit('clear')
}

function handleKeydown(event: KeyboardEvent) {
  if (isDisabled.value || isEditableTarget(event.target)) return
  if (event.metaKey || event.ctrlKey || event.altKey) return

  if (/^\d$/.test(event.key)) {
    event.preventDefault()
    pressDigit(event.key)
    return
  }

  if (event.key === 'Backspace' || event.key === 'Delete') {
    event.preventDefault()
    backspace()
    return
  }

  if (event.key === 'Enter' && modelValue.value.length === props.length) {
    event.preventDefault()
    emit('complete', modelValue.value)
  }
}

onMounted(() => {
  if (typeof window === 'undefined') return
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  if (typeof window === 'undefined') return
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-center gap-2.5" aria-label="PIN progress">
      <span
        v-for="(slot, index) in pinSlots"
        :key="index"
        class="flex size-5 items-center justify-center rounded-full border transition-all duration-200 sm:size-4.5"
        :class="slot.error
          ? (slot.active
            ? 'border-rose-400 bg-rose-100 shadow-[inset_0_0_0_1px_rgba(244,63,94,0.12),0_0_16px_rgba(244,63,94,0.16)] dark:border-rose-300 dark:bg-rose-400/15 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12),0_0_18px_rgba(251,113,133,0.16)]'
            : 'border-rose-300 bg-rose-50 shadow-[inset_0_0_0_1px_rgba(244,63,94,0.08)] dark:border-rose-300/70 dark:bg-rose-400/10 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]')
          : (slot.active
            ? 'border-sky-300 bg-sky-100 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.12),0_0_16px_rgba(14,165,233,0.12)] dark:border-sky-200/90 dark:bg-sky-400/15 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.18),0_0_18px_rgba(56,189,248,0.18)]'
            : 'border-slate-300 bg-white shadow-[inset_0_0_0_1px_rgba(15,23,42,0.06)] dark:border-white/30 dark:bg-white/10 dark:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.06)]')"
      >
        <span
          class="size-2 rounded-full transition-all duration-200 sm:size-2"
          :class="slot.error
            ? (slot.active
              ? 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.28)] dark:bg-rose-100 dark:shadow-[0_0_12px_rgba(251,113,133,0.45)]'
              : 'bg-rose-300/80 dark:bg-rose-300/35')
            : (slot.active ? 'bg-sky-500 shadow-[0_0_12px_rgba(14,165,233,0.28)] dark:bg-sky-100 dark:shadow-[0_0_12px_rgba(224,242,254,0.45)]' : 'bg-slate-400/70 dark:bg-white/35')"
        />
      </span>
    </div>

    <div
      class="rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f7fbff)] px-3 py-4 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.18)] sm:px-4 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(15,23,42,0.98))] dark:shadow-[0_24px_60px_-34px_rgba(15,23,42,0.8)]"
      :class="error ? 'pin-shake' : ''"
    >
      <div class="grid grid-cols-3 gap-3 sm:gap-4">
        <button
          v-for="item in digitRows"
          :key="item.digit"
          type="button"
          class="flex h-16 flex-col items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-[0_12px_24px_-16px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] transition active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 dark:border-transparent dark:bg-white/10 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_24px_-16px_rgba(0,0,0,0.55)] sm:h-[4.75rem]"
          :disabled="isDisabled"
          @click="pressDigit(item.digit)"
        >
          <span class="text-[1.75rem] font-medium leading-none tracking-tight sm:text-[2rem]">{{ item.digit }}</span>
          <span class="mt-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-white/40 sm:text-[0.65rem]">
            {{ item.letters }}
          </span>
        </button>

        <div aria-hidden="true" class="aspect-square" />

        <button
          type="button"
          class="flex h-16 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-900 shadow-[0_12px_24px_-16px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] transition active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 dark:border-transparent dark:bg-white/10 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_24px_-16px_rgba(0,0,0,0.55)] sm:h-[4.75rem]"
          :disabled="isDisabled"
          @click="pressDigit('0')"
        >
          <span class="text-[1.75rem] font-medium leading-none tracking-tight sm:text-[2rem]">0</span>
        </button>

        <button
          type="button"
          class="flex h-16 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-[0_12px_24px_-16px_rgba(15,23,42,0.18),inset_0_1px_0_rgba(255,255,255,0.9)] transition active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 dark:border-transparent dark:bg-white/10 dark:text-white dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_24px_-16px_rgba(0,0,0,0.55)] sm:h-[4.75rem]"
          :disabled="isDisabled || !modelValue"
          aria-label="Delete digit"
          @click="backspace"
        >
          <UIcon name="i-lucide-delete" class="size-5 sm:size-6" />
        </button>
      </div>

      <div class="mt-3 flex items-center justify-center">
        <button
          type="button"
          class="rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 dark:text-white/55"
          :disabled="isDisabled || !modelValue"
          @click="clearValue"
        >
          Clear
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes pin-shake {
  0%, 100% {
    transform: translateX(0);
  }

  14% {
    transform: translateX(-5px);
  }

  28% {
    transform: translateX(4px);
  }

  42% {
    transform: translateX(-3px);
  }

  56% {
    transform: translateX(3px);
  }

  70% {
    transform: translateX(-2px);
  }

  84% {
    transform: translateX(1px);
  }
}

.pin-shake {
  animation: pin-shake 420ms ease-in-out;
}
</style>
