<script setup lang="ts">
import type { WalletColor } from '~/composables/useMoneyNote'
import { useMoneyNote, walletColorOptions } from '~/composables/useMoneyNote'

const { selectedLanguage } = useAppLanguage()
const { activeTheme } = useAppThemeColor()
const {
  hydrated,
  companyEntries,
  addCompany,
  updateCompany,
  removeCompany,
  setDefaultCompanyEnabled,
  setCustomCompanyEnabled,
  setCompanyPinned,
  moveCompany,
  canEditMoneyData
} = useMoneyNote()

const companyModalOpen = ref(false)
const manageCompanyOpen = ref(false)
const deleteCompanyOpen = ref(false)
const editingCompanyId = ref<string | null>(null)
const sheetDragY = ref(0)
const sheetDragging = ref(false)
const sheetDragStartY = ref(0)
const sheetPointerId = ref<number | null>(null)
const sheetHandleRef = ref<HTMLElement | null>(null)
const formError = ref('')
const companyIsSubmitting = ref(false)
const selectedCompany = ref<any | null>(null)
const dragState = reactive({
  key: ''
})

const form = reactive({
  name: '',
  emoji: '🏢',
  color: 'sky' as WalletColor
})

function resolveActionErrorMessage(error: unknown) {
  const maybeResponse = error as {
    data?: { statusMessage?: string; message?: string }
    message?: string
    statusMessage?: string
  }

  return maybeResponse?.data?.statusMessage
    || maybeResponse?.data?.message
    || maybeResponse?.statusMessage
    || maybeResponse?.message
    || companiesCopy.value.nameExists
}

const accentMap = Object.fromEntries(walletColorOptions.map(item => [item.value, item.accent])) as Record<WalletColor, string>

const companiesCopy = computed(() => selectedLanguage.value === 'lo'
  ? {
      title: 'ບໍລິສັດ',
      add: 'ເພີ່ມ',
      listDesc: 'ຈັດການຊື່ບໍລິສັດທີ່ໃຊ້ໃນລາຍຮັບ.',
      addCompany: 'ເພີ່ມບໍລິສັດ',
      newCompany: 'ບໍລິສັດໃໝ່',
      closeCompanySheet: 'ປິດແຖບບໍລິສັດ',
      companyName: 'ຊື່ບໍລິສັດ',
      companyPlaceholder: 'ເຊັ່ນ: ບໍລິສັດ ABC',
      emoji: 'ອີໂມຈິ',
      color: 'ສີ',
      default: 'ຄ່າຕັ້ງຕົ້ນ',
      custom: 'ກຳນົດເອງ',
      transactions: 'ລາຍການ',
      cancel: 'ຍົກເລີກ',
      saveCompany: 'ບັນທຶກບໍລິສັດ',
      nameExists: 'ຊື່ບໍລິສັດມີຢູ່ແລ້ວ ຫຼື ບໍ່ວ່າງ.',
      manageTitle: 'ຈັດການບໍລິສັດ',
      manageDesc: 'ແກ້ໄຂ, ປັກໝຸດ, ເປີດ/ປິດ, ຫຼືລຶບບໍລິສັດນີ້.',
      lockedTitle: 'ບໍລິສັດທີ່ລັອກ',
      lockedDescription: 'ບໍລິສັດຄ່າຕັ້ງຕົ້ນບໍ່ສາມາດແກ້ໄຂ ຫຼື ລຶບໄດ້.',
      otherTitle: 'ບັນຊີສຳຮອງ',
      otherDescription: 'Other ແມ່ນປ້າຍບໍລິສັດຄ່າຕັ້ງຕົ້ນພຽງອັນດຽວ. ຖ້າຢາກໃຊ້ແຕ່ປ້າຍກຳນົດເອງ ສາມາດຊ່ອນມັນໄດ້.',
      edit: 'ແກ້ໄຂ',
      delete: 'ລຶບ',
      deleteTitle: 'ລຶບບໍລິສັດ?',
      deleteDescription: 'ບໍລິສັດນີ້ຈະຖືກລຶບອອກຈາກລາຍການ. ລາຍການເກົ່າຈະຍັງຄົງຢູ່.',
      confirmDelete: 'ລຶບບໍລິສັດ',
      enable: 'ເປີດໃຊ້',
      disable: 'ປິດໃຊ້',
      active: 'ເປີດຢູ່',
      hidden: 'ຖືກຊ່ອນ',
      pin: 'ປັກໝຸດ',
      unpin: 'ຖອນປັກໝຸດ',
      drag: 'ລາກຈັດລຳດັບ',
      noEnabledCompanies: 'ຍັງບໍ່ມີບໍລິສັດທີ່ເປີດໃຊ້. ເປີດບໍລິສັດໜຶ່ງກ່ອນ ຫຼື ສ້າງບໍລິສັດໃໝ່.',
      addNew: 'ສ້າງບໍລິສັດ'
    }
  : {
      title: 'Companies',
      add: 'Add',
      addCompany: 'Add company',
      newCompany: 'New company',
      closeCompanySheet: 'Close company sheet',
      companyName: 'Company name',
      companyPlaceholder: 'e.g. ABC Studio',
      emoji: 'Emoji',
      color: 'Color',
      default: 'Default',
      custom: 'Custom',
      transactions: 'transactions',
      cancel: 'Cancel',
      saveCompany: 'Save company',
      nameExists: 'Company name already exists or is empty.',
      manageTitle: 'Manage company',
      manageDesc: 'Edit, pin, enable, or delete this company.',
      lockedTitle: 'Locked company',
      lockedDescription: 'Built-in companies cannot be edited or deleted.',
      otherTitle: 'Built-in fallback',
      otherDescription: 'Other is the only built-in company label. Hide it if you only want custom companies.',
      edit: 'Edit',
      delete: 'Delete',
      deleteTitle: 'Delete company?',
      deleteDescription: 'This company will be removed from the list. Existing transactions will keep their history.',
      confirmDelete: 'Delete company',
      enable: 'Enable',
      disable: 'Disable',
      active: 'Active',
      hidden: 'Hidden',
      pin: 'Pin',
      unpin: 'Unpin',
      drag: 'Drag to sort',
      noEnabledCompanies: 'No company is enabled yet. Turn one on or create a new company.',
      addNew: 'Add company'
    })

