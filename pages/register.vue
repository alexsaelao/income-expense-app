<script setup lang="ts">
const router = useRouter()
const { selectedLanguage } = useAppLanguage()
const { activeTheme } = useAppThemeColor()
const { authReady, isAuthenticated, signIn } = useDeviceAuth()

const identifier = ref('')
const rememberDevice = ref(false)
const pinValue = ref('')
const confirmPinValue = ref('')
const step = ref<'account' | 'pin'>('account')
const isCheckingAccount = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const identifierInput = ref<HTMLInputElement | null>(null)
const pinInput = ref<HTMLInputElement | null>(null)

const registerCopy = computed(() => selectedLanguage.value === 'lo'
  ? {
      newAccount: 'ບັນຊີໃໝ່',
      title: 'ລົງທະບຽນ',
      subtitle: 'ສ້າງບັນຊີດ້ວຍອີເມວ ຫຼື ເບີໂທ ແລ້ວຕັ້ງ PIN 6 ຫຼັກ.',
      emailOrPhone: 'ອີເມວ ຫຼື ເບີໂທ',
      emailPlaceholder: 'name@example.com ຫຼື 020 xxx xxxx',
      rememberDevice: 'ຈື່ຈຳອຸປະກອນນີ້',
      rememberHint: 'ບັນທຶກບັນຊີນີ້ໄວ້ໃນອຸປະກອນນີ້.',
      next: 'ຖັດໄປ',
      createAccount: 'ສ້າງບັນຊີ',
      checking: 'ກຳລັງກວດ',
      creating: 'ກຳລັງສ້າງ',
      backToSignIn: 'ກັບໄປເຂົ້າລະບົບ',
      changeAccount: 'ປ່ຽນບັນຊີ',
      digits: '6 ຫຼັກ',
      createPin: 'ສ້າງ PIN',
      createPinHint: 'ໃສ່ PIN 6 ຫຼັກ.',
      confirmPin: 'ຢືນຢັນ PIN',
      confirmPinHint: 'ໃສ່ PIN ອີກຄັ້ງເພື່ອຢືນຢັນ.',
      noAccount: 'ບໍ່ພົບບັນຊີ. ກະລຸນາລອງໃໝ່.',
      accountExists: 'ບັນຊີມີຢູ່ແລ້ວ. ກະລຸນາເຂົ້າລະບົບແທນ.',
      enterAccount: 'ກະລຸນາໃສ່ອີເມວ ຫຼື ເບີໂທ.',
      pinNumbers: 'PIN ຕ້ອງເປັນ 6 ຕົວເລກ.',
      confirmPinAgain: 'ກະລຸນາໃສ່ PIN ອີກຄັ້ງເພື່ອຢືນຢັນ.',
      pinMismatch: 'PIN ບໍ່ຕົງກັນ. ກະລຸນາລອງໃໝ່.',
      checkingAccount: 'ກຳລັງກວດ',
      creatingAccount: 'ກຳລັງສ້າງ',
      couldNotCheck: 'ບໍ່ສາມາດກວດບັນຊີໄດ້ຕອນນີ້.',
      couldNotCreate: 'ບໍ່ສາມາດສ້າງບັນຊີໄດ້ຕອນນີ້.'
    }
  : {
      newAccount: 'New account',
      title: 'Register',
      subtitle: 'Create your account with email or phone number, then set a 6-digit PIN.',
      emailOrPhone: 'Email or phone',
      emailPlaceholder: 'name@example.com or 020 xxx xxxx',
      rememberDevice: 'Remember this device',
      rememberHint: 'Save this account on this device.',
      next: 'Next',
      createAccount: 'Create account',
      checking: 'Checking',
      creating: 'Creating',
      backToSignIn: 'Back to sign in',
      changeAccount: 'Change account',
      digits: '6 digits',
      createPin: 'Create PIN',
      createPinHint: 'Enter a 6-digit PIN.',
      confirmPin: 'Confirm PIN',
      confirmPinHint: 'Enter your PIN again to confirm it.',
      noAccount: 'No account found. Please try again.',
      accountExists: 'Account already exists. Please sign in instead.',
      enterAccount: 'Please enter your email or phone number.',
      pinNumbers: 'PIN must be 6 numbers.',
      confirmPinAgain: 'Please enter your PIN again to confirm.',
      pinMismatch: 'PIN codes do not match. Please try again.',
      checkingAccount: 'Checking',
      creatingAccount: 'Creating',
      couldNotCheck: 'Could not check your account right now.',
      couldNotCreate: 'Could not create your account right now.'
    })

