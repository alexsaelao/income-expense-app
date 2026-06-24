<script setup lang="ts">
const modelValue = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<{
  ariaLabel?: string
  autocomplete?: string
  disabled?: boolean
  error?: boolean
  length?: number
  revealValue?: boolean
}>(), {
  ariaLabel: 'PIN',
  autocomplete: 'one-time-code',
  disabled: false,
  error: false,
  length: 6,
  revealValue: false
})

const emit = defineEmits<{
  blur: []
  complete: [value: string]
  focus: []
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)

const digits = computed(() => Array.from({ length: props.length }, (_, index) => modelValue.value[index] ?? ''))
const activeIndex = computed(() => modelValue.value.length < props.length ? modelValue.value.length : -1)

function sanitizeValue(value: string) {
  return value.replace(/\D/g, '').slice(0, props.length)
}

function updateValue(nextValue: string) {
  const sanitized = sanitizeValue(nextValue)
  modelValue.value = sanitized

  if (sanitized.length === props.length) {
    emit('complete', sanitized)
  }
}

function focus() {
  if (props.disabled) return
  if (inputRef.value) {
    inputRef.value.focus({ preventScroll: true })
    return
  }

  nextTick(() => inputRef.value?.focus({ preventScroll: true }))
}

function blur() {
  inputRef.value?.blur()
}

function handleInput(event: Event) {
  updateValue((event.target as HTMLInputElement).value)
}

function handlePaste(event: ClipboardEvent) {
  event.preventDefault()
  updateValue(event.clipboardData?.getData('text') ?? '')
}

function handleFocus() {
  isFocused.value = true
  emit('focus')
}

function handleBlur() {
  isFocused.value = false
  emit('blur')
}

watch(modelValue, (value) => {
  const sanitized = sanitizeValue(value)
  if (sanitized !== value) {
    modelValue.value = sanitized
  }
})

defineExpose({
  blur,
  focus
})
</script>

<template>
  <div class="relative">
    <input
      ref="inputRef"
      :value="modelValue"
      type="tel"
      inputmode="numeric"
      pattern="[0-9]*"
      enterkeyhint="done"
      :autocomplete="autocomplete"
      :aria-label="ariaLabel"
      :disabled="disabled"
      autocapitalize="off"
      autocorrect="off"
      spellcheck="false"
      class="pointer-events-none absolute left-0 top-0 h-px w-px opacity-0"
      @input="handleInput"
      @paste="handlePaste"
      @focus="handleFocus"
      @blur="handleBlur"
    >

    <button
      type="button"
      :disabled="disabled"
      class="block w-full rounded-[1.5rem] border border-slate-200/80 bg-[linear-gradient(180deg,#ffffff,#f8fbff)] p-3 text-left shadow-[0_18px_44px_-28px_rgba(15,23,42,0.18)] transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.96),rgba(2,6,23,0.98))] dark:shadow-[0_24px_60px_-36px_rgba(2,6,23,0.85)] sm:p-4"
      :class="[
        error ? 'pin-shake border-rose-300/90 dark:border-rose-300/60' : '',
        isFocused ? 'border-sky-300 shadow-[0_20px_48px_-28px_rgba(14,165,233,0.34)] dark:border-sky-300/60 dark:shadow-[0_24px_60px_-34px_rgba(14,165,233,0.28)]' : ''
      ]"
      @click="focus"
    >
      <div class="grid grid-cols-6 gap-2 sm:gap-3">
        <div
          v-for="(digit, index) in digits"
          :key="index"
          class="relative flex h-14 items-center justify-center overflow-hidden rounded-[1.15rem] border text-center transition-all duration-200 sm:h-16"
          :class="[
            error
              ? (digit
                ? 'border-rose-300 bg-rose-50/90 dark:border-rose-300/60 dark:bg-rose-400/10'
                : 'border-rose-200/80 bg-rose-50/55 dark:border-rose-300/30 dark:bg-rose-400/5')
              : (digit
                ? 'border-sky-200 bg-sky-50/90 dark:border-sky-300/40 dark:bg-sky-400/10'
                : 'border-slate-200 bg-white/80 dark:border-white/10 dark:bg-white/5'),
            isFocused && activeIndex === index && !digit
              ? 'border-sky-300 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.22),0_0_0_4px_rgba(14,165,233,0.08)] dark:border-sky-300/70'
              : ''
          ]"
        >
          <span
            v-if="digit"
            class="pin-pop text-[1.25rem] font-black tracking-tight text-slate-900 dark:text-white sm:text-[1.4rem]"
          >
            {{ revealValue ? digit : '•' }}
          </span>

          <span
            v-else-if="isFocused && activeIndex === index"
            class="pin-caret h-6 w-[2px] rounded-full bg-sky-500/80 dark:bg-sky-200"
          />

          <span
            v-else
            class="size-2 rounded-full bg-slate-200 dark:bg-white/10"
          />
        </div>
      </div>
    </button>
  </div>
</template>

<style scoped>
@keyframes pin-shake {
  0%, 100% {
    transform: translateX(0);
  }

  20% {
    transform: translateX(-5px);
  }

  40% {
    transform: translateX(4px);
  }

  60% {
    transform: translateX(-3px);
  }

  80% {
    transform: translateX(2px);
  }
}

@keyframes pin-pop {
  0% {
    opacity: 0;
    transform: scale(0.7) translateY(6px);
  }

  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes pin-caret {
  0%, 100% {
    opacity: 1;
  }

  50% {
    opacity: 0.18;
  }
}

.pin-shake {
  animation: pin-shake 360ms ease-in-out;
}

.pin-pop {
  animation: pin-pop 180ms ease-out;
}

.pin-caret {
  animation: pin-caret 1s ease-in-out infinite;
}
</style>