const companyList = computed(() => companyEntries())
const isHydrated = computed(() => hydrated.value)
const hasEnabledCompanies = computed(() => companyList.value.some(item => item.enabled))
const selectedCompanyIsEditable = computed(() => Boolean(selectedCompany.value) && !selectedCompany.value?.isDefault)
const selectedCompanyCanDelete = computed(() => Boolean(selectedCompany.value) && (!selectedCompany.value?.isDefault || selectedCompany.value?.name === 'Other'))

const companyToggleCopy = computed(() => selectedLanguage.value === 'lo'
  ? {
      enable: 'ເປີດໃຊ້',
      disable: 'ປິດໃຊ້',
      active: 'ເປີດຢູ່',
      hidden: 'ຖືກຊ່ອນ',
      pin: 'ປັກໝຸດ',
      unpin: 'ຖອນປັກໝຸດ',
      drag: 'ລາກຈັດລຳດັບ'
    }
  : {
      enable: 'Enable',
      disable: 'Disable',
      active: 'Active',
      hidden: 'Hidden',
      pin: 'Pin',
      unpin: 'Unpin',
      drag: 'Drag to sort'
    })

const companyManageCopy = computed(() => selectedLanguage.value === 'lo'
  ? {
      title: 'ຈັດການບໍລິສັດ',
      description: 'ແກ້ໄຂ, ປັກໝຸດ, ເປີດ/ປິດ, ຫຼືລຶບບໍລິສັດນີ້.',
      lockedTitle: 'ບໍລິສັດທີ່ລັອກ',
      lockedDescription: 'ບໍລິສັດຄ່າຕັ້ງຕົ້ນບໍ່ສາມາດແກ້ໄຂ ຫຼື ລຶບໄດ້.',
      edit: 'ແກ້ໄຂ',
      delete: 'ລຶບ',
      deleteTitle: 'ລຶບບໍລິສັດ?',
      deleteDescription: 'ບໍລິສັດນີ້ຈະຖືກລຶບອອກຈາກລາຍການ. ລາຍການເກົ່າຈະຍັງຄົງຢູ່.',
      confirmDelete: 'ລຶບບໍລິສັດ',
      close: 'ປິດ'
    }
  : {
      title: 'Manage company',
      description: 'Edit, pin, enable, or delete this company.',
      lockedTitle: 'Locked company',
      lockedDescription: 'Built-in companies cannot be edited or deleted.',
      edit: 'Edit',
      delete: 'Delete',
      deleteTitle: 'Delete company?',
      deleteDescription: 'This company will be removed from the list. Existing transactions will keep their history.',
      confirmDelete: 'Delete company',
      close: 'Close'
    })