const pinSlots = computed(() => Array.from({ length: 6 }, (_, index) => pinValue.value[index] ?? ''))
const confirmPinSlots = computed(() => Array.from({ length: 6 }, (_, index) => confirmPinValue.value[index] ?? ''))
const canContinue = computed(() => identifier.value.trim().length >= 3)
const nextButtonLabel = computed(() => step.value === 'account' ? registerCopy.value.next : registerCopy.value.createAccount)
const pinMatch = computed(() => pinValue.value.length === 6 && confirmPinValue.value.length === 6 && pinValue.value === confirmPinValue.value)

watch(
  authReady,
  (ready) => {
    if (!ready) return
    if (isAuthenticated.value) {
      router.replace('/')
    }
  },
  { immediate: true }
)

function focusIdentifier() {
  nextTick(() => identifierInput.value?.focus())
}

function focusPin() {
  nextTick(() => pinInput.value?.focus())
}

function goBackToAccount() {
  step.value = 'account'
  pinValue.value = ''
  confirmPinValue.value = ''
  errorMessage.value = ''
  focusIdentifier()
}

async function goToPin() {
  const normalized = identifier.value.trim()
  if (!normalized) {
    errorMessage.value = registerCopy.value.enterAccount
    focusIdentifier()
    return
  }

  isCheckingAccount.value = true
  errorMessage.value = ''

  try {
    const result = await $fetch<{ exists: boolean }>('/api/auth/check', {
      query: { identifier: normalized }
    })

    if (result.exists) {
      errorMessage.value = registerCopy.value.accountExists
      return
    }

    step.value = 'pin'
    pinValue.value = ''
    confirmPinValue.value = ''
    focusPin()
  }
  catch {
    errorMessage.value = registerCopy.value.couldNotCheck
  }
  finally {
    isCheckingAccount.value = false
  }
}

function sanitizePin(value: string) {
  pinValue.value = value.replace(/\D/g, '').slice(0, 6)
  errorMessage.value = ''
}

function sanitizeConfirmPin(value: string) {
  confirmPinValue.value = value.replace(/\D/g, '').slice(0, 6)
  errorMessage.value = ''
}

async function submitRegister() {
  if (isSubmitting.value) return

  const normalizedIdentifier = identifier.value.trim()

  if (!normalizedIdentifier) {
    errorMessage.value = registerCopy.value.enterAccount
    step.value = 'account'
    focusIdentifier()
    return
  }

  if (pinValue.value.length !== 6) {
    errorMessage.value = registerCopy.value.pinNumbers
    focusPin()
    return
  }

  if (confirmPinValue.value.length !== 6) {
    errorMessage.value = registerCopy.value.confirmPinAgain
    return
  }

  if (!pinMatch.value) {
    errorMessage.value = registerCopy.value.pinMismatch
    confirmPinValue.value = ''
    return
  }

  isSubmitting.value = true

  try {
    const result = await $fetch<{
      ok: boolean
      account: { plan?: 'free' | 'pro' }
    }>('/api/auth/register', {
      method: 'POST',
      body: {
        identifier: normalizedIdentifier,
        pin: pinValue.value,
        remember: rememberDevice.value
      }
    })

    signIn(normalizedIdentifier, pinValue.value, rememberDevice.value, result.account.plan ?? 'free')
    router.replace('/')
  }
  catch (error) {
    const status = (error as { statusCode?: number; response?: { status?: number } } | null)?.statusCode
      ?? (error as { response?: { status?: number } } | null)?.response?.status

    if (status === 409) {
      errorMessage.value = registerCopy.value.accountExists
      step.value = 'account'
      return
    }

    errorMessage.value = registerCopy.value.couldNotCreate
  }
  finally {
    isSubmitting.value = false
  }
}

