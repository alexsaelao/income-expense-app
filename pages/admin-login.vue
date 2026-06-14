<script setup lang="ts">
definePageMeta({
  layout: 'admin'
})

const router = useRouter()
const { selectedLanguage } = useAppLanguage()
const { activeTheme } = useAppThemeColor()
const { authReady, isAuthenticated, rememberedProfile, clearRememberedProfile, signIn, hydrateAuth } = useAdminDeviceAuth()

const identifier = ref('')
const rememberDevice = ref(false)
const pinValue = ref('')
const pinError = ref(false)
let pinErrorTimer: ReturnType<typeof setTimeout> | undefined
const step = ref<'account' | 'pin'>('account')
const isCheckingAccount = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref('')
const identifierInput = ref<HTMLInputElement | null>(null)

const copy = computed(() => selectedLanguage.value === 'lo'
  ? {
      welcomeBack: 'ພື້ນທີ່ Admin',
      title: 'Admin login',
      subtitle: 'ໜ້ານີ້ໃຊ້ເຂົ້າຈັດການລະບົບສຳລັບ admin ເທົ່ານັ້ນ.',
      savedAccount: 'ບັນຊີ admin ທີ່ຈື່ໄວ້',
      savedAccountHint: 'ກົດ Next ເພື່ອເຂົ້າບັນຊີນີ້ ຫຼື X ເພື່ອປ່ຽນບັນຊີ.',
      emailOrPhone: 'ອີເມວ ຫຼື ເບີໂທ',
      emailPlaceholder: 'admin@local ຫຼື 020 xxx xxxx',
      rememberDevice: 'ຈື່ຈຳອຸປະກອນນີ້',
      rememberHint: 'ບັນທຶກ admin ນີ້ໃນເຄື່ອງນີ້.',
      next: 'ຖັດໄປ',
      unlock: 'ເຂົ້າ',
      checking: 'ກຳລັງກວດ',
      signingIn: 'ກຳລັງເຂົ້າລະບົບ',
      backToSignIn: 'ກັບໄປເຂົ້າລະບົບ',
      changeAccount: 'ປ່ຽນບັນຊີ',
      digits: '6 ຫຼັກ',
      enterPin: 'ໃສ່ PIN',
      enterPinHint: 'ໃສ່ PIN 6 ຫຼັກເພື່ອເຂົ້າຈັດການ.',
      clearSavedAccount: 'ລຶບບັນຊີທີ່ຈື່ໄວ້',
      noAccount: 'ບໍ່ພົບບັນຊີ admin.',
      verifyAccount: 'ບໍ່ສາມາດກວດບັນຊີ admin ໄດ້.',
      enterAccount: 'ກະລຸນາໃສ່ອີເມວ ຫຼື ເບີໂທ admin.',
      enterPinNumbers: 'PIN ຕ້ອງເປັນ 6 ຕົວເລກ.',
      pinWrong: 'PIN ບໍ່ຖືກຕ້ອງ.',
      signInFailed: 'ບໍ່ສາມາດເຂົ້າ admin ໄດ້.',
    }
  : {
      welcomeBack: 'Admin area',
      title: 'Admin login',
      subtitle: 'This page is only for admin access to the management console.',
      savedAccount: 'Saved admin account',
      savedAccountHint: 'Tap Next to continue with this account or clear it to use another one.',
      emailOrPhone: 'Email or phone',
      emailPlaceholder: 'admin@local or 020 xxx xxxx',
      rememberDevice: 'Remember this device',
      rememberHint: 'Save this admin account on this device.',
      next: 'Next',
      unlock: 'Unlock',
      checking: 'Checking',
      signingIn: 'Signing in',
      backToSignIn: 'Back to sign in',
      changeAccount: 'Change account',
      digits: '6 digits',
      enterPin: 'Enter PIN',
      enterPinHint: 'Enter the 6-digit PIN to continue.',
      clearSavedAccount: 'Clear saved account',
      noAccount: 'No admin account found.',
      verifyAccount: 'Could not verify the admin account right now.',
      enterAccount: 'Please enter your admin email or phone number.',
      enterPinNumbers: 'PIN must be 6 numbers.',
      pinWrong: 'PIN is not correct.',
      signInFailed: 'Could not sign in right now.',
    })

const canContinue = computed(() => identifier.value.trim().length >= 3)
const hasSavedAccount = computed(() => Boolean(rememberedProfile.value?.identifier))
const nextButtonLabel = computed(() => step.value === 'account' ? copy.value.next : copy.value.unlock)
const adminPortalPath = '/superadmin'

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

function focusIdentifier() {
  nextTick(() => identifierInput.value?.focus())
}

function focusPin() {
  // iOS-style keypad does not use a text input.
}

function flashPinError() {
  pinError.value = true
  if (pinErrorTimer) {
    clearTimeout(pinErrorTimer)
  }
  pinErrorTimer = setTimeout(() => {
    pinError.value = false
    pinErrorTimer = undefined
  }, 550)
}