const sheetCopy = computed(() => {
  if (editingCompanyId.value) {
    return selectedLanguage.value === 'lo'
      ? {
          addCompany: 'ແກ້ໄຂບໍລິສັດ',
          newCompany: 'ປັບປຸງບໍລິສັດ',
          closeCompanySheet: 'ປິດແຖບບໍລິສັດ',
          saveCompany: 'ບັນທຶກການແກ້ໄຂ'
        }
      : {
          addCompany: 'Edit company',
          newCompany: 'Update company',
          closeCompanySheet: 'Close company sheet',
          saveCompany: 'Save changes'
        }
  }

  return {
    addCompany: companiesCopy.value.addCompany,
    newCompany: companiesCopy.value.newCompany,
    closeCompanySheet: companiesCopy.value.closeCompanySheet,
    saveCompany: companiesCopy.value.saveCompany
  }
})

function companyKeyForItem(item: any) {
  return item.key ?? (item.isDefault ? item.name.toLowerCase() : `custom:${item.id}`)
}

function openCompanyManager(item: any) {
  if (!canEditMoneyData.value) return
  selectedCompany.value = item
  manageCompanyOpen.value = true
}

function closeCompanyManager() {
  manageCompanyOpen.value = false
  deleteCompanyOpen.value = false
  selectedCompany.value = null
}

function openCompanyEditor(item: any) {
  if (!canEditMoneyData.value) return
  selectedCompany.value = item
  editingCompanyId.value = item.id
  form.name = item.name
  form.emoji = item.emoji
  form.color = item.color
  formError.value = ''
  manageCompanyOpen.value = false
  companyModalOpen.value = true
}

function resetForm() {
  form.name = ''
  form.emoji = '🏢'
  form.color = 'sky'
  formError.value = ''
}

function cancelCompanySheet() {
  companyModalOpen.value = false
  if (editingCompanyId.value) {
    editingCompanyId.value = null
    selectedCompany.value = null
    resetForm()
  }
}

function resetSheetDrag() {
  sheetDragY.value = 0
  sheetDragging.value = false
  sheetDragStartY.value = 0
  sheetPointerId.value = null
}

function onSheetPointerDown(event: PointerEvent) {
  if (event.pointerType === 'mouse' && event.button !== 0) return

  sheetHandleRef.value?.setPointerCapture(event.pointerId)
  sheetDragging.value = true
  sheetDragStartY.value = event.clientY
  sheetPointerId.value = event.pointerId
}

function onSheetPointerMove(event: PointerEvent) {
  if (!sheetDragging.value || sheetPointerId.value !== event.pointerId) return

  const deltaY = Math.max(0, event.clientY - sheetDragStartY.value)
  sheetDragY.value = deltaY
}

function onSheetPointerUp(event: PointerEvent) {
  if (!sheetDragging.value || sheetPointerId.value !== event.pointerId) return

  sheetHandleRef.value?.releasePointerCapture(event.pointerId)
  const shouldClose = sheetDragY.value > 90
  companyModalOpen.value = !shouldClose
  resetSheetDrag()
}

function onSheetPointerCancel() {
  if (sheetPointerId.value !== null) {
    sheetHandleRef.value?.releasePointerCapture(sheetPointerId.value)
  }
  resetSheetDrag()
}

