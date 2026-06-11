<script setup lang="ts">
definePageMeta({
  layout: 'install'
})

type DeviceType = 'ios' | 'android' | 'other'

useAppLanguage()
const { activeTheme } = useAppThemeColor()
const { isStandalone } = usePwaDisplayMode()
const { $pwa } = useNuxtApp()

const appIconSrc = '/wallet-codesabai-mark.svg'
const publicAppHomeUrl = 'https://appwallet.codesabai.com/'
const iosGuideRef = ref<HTMLElement | null>(null)
const isInstalling = ref(false)
const showAndroidFallback = ref(false)
const deviceType = ref<DeviceType>('other')

const copy = {
  title: 'ຕິດຕັ້ງແອັບ',
  subtitle: 'ໜ້ານີ້ຈະປັບຕາມ iPhone, iPad ຫຼື Android ອັດຕະໂນມັດ.',
  button: 'ຕິດຕັ້ງ',
  openApp: 'ເປີດແອັບ',
  iosCta: 'ເບິ່ງຂັ້ນຕອນ iPhone',
  installed: 'ຕິດຕັ້ງແລ້ວ',
  installedHint: 'ເປີດຈາກ Home Screen ເພື່ອເຂົ້າແອັບທັນທີ.',
  deviceIos: 'iPhone / iPad',
  deviceAndroid: 'Android',
  deviceOther: 'ອຸປະກອນອື່ນ',
  ready: 'ພ້ອມຕິດຕັ້ງ',
  guideBadge: 'ຄູ່ມື iPhone',
  guideTitle: 'ເພີ່ມເຂົ້າ Home Screen ໃນ Safari',
  guideSubtitle: 'iPhone ບໍ່ມີປຸ່ມຕິດຕັ້ງແບບກົດຄັ້ງດຽວ, ເລີຍໃຫ້ໃຊ້ Share > Add to Home Screen.',
  iosSteps: [
    {
      step: '1',
      title: 'ເປີດໜ້ານີ້ໃນ Safari',
      description: 'Safari ເທົ່ານັ້ນຈະມີເມນູທີ່ຕ້ອງໃຊ້.'
    },
    {
      step: '2',
      title: 'ແຕະປຸ່ມ Share',
      description: 'ຊອກຫາໄອຄອນສົ່ງອອກ ຫຼືລູກສອນຂຶ້ນ.'
    },
    {
      step: '3',
      title: 'ເລືອກ Add to Home Screen',
      description: 'ລະບົບຈະສ້າງໄອຄອນແອັບໃຫ້ທັນທີ.'
    },
    {
      step: '4',
      title: 'ເປີດຈາກ Home Screen',
      description: 'ຫຼັງຈາກນັ້ນແອັບຈະເປີດເຕັມຈໍ.'
    }
  ],
  iosTrail: ['Safari', 'Share', 'Add to Home Screen'],
  iosLimit: 'iPhone ບໍ່ອະນຸຍາດ one-tap install ຈາກເວັບ, ດັ່ງນັ້ນຕ້ອງໃຊ້ຂັ້ນຕອນນີ້.',
  androidTitle: 'ຕິດຕັ້ງໃນ Android',
  androidHint: 'ແຕະປຸ່ມຕິດຕັ້ງ ເພື່ອຕິດຕັ້ງອັດຕະໂນມັດໃນ browser ທີ່ຮອງຮັບ.',
  androidFallback: 'ຖ້າບໍ່ຂຶ້ນ prompt, ໃຫ້ເປີດໜ້ານີ້ໃນ Chrome ຫຼື browser ທີ່ຮອງຮັບ PWA.',
  androidSteps: [
    {
      step: '1',
      title: 'ໃຊ້ browser ທີ່ຮອງຮັບ',
      description: 'Chrome ແລະ browser ທີ່ຮອງຮັບ PWA ຈະເຫັນ install prompt.'
    },
    {
      step: '2',
      title: 'ແຕະປຸ່ມຕິດຕັ້ງ',
      description: 'ລະບົບຈະຕິດຕັ້ງແອັບໃຫ້ທັນທີ.'
    },
    {
      step: '3',
      title: 'ເປີດແອັບຈາກ Home Screen',
      description: 'ແອັບຈະເປີດແບບເຕັມຈໍຄື native app.'
    }
  ],
  otherTitle: 'ເປີດຈາກ iPhone / Android',
  otherHint: 'ໜ້ານີ້ຈະແສດງປຸ່ມຕິດຕັ້ງທີ່ກົງກັບ browser ຂອງອຸປະກອນ.',
  fallbackBadge: 'ຄຳແນະນຳ'
}

