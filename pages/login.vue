<script setup lang="ts">
definePageMeta({
  layout: 'auth'
})

const router = useRouter()
const { selectedLanguage } = useAppLanguage()
const { activeTheme } = useAppThemeColor()
const { authReady, isAuthenticated, rememberedProfile, clearRememberedProfile, signIn } = useDeviceAuth()

const identifier = ref('')
const rememberDevice = ref(false)
const pinValue = ref('')
const step = ref<'account' | 'pin'>('account')
const isCheckingAccount = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const identifierInput = ref<HTMLInputElement | null>(null)

const loginCopy = computed(() => selectedLanguage.value === 'lo'
  ? {
      welcomeBack: 'ຍິນດີຕ້ອນຮັບກັບຄືນ',
      title: 'ເຂົ້າລະບົບ',
      subtitle: 'ໃຊ້ອີເມວ ຫຼື ເບີໂທ ແລ້ວໃສ່ PIN 6 ຫຼັກເພື່ອເຂົ້າໃຊ້ງານ.',
      savedAccount: 'ບັນຊີທີ່ບັນທຶກໄວ້',
      savedAccountHint: 'ກົດ Next ເພື່ອໃຊ້ບັນຊີນີ້ ຫຼື ກົດ X ເພື່ອໃສ່ບັນຊີໃໝ່.',
      emailOrPhone: 'ອີເມວ ຫຼື ເບີໂທ',
      emailPlaceholder: 'name@example.com ຫຼື 020 xxx xxxx',
      rememberDevice: 'ຈື່ຈຳອຸປະກອນນີ້',
      rememberHint: 'ບັນທຶກບັນຊີນີ້ໄວ້ໃນໂທລະສັບ ຫຼື ແທັບເລັດນີ້.',
      next: 'ຖັດໄປ',
      unlock: 'ເປີດ',
      checking: 'ກຳລັງກວດ',
      signingIn: 'ກຳລັງເຂົ້າລະບົບ',
      backToSignIn: 'ກັບໄປເຂົ້າລະບົບ',
      changeAccount: 'ປ່ຽນບັນຊີ',
      digits: '6 ຫຼັກ',
      enterPin: 'ໃສ່ PIN',
      enterPinHint: 'ໃສ່ PIN 6 ຫຼັກເພື່ອເປີດໃຊ້ງານ.',
      clearSavedAccount: 'ລຶບບັນຊີທີ່ບັນທຶກ',
      createAccount: 'ສ້າງບັນຊີ',
      noAccount: 'ບໍ່ພົບບັນຊີ. ກະລຸນາສ້າງບັນຊີກ່ອນ.',
      verifyAccount: 'ບໍ່ສາມາດກວດບັນຊີໄດ້ຕອນນີ້.',
      enterAccount: 'ກະລຸນາໃສ່ອີເມວ ຫຼື ເບີໂທ.',
      enterPinNumbers: 'PIN ຕ້ອງເປັນ 6 ຕົວເລກ.',
      pinWrong: 'PIN ບໍ່ຖືກຕ້ອງ.',
      signInFailed: 'ບໍ່ສາມາດເຂົ້າລະບົບໄດ້ຕອນນີ້.'
    }
  : {
      welcomeBack: 'Welcome back',
      title: 'Sign in',
      subtitle: 'Use your email or phone number, then enter your 6-digit PIN to unlock your device.',
      savedAccount: 'Saved account',
      savedAccountHint: 'Tap Next to continue with the saved account or clear it to use a new one.',
      emailOrPhone: 'Email or phone',
      emailPlaceholder: 'name@example.com or 020 xxx xxxx',
      rememberDevice: 'Remember this device',
      rememberHint: 'Save this account on this phone or tablet.',
      next: 'Next',
      unlock: 'Unlock',
      checking: 'Checking',
      signingIn: 'Signing in',
      backToSignIn: 'Back to sign in',
      changeAccount: 'Change account',
      digits: '6 digits',
      enterPin: 'Enter PIN',
      enterPinHint: 'Enter your 6-digit PIN to continue.',
      clearSavedAccount: 'Clear saved account',
      createAccount: 'Create account',
      noAccount: 'No account found. Please create one first.',
      verifyAccount: 'Could not verify the account right now.',
      enterAccount: 'Please enter your email or phone number.',
      enterPinNumbers: 'PIN must be 6 numbers.',
      pinWrong: 'PIN is not correct.',
      signInFailed: 'Could not sign in right now.'
    })

const canContinue = computed(() => identifier.value.trim().length >= 3 || hasSavedAccount.value)
const hasSavedAccount = computed(() => Boolean(rememberedProfile.value?.identifier))
const nextButtonLabel = computed(() => step.value === 'account' ? loginCopy.value.next : loginCopy.value.unlock)

