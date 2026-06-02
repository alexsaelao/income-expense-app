<script setup lang="ts">
definePageMeta({
  layout: 'admin',
  middleware: 'admin-auth'
})

type RedeemKeyRow = {
  code: string
  active: boolean
  redeemedBy: string | null
  redeemedAt: string | null
  createdAt: string
  updatedAt: string
}

const { selectedLanguage } = useAppLanguage()
const { activeTheme } = useAppThemeColor()
const keyPage = ref(1)
const keyPageSize = ref(10)
const keyPageSizeOptions = [10, 20, 50]
const { data: overview, pending, refresh } = useSuperadminData({
  accountsLimit: 0,
  redeemKeysPage: keyPage,
  redeemKeysLimit: keyPageSize
})
const lastGeneratedKey = ref('')
const generating = ref(false)
const deletingKey = ref(false)
const deleteKeyItem = ref<RedeemKeyRow | null>(null)
const deleteKeyOpen = ref(false)
const deleteSheetDragY = ref(0)
const deleteSheetDragging = ref(false)
const deleteSheetDragStartY = ref(0)
const deleteSheetPointerId = ref<number | null>(null)
const deleteSheetHandleRef = ref<HTMLElement | null>(null)

const copyState = ref<'idle' | 'copied'>('idle')

const copy = computed(() => selectedLanguage.value === 'lo'
  ? {
      title: 'Key',
      subtitle: 'ສ້າງແລະຈັດການ Pro redeem key',
      generateKey: 'ສ້າງ Pro key',
      generateDesc: 'ສ້າງ key ໃໝ່ແລ້ວສົ່ງໃຫ້ user ເພື່ອປົດລັອກ Pro.',
      create: 'ສ້າງ',
      newKey: 'key ໃໝ່',
      copy: 'ສຳເນົາ',
      delete: 'ລຶບ',
      activeKeys: 'key ເປີດໃຊ້',
      usedKeys: 'key ຖືກໃຊ້',
      totalKeys: 'key ທັງໝົດ',
      active: 'ເປີດໃຊ້',
      used: 'ໃຊ້ແລ້ວ',
      available: 'ວ່າງ',
      usedByUser: 'ໃຊ້ໂດຍ user',
      key: 'Key',
      status: 'ສະຖານະ',
      created: 'ສ້າງ',
      redeemed: 'ໃຊ້',
      actions: 'ຈັດການ',
      showing: 'ສະແດງ',
      perPage: 'ຕໍ່ໜ້າ',
      page: 'ໜ້າ',
      of: 'ຈາກ',
      previous: 'ກ່ອນໜ້າ',
      next: 'ຖັດໄປ',
      noData: 'ຍັງບໍ່ມີ key',
      deleteTitle: 'ລຶບ key',
      deleteDesc: 'ລຶບ redeem key ນີ້ຖາວອນບໍ?',
      deleteUser: 'ໃຊ້ໂດຍ',
      deleteCreated: 'ສ້າງເມື່ອ',
      deleteStatus: 'ສະຖານະ',
      cancel: 'ຍົກເລີກ',
      confirmDelete: 'ລຶບ key',
      copied: 'ສຳເນົາແລ້ວ',
      shareHint: 'ສົ່ງ key ນີ້ໃຫ້ user ເພື່ອເປີດ Pro.',
      reload: 'ໂຫຼດໃໝ່'
    }
  : {
      title: 'Keys',
      subtitle: 'Generate and manage Pro redeem keys.',
      generateKey: 'Generate Pro key',
      generateDesc: 'Create a new redeem key and share it with a user to unlock Pro.',
      create: 'Generate',
      newKey: 'New key',
      copy: 'Copy',
      delete: 'Delete',
      activeKeys: 'Active keys',
      usedKeys: 'Used keys',
      totalKeys: 'Total keys',
      active: 'Active',
      used: 'Used',
      available: 'Available',
      usedByUser: 'Used by user',
      key: 'Key',
      status: 'Status',
      created: 'Created',
      redeemed: 'Redeemed',
      actions: 'Actions',
      showing: 'Showing',
      perPage: 'per page',
      page: 'Page',
      of: 'of',
      previous: 'Previous',
      next: 'Next',
      noData: 'No keys yet',
      deleteTitle: 'Delete key',
      deleteDesc: 'Delete this redeem key permanently?',
      deleteUser: 'Redeemed by',
      deleteCreated: 'Created',
      deleteStatus: 'Status',
      cancel: 'Cancel',
      confirmDelete: 'Delete key',
      copied: 'Copied',
      shareHint: 'Share this key with a user to unlock Pro.',
      reload: 'Reload'
    })