watch([pinValue, confirmPinValue], () => {
  if (step.value !== 'pin' || isSubmitting.value) return

  if (pinValue.value.length !== 6 || confirmPinValue.value.length !== 6) return

  if (pinMatch.value) {
    void submitRegister()
    return
  }

  errorMessage.value = 'PIN codes do not match. Please try again.'
  confirmPinValue.value = ''
})

onMounted(() => {
  if (isAuthenticated.value) {
    router.replace('/')
    return
  }

  focusIdentifier()
})
</script>

<template>
  <div class="space-y-6 pb-8">
    <section class="space-y-3 text-center">
      <div :class="['mx-auto flex size-16 items-center justify-center rounded-[1.4rem] bg-gradient-to-br text-white shadow-[0_16px_36px_-18px_rgba(37,99,235,0.7)]', activeTheme.accent]">
        <UIcon name="i-lucide-user-round-plus" class="size-8" />
      </div>

      <div class="space-y-1">
        <p class="text-[10px] font-semibold uppercase tracking-[0.32em] text-muted">{{ registerCopy.newAccount }}</p>
        <h1 class="text-3xl font-black tracking-tight text-default">{{ registerCopy.title }}</h1>
        <p class="mx-auto max-w-[18rem] text-sm leading-6 text-muted">
          {{ registerCopy.subtitle }}
        </p>
      </div>
    </section>

    <UCard class="overflow-hidden rounded-[1.4rem] border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80">
      <form class="space-y-4" @submit.prevent="step === 'account' ? goToPin() : submitRegister()">
        <div v-if="step === 'account'" class="space-y-4">
          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <div class="flex size-9 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-200">
                <UIcon name="i-lucide-user-round" class="size-4.5" />
              </div>
              <p class="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted sm:text-[10px]">{{ registerCopy.emailOrPhone }}</p>
            </div>

            <input
              ref="identifierInput"
              v-model="identifier"
              type="text"
              inputmode="email"
              autocomplete="username"
              autocapitalize="off"
              autocorrect="off"
              spellcheck="false"
              :placeholder="registerCopy.emailPlaceholder"
              class="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[16px] font-semibold text-default shadow-none outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950"
            >
          </div>

          <label class="flex items-center justify-between gap-3 rounded-[1.2rem] border border-slate-200/80 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
            <div class="min-w-0">
              <p class="text-sm font-bold text-default">{{ registerCopy.rememberDevice }}</p>
              <p class="text-xs text-muted">{{ registerCopy.rememberHint }}</p>
            </div>

            <button
              type="button"
              class="relative inline-flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition duration-200 ease-out active:scale-95"
              :class="rememberDevice ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'"
              @click="rememberDevice = !rememberDevice"
            >
              <span
                class="inline-block size-6 rounded-full bg-white shadow-sm ring-1 ring-black/5 transition duration-200 ease-out"
                :class="rememberDevice ? 'translate-x-5' : 'translate-x-0'"
              />
            </button>
          </label>

          <UButton
            type="submit"
            :disabled="!canContinue || isSubmitting || isCheckingAccount"
            :class="['h-12 w-full rounded-full bg-gradient-to-r text-sm font-extrabold text-white shadow-[0_14px_32px_-18px_rgba(14,165,233,0.75)] transition active:scale-[0.98] sm:text-base', activeTheme.accent]"
          >
            <span class="flex w-full items-center justify-center gap-2 text-center">
              <UIcon
                :name="isSubmitting || isCheckingAccount ? 'i-lucide-refresh-cw' : 'i-lucide-arrow-right'"
                class="size-4 shrink-0"
                :class="isSubmitting || isCheckingAccount ? 'animate-spin' : ''"
              />
              <span class="text-center">{{ isSubmitting ? registerCopy.creatingAccount : isCheckingAccount ? registerCopy.checkingAccount : nextButtonLabel }}</span>
            </span>
          </UButton>

          <div class="text-center">
            <NuxtLink to="/login" class="text-sm font-bold text-primary">
              {{ registerCopy.backToSignIn }}
            </NuxtLink>
          </div>
        </div>

        <div v-else class="space-y-4">
          <div class="flex items-center justify-between gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 transition active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              @click="goBackToAccount"
            >
              <UIcon name="i-lucide-arrow-left" class="size-4" />
              {{ registerCopy.changeAccount }}
            </button>

            <UBadge color="neutral" variant="soft" class="rounded-full">
              {{ registerCopy.digits }}
            </UBadge>
          </div>

          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <div class="flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-200">
                <UIcon name="i-lucide-key-round" class="size-4.5" />
              </div>
              <p class="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted sm:text-[10px]">{{ registerCopy.createPin }}</p>
            </div>

            <input
              ref="pinInput"
              :value="pinValue"
              type="password"
              inputmode="numeric"
              autocomplete="new-password"
              autocapitalize="off"
              spellcheck="false"
              placeholder="••••••"
              class="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[16px] font-semibold tracking-[0.35em] text-default shadow-none outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950"
              @input="sanitizePin(($event.target as HTMLInputElement).value)"
            >
          </div>

          <div class="space-y-3">
            <div class="flex items-center gap-2">
              <div class="flex size-9 items-center justify-center rounded-full bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-200">
                <UIcon name="i-lucide-key-round" class="size-4.5" />
              </div>
              <p class="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted sm:text-[10px]">{{ registerCopy.confirmPin }}</p>
            </div>

            <input
              :value="confirmPinValue"
              type="password"
              inputmode="numeric"
              autocomplete="new-password"
              autocapitalize="off"
              spellcheck="false"
              placeholder="••••••"
              class="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[16px] font-semibold tracking-[0.35em] text-default shadow-none outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950"
              @input="sanitizeConfirmPin(($event.target as HTMLInputElement).value)"
            >
          </div>

          <div class="grid grid-cols-6 gap-2">
            <div
              v-for="(slot, index) in pinSlots"
              :key="index"
              class="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xl font-black text-default dark:border-slate-800 dark:bg-slate-950"
            >
              {{ slot || '·' }}
            </div>
          </div>

          <div class="grid grid-cols-6 gap-2">
            <div
              v-for="(slot, index) in confirmPinSlots"
              :key="index"
              class="flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xl font-black text-default dark:border-slate-800 dark:bg-slate-950"
            >
              {{ slot || '·' }}
            </div>
          </div>

          <p class="rounded-[1.2rem] border border-sky-200/70 bg-sky-50/80 px-4 py-3 text-xs leading-5 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-100">
            {{ registerCopy.createPinHint }} {{ registerCopy.confirmPinHint }}
          </p>

          <UButton
            type="submit"
            :disabled="pinValue.length !== 6 || isSubmitting"
            :class="['h-12 w-full rounded-full bg-gradient-to-r text-sm font-extrabold text-white shadow-[0_14px_32px_-18px_rgba(14,165,233,0.75)] transition active:scale-[0.98] sm:text-base', activeTheme.accent]"
          >
            <span class="flex w-full items-center justify-center gap-2 text-center">
              <UIcon
                :name="isSubmitting ? 'i-lucide-refresh-cw' : 'i-lucide-check'"
                class="size-4 shrink-0"
                :class="isSubmitting ? 'animate-spin' : ''"
              />
              <span class="text-center">{{ isSubmitting ? registerCopy.creating : nextButtonLabel }}</span>
            </span>
          </UButton>
        </div>

        <p v-if="errorMessage" class="rounded-[1.2rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-100">
          {{ errorMessage }}
        </p>
      </form>
    </UCard>
  </div>
</template>