watch(
  rememberedProfile,
  (profile) => {
    if (profile?.identifier) {
      identifier.value = profile.identifier
      rememberDevice.value = true
    }
  },
  { immediate: true }
)

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
  nextTick(() => {
    identifierInput.value?.focus({ preventScroll: true })
  })
}

function focusPin() {
  // iOS-style keypad does not use a text input.
}

function clearSavedAccount() {
  clearRememberedProfile()
  identifier.value = ''
  pinValue.value = ''
  step.value = 'account'
  errorMessage.value = ''
  rememberDevice.value = true
  focusIdentifier()
}

async function goToPin() {
  const normalized = identifier.value.trim() || rememberedProfile.value?.identifier?.trim() || ''
  if (!normalized) {
    errorMessage.value = loginCopy.value.enterAccount
    focusIdentifier()
    return
  }

  identifier.value = normalized
  isCheckingAccount.value = true
  errorMessage.value = ''

  try {
    const result = await $fetch<{ exists: boolean }>('/api/auth/check', {
      query: { identifier: normalized }
    })

    if (!result.exists) {
      errorMessage.value = loginCopy.value.noAccount
      return
    }

    step.value = 'pin'
    pinValue.value = ''
    focusPin()
  }
  catch (error) {
    const status = (error as { statusCode?: number; response?: { status?: number } } | null)?.statusCode
      ?? (error as { response?: { status?: number } } | null)?.response?.status

    if (status === 404) {
      errorMessage.value = loginCopy.value.noAccount
      return
    }

    errorMessage.value = loginCopy.value.verifyAccount
  }
  finally {
    isCheckingAccount.value = false
  }
}

function goBackToAccount() {
  step.value = 'account'
  pinValue.value = ''
  errorMessage.value = ''
  focusIdentifier()
}