function clearSavedAccount() {
  clearRememberedProfile()
  identifier.value = ''
  pinValue.value = ''
  pinError.value = false
  step.value = 'account'
  errorMessage.value = ''
  rememberDevice.value = true
  focusIdentifier()
}

async function goToPin() {
  const normalized = identifier.value.trim()
  if (!normalized) {
    errorMessage.value = copy.value.enterAccount
    focusIdentifier()
    return
  }

    step.value = 'pin'
    pinValue.value = ''
    pinError.value = false
    errorMessage.value = ''
    focusPin()
    isCheckingAccount.value = true

  try {
    const result = await $fetch<{ exists: boolean }>('/api/admin/check', {
      query: { identifier: normalized }
    })

    if (!result.exists) {
      errorMessage.value = copy.value.noAccount
      step.value = 'account'
      pinValue.value = ''
      focusIdentifier()
      return
    }
  }
  catch (error) {
    const status = (error as { statusCode?: number; response?: { status?: number } } | null)?.statusCode
      ?? (error as { response?: { status?: number } } | null)?.response?.status

    if (status === 404) {
      errorMessage.value = copy.value.noAccount
      step.value = 'account'
      pinValue.value = ''
      focusIdentifier()
      return
    }

    errorMessage.value = copy.value.verifyAccount
    step.value = 'account'
    pinValue.value = ''
    focusIdentifier()
  }
  finally {
    isCheckingAccount.value = false
  }
}

function goBackToAccount() {
  step.value = 'account'
  pinValue.value = ''
  pinError.value = false
  errorMessage.value = ''
  focusIdentifier()
}

watch(step, (value) => {
  if (value === 'pin') {
    focusPin()
  }
})

async function submitLogin() {
  if (isSubmitting.value) return

  const normalizedIdentifier = identifier.value.trim()

  if (!normalizedIdentifier) {
    errorMessage.value = copy.value.enterAccount
    step.value = 'account'
    focusIdentifier()
    return
  }

  if (pinValue.value.length !== 6) {
    errorMessage.value = copy.value.enterPinNumbers
    focusPin()
    return
  }

  isSubmitting.value = true

  try {
    await $fetch('/api/admin/login', {
      method: 'POST',
      body: {
        identifier: normalizedIdentifier,
        pin: pinValue.value
      }
    })

    signIn(normalizedIdentifier, pinValue.value, rememberDevice.value)
    await router.replace(adminPortalPath)

    if (process.client && router.currentRoute.value.path !== adminPortalPath) {
      window.location.replace(adminPortalPath)
    }
  }
  catch (error) {
    const status = typeof error === 'object' && error && 'statusCode' in error ? (error as { statusCode?: number }).statusCode : undefined
    if (status === 404) {
      errorMessage.value = copy.value.noAccount
      step.value = 'account'
      return
    }

    if (status === 401) {
      errorMessage.value = copy.value.pinWrong
      flashPinError()
      pinValue.value = ''
      focusPin()
      return
    }

    errorMessage.value = copy.value.signInFailed
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
  if (pinError.value && value.length > 0) {
    pinError.value = false
  }
  if (value.length === 6 && !isSubmitting.value) {
    submitLogin()
  }
})

onMounted(() => {
  hydrateAuth()

  if (rememberedProfile.value?.identifier) {
    identifier.value = rememberedProfile.value.identifier
    rememberDevice.value = true
  }

  focusIdentifier()
})

onBeforeUnmount(() => {
  if (pinErrorTimer) {
    clearTimeout(pinErrorTimer)
  }
})
</script>