const stats = computed(() => overview.value?.stats ?? null)
const redeemKeys = computed<RedeemKeyRow[]>(() => overview.value?.redeemKeys ?? [])
const keyPagination = computed(() => overview.value?.redeemKeysPagination ?? null)
const refreshingKeys = ref(false)
const keyRangeStart = computed(() => {
  if (!keyPagination.value?.total || !redeemKeys.value.length) return 0
  return ((keyPagination.value.page - 1) * keyPagination.value.limit) + 1
})
const keyRangeEnd = computed(() => {
  if (!keyPagination.value?.total || !redeemKeys.value.length) return 0
  return keyRangeStart.value + redeemKeys.value.length - 1
})
const keyHasPrevious = computed(() => (keyPagination.value?.page ?? 1) > 1)
const keyHasNext = computed(() => Boolean(keyPagination.value && keyPagination.value.totalPages > 0 && keyPagination.value.page < keyPagination.value.totalPages))

watch(keyPageSize, () => {
  keyPage.value = 1
})

watch(keyPagination, (pagination) => {
  if (pagination && pagination.totalPages > 0 && keyPage.value > pagination.totalPages) {
    keyPage.value = pagination.totalPages
  }
})

function formatDateTime(value: string) {
  if (!value) return '—'
  return new Intl.DateTimeFormat(selectedLanguage.value === 'lo' ? 'lo-LA' : 'en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(new Date(value))
}

async function generateKey() {
  if (generating.value) return
  generating.value = true

  try {
    const result = await $fetch<{ key?: { code?: string } }>('/api/superadmin/redeem-keys', {
      method: 'POST'
    })
    lastGeneratedKey.value = result.key?.code ?? ''
    await refresh()
  }
  finally {
    generating.value = false
  }
}

async function refreshKeys() {
  if (refreshingKeys.value || generating.value) return
  refreshingKeys.value = true
  try {
    await refresh()
  }
  finally {
    refreshingKeys.value = false
  }
}

async function copyKey(code: string) {
  if (!code) return
  await navigator.clipboard.writeText(code)
  copyState.value = 'copied'
  window.setTimeout(() => {
    copyState.value = 'idle'
  }, 1200)
}

function askDeleteKey(code: string) {
  deleteKeyItem.value = redeemKeys.value.find(key => key.code === code) ?? {
    code,
    active: false,
    redeemedBy: null,
    redeemedAt: null,
    createdAt: '',
    updatedAt: ''
  }
  deleteKeyOpen.value = true
}

function closeDeleteKeySheet() {
  if (deletingKey.value) return
  deleteKeyOpen.value = false
  deleteKeyItem.value = null
  deleteSheetDragY.value = 0
  deleteSheetDragging.value = false
  deleteSheetDragStartY.value = 0
  deleteSheetPointerId.value = null
}

function onDeleteSheetPointerDown(event: PointerEvent) {
  if (!deleteSheetHandleRef.value) return
  deleteSheetHandleRef.value.setPointerCapture(event.pointerId)
  deleteSheetDragging.value = true
  deleteSheetDragStartY.value = event.clientY
  deleteSheetPointerId.value = event.pointerId
}

function onDeleteSheetPointerMove(event: PointerEvent) {
  if (!deleteSheetDragging.value || deleteSheetPointerId.value !== event.pointerId) return
  const deltaY = Math.max(0, event.clientY - deleteSheetDragStartY.value)
  deleteSheetDragY.value = deltaY
}

function onDeleteSheetPointerUp(event: PointerEvent) {
  if (!deleteSheetDragging.value || deleteSheetPointerId.value !== event.pointerId) return
  deleteSheetHandleRef.value?.releasePointerCapture(event.pointerId)
  const shouldClose = deleteSheetDragY.value > 90
  if (shouldClose) {
    closeDeleteKeySheet()
  }
  else {
    deleteSheetDragY.value = 0
  }
  deleteSheetDragging.value = false
  deleteSheetPointerId.value = null
}

function onDeleteSheetPointerCancel(event: PointerEvent) {
  if (deleteSheetPointerId.value !== null) {
    deleteSheetHandleRef.value?.releasePointerCapture(deleteSheetPointerId.value)
  }
  deleteSheetDragY.value = 0
  deleteSheetDragging.value = false
  deleteSheetPointerId.value = null
}

async function confirmDeleteKey() {
  if (!deleteKeyItem.value?.code || deletingKey.value) return
  deletingKey.value = true

  try {
    await $fetch(`/api/superadmin/redeem-keys/${encodeURIComponent(deleteKeyItem.value.code)}`, {
      method: 'DELETE'
    })
    deleteKeyOpen.value = false
    deleteKeyItem.value = null
    await refresh()
  }
  finally {
    deletingKey.value = false
  }
}

function goToPreviousKeyPage() {
  if (!keyHasPrevious.value) return
  keyPage.value -= 1
}

function goToNextKeyPage() {
  if (!keyHasNext.value) return
  keyPage.value += 1
}

useHead({
  title: 'Super Admin · Keys'
})
</script>

<template>
  <div class="space-y-5 pb-8">
    <section class="overflow-hidden rounded-[1.4rem] border border-slate-200/80 bg-white/85 p-4 shadow-[0_22px_60px_-32px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/75">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <p class="text-[10px] font-semibold uppercase tracking-[0.28em] text-muted">{{ copy.title }}</p>
          <h1 class="mt-1 text-2xl font-black tracking-tight text-default">{{ copy.title }}</h1>
          <p class="mt-1 max-w-[28rem] truncate text-sm leading-6 text-muted">{{ copy.subtitle }}</p>
        </div>
      </div>
    </section>

    <section class="grid grid-cols-2 gap-3">
      <div class="rounded-[1.2rem] border border-slate-200/80 bg-white p-3 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-slate-950/70">
        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{{ copy.activeKeys }}</p>
        <p class="mt-1 text-2xl font-black text-default">{{ stats?.activeKeys ?? 0 }}</p>
      </div>
      <div class="rounded-[1.2rem] border border-slate-200/80 bg-white p-3 shadow-[0_18px_40px_-28px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-slate-950/70">
        <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{{ copy.usedKeys }}</p>
        <p class="mt-1 text-2xl font-black text-default">{{ stats?.usedKeys ?? 0 }}</p>
      </div>
    </section>

    <section class="overflow-hidden rounded-[1.4rem] border border-slate-200/80 bg-white/85 shadow-[0_22px_60px_-32px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/75">
      <div class="flex items-center justify-between gap-3 px-4 py-4">
        <div class="min-w-0">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">{{ copy.generateKey }}</p>
          <h2 class="text-sm font-black tracking-tight text-default">{{ copy.generateKey }}</h2>
          <p class="truncate text-xs leading-5 text-muted">{{ copy.generateDesc }}</p>
        </div>
        <UButton
          :disabled="generating"
          class="h-10 gap-2 rounded-full bg-gradient-to-r px-4 text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(15,23,42,0.3)] transition active:scale-95"
          :class="activeTheme.accent"
          @click="generateKey"
        >
          <UIcon
            :name="generating ? 'i-lucide-refresh-cw' : 'i-lucide-sparkles'"
            class="size-4 shrink-0"
            :class="generating ? 'animate-spin' : ''"
          />
          {{ copy.create }}
        </UButton>
      </div>

      <div class="border-t border-slate-200/80 px-4 py-4 dark:border-slate-800">
        <div v-if="lastGeneratedKey" class="rounded-[1.1rem] border border-slate-200/80 bg-slate-50 px-3 py-3 dark:border-slate-800 dark:bg-slate-900">
          <div class="flex items-center justify-between gap-3">
            <div class="min-w-0">
              <p class="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">{{ copy.newKey }}</p>
              <p class="truncate text-sm font-black text-default">{{ lastGeneratedKey }}</p>
            </div>
            <UButton
              icon="i-lucide-copy"
              class="h-9 rounded-full bg-black px-3 text-xs font-bold text-white shadow-sm transition hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
              @click="copyKey(lastGeneratedKey)"
            >
              {{ copy.copy }}
            </UButton>
          </div>
          <p class="mt-2 truncate text-[11px] leading-5 text-muted">
            {{ copyState === 'copied' ? copy.copied : copy.shareHint }}
          </p>
        </div>
      </div>
    </section>

    <section class="overflow-hidden rounded-[1.4rem] border border-slate-200/80 bg-white/85 shadow-[0_22px_60px_-32px_rgba(15,23,42,0.2)] dark:border-slate-800 dark:bg-slate-950/75">
      <div class="flex items-center justify-between gap-3 px-4 py-4">
        <div class="min-w-0">
          <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">{{ copy.totalKeys }}</p>
          <h2 class="text-sm font-black tracking-tight text-default">{{ copy.key }}</h2>
        </div>
        <div class="flex items-center gap-2">
          <UButton
            :disabled="refreshingKeys || generating || pending"
            class="h-9 gap-2 rounded-full px-3 text-xs font-bold shadow-none transition active:scale-95"
            :class="refreshingKeys
              ? 'border-transparent bg-gradient-to-r from-sky-500 to-cyan-400 text-white shadow-[0_14px_28px_-18px_rgba(14,165,233,0.35)]'
              : 'border border-slate-200 bg-white text-default hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800'"
            @click="refreshKeys"
            aria-label="Reload"
          >
            <UIcon
              name="i-lucide-refresh-cw"
              class="size-4 shrink-0"
              :class="refreshingKeys ? 'animate-spin text-white' : ''"
            />
            <span :class="refreshingKeys ? 'text-white' : ''">{{ copy.reload }}</span>
          </UButton>
          <UBadge color="neutral" variant="soft" class="rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em]">
            {{ stats?.activeKeys ?? 0 }} / {{ stats?.totalKeys ?? 0 }}
          </UBadge>
        </div>
      </div>

      <div class="border-t border-slate-200/80 dark:border-slate-800">
        <div v-if="pending || generating || refreshingKeys" class="relative h-[3px] overflow-hidden rounded-full bg-slate-200/80 dark:bg-slate-800/85">
          <div class="superadmin-keys-loading-track" />
          <div class="superadmin-keys-loading-bar" />
        </div>
        <div class="border-b border-slate-200/80 bg-slate-50/80 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/60" />
        <div class="overflow-x-auto">
          <table class="min-w-full border-collapse">
            <thead class="bg-slate-50/80 dark:bg-slate-900/60">
              <tr class="text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-muted">
                <th class="whitespace-nowrap px-4 py-3">{{ copy.key }}</th>
                <th class="whitespace-nowrap px-4 py-3">{{ copy.status }}</th>
                <th class="whitespace-nowrap px-4 py-3">{{ copy.deleteUser }}</th>
                <th class="whitespace-nowrap px-4 py-3">{{ copy.created }}</th>
                <th class="whitespace-nowrap px-4 py-3">{{ copy.actions }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="key in redeemKeys"
                :key="key.code"
                class="border-t border-slate-200/80 transition hover:bg-slate-50/70 dark:border-slate-800 dark:hover:bg-slate-900/60"
              >
                <td class="px-4 py-3 align-middle">
                  <p class="truncate text-sm font-black tracking-tight text-default">{{ key.code }}</p>
                </td>
                <td class="px-4 py-3 align-middle">
                  <UBadge
                    :color="key.active ? 'emerald' : 'neutral'"
                    :variant="key.active ? 'solid' : 'soft'"
                    class="whitespace-nowrap rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em]"
                  >
                    {{ key.active ? copy.available : (key.redeemedBy ? copy.usedByUser : copy.used) }}
                  </UBadge>
                </td>
                <td class="px-4 py-3 align-middle">
                  <p class="whitespace-nowrap truncate text-xs font-semibold text-default">
                    {{ key.redeemedBy ?? '—' }}
                  </p>
                </td>
                <td class="px-4 py-3 align-middle">
                  <p class="whitespace-nowrap text-xs font-semibold text-default">
                    {{ key.redeemedAt
                      ? `${copy.redeemed} ${formatDateTime(key.redeemedAt)}`
                      : `${copy.created} ${formatDateTime(key.createdAt)}` }}
                  </p>
                </td>
                <td class="px-4 py-3 align-middle">
                  <div class="flex items-center justify-end gap-2">
                    <UButton
                      icon="i-lucide-copy"
                      class="h-9 rounded-full border border-slate-200 bg-white px-3 text-xs font-bold text-default shadow-none transition hover:bg-slate-50 active:scale-95 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:bg-slate-800"
                      @click="copyKey(key.code)"
                    >
                      {{ copy.copy }}
                    </UButton>
                    <UButton
                      icon="i-lucide-trash-2"
                      class="h-9 rounded-full border border-red-200 bg-red-50 px-3 text-xs font-bold text-red-700 shadow-none transition hover:bg-red-100 active:scale-95 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/50"
                      @click="askDeleteKey(key.code)"
                    >
                      {{ copy.delete }}
                    </UButton>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="border-t border-slate-200/80 px-4 py-4 dark:border-slate-800">
          <p class="text-xs font-semibold text-muted">
            <span class="whitespace-nowrap">{{ copy.showing }}</span>
            <span class="whitespace-nowrap">
              {{ keyPagination?.total ? `${keyRangeStart || 0}-${keyRangeEnd || 0} ${copy.of} ${keyPagination.total}` : `0 ${copy.of} 0` }}
            </span>
          </p>

          <div class="mt-2 flex items-center justify-between gap-2">
            <div class="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-900">
              <span class="whitespace-nowrap text-[8px] font-semibold uppercase tracking-[0.1em] text-muted">{{ copy.perPage }}</span>
              <select
                v-model.number="keyPageSize"
                class="h-7 w-[3.5rem] rounded-full border border-slate-200/80 bg-white px-1.5 text-[10px] font-bold text-default outline-none transition focus:border-sky-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
              >
                <option v-for="option in keyPageSizeOptions" :key="option" :value="option">
                  {{ option }}
                </option>
              </select>
            </div>

            <div class="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-slate-200/80 bg-slate-50 px-2 py-1.5 dark:border-slate-800 dark:bg-slate-900">
              <UButton
                icon="i-lucide-chevron-left"
                size="xs"
                class="h-7 w-7 justify-center rounded-full border border-slate-200 bg-white p-0 text-default shadow-none transition hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800"
                :disabled="!keyHasPrevious || pending || generating"
                :aria-label="copy.previous"
                @click="goToPreviousKeyPage"
              />

              <span class="min-w-[4.9rem] whitespace-nowrap rounded-full border border-slate-200 bg-white px-2 py-1 text-center text-[9px] font-black text-default dark:border-slate-700 dark:bg-slate-950 dark:text-white">
                {{ copy.page }} {{ keyPagination?.page ?? 1 }} {{ copy.of }} {{ keyPagination?.totalPages ?? 0 }}
              </span>

              <UButton
                icon="i-lucide-chevron-right"
                size="xs"
                class="h-7 w-7 justify-center rounded-full border border-slate-200 bg-white p-0 text-default shadow-none transition hover:bg-slate-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:hover:bg-slate-800"
                :disabled="!keyHasNext || pending || generating"
                :aria-label="copy.next"
                @click="goToNextKeyPage"
              />
            </div>
          </div>
        </div>

        <div v-if="!pending && !redeemKeys.length" class="px-4 py-6 text-center text-sm text-muted">
          {{ copy.noData }}
        </div>
      </div>
    </section>

    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="deleteKeyOpen"
        class="fixed inset-0 z-[90] flex items-end justify-center bg-slate-950/45 px-0 py-0 sm:px-4 sm:py-4"
        @click.self="closeDeleteKeySheet"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="translate-y-full opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="translate-y-full opacity-0"
        >
          <div
            class="w-full overflow-hidden rounded-t-[1.6rem] border border-slate-200/80 bg-white shadow-[0_-24px_60px_-36px_rgba(15,23,42,0.4)] dark:border-slate-800 dark:bg-slate-950 sm:max-w-lg sm:rounded-[1.6rem]"
            :style="{ transform: `translateY(${deleteSheetDragY}px)`, transition: deleteSheetDragging ? 'none' : 'transform 180ms ease-out' }"
          >
            <div class="px-4 pt-3">
              <div
                ref="deleteSheetHandleRef"
                class="touch-none select-none cursor-grab active:cursor-grabbing"
                @pointerdown="onDeleteSheetPointerDown"
                @pointermove="onDeleteSheetPointerMove"
                @pointerup="onDeleteSheetPointerUp"
                @pointercancel="onDeleteSheetPointerCancel"
              >
                <div class="mx-auto h-1.5 w-12 rounded-full bg-slate-200 dark:bg-slate-700" />
              </div>
            </div>
            <div class="px-4 pb-4 pt-3">
              <p class="text-[10px] font-semibold uppercase tracking-[0.22em] text-muted">{{ copy.deleteTitle }}</p>
              <h3 class="mt-1 truncate text-lg font-black tracking-tight text-default">{{ deleteKeyItem?.code ?? '—' }}</h3>
              <p class="mt-1 truncate text-sm leading-6 text-muted">{{ copy.deleteDesc }}</p>
            </div>
            <div class="space-y-3 border-t border-slate-200/80 px-4 py-4 dark:border-slate-800">
              <div class="grid grid-cols-2 gap-2 text-[11px]">
                <div class="rounded-[1rem] border border-slate-200/80 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
                  <p class="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">{{ copy.deleteStatus }}</p>
                  <p class="mt-1 truncate font-black text-default">
                    {{ deleteKeyItem?.active ? copy.available : (deleteKeyItem?.redeemedBy ? copy.usedByUser : copy.used) }}
                  </p>
                </div>
                <div class="rounded-[1rem] border border-slate-200/80 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
                  <p class="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">{{ copy.deleteCreated }}</p>
                  <p class="mt-1 truncate font-black text-default">{{ deleteKeyItem ? formatDateTime(deleteKeyItem.createdAt) : '—' }}</p>
                </div>
              </div>
              <div class="rounded-[1rem] border border-slate-200/80 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900">
                <p class="text-[9px] font-semibold uppercase tracking-[0.18em] text-muted">{{ copy.deleteUser }}</p>
                <p class="mt-1 truncate text-sm font-bold text-default">{{ deleteKeyItem?.redeemedBy ?? '—' }}</p>
                <p class="mt-1 truncate text-[11px] leading-5 text-muted">
                  {{ deleteKeyItem?.redeemedAt ? formatDateTime(deleteKeyItem.redeemedAt) : '—' }}
                </p>
              </div>
              <UButton
                block
                icon="i-lucide-trash-2"
                :loading="deletingKey"
                :disabled="deletingKey"
                class="h-11 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-sm font-bold text-white shadow-[0_14px_28px_-18px_rgba(185,28,28,0.45)] transition active:scale-95"
                @click="confirmDeleteKey"
              >
                {{ copy.confirmDelete }}
              </UButton>
              <UButton
                block
                variant="soft"
                class="h-11 rounded-full text-sm font-bold"
                :disabled="deletingKey"
                @click="closeDeleteKeySheet"
              >
                {{ copy.cancel }}
              </UButton>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
@keyframes superadminKeysLoadingBar {
  0% {
    transform: translateX(-120%) scaleX(0.85);
    opacity: 0.24;
  }

  20% {
    opacity: 1;
  }

  50% {
    transform: translateX(0%) scaleX(1);
    opacity: 1;
  }

  80% {
    opacity: 1;
  }

  100% {
    transform: translateX(220%) scaleX(0.9);
    opacity: 0.24;
  }
}

.superadmin-keys-loading-track {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(2, 132, 199, 0.08), rgba(14, 165, 233, 0.26), rgba(34, 211, 238, 0.32), rgba(14, 165, 233, 0.26), rgba(2, 132, 199, 0.08)),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.08) 0 8px, transparent 8px 16px);
  background-size: 300% 100%, 18px 100%;
  animation:
    superadminKeysLoadingTrack 1.1s linear infinite,
    superadminKeysLoadingTrack2 0.85s linear infinite;
  filter: saturate(1.1);
}