const themeAccentClass = computed(() => activeTheme.value?.accent ?? 'from-sky-500 to-cyan-400')

const isIosDevice = computed(() => deviceType.value === 'ios')
const isAndroidDevice = computed(() => deviceType.value === 'android')
const canUseNativePrompt = computed(() => isAndroidDevice.value && Boolean($pwa?.showInstallPrompt && $pwa?.install))

const buttonLabel = computed(() => {
  if (isStandalone.value) return copy.openApp
  if (isIosDevice.value) return copy.iosCta
  return copy.button
})

const buttonIcon = computed(() => {
  if (isStandalone.value) return 'i-lucide-app-window'
  if (isIosDevice.value) return 'i-lucide-arrow-down-circle'
  return 'i-lucide-download'
})

const iosMockups = computed(() => [
  {
    step: '1',
    title: 'Three dots',
    subtitle: 'Tap the bottom menu',
    variant: 'dots' as const,
    accent: 'from-sky-500 to-cyan-400',
    note: 'ແຕະຈຸດ 3 ຈຸດດ້ານລຸ່ມຂອງ Safari ເພື່ອເປີດເມນູ.'
  },
  {
    step: '2',
    title: 'Share sheet',
    subtitle: 'Tap Share',
    variant: 'share' as const,
    accent: 'from-slate-700 to-slate-900',
    note: 'ຫຼັງຈາກກົດ Share ແລ້ວ ແຜ່ນ share sheet ຈະເປີດຂຶ້ນ.'
  },
  {
    step: '3',
    title: 'Scroll down',
    subtitle: 'Find Add to Home Screen',
    variant: 'more' as const,
    accent: 'from-amber-500 to-yellow-400',
    note: 'ເລື່ອນລົງເພື່ອຫາ Add to Home Screen.'
  },
  {
    step: '4',
    title: 'Add',
    subtitle: 'Confirm the install',
    variant: 'add' as const,
    accent: 'from-emerald-500 to-teal-400',
    note: 'ກົດ Add ເພື່ອເພີ່ມໄອຄອນໃຫ້ໜ້າຈໍໂຮມ.'
  }
])

const androidMockups = computed(() => [
  {
    step: '1',
    title: 'Supported browser',
    subtitle: 'Chrome / PWA browser',
    accent: 'from-sky-500 to-cyan-400',
    icon: 'i-lucide-globe',
    note: 'ເປີດໜ້ານີ້ໃນ browser ທີ່ຮອງຮັບ.'
  },
  {
    step: '2',
    title: 'Install prompt',
    subtitle: 'Tap Install',
    accent: 'from-emerald-500 to-teal-400',
    icon: 'i-lucide-download',
    note: 'ກົດ Install ເພື່ອເພີ່ມແອັບເຂົ້າອຸປະກອນ.'
  },
  {
    step: '3',
    title: 'Home screen',
    subtitle: 'Open like an app',
    accent: 'from-violet-500 to-fuchsia-500',
    icon: 'i-lucide-app-window',
    note: 'ເປີດຈາກ Home Screen ແລ້ວໃຊ້ແບບ native app.'
  }
])

useHead(() => ({
  title: 'ຕິດຕັ້ງ Wallet Code Sabai'
}))

function detectDeviceType(): DeviceType {
  if (import.meta.server) return 'other'

  const ua = navigator.userAgent
  const platform = navigator.platform
  const iPadLike = /iPad/i.test(ua) || (platform === 'MacIntel' && navigator.maxTouchPoints > 1)

  if (/iPhone|iPod/i.test(ua) || iPadLike) return 'ios'
  if (/Android/i.test(ua)) return 'android'

  return 'other'
}