<template>
  <div class="w-full space-y-3 sm:space-y-4">
    <section v-if="step === 'account'" class="space-y-2 text-center">
      <div :class="['mx-auto flex size-12 items-center justify-center overflow-hidden rounded-[1.25rem] bg-gradient-to-br text-white shadow-[0_16px_36px_-18px_rgba(37,99,235,0.7)] sm:size-14', activeTheme.accent]">
        <img src="/wallet-codesabai-mark.svg" alt="" class="h-full w-full" />
      </div>

      <div class="space-y-0.5 sm:space-y-1">
        <p class="text-[9px] font-semibold uppercase tracking-[0.28em] text-muted sm:text-[10px]">{{ copy.welcomeBack }}</p>
        <h1 class="text-[1.55rem] font-black tracking-tight text-default sm:text-2xl">{{ copy.title }}</h1>
        <p class="mx-auto hidden max-w-sm text-[13px] leading-5 text-muted sm:block sm:text-sm sm:leading-6">{{ copy.subtitle }}</p>
      </div>
    </section>

    <section class="overflow-hidden rounded-[1.5rem] border border-white/60 bg-white/90 shadow-[0_18px_50px_-24px_rgba(15,23,42,0.22)] dark:border-white/10 dark:bg-slate-950/80">
      <form class="space-y-2 px-4 py-3 sm:space-y-3 sm:py-4" @submit.prevent="step === 'account' ? goToPin() : submitLogin()">
        <div v-if="hasSavedAccount && step === 'account'" class="mb-3 rounded-[1.2rem] border border-slate-200/80 bg-slate-50 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:mb-4">
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted">{{ copy.savedAccount }}</p>
              <p class="mt-1 truncate text-sm font-black text-default">{{ rememberedProfile?.identifier }}</p>
              <p class="mt-1 hidden text-[11px] leading-5 text-muted sm:block">{{ copy.savedAccountHint }}</p>
            </div>
            <button
              type="button"
              class="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-900 shadow-sm transition hover:bg-slate-50 active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-50"
              aria-label="Clear saved account"
              @click="clearSavedAccount"
            >
              <UIcon name="i-lucide-x" class="size-4.5" />
            </button>
          </div>
        </div>

        <div v-if="step === 'account'" class="space-y-3 sm:space-y-4">
          <div v-if="!hasSavedAccount">
            <div class="flex items-center gap-2">
              <div class="flex size-9 items-center justify-center rounded-full bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-200">
                <UIcon name="i-lucide-user-round" class="size-4.5" />
              </div>
              <p class="text-[9px] font-semibold uppercase tracking-[0.24em] text-muted sm:text-[10px]">{{ copy.emailOrPhone }}</p>
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
              :placeholder="copy.emailPlaceholder"
              class="mt-3 h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-[16px] font-semibold text-default shadow-none outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 dark:border-slate-800 dark:bg-slate-950"
              @keyup.enter="goToPin"
            >
          </div>

          <div
            v-else
            class="rounded-[1.2rem] border border-slate-200/80 bg-slate-50 px-4 py-2.5 text-sm text-muted dark:border-slate-800 dark:bg-slate-950 sm:py-3"
          >
            <span class="hidden sm:inline">{{ copy.savedAccountHint }}</span>
            <span class="sm:hidden">{{ copy.next }}</span>
          </div>

          <label class="flex items-center justify-between gap-3 rounded-[1.2rem] border border-slate-200/80 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
            <div class="min-w-0">
              <p class="text-sm font-bold text-default">{{ copy.rememberDevice }}</p>
              <p class="hidden text-xs text-muted sm:block">{{ copy.rememberHint }}</p>
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
        </div>

        <div v-else class="space-y-3 sm:space-y-4">
          <div class="flex items-center justify-between gap-3">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] font-bold text-slate-600 transition active:scale-95 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"
              @click="goBackToAccount"
            >
              <UIcon name="i-lucide-arrow-left" class="size-4" />
              {{ copy.backToSignIn }}
            </button>

            <UBadge color="neutral" variant="soft" class="rounded-full">
              {{ copy.digits }}
            </UBadge>
          </div>

          <div class="rounded-[1.2rem] border border-sky-200/70 bg-sky-50/80 px-4 py-3 dark:border-sky-900/50 dark:bg-sky-950/30">
            <p class="text-[9px] font-semibold uppercase tracking-[0.24em] text-sky-700 dark:text-sky-100">{{ copy.emailOrPhone }}</p>
            <p class="mt-1 break-all text-base font-black text-default">{{ identifier }}</p>
          </div>

          <IosPinKeypad
            v-model="pinValue"
            :disabled="isSubmitting || isCheckingAccount"
            :error="pinError"
            @clear="errorMessage = ''"
          />
        </div>

        <p v-if="errorMessage" class="mt-2 rounded-[0.95rem] border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-100">
          {{ errorMessage }}
        </p>

        <div class="flex items-center gap-3">
          <UButton
            v-if="step === 'account'"
            type="button"
            :class="['h-11 flex-1 justify-center rounded-full bg-gradient-to-r px-4 text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(15,23,42,0.45)] transition hover:opacity-95 active:scale-95', activeTheme.accent]"
            :disabled="!canContinue || isCheckingAccount"
            @click="goToPin"
          >
            <span class="flex w-full items-center justify-center gap-2 text-center">
              <UIcon
                :name="isCheckingAccount ? 'i-lucide-refresh-cw' : 'i-lucide-arrow-right'"
                class="size-4 shrink-0"
                :class="isCheckingAccount ? 'animate-spin' : ''"
              />
              <span class="text-center">{{ isCheckingAccount ? copy.checking : copy.next }}</span>
            </span>
          </UButton>

          <div
            v-else
            class="flex h-11 flex-1 items-center justify-center rounded-full border border-dashed border-slate-200 bg-slate-50 px-4 text-xs font-semibold text-muted dark:border-slate-800 dark:bg-slate-900"
          >
            {{ isSubmitting ? copy.signingIn : copy.enterPin }}
          </div>
        </div>
      </form>
    </section>
  </div>
</template>
