<script setup lang="ts">
const modelValue = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<{
  disabled?: boolean
  length?: number
}>(), {
  disabled: false,
  length: 6
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
  active: Boolean(modelValue.value[index])
})))
const isDisabled = computed(() => props.disabled)

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
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center justify-center gap-2" aria-label="PIN progress">
      <span
        v-for="(slot, index) in pinSlots"
        :key="index"
        class="flex size-4 items-center justify-center rounded-full border transition-all duration-200 sm:size-4.5"
        :class="slot.active
          ? 'border-white/80 bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.14)]'
          : 'border-white/20 bg-white/5'"
      >
        <span
          class="size-1.5 rounded-full transition-all duration-200 sm:size-2"
          :class="slot.active ? 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.35)]' : 'bg-white/25'"
        />
      </span>
    </div>

    <div class="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(17,24,39,0.96),rgba(15,23,42,0.98))] px-3 py-4 shadow-[0_24px_60px_-34px_rgba(15,23,42,0.8)] sm:px-4">
      <div class="grid grid-cols-3 gap-3 sm:gap-4">
        <button
          v-for="item in digitRows"
          :key="item.digit"
          type="button"
          class="flex h-16 flex-col items-center justify-center rounded-full bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_24px_-16px_rgba(0,0,0,0.55)] transition active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[4.75rem]"
          :disabled="isDisabled"
          @click="pressDigit(item.digit)"
        >
          <span class="text-[1.75rem] font-medium leading-none tracking-tight sm:text-[2rem]">{{ item.digit }}</span>
          <span class="mt-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.28em] text-white/40 sm:text-[0.65rem]">
            {{ item.letters }}
          </span>
        </button>

        <div aria-hidden="true" class="aspect-square" />

        <button
          type="button"
          class="flex h-16 items-center justify-center rounded-full bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_24px_-16px_rgba(0,0,0,0.55)] transition active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[4.75rem]"
          :disabled="isDisabled"
          @click="pressDigit('0')"
        >
          <span class="text-[1.75rem] font-medium leading-none tracking-tight sm:text-[2rem]">0</span>
        </button>

        <button
          type="button"
          class="flex h-16 items-center justify-center rounded-full bg-white/10 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_12px_24px_-16px_rgba(0,0,0,0.55)] transition active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-50 sm:h-[4.75rem]"
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
          class="rounded-full px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/55 transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
          :disabled="isDisabled || !modelValue"
          @click="clearValue"
        >
          Clear
        </button>
      </div>
    </div>
  </div>
</template>