function scrollToIosGuide() {
  iosGuideRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

async function installApp() {
  if (isStandalone.value) {
    window.location.replace(publicAppHomeUrl)
    return
  }

  if (isIosDevice.value) {
    scrollToIosGuide()
    return
  }

  if (canUseNativePrompt.value && $pwa?.install) {
    isInstalling.value = true
    showAndroidFallback.value = false

    try {
      await $pwa.install()
    }
    finally {
      isInstalling.value = false
    }

    return
  }

  showAndroidFallback.value = true
}

onMounted(() => {
  deviceType.value = detectDeviceType()

  if (isStandalone.value) {
    window.location.replace(publicAppHomeUrl)
  }
})

watch(isStandalone, (value) => {
  if (value) {
    window.location.replace(publicAppHomeUrl)
  }
}, { immediate: true })
</script>

<template>
  <div class="relative isolate min-h-screen overflow-hidden bg-slate-50 text-slate-900">
    <div class="pointer-events-none absolute inset-0 overflow-hidden">
      <div class="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.18),transparent_60%)]" />
      <div class="absolute left-[-5rem] top-20 h-56 w-56 rounded-full bg-sky-300/25 blur-3xl" />
      <div class="absolute right-[-5rem] top-28 h-56 w-56 rounded-full bg-cyan-300/25 blur-3xl" />
      <div class="absolute bottom-0 left-1/2 h-64 w-[32rem] -translate-x-1/2 rounded-full bg-blue-200/20 blur-3xl" />
    </div>

    <div class="relative mx-auto flex min-h-screen w-full max-w-lg flex-col px-4 py-4 sm:px-6 sm:py-6">
      <main class="flex flex-1 flex-col gap-4 pb-2">
        <section class="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_22px_60px_-34px_rgba(15,23,42,0.28)] backdrop-blur-xl sm:p-6">
          <div class="flex flex-col items-center text-center">
            <div :class="['flex size-20 items-center justify-center rounded-[1.8rem] border border-white/80 bg-white shadow-[0_22px_40px_-22px_rgba(15,23,42,0.28)]', themeAccentClass]">
              <img :src="appIconSrc" alt="Wallet Code Sabai" class="h-11 w-11 object-contain">
            </div>

            <div class="mt-4 space-y-2">
              <p class="text-[10px] font-semibold uppercase tracking-[0.32em] text-slate-500">
                {{ copy.ready }}
              </p>
              <h2 class="text-3xl font-black tracking-tight text-slate-900 sm:text-[2.25rem]">
                {{ copy.title }}
              </h2>
              <p class="mx-auto max-w-md text-sm leading-6 text-slate-600 sm:text-[15px]">
                {{ copy.subtitle }}
              </p>
            </div>

            <div class="mt-4 flex flex-wrap justify-center gap-2">
              <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                {{ isIosDevice ? copy.deviceIos : isAndroidDevice ? copy.deviceAndroid : copy.deviceOther }}
              </span>
              <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-slate-500">
                {{ isStandalone ? copy.installed : buttonLabel }}
              </span>
            </div>

            <UButton
              class="mt-5 h-12 w-full justify-center rounded-full bg-gradient-to-r text-[13px] font-bold text-white shadow-[0_14px_30px_-16px_rgba(14,165,233,0.8)] transition active:scale-[0.99] sm:h-12 sm:text-sm"
              :class="themeAccentClass"
              :loading="isInstalling"
              @click="installApp"
            >
              <span class="flex items-center gap-2">
                <UIcon :name="buttonIcon" class="size-4" />
                <span>{{ buttonLabel }}</span>
              </span>
            </UButton>

            <p v-if="isStandalone" class="mt-3 text-xs leading-5 text-slate-500">
              {{ copy.installedHint }}
            </p>
          </div>
        </section>

        <section
          v-if="isIosDevice"
          ref="iosGuideRef"
          class="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_22px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur-xl sm:p-6"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-600">
                {{ copy.guideBadge }}
              </p>
              <h3 class="mt-1 text-lg font-black tracking-tight text-slate-900">
                {{ copy.guideTitle }}
              </h3>
              <p class="mt-2 text-sm leading-6 text-slate-600">
                {{ copy.guideSubtitle }}
              </p>
            </div>

            <div class="hidden shrink-0 rounded-2xl bg-sky-50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-sky-700 sm:block">
              Safari
            </div>
          </div>

          <div class="mt-4 flex flex-wrap gap-2">
            <span
              v-for="step in copy.iosTrail"
              :key="step"
              class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-600"
            >
              {{ step }}
            </span>
          </div>

          <div v-if="false" class="mt-4">
            <div class="mb-3 flex items-center justify-between gap-3">
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Mobile slide
                </p>
                <p class="text-sm font-bold text-slate-900">
                  Step by step mockup
                </p>
              </div>
              <p class="text-xs font-medium text-slate-500">
                Swipe left
              </p>
            </div>

            <div class="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
              <article
                v-for="slide in iosMockups"
                :key="slide.step"
                class="min-w-[18rem] snap-start overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white p-3 shadow-[0_14px_34px_-24px_rgba(15,23,42,0.25)]"
              >
                <div class="flex items-center justify-between">
                  <span class="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                    Step {{ slide.step }}
                  </span>
                  <span class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Slide
                  </span>
                </div>

                <div class="mt-3 overflow-hidden rounded-[1.4rem] bg-[#f3f6fb] p-2">
                  <div class="flex items-center justify-between px-2 pt-1 text-[10px] font-bold text-slate-900">
                    <span>17:24</span>
                    <span>iPhone</span>
                  </div>

                  <div
                    :class="[
                      'mt-3 overflow-hidden rounded-[1.25rem] border bg-white shadow-[0_18px_30px_-24px_rgba(15,23,42,0.22)]',
                      slide.variant === 'share' ? 'border-slate-200 bg-white/95' : 'border-slate-100'
                    ]"
                  >
                    <template v-if="slide.variant === 'dots'">
                      <div class="relative overflow-hidden bg-[#f7f9fd]">
                        <div class="px-3 pt-4">
                          <div class="flex items-center justify-between text-[10px] font-bold text-slate-900">
                            <span>17:24</span>
                            <span class="inline-flex items-center gap-1.5">
                              <span>▂▂▂</span>
                              <span>◜◝</span>
                              <span>49</span>
                            </span>
                          </div>

                          <div class="mt-10 rounded-[1.8rem] border border-slate-100 bg-white px-4 py-4 shadow-[0_22px_44px_-28px_rgba(15,23,42,0.18)]">
                            <div class="mx-auto flex size-20 items-center justify-center rounded-[1.5rem] border border-slate-100 bg-white shadow-[0_16px_28px_-20px_rgba(15,23,42,0.16)]">
                              <img :src="appIconSrc" alt="Wallet Code Sabai" class="h-11 w-11 object-contain">
                            </div>

                            <div class="mt-5 text-center">
                              <p class="text-[10px] font-semibold uppercase tracking-[0.34em] text-slate-500">
                                INSTALL APP
                              </p>
                              <h4 class="mt-2 text-[clamp(1.45rem,4vw,1.95rem)] font-black tracking-tight text-slate-900">
                                Install app
                              </h4>
                              <p class="mt-3 text-[13px] leading-5 text-slate-500">
                                This page adapts automatically for iPhone/iPad or Android.
                              </p>
                            </div>

                            <div class="mt-4 flex flex-wrap justify-center gap-2">
                              <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.24em] text-slate-500">
                                iPhone / iPad detected
                              </span>
                              <span class="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.24em] text-slate-500">
                                View iPhone steps
                              </span>
                            </div>
                          </div>
                        </div>

                        <div class="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-slate-900/90 px-4 py-2.5 text-white shadow-[0_18px_30px_-18px_rgba(15,23,42,0.45)]">
                          <div class="flex size-8 items-center justify-center rounded-full bg-white/10">
                            <UIcon name="i-lucide-arrow-left" class="size-4 rotate-180" />
                          </div>
                          <div class="flex size-8 items-center justify-center rounded-full bg-white/10">
                            <UIcon name="i-lucide-circle" class="size-4" />
                          </div>
                          <div class="flex size-8 items-center justify-center rounded-full bg-white/10">
                            <UIcon name="i-lucide-more-horizontal" class="size-4" />
                          </div>
                        </div>
                      </div>
                    </template>

                    <template v-else-if="slide.variant === 'share'">
                      <div class="relative overflow-hidden bg-[#eef0f4]">
                        <div class="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/5 to-transparent" />
                        <div class="relative px-3 pb-4 pt-3">
                          <div class="flex items-center justify-between text-[10px] font-bold text-slate-900">
                            <span>17:24</span>
                            <span class="inline-flex items-center gap-1.5">
                              <span>▂▂▂</span>
                              <span>◜◝</span>
                              <span>49</span>
                            </span>
                          </div>

                          <div class="mt-3 rounded-[1.7rem] bg-white/85 px-3 pb-4 pt-3 shadow-[0_24px_50px_-30px_rgba(15,23,42,0.28)] backdrop-blur-xl">
                            <div class="flex items-start gap-3">
                              <div class="flex size-14 shrink-0 items-center justify-center rounded-[1.15rem] border border-slate-200 bg-white shadow-sm">
                                <UIcon name="i-lucide-compass" class="size-7 text-slate-500" />
                              </div>

                              <div class="min-w-0 flex-1">
                                <p class="truncate text-[16px] font-black text-slate-900">
                                  Install Wallet Code Sabai
                                </p>
                                <p class="mt-1 text-[12px] text-slate-500">
                                  192.168.100.206
                                </p>
                                <div class="mt-3 inline-flex items-center rounded-full bg-white px-3 py-2 text-[12px] font-bold text-slate-700 shadow-[0_10px_20px_-14px_rgba(15,23,42,0.18)]">
                                  ຕົວເລືອກ
                                  <UIcon name="i-lucide-chevron-right" class="ml-1.5 size-4 text-slate-400" />
                                </div>
                              </div>

                              <div class="ml-auto flex size-11 shrink-0 items-center justify-center rounded-full bg-white shadow-[0_12px_18px_-10px_rgba(15,23,42,0.18)]">
                                <UIcon name="i-lucide-x" class="size-7 text-slate-900" />
                              </div>
                            </div>

                            <div class="mt-6 grid grid-cols-4 gap-2 text-center">
                              <div class="space-y-2">
                                <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100">
                                  <UIcon name="i-lucide-copy" class="size-7 text-slate-900" />
                                </div>
                                <p class="text-[11px] leading-4 text-slate-700">ຄັດລອກ</p>
                              </div>
                              <div class="space-y-2">
                                <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100">
                                  <UIcon name="i-lucide-bookmark" class="size-7 text-slate-900" />
                                </div>
                                <p class="text-[11px] leading-4 text-slate-700">ເພີ່ມທີ່ຄັ້ນໜ້າ</p>
                              </div>
                              <div class="space-y-2">
                                <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100">
                                  <UIcon name="i-lucide-glasses" class="size-7 text-slate-900" />
                                </div>
                                <p class="text-[11px] leading-4 text-slate-700">ລາຍການອ່ານ</p>
                              </div>
                              <div class="space-y-2">
                                <div class="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100">
                                  <UIcon name="i-lucide-chevron-up" class="size-7 text-slate-900" />
                                </div>
                                <p class="text-[11px] leading-4 text-slate-700">ດູນ້ອຍລົງ</p>
                              </div>
                            </div>

                            <div class="mt-5 space-y-0 rounded-[1.35rem] bg-[#f2f3f6] px-3 py-2">
                              <div class="flex items-center gap-3 rounded-2xl bg-white px-3 py-3">
                                <UIcon name="i-lucide-book-open" class="size-5 text-slate-700" />
                                <p class="text-[14px] text-slate-900">ເພີ່ມທີ່ຄັ້ນໜ້າໄປຍັງ...</p>
                              </div>
                              <div class="mt-2 flex items-center gap-3 rounded-2xl bg-white px-3 py-3">
                                <UIcon name="i-lucide-star" class="size-5 text-slate-700" />
                                <p class="text-[14px] text-slate-900">ເພີ່ມໄປຍັງລາຍການໂປຣດ</p>
                              </div>
                              <div class="mt-2 flex items-center gap-3 rounded-2xl bg-white px-3 py-3">
                                <UIcon name="i-lucide-message-square" class="size-5 text-slate-700" />
                                <p class="text-[14px] text-slate-900">ເພີ່ມໄປຍັງໂນດດ່ວນ</p>
                              </div>
                              <div class="mt-2 flex items-center gap-3 rounded-2xl bg-white px-3 py-3">
                                <UIcon name="i-lucide-search" class="size-5 text-slate-700" />
                                <p class="text-[14px] text-slate-900">ຄົ້ນຫາໃນໜ້າ</p>
                              </div>
                              <div class="mt-2 flex items-center gap-3 rounded-2xl bg-white px-3 py-3">
                                <UIcon name="i-lucide-square-plus" class="size-5 text-slate-700" />
                                <p class="text-[14px] font-medium text-slate-900">ເພີ່ມໄປຍັງໜ້າຈໍໂຮມ</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>

                    <template v-else-if="slide.variant === 'more'">
                      <div class="overflow-hidden bg-[#eef0f4]">
                        <div class="flex items-center justify-between border-b border-slate-200/80 bg-[#f7f8fc] px-3 py-3">
                          <div class="flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
                            <UIcon name="i-lucide-x" class="size-6 text-slate-900" />
                          </div>
                          <p class="text-[13px] font-bold text-slate-900">
                            ເພີ່ມໄປຍັງໜ້າຈໍໂຮມ
                          </p>
                          <div class="rounded-full bg-blue-500 px-4 py-2 text-[12px] font-bold text-white shadow-sm">
                            ເພີ່ມ
                          </div>
                        </div>

                        <div class="px-3 py-4">
                          <div class="flex items-center gap-3 rounded-[1.2rem] bg-white px-3 py-3 shadow-sm">
                            <img :src="appIconSrc" alt="Wallet Code Sabai" class="size-14 rounded-2xl object-contain">
                            <div class="min-w-0 flex-1">
                              <p class="truncate text-[14px] font-medium text-slate-900">
                                Wallet Sabai
                              </p>
                              <p class="mt-1 truncate text-[12px] text-slate-500">
                                http://192.168.100.206:3001/
                              </p>
                            </div>
                            <div class="flex size-7 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                              <UIcon name="i-lucide-x" class="size-4" />
                            </div>
                          </div>

                          <div class="mt-4 flex items-center justify-between rounded-[1.2rem] bg-white px-4 py-3 shadow-sm">
                            <p class="text-[14px] font-medium text-slate-900">ເປີດເປັນແອັບໜ້າເວັບ</p>
                            <div class="relative h-9 w-16 rounded-full bg-emerald-500">
                              <div class="absolute right-1 top-1 size-7 rounded-full bg-white shadow-sm" />
                            </div>
                          </div>

                          <p class="mt-3 px-1 text-[12px] leading-5 text-slate-500">
                            ໄອຄອນຈະເພີ່ມໄປຍັງໜ້າຈໍໂຮມເພື່ອໃຫ້ເຂົ້າຖຶງໄດ້ຢ່າງວ່ອງໄວ
                          </p>

                          <div class="mt-4 overflow-hidden rounded-[1.4rem] bg-[#e5e7eb] p-3">
                            <div class="grid grid-cols-4 gap-2">
                              <div class="h-10 rounded-2xl bg-white/80" />
                              <div class="h-10 rounded-2xl bg-white/80" />
                              <div class="h-10 rounded-2xl bg-white/80" />
                              <div class="h-10 rounded-2xl bg-white/80" />
                              <div class="h-10 rounded-2xl bg-white/80" />
                              <div class="h-10 rounded-2xl bg-white/80" />
                              <div class="h-10 rounded-2xl bg-white/80" />
                              <div class="h-10 rounded-2xl bg-white/80" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>

                    <template v-else>
                      <div class="overflow-hidden bg-[#f5f7fb]">
                        <div class="flex items-center justify-between border-b border-slate-200 bg-[#f7f8fc] px-3 py-3">
                          <div class="flex size-10 items-center justify-center rounded-full bg-white shadow-sm">
                            <UIcon name="i-lucide-x" class="size-6 text-slate-900" />
                          </div>
                          <p class="text-[13px] font-bold text-slate-900">
                            ເພີ່ມໄປຍັງໜ້າຈໍໂຮມ
                          </p>
                          <div class="rounded-full bg-blue-500 px-4 py-2 text-[12px] font-bold text-white shadow-sm">
                            ເພີ່ມ
                          </div>
                        </div>

                        <div class="px-3 py-4">
                          <div class="flex items-center gap-3 rounded-[1.2rem] bg-white px-3 py-3 shadow-sm">
                            <img :src="appIconSrc" alt="Wallet Code Sabai" class="size-14 rounded-2xl object-contain">
                            <div class="min-w-0 flex-1">
                              <p class="truncate text-[14px] font-medium text-slate-900">
                                Wallet Sabai
                              </p>
                              <p class="mt-1 truncate text-[12px] text-slate-400">
                                http://192.168.100.206:3001/
                              </p>
                            </div>
                            <div class="flex size-7 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                              <UIcon name="i-lucide-x" class="size-4" />
                            </div>
                          </div>

                          <div class="mt-4 flex items-center justify-between rounded-[1.2rem] bg-white px-4 py-3 shadow-sm">
                            <p class="text-[14px] font-medium text-slate-900">ເປີດເປັນແອັບໜ້າເວັບ</p>
                            <div class="relative h-9 w-16 rounded-full bg-emerald-500">
                              <div class="absolute right-1 top-1 size-7 rounded-full bg-white shadow-sm" />
                            </div>
                          </div>

                          <p class="mt-3 px-1 text-[12px] leading-5 text-slate-400">
                            ໄອຄອນຈະເພີ່ມໄປຍັງໜ້າຈໍໂຮມເພື່ອໃຫ້ເຂົ້າຖຶງໄດ້ຢ່າງວ່ອງໄວ
                          </p>

                          <div class="mt-4 overflow-hidden rounded-[1.4rem] bg-[#e5e7eb] p-3">
                            <div class="grid grid-cols-4 gap-2">
                              <div class="h-10 rounded-2xl bg-white/80" />
                              <div class="h-10 rounded-2xl bg-white/80" />
                              <div class="h-10 rounded-2xl bg-white/80" />
                              <div class="h-10 rounded-2xl bg-white/80" />
                              <div class="h-10 rounded-2xl bg-white/80" />
                              <div class="h-10 rounded-2xl bg-white/80" />
                              <div class="h-10 rounded-2xl bg-white/80" />
                              <div class="h-10 rounded-2xl bg-white/80" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>

                <p class="mt-3 text-xs leading-5 text-slate-600">
                  {{ slide.note }}
                </p>
              </article>
            </div>
          </div>

          <div class="mt-4 space-y-3">
            <div
              v-for="step in copy.iosSteps"
              :key="step.step"
              class="flex gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50/80 p-3.5"
            >
              <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-sky-500 text-sm font-black text-white shadow-sm">
                {{ step.step }}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-bold text-slate-900">
                  {{ step.title }}
                </p>
                <p class="mt-1 text-sm leading-6 text-slate-600">
                  {{ step.description }}
                </p>
              </div>
            </div>
          </div>

          <div class="mt-4 rounded-[1.2rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
            {{ copy.iosLimit }}
          </div>
        </section>

        <section
          v-else-if="isAndroidDevice"
          class="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_22px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur-xl sm:p-6"
        >
          <div class="flex items-start justify-between gap-3">
            <div class="min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-600">
                Android
              </p>
              <h3 class="mt-1 text-lg font-black tracking-tight text-slate-900">
                {{ copy.androidTitle }}
              </h3>
              <p class="mt-2 text-sm leading-6 text-slate-600">
                {{ copy.androidHint }}
              </p>
            </div>

            <div class="hidden shrink-0 rounded-2xl bg-emerald-50 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-700 sm:block">
              PWA
            </div>
          </div>

          <div class="mt-4">
            <div class="mb-3 flex items-center justify-between gap-3">
              <div>
                <p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Mobile slide
                </p>
                <p class="text-sm font-bold text-slate-900">
                  Step by step mockup
                </p>
              </div>
              <p class="text-xs font-medium text-slate-500">
                Swipe left
              </p>
            </div>

            <div class="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1 [-webkit-overflow-scrolling:touch]">
              <article
                v-for="slide in androidMockups"
                :key="slide.step"
                class="min-w-[16rem] snap-start rounded-[1.5rem] border border-slate-200 bg-slate-50 p-3 shadow-[0_14px_34px_-24px_rgba(15,23,42,0.25)]"
              >
                <div class="flex items-center justify-between">
                  <span class="rounded-full bg-slate-900 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white">
                    Step {{ slide.step }}
                  </span>
                  <span class="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
                    Slide
                  </span>
                </div>

                <div :class="['mt-3 overflow-hidden rounded-[1.2rem] border border-white/80 bg-gradient-to-br p-3 text-white shadow-[0_18px_36px_-22px_rgba(15,23,42,0.35)]', slide.accent]">
                  <div class="flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.24em] text-white/80">
                    <span>{{ slide.title }}</span>
                    <span>Android</span>
                  </div>

                  <div class="mt-3 rounded-[1.05rem] bg-white/15 p-3 backdrop-blur-sm">
                    <div class="flex items-center justify-between">
                      <div class="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/75">
                        {{ slide.subtitle }}
                      </div>
                      <UIcon :name="slide.icon" class="size-4 text-white/90" />
                    </div>
                    <div class="mt-3 space-y-2">
                      <div class="h-2.5 w-14 rounded-full bg-white/20" />
                      <div class="h-9 rounded-2xl bg-white/15" />
                      <div class="h-9 rounded-2xl bg-white/15" />
                    </div>
                  </div>

                  <p class="mt-3 text-xs leading-5 text-white/90">
                    {{ slide.note }}
                  </p>
                </div>
              </article>
            </div>
          </div>

          <div class="mt-4 space-y-3">
            <div
              v-for="step in copy.androidSteps"
              :key="step.step"
              class="flex gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50/80 p-3.5"
            >
              <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-black text-white shadow-sm">
                {{ step.step }}
              </div>
              <div class="min-w-0">
                <p class="text-sm font-bold text-slate-900">
                  {{ step.title }}
                </p>
                <p class="mt-1 text-sm leading-6 text-slate-600">
                  {{ step.description }}
                </p>
              </div>
            </div>
          </div>

          <p
            v-if="showAndroidFallback && !canUseNativePrompt"
            class="mt-4 rounded-[1.2rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900"
          >
            <span class="font-bold">{{ copy.fallbackBadge }}:</span>
            {{ copy.androidFallback }}
          </p>
        </section>

        <section
          v-else
          class="rounded-[1.75rem] border border-slate-200/80 bg-white/90 p-5 shadow-[0_22px_60px_-34px_rgba(15,23,42,0.2)] backdrop-blur-xl sm:p-6"
        >
          <p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-sky-600">
            {{ copy.deviceOther }}
          </p>
          <h3 class="mt-1 text-lg font-black tracking-tight text-slate-900">
            {{ copy.otherTitle }}
          </h3>
          <p class="mt-2 text-sm leading-6 text-slate-600">
            {{ copy.otherHint }}
          </p>
        </section>
      </main>
    </div>
  </div>
</template>