async function submitLogin() {
  if (isSubmitting.value) return

  const normalizedIdentifier = identifier.value.trim()

  if (!normalizedIdentifier) {
    errorMessage.value = loginCopy.value.enterAccount
    step.value = 'account'
    focusIdentifier()
    return
  }

  if (pinValue.value.length !== 6) {
    errorMessage.value = loginCopy.value.enterPinNumbers
    focusPin()
    return
  }

  isSubmitting.value = true

  try {
    const result = await $fetch<{
      ok: boolean
      account: { plan?: 'free' | 'pro' }
    }>('/api/auth/login', {
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
    const status = typeof error === 'object' && error && 'statusCode' in error ? (error as { statusCode?: number }).statusCode : undefined
    if (status === 404) {
      errorMessage.value = loginCopy.value.noAccount
      step.value = 'account'
      return
    }

    if (status === 401) {
      errorMessage.value = loginCopy.value.pinWrong
      pinValue.value = ''
      focusPin()
      return
    }

    errorMessage.value = loginCopy.value.signInFailed
  }
  finally {
    isSubmitting.value = false
  }
}

watch(pinValue, (value) => {
  if (step.value !== 'pin') return
  if (errorMessage.value) {
    errorMessage.value = ''
  }
  if (value.length === 6 && !isSubmitting.value) {
    submitLogin()
  }
})

watch(step, (currentStep) => {
  if (currentStep === 'pin') {
    focusPin()
    return
  }

  focusIdentifier()
})

onMounted(() => {
  if (isAuthenticated.value) {
    router.replace('/')
    return
  }

  if (rememberedProfile.value?.identifier) {
    identifier.value = rememberedProfile.value.identifier
    rememberDevice.value = true
  }

  focusIdentifier()
})
</script>

<template>
  <div class="flex h-full flex-1 items-center justify-center overflow-hidden py-1 sm:py-2">
    <div class="w-full max-w-[26rem] space-y-3 sm:space-y-4">
      <section v-if="step === 'account'" class="space-y-2 text-center">
        <div :class="['mx-auto flex size-12 items-center justify-center overflow-hidden rounded-[1.25rem] bg-gradient-to-br text-white shadow-[0_16px_36px_-18px_rgba(37,99,235,0.7)] sm:size-14', activeTheme.accent]">
          <img src="/wallet-codesabai-mark.svg" alt="" class="h-full w-full" />
        </div>

        <div class="space-y-0.5 sm:space-y-1">
          <p class="text-[9px] font-semibold uppercase tracking-[0.28em] text-muted sm:text-[10px]">
            {{ loginCopy.welcomeBack }}
          </p>
          <h1 class="text-2xl font-black tracking-tight text-default sm:text-[1.75rem]">
            {{ loginCopy.title }}
          </h1>
          <p class="mx-auto max-w-[22rem] text-sm leading-6 text-muted sm:text-[15px]">
            {{ loginCopy.subtitle }}
          </p>
        </div>
      </section>

      <UCard class="overflow-hidden rounded-[1.4rem] border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80">
        <form class="space-y-2 sm:space-y-3" @submit.prevent="step === 'account' ? goToPin() : submitLogin()">
        <div
          v-if="hasSavedAccount && step === 'account'"
          class="rounded-[1.2rem] border border-sky-200/70 bg-sky-50/80 p-3 dark:border-sky-900/50 dark:bg-sky-950/30 sm:p-4"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-100">{{ loginCopy.savedAccount }}</p>
              <p class="mt-1 break-all text-base font-black text-default">{{ rememberedProfile?.identifier }}</p>
              <p class="mt-1 hidden text-xs leading-5 text-muted sm:block">{{ loginCopy.savedAccountHint }}</p>
            </div>

            <button
              type="button"
              class="inline-flex size-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition active:scale-95 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
              :aria-label="loginCopy.clearSavedAccount"
              @click="clearSavedAccount"
            >
              <UIcon name="i-lucide-x" class="size-4.5" />
            </button>
          </div>
        </div>

        <div v-if="step === 'account'" class="space-y-3 sm:space-y-4">
          <div v-if="!hasSavedAccount">
            <div class="flex items-center gap-2">
              <div class="flex size-8 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-200">
                <UIcon name="i-lucide-user-round" class="size-4" />
              </div>
              <p class="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted sm:text-[10px]">{{ loginCopy.emailOrPhone }}</p>
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
              :placeholder="loginCopy.emailPlaceholder"
              class="mt-3 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[16px] font-semibold text-default shadow-none outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950 sm:h-12"
            >
          </div>

          <div
            v-else
            class="rounded-[1.2rem] border border-slate-200/80 bg-slate-50 px-4 py-2.5 text-sm text-muted dark:border-slate-800 dark:bg-slate-950 sm:py-3"
          >
            <span class="hidden sm:inline">{{ loginCopy.savedAccountHint }}</span>
            <span class="sm:hidden">{{ loginCopy.next }}</span>
          </div>

          <label class="flex items-center justify-between gap-3 rounded-[1.2rem] border border-slate-200/80 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-950 sm:py-3">
            <div class="min-w-0">
              <p class="text-sm font-bold text-default">{{ loginCopy.rememberDevice }}</p>
              <p class="hidden text-xs text-muted sm:block">{{ loginCopy.rememberHint }}</p>
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
            :disabled="isSubmitting || isCheckingAccount"
            :class="['h-11 w-full rounded-full bg-gradient-to-r text-sm font-extrabold text-white shadow-[0_14px_32px_-18px_rgba(14,165,233,0.75)] transition active:scale-[0.98] sm:h-12 sm:text-base', activeTheme.accent]"
          >
            <span class="flex w-full items-center justify-center gap-2 text-center">
              <UIcon
                :name="isSubmitting || isCheckingAccount ? 'i-lucide-refresh-cw' : 'i-lucide-arrow-right'"
                class="size-4 shrink-0"
                :class="isSubmitting || isCheckingAccount ? 'animate-spin' : ''"
              />
              <span class="text-center">{{ isSubmitting ? loginCopy.signingIn : isCheckingAccount ? loginCopy.checking : nextButtonLabel }}</span>
            </span>
          </UButton>

          <div class="flex flex-wrap items-center justify-center gap-2 text-center">
            <NuxtLink
              to="/admin-login"
              class="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3.5 py-1.5 text-[11px] font-bold text-slate-600 transition active:scale-95 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
            >
              Admin login
            </NuxtLink>

            <NuxtLink to="/register" class="hidden items-center justify-center rounded-full border border-transparent px-3.5 py-1.5 text-[11px] font-bold text-primary transition active:scale-95 sm:inline-flex">
              {{ loginCopy.createAccount }}
            </NuxtLink>
          </div>
        </div>

        <div v-else class="space-y-3 sm:space-y-4">
          <div class="flex items-center justify-between gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-bold text-slate-600 transition active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              @click="goBackToAccount"
            >
              <UIcon name="i-lucide-arrow-left" class="size-4" />
              {{ loginCopy.changeAccount }}
            </button>

            <UBadge color="neutral" variant="soft" class="rounded-full">
              {{ loginCopy.digits }}
            </UBadge>
          </div>

          <div class="rounded-[1.2rem] border border-sky-200/70 bg-sky-50/80 px-4 py-3 dark:border-sky-900/50 dark:bg-sky-950/30">
            <p class="text-[9px] font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-100">{{ loginCopy.emailOrPhone }}</p>
            <p class="mt-1 break-all text-base font-black text-default">{{ identifier }}</p>
          </div>

          <IosPinKeypad
            v-model="pinValue"
            :disabled="isSubmitting || isCheckingAccount"
            @clear="errorMessage = ''"
          />
        </div>

        <p v-if="errorMessage" class="mt-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-100">
          {{ errorMessage }}
        </p>
        </form>
      </UCard>
    </div>
  </div>
</template>