.superadmin-keys-loading-bar {
  position: absolute;
  inset-y: 0;
  left: 0;
  width: 38%;
  border-radius: 9999px;
  background: linear-gradient(90deg, transparent 0%, #0284c7 18%, #0ea5e9 44%, #67e8f9 64%, #0ea5e9 82%, transparent 100%);
  box-shadow: 0 0 20px rgba(14, 165, 233, 0.36);
  animation: superadminKeysLoadingBar 1.05s cubic-bezier(0.4, 0, 0.2, 1) infinite;
}

:global(.dark) .superadmin-keys-loading-track {
  background:
    linear-gradient(90deg, rgba(14, 165, 233, 0.03), rgba(56, 189, 248, 0.12), rgba(103, 232, 249, 0.16), rgba(56, 189, 248, 0.12), rgba(14, 165, 233, 0.03)),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.06) 0 8px, transparent 8px 16px);
  background-size: 300% 100%, 18px 100%;
  animation:
    superadminKeysLoadingTrack 1.1s linear infinite,
    superadminKeysLoadingTrack2 0.85s linear infinite;
  filter: saturate(1.08);
}

:global(.dark) .superadmin-keys-loading-bar {
  background: linear-gradient(90deg, transparent 0%, #38bdf8 18%, #67e8f9 50%, #38bdf8 80%, transparent 100%);
  box-shadow: 0 0 18px rgba(56, 189, 248, 0.28);
}

@keyframes superadminKeysLoadingTrack {
  0% {
    background-position: 0% 50%;
  }

  100% {
    background-position: 200% 50%;
  }
}

@keyframes superadminKeysLoadingTrack2 {
  0% {
    background-position: 0 0;
  }

  100% {
    background-position: 18px 0;
  }
}
</style>