async function submitCompany() {
  if (!canEditMoneyData.value) return
  if (companyIsSubmitting.value) return

  const nextName = form.name.trim()
  if (!nextName) {
    formError.value = companiesCopy.value.nameExists
    return
  }

  companyIsSubmitting.value = true
  formError.value = ''

  try {
    if (editingCompanyId.value && selectedCompany.value && !selectedCompany.value.isDefault) {
      await updateCompany(editingCompanyId.value, {
        name: nextName,
        emoji: form.emoji,
        color: form.color
      })

      closeCompanyManager()
      companyModalOpen.value = false
      editingCompanyId.value = null
      selectedCompany.value = null
      resetForm()
      return
    }

    await addCompany({
      name: nextName,
      emoji: form.emoji,
      color: form.color
    })

    resetForm()
    companyModalOpen.value = false
  }
  catch (error) {
    formError.value = resolveActionErrorMessage(error)
  }
  finally {
    companyIsSubmitting.value = false
  }
}

async function togglePinned(item: any) {
  formError.value = ''

  try {
    await setCompanyPinned(companyKeyForItem(item), !item.pinned)
  }
  catch (error) {
    formError.value = resolveActionErrorMessage(error)
  }
}

async function toggleEnabled(item: any) {
  const nextEnabled = !item.enabled
  formError.value = ''

  if (item.isDefault) {
    try {
      await setDefaultCompanyEnabled(item.name, nextEnabled)
    }
    catch (error) {
      formError.value = resolveActionErrorMessage(error)
    }
    return
  }

  try {
    await setCustomCompanyEnabled(item.id, nextEnabled)
  }
  catch (error) {
    formError.value = resolveActionErrorMessage(error)
  }
}

async function confirmDeleteCompany() {
  if (!canEditMoneyData.value) return
  if (!selectedCompany.value) return

  if (selectedCompany.value.isDefault) {
    if (selectedCompany.value.name === 'Other') {
      try {
        await setDefaultCompanyEnabled(selectedCompany.value.name, false)
      }
      catch (error) {
        formError.value = resolveActionErrorMessage(error)
        return
      }
    }
    closeCompanyManager()
    return
  }

  try {
    await removeCompany(selectedCompany.value.id)
    closeCompanyManager()
  }
  catch (error) {
    formError.value = resolveActionErrorMessage(error)
  }
}

function onCompanyDragStart(item: any, event: DragEvent) {
  if (!event.dataTransfer) return

  dragState.key = companyKeyForItem(item)
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', dragState.key)
}

async function onCompanyDrop(item: any) {
  const fromKey = dragState.key
  const toKey = companyKeyForItem(item)

  if (fromKey && fromKey !== toKey) {
    formError.value = ''

    try {
      await moveCompany(fromKey, toKey)
    }
    catch (error) {
      formError.value = resolveActionErrorMessage(error)
    }
  }

  dragState.key = ''
}

function onCompanyDragEnd() {
  dragState.key = ''
}
</script>

<template>
  <div class="space-y-5 pb-24">
    <section class="flex items-center justify-between gap-3">
      <div class="min-w-0">
        <h1 class="text-2xl font-black tracking-tight text-default">{{ companiesCopy.title }}</h1>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <PageReloadButton />

        <UButton
          v-if="canEditMoneyData"
          size="lg"
          :class="['rounded-[1.25rem] border-0 bg-gradient-to-r px-4 font-bold text-white shadow-[0_18px_35px_-22px_rgba(15,23,42,0.28)] transition active:scale-95', activeTheme.accent]"
          @click="companyModalOpen = true"
        >
          {{ companiesCopy.add }}
        </UButton>
      </div>
    </section>

    <section class="space-y-2">
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-base font-black tracking-tight text-default">{{ companiesCopy.title }}</h2>
          <p class="mt-1 text-[11px] text-muted">{{ companiesCopy.listDesc }}</p>
        </div>

        <UBadge color="neutral" variant="soft" class="rounded-full">
          {{ isHydrated ? companyList.length : '...' }}
        </UBadge>
      </div>

      <div v-if="!isHydrated" class="space-y-2">
        <div
          v-for="index in 3"
          :key="index"
          class="h-18 rounded-[1.25rem] border border-slate-200/80 bg-white/70 px-4 py-3 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.18)] dark:border-slate-800 dark:bg-slate-950/70"
        >
          <div class="flex h-full items-center gap-3">
            <div class="size-10 rounded-full bg-slate-100 dark:bg-slate-800" />
            <div class="min-w-0 flex-1 space-y-2">
              <div class="h-3.5 w-28 rounded-full bg-slate-100 dark:bg-slate-800" />
              <div class="h-2.5 w-40 rounded-full bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
        </div>
      </div>

      <template v-else>
        <p v-if="!hasEnabledCompanies" class="rounded-[1.25rem] border border-amber-200/80 bg-amber-50 px-4 py-3 text-[12px] font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
          {{ companiesCopy.noEnabledCompanies }}
        </p>

        <div class="space-y-2">
          <article
            v-for="item in companyList"
            :key="item.id"
            class="flex cursor-pointer items-center justify-between gap-2.5 rounded-[1.25rem] border border-slate-200/80 bg-white/80 px-4 py-3 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.18)] transition active:scale-[0.99] dark:border-slate-800 dark:bg-slate-950/70"
            :class="item.enabled ? '' : 'opacity-60 saturate-50'"
            draggable="true"
            @click="openCompanyManager(item)"
            @dragstart="onCompanyDragStart(item, $event)"
            @dragover.prevent
            @drop.prevent="onCompanyDrop(item)"
            @dragend="onCompanyDragEnd"
          >
            <div class="flex min-w-0 items-center gap-3">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm sm:size-11" :class="accentMap[item.color]">
                <span class="block translate-y-px text-base leading-none sm:text-lg">{{ item.emoji }}</span>
              </div>

              <div class="min-w-0">
                <p class="truncate text-sm font-black text-default">{{ item.name }}</p>
                <div class="mt-1 flex flex-wrap items-center gap-1.5">
                  <UBadge color="neutral" variant="soft" class="rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] leading-none">
                    {{ item.isDefault ? companiesCopy.default : companiesCopy.custom }}
                  </UBadge>
                  <p class="text-[10px] leading-none text-muted">{{ item.count }} {{ companiesCopy.transactions }}</p>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-1.5">
              <button
                type="button"
                class="inline-flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition active:scale-95 dark:bg-slate-900 dark:text-slate-300 sm:size-9"
                :aria-label="item.pinned ? companyToggleCopy.unpin : companyToggleCopy.pin"
                @click.stop="togglePinned(item)"
              >
                <UIcon :name="item.pinned ? 'i-lucide-pin-off' : 'i-lucide-pin'" class="size-3.5 sm:size-4" />
              </button>

              <button
                type="button"
                class="inline-flex items-center gap-1 rounded-full px-2.5 py-2 text-[11px] font-bold transition active:scale-95"
                :class="item.enabled ? 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-200' : 'bg-primary/10 text-primary'"
                @click.stop="toggleEnabled(item)"
              >
                <UIcon :name="item.enabled ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="size-3.5" />
                {{ item.enabled ? companyToggleCopy.disable : companyToggleCopy.enable }}
              </button>

              <div
                class="inline-flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300 sm:size-9"
                :title="companyToggleCopy.drag"
                @click.stop
              >
                <UIcon name="i-lucide-grip-vertical" class="size-3.5 sm:size-4" />
              </div>
            </div>
          </article>
        </div>
      </template>
    </section>

    <USlideover
      v-model:open="manageCompanyOpen"
      side="bottom"
      :close="true"
      :ui="{
        content: 'w-full data-[state=open]:animate-[slide-in-from-bottom_220ms_ease-out] data-[state=closed]:animate-[slide-out-to-bottom_220ms_ease-in] data-[state=open]:rounded-t-[1.5rem] data-[state=closed]:rounded-t-[1.5rem] overflow-hidden border border-slate-200/80 bg-white shadow-[0_-18px_60px_-30px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950',
        body: 'p-0',
        footer: 'p-0',
        header: 'p-0'
      }"
    >
      <template #content="{ close }">
        <div class="max-h-[84svh] overflow-hidden">
          <div class="border-b border-slate-200/80 px-4 pb-3 pt-2 dark:border-slate-800">
            <div class="mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-300/80 dark:bg-slate-700" />
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{{ companyManageCopy.title }}</p>
                <h2 class="mt-1 text-lg font-black tracking-tight text-default">{{ selectedCompany?.name ?? '-' }}</h2>
                <p class="mt-1 text-[11px] text-muted">{{ companyManageCopy.description }}</p>
              </div>

              <button
                type="button"
                class="flex size-9 items-center justify-center rounded-full bg-slate-100 text-muted transition active:scale-95 dark:bg-slate-900"
                :aria-label="companiesCopy.closeCompanySheet"
                @click="closeCompanyManager(); close()"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </div>
          </div>

          <div class="max-h-[calc(84svh-4.5rem)] overflow-y-auto px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+7rem)]">
            <div
              v-if="selectedCompany"
              class="rounded-[1.25rem] border border-slate-200/80 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/70"
            >
              <div class="flex items-center gap-3">
                <div class="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm" :class="accentMap[selectedCompany.color]">
                  <span class="block translate-y-px text-xl leading-none">{{ selectedCompany.emoji }}</span>
                </div>

                <div class="min-w-0">
                  <p class="truncate text-sm font-black text-default">{{ selectedCompany.name }}</p>
                  <div class="mt-1 flex flex-wrap items-center gap-1.5">
                    <UBadge color="neutral" variant="soft" class="rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] leading-none">
                      {{ selectedCompany.isDefault ? companiesCopy.default : companiesCopy.custom }}
                    </UBadge>
                    <p class="text-[10px] leading-none text-muted">{{ selectedCompany.count }} {{ companiesCopy.transactions }}</p>
                  </div>
                </div>
              </div>
            </div>

            <div
              v-if="selectedCompany?.isDefault && selectedCompany?.name !== 'Other'"
              class="mt-4 rounded-[1.25rem] border border-amber-200/80 bg-amber-50 px-4 py-3 text-[12px] font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
            >
              <p class="font-bold">{{ companyManageCopy.lockedTitle }}</p>
              <p class="mt-1">{{ companyManageCopy.lockedDescription }}</p>
            </div>

            <div
              v-else-if="selectedCompany?.isDefault && selectedCompany?.name === 'Other'"
              class="mt-4 rounded-[1.25rem] border border-slate-200/80 bg-slate-50 px-4 py-3 text-[12px] font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-950/70 dark:text-slate-300"
            >
              <p class="font-bold">{{ companyManageCopy.otherTitle }}</p>
              <p class="mt-1">{{ companyManageCopy.otherDescription }}</p>
            </div>

            <div v-else-if="selectedCompany" class="mt-4 grid gap-3" :class="selectedCompanyIsEditable ? 'grid-cols-2' : 'grid-cols-1'">
              <UButton
                v-if="selectedCompanyIsEditable"
                class="h-12 justify-center rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 font-bold text-white shadow-[0_18px_35px_-22px_rgba(99,102,241,0.65)] transition hover:from-indigo-600 hover:to-violet-500 active:scale-95"
                icon="i-lucide-pencil-line"
                @click="openCompanyEditor(selectedCompany)"
              >
                {{ companyManageCopy.edit }}
              </UButton>

              <UButton
                v-if="selectedCompanyCanDelete"
                color="error"
                variant="soft"
                class="h-12 justify-center rounded-full font-bold"
                icon="i-lucide-trash-2"
                @click="manageCompanyOpen = false; deleteCompanyOpen = true"
              >
                {{ companyManageCopy.delete }}
              </UButton>
            </div>

            <div class="mt-4 grid gap-3">
              <button
                type="button"
                class="flex items-center justify-between rounded-[1.15rem] border border-slate-200/80 bg-white px-4 py-3 text-left transition active:scale-[0.99] dark:border-slate-800 dark:bg-slate-950/70"
                @click="selectedCompany && togglePinned(selectedCompany)"
              >
                <div class="min-w-0">
                  <p class="text-sm font-bold text-default">{{ selectedCompany?.pinned ? companyToggleCopy.unpin : companyToggleCopy.pin }}</p>
                  <p class="mt-0.5 text-[11px] text-muted">{{ companyToggleCopy.drag }}</p>
                </div>
                <UIcon :name="selectedCompany?.pinned ? 'i-lucide-pin-off' : 'i-lucide-pin'" class="size-5 text-muted" />
              </button>

              <button
                type="button"
                class="flex items-center justify-between rounded-[1.15rem] border border-slate-200/80 bg-white px-4 py-3 text-left transition active:scale-[0.99] dark:border-slate-800 dark:bg-slate-950/70"
                @click="selectedCompany && toggleEnabled(selectedCompany)"
              >
                <div class="min-w-0">
                  <p class="text-sm font-bold text-default">{{ selectedCompany?.enabled ? companyToggleCopy.disable : companyToggleCopy.enable }}</p>
                  <p class="mt-0.5 text-[11px] text-muted">{{ selectedCompany?.enabled ? companyToggleCopy.active : companyToggleCopy.hidden }}</p>
                </div>
                <UIcon :name="selectedCompany?.enabled ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="size-5 text-muted" />
              </button>
            </div>
          </div>
        </div>
      </template>
    </USlideover>

    <UModal v-model="deleteCompanyOpen">
      <template #body>
        <div v-if="selectedCompany" class="space-y-4">
          <div class="flex items-start gap-3">
            <div class="flex size-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-200">
              <UIcon name="i-lucide-trash-2" class="size-5" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{{ companyManageCopy.deleteTitle }}</p>
              <h3 class="mt-1 text-lg font-black tracking-tight text-default">{{ selectedCompany.name }}</h3>
              <p class="mt-1 text-[12px] text-muted">{{ companyManageCopy.deleteDescription }}</p>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex w-full gap-3">
          <UButton
            variant="soft"
            color="neutral"
            class="h-12 flex-1 justify-center rounded-full text-center font-bold"
            icon="i-lucide-x"
            @click="deleteCompanyOpen = false"
          >
            {{ companiesCopy.cancel }}
          </UButton>
          <UButton
            color="error"
            class="h-12 flex-1 justify-center rounded-full text-center font-bold text-white"
            icon="i-lucide-trash-2"
            @click="confirmDeleteCompany"
          >
            {{ companyManageCopy.confirmDelete }}
          </UButton>
        </div>
      </template>
    </UModal>

    <USlideover
      v-model:open="companyModalOpen"
      side="bottom"
      :close="true"
      :ui="{
        content: 'w-full data-[state=open]:animate-[slide-in-from-bottom_220ms_ease-out] data-[state=closed]:animate-[slide-out-to-bottom_220ms_ease-in] data-[state=open]:rounded-t-[1.5rem] data-[state=closed]:rounded-t-[1.5rem] overflow-hidden border border-slate-200/80 bg-white shadow-[0_-18px_60px_-30px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950',
        body: 'p-0',
        footer: 'p-0',
        header: 'p-0'
      }"
      @after:leave="resetSheetDrag"
    >
      <template #content="{ close }">
        <div class="max-h-[88svh] overflow-hidden" :style="{ transform: `translateY(${sheetDragY}px)`, transition: sheetDragging ? 'none' : 'transform 180ms ease-out' }">
          <div class="border-b border-slate-200/80 px-4 pb-3 pt-2 dark:border-slate-800">
            <div
              ref="sheetHandleRef"
              class="touch-none select-none cursor-grab active:cursor-grabbing"
              @pointerdown="onSheetPointerDown"
              @pointermove="onSheetPointerMove"
              @pointerup="onSheetPointerUp"
              @pointercancel="onSheetPointerCancel"
            >
              <div class="mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-300/80 dark:bg-slate-700" />
            </div>

            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{{ sheetCopy.addCompany }}</p>
                <h2 class="mt-1 text-lg font-black tracking-tight text-default">{{ sheetCopy.newCompany }}</h2>
              </div>

              <button
                type="button"
                class="flex size-9 items-center justify-center rounded-full bg-slate-100 text-muted transition active:scale-95 dark:bg-slate-900"
                :aria-label="sheetCopy.closeCompanySheet"
                @click="cancelCompanySheet(); close()"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </div>
          </div>

          <div class="max-h-[calc(88svh-4.5rem)] overflow-y-auto px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+7rem)]">
            <div class="space-y-4">
              <label class="block">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
                    <UIcon name="i-lucide-building-2" class="size-3.5" />
                  </div>
                  <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{{ companiesCopy.companyName }}</span>
                </div>
                <UInput
                  v-model="form.name"
                  class="w-full rounded-2xl [&>input]:h-12 [&>input]:w-full [&>input]:rounded-2xl [&>input]:border-0 [&>input]:bg-slate-50 [&>input]:px-4 [&>input]:text-[16px] [&>input]:font-semibold [&>input]:shadow-none dark:[&>input]:bg-slate-950"
                  :placeholder="companiesCopy.companyPlaceholder"
                />
              </label>

              <label class="block">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
                    <UIcon name="i-lucide-sparkles" class="size-3.5" />
                  </div>
                  <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{{ companiesCopy.emoji }}</span>
                </div>
                <UInput
                  v-model="form.emoji"
                  class="w-full rounded-2xl [&>input]:h-12 [&>input]:w-full [&>input]:rounded-2xl [&>input]:border-0 [&>input]:bg-slate-50 [&>input]:px-4 [&>input]:text-[16px] [&>input]:font-semibold [&>input]:shadow-none dark:[&>input]:bg-slate-950"
                  autocapitalize="off"
                  autocomplete="off"
                  enterkeyhint="done"
                  inputmode="text"
                  spellcheck="false"
                  lang="en"
                  maxlength="2"
                  placeholder="🏢"
                />
              </label>

              <div class="block">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
                    <UIcon name="i-lucide-palette" class="size-3.5" />
                  </div>
                  <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{{ companiesCopy.color }}</span>
                </div>
                <div class="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  <button
                    v-for="item in walletColorOptions"
                    :key="item.value"
                    type="button"
                    class="group relative flex flex-col items-center gap-1.5 rounded-2xl border px-2.5 py-2 text-center transition active:scale-95"
                    :class="form.color === item.value
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                      : 'border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950/60'"
                    @click="form.color = item.value"
                  >
                    <span class="flex size-8 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm" :class="item.accent">
                      <UIcon v-if="form.color === item.value" name="i-lucide-check" class="size-4" />
                    </span>
                    <span class="text-[10px] font-semibold leading-none text-default">{{ item.label }}</span>
                  </button>
                </div>
              </div>

              <p v-if="formError" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-100">
                {{ formError }}
              </p>
            </div>

            <div class="h-8" aria-hidden="true" />
          </div>

          <div class="sticky bottom-0 shrink-0 border-t border-slate-200/80 bg-white/96 px-4 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/96">
            <div class="flex w-full gap-3">
              <UButton
                variant="soft"
                color="neutral"
                class="h-12 flex-1 justify-center rounded-full text-center font-bold"
                icon="i-lucide-x"
                @click="cancelCompanySheet(); close()"
              >
                {{ companiesCopy.cancel }}
              </UButton>
              <UButton
                :class="['h-12 flex-1 justify-center rounded-full bg-gradient-to-r text-center font-bold text-white shadow-[0_18px_35px_-22px_rgba(15,23,42,0.28)] transition active:scale-95', activeTheme.accent]"
                :disabled="companyIsSubmitting"
                @click="submitCompany"
              >
                <LoadingSpinner v-if="companyIsSubmitting" class="size-4 shrink-0" />
                <UIcon v-else name="i-lucide-check" class="size-4" />
                {{ sheetCopy.saveCompany }}
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>
