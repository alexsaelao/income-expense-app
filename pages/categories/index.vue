<script setup lang="ts">
import type { CategoryType, WalletColor } from '~/composables/useMoneyNote'
import { useMoneyNote, walletColorOptions } from '~/composables/useMoneyNote'

const { selectedLanguage } = useAppLanguage()
const { activeTheme } = useAppThemeColor()
const {
  categoryEntriesFor,
  addCategory,
  updateCategory,
  removeCategory,
  setDefaultCategoryEnabled,
  setCategoryPinned,
  setCustomCategoryEnabled,
  moveCategory,
  canEditMoneyData
} = useMoneyNote()

const categoryModalOpen = ref(false)
const manageCategoryOpen = ref(false)
const deleteCategoryOpen = ref(false)
const editingCategoryId = ref<string | null>(null)
const sheetDragY = ref(0)
const sheetDragging = ref(false)
const sheetDragStartY = ref(0)
const sheetPointerId = ref<number | null>(null)
const sheetHandleRef = ref<HTMLElement | null>(null)
const formError = ref('')
const categoryIsSubmitting = ref(false)
const deleteCategoryBusy = ref(false)
const deleteCategoryError = ref('')
const selectedCategory = ref<any | null>(null)
const dragState = reactive({
  type: null as CategoryType | null,
  key: ''
})

const form = reactive({
  name: '',
  type: 'expense' as CategoryType,
  emoji: '🏷️',
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
    || categoriesCopy.value.nameExists
}

const accentMap = Object.fromEntries(walletColorOptions.map(item => [item.value, item.accent])) as Record<WalletColor, string>
const colorLabelMap = computed<Record<WalletColor, string>>(() => selectedLanguage.value === 'lo'
  ? {
      sky: 'ຟ້າ',
      emerald: 'ຂຽວ',
      indigo: 'ຄ້າຍມ່ວງ',
      amber: 'ເຫຼືອງ',
      rose: 'ຊົມພູ',
      violet: 'ມ່ວງ',
      fuchsia: 'ບົວ',
      slate: 'ເທົາ'
    }
  : {
      sky: 'Sky',
      emerald: 'Emerald',
      indigo: 'Indigo',
      amber: 'Amber',
      rose: 'Rose',
      violet: 'Violet',
      fuchsia: 'Fuchsia',
      slate: 'Slate'
    })

const categoriesCopy = computed(() => selectedLanguage.value === 'lo'
  ? {
      title: 'ປະເພດ',
      add: 'ເພີ່ມ',
      incomeCategories: 'ປະເພດລາຍຮັບ',
      incomeDescription: 'ປ້າຍທີ່ໃຊ້ກັບລາຍການລາຍຮັບ.',
      expenseCategories: 'ປະເພດລາຍຈ່າຍ',
      expenseDescription: 'ປ້າຍທີ່ໃຊ້ກັບລາຍການລາຍຈ່າຍ.',
      createCustomFirst: 'ສ້າງປະເພດເອງກ່ອນເພື່ອໃຊ້ໃນທຸລະກຳ.',
      noEnabledCategories: 'ຍັງບໍ່ມີປະເພດທີ່ເປີດໃຊ້. ເປີດປະເພດໜຶ່ງກ່ອນ ຫຼື ສ້າງປະເພດໃໝ່.',
      addCategory: 'ເພີ່ມປະເພດ',
      newCategory: 'ປະເພດໃໝ່',
      closeCategorySheet: 'ປິດແຖບປະເພດ',
      categoryName: 'ຊື່ປະເພດ',
      categoryPlaceholder: 'ເຊັ່ນ: ເງິນເດືອນ, ຄ່າກິນ',
      type: 'ປະເພດ',
      income: 'ລາຍຮັບ',
      expense: 'ລາຍຈ່າຍ',
      emoji: 'ອີໂມຈິ',
      color: 'ສີ',
      default: 'ຄ່າຕັ້ງຕົ້ນ',
      custom: 'ກຳນົດເອງ',
      transactions: 'ລາຍການ',
      cancel: 'ຍົກເລີກ',
      saveCategory: 'ບັນທຶກປະເພດ',
      nameExists: 'ຊື່ປະເພດມີຢູ່ແລ້ວ ຫຼື ບໍ່ວ່າງ.'
    }
  : {
      title: 'Categories',
      add: 'Add',
      incomeCategories: 'Income categories',
      incomeDescription: 'Labels used for income records.',
      expenseCategories: 'Expense categories',
      expenseDescription: 'Labels used for expense records.',
      createCustomFirst: 'Create your own categories first to use them in transactions.',
      noEnabledCategories: 'No category is enabled yet. Turn one on or create a new category.',
      addCategory: 'Add category',
      newCategory: 'New category',
      closeCategorySheet: 'Close category sheet',
      categoryName: 'Category name',
      categoryPlaceholder: 'e.g. Salary, Groceries',
      type: 'Type',
      income: 'Income',
      expense: 'Expense',
      emoji: 'Emoji',
      color: 'Color',
      default: 'Default',
      custom: 'Custom',
      transactions: 'transactions',
      cancel: 'Cancel',
      saveCategory: 'Save category',
      nameExists: 'Category name already exists or is empty.'
    })

const categorySections = computed(() => [
  {
    key: 'income',
    label: categoriesCopy.value.incomeCategories,
    description: categoriesCopy.value.incomeDescription,
    items: categoryEntriesFor('income')
  },
  {
    key: 'expense',
    label: categoriesCopy.value.expenseCategories,
    description: categoriesCopy.value.expenseDescription,
    items: categoryEntriesFor('expense')
  }
])
const categoryToggleCopy = computed(() => selectedLanguage.value === 'lo'
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

const categoryManageCopy = computed(() => selectedLanguage.value === 'lo'
  ? {
      title: 'ຈັດການປະເພດ',
      description: 'ແກ້ໄຂ, ປັກໝຸດ, ເປີດ/ປິດ, ຫຼືລຶບປະເພດນີ້.',
      lockedTitle: 'ປະເພດທີ່ລັອກ',
      lockedDescription: 'ປະເພດຄ່າຕັ້ງຕົ້ນບໍ່ສາມາດແກ້ໄຂ ຫຼື ລຶບໄດ້.',
      edit: 'ແກ້ໄຂ',
      delete: 'ລຶບ',
      deleteTitle: 'ລຶບປະເພດ?',
      deleteDescription: 'ປະເພດນີ້ຈະຖືກລຶບອອກຈາກລາຍການ. ລາຍການເກົ່າຈະຍັງຄົງຢູ່.',
      confirmDelete: 'ລຶບປະເພດ',
      close: 'ປິດ'
    }
  : {
      title: 'Manage category',
      description: 'Edit, pin, enable, or delete this category.',
      lockedTitle: 'Locked category',
      lockedDescription: 'Built-in categories cannot be edited or deleted.',
      edit: 'Edit',
      delete: 'Delete',
      deleteTitle: 'Delete category?',
      deleteDescription: 'This category will be removed from the list. Existing transactions will keep their history.',
      confirmDelete: 'Delete category',
      close: 'Close'
    })

const sheetCopy = computed(() => {
  if (editingCategoryId.value) {
    return selectedLanguage.value === 'lo'
      ? {
          addCategory: 'ແກ້ໄຂປະເພດ',
          newCategory: 'ປັບປຸງປະເພດ',
          closeCategorySheet: 'ປິດແຖບປະເພດ',
          saveCategory: 'ບັນທຶກການແກ້ໄຂ'
        }
      : {
          addCategory: 'Edit category',
          newCategory: 'Update category',
          closeCategorySheet: 'Close category sheet',
          saveCategory: 'Save changes'
        }
  }

  return {
    addCategory: categoriesCopy.value.addCategory,
    newCategory: categoriesCopy.value.newCategory,
    closeCategorySheet: categoriesCopy.value.closeCategorySheet,
    saveCategory: categoriesCopy.value.saveCategory
  }
})

const hasEnabledCategories = computed(() => categorySections.value.some(section => section.items.some(item => item.enabled)))
const activeCategory = computed(() => selectedCategory.value ?? null)
const isDefaultSelectedCategory = computed(() => Boolean(activeCategory.value?.isDefault))
const selectedCategoryTypeLabel = computed(() => activeCategory.value
  ? (activeCategory.value.type === 'income'
      ? categoriesCopy.value.income
      : categoriesCopy.value.expense)
  : '')

function categoryKeyForItem(item: any) {
  return item.key ?? (item.isDefault ? `${item.type}:${item.name.toLowerCase()}` : `custom:${item.id}`)
}

function openCategoryManager(item: any) {
  if (!canEditMoneyData.value) return
  selectedCategory.value = item
  deleteCategoryOpen.value = false
  manageCategoryOpen.value = true
}

function closeCategoryManager() {
  manageCategoryOpen.value = false
  deleteCategoryOpen.value = false
  deleteCategoryError.value = ''
  selectedCategory.value = null
}

function openDeleteCategory() {
  if (!activeCategory.value || activeCategory.value.isDefault) return
  deleteCategoryError.value = ''
  deleteCategoryOpen.value = true
}

function openCategoryEditor(item: any) {
  if (!canEditMoneyData.value) return
  selectedCategory.value = item
  deleteCategoryOpen.value = false
  editingCategoryId.value = item.id
  form.name = item.name
  form.type = item.type
  form.emoji = item.emoji
  form.color = item.color
  formError.value = ''
  manageCategoryOpen.value = false
  categoryModalOpen.value = true
}

function resetEditState() {
  editingCategoryId.value = null
  selectedCategory.value = null
  resetForm()
}

function onCategoryDragStart(type: CategoryType, item: any, event: DragEvent) {
  if (!event.dataTransfer) return

  dragState.type = type
  dragState.key = categoryKeyForItem(item)
  event.dataTransfer.effectAllowed = 'move'
  event.dataTransfer.setData('text/plain', dragState.key)
}

async function onCategoryDrop(type: CategoryType, item: any) {
  if (!dragState || dragState.type !== type) return

  const fromKey = dragState.key
  const toKey = categoryKeyForItem(item)

  if (fromKey !== toKey) {
    formError.value = ''

    try {
      await moveCategory(type, fromKey, toKey)
    }
    catch (error) {
      formError.value = resolveActionErrorMessage(error)
    }
  }

  dragState.type = null
  dragState.key = ''
}

function onCategoryDragEnd() {
  if (dragState) {
    dragState.type = null
    dragState.key = ''
  }
}

async function togglePinned(item: any) {
  formError.value = ''

  try {
    await setCategoryPinned(item.type, categoryKeyForItem(item), !item.pinned)
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
      await setDefaultCategoryEnabled(item.type, item.name, nextEnabled)
    }
    catch (error) {
      formError.value = resolveActionErrorMessage(error)
    }
    return
  }

  try {
    await setCustomCategoryEnabled(item.id, nextEnabled)
  }
  catch (error) {
    formError.value = resolveActionErrorMessage(error)
  }
}

function resetForm() {
  form.name = ''
  form.type = 'expense'
  form.emoji = '🏷️'
  form.color = 'sky'
  formError.value = ''
}

async function submitCategory() {
  if (!canEditMoneyData.value) return
  if (categoryIsSubmitting.value) return

  const nextName = form.name.trim()
  const nextType = editingCategoryId.value && selectedCategory.value ? selectedCategory.value.type : form.type
  if (!nextName) {
    formError.value = categoriesCopy.value.nameExists
    return
  }

  const matchesDefaultName = categoryEntriesFor(nextType).some(item => (
    item.isDefault
    && item.name.trim().toLowerCase() === nextName.toLowerCase()
    && (!editingCategoryId.value || selectedCategory.value?.name.trim().toLowerCase() !== nextName.toLowerCase())
  ))

  if (matchesDefaultName) {
    formError.value = categoriesCopy.value.nameExists
    return
  }

  categoryIsSubmitting.value = true
  formError.value = ''

  try {
    if (editingCategoryId.value && selectedCategory.value && !selectedCategory.value.isDefault) {
      await updateCategory(editingCategoryId.value, {
        name: nextName,
        emoji: form.emoji,
        color: form.color
      })

      closeCategoryManager()
      categoryModalOpen.value = false
      resetEditState()
      return
    }

    await addCategory({
      type: form.type,
      name: nextName,
      emoji: form.emoji,
      color: form.color
    })

    resetForm()
    categoryModalOpen.value = false
  }
  catch (error) {
    formError.value = resolveActionErrorMessage(error)
  }
  finally {
    categoryIsSubmitting.value = false
  }
}

async function confirmDeleteCategory() {
  if (!canEditMoneyData.value) return
  if (!selectedCategory.value || selectedCategory.value.isDefault || deleteCategoryBusy.value) return

  deleteCategoryBusy.value = true
  deleteCategoryError.value = ''

  try {
    await removeCategory(selectedCategory.value.id)
    closeCategoryManager()
    deleteCategoryOpen.value = false
  }
  catch (error) {
    deleteCategoryError.value = resolveActionErrorMessage(error)
  }
  finally {
    deleteCategoryBusy.value = false
  }
}

function cancelCategorySheet() {
  categoryModalOpen.value = false
  if (editingCategoryId.value) {
    resetEditState()
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
  categoryModalOpen.value = !shouldClose
  resetSheetDrag()
}

function onSheetPointerCancel() {
  if (sheetPointerId.value !== null) {
    sheetHandleRef.value?.releasePointerCapture(sheetPointerId.value)
  }
  resetSheetDrag()
}
</script>

<template>
  <div class="space-y-5 pb-4">
    <section class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <h1 class="text-3xl font-black tracking-tight text-default">{{ categoriesCopy.title }}</h1>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <PageReloadButton />

        <UButton
          v-if="canEditMoneyData"
          icon="i-lucide-plus"
          size="lg"
          :class="['rounded-[1.25rem] border-0 bg-gradient-to-r px-4 font-bold text-white shadow-[0_18px_35px_-22px_rgba(15,23,42,0.28)] transition active:scale-95', activeTheme.accent]"
          @click="categoryModalOpen = true"
        >
          {{ categoriesCopy.add }}
        </UButton>
      </div>
    </section>

    <p v-if="!hasEnabledCategories" class="rounded-[1.25rem] border border-amber-200/80 bg-amber-50 px-4 py-3 text-[12px] font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100">
      {{ categoriesCopy.noEnabledCategories }}
    </p>

    <section
      v-for="section in categorySections"
      :key="section.key"
      class="space-y-2"
    >
      <div class="flex items-center justify-between gap-3">
        <div class="min-w-0">
          <h2 class="text-base font-black tracking-tight text-default">{{ section.label }}</h2>
          <p class="mt-1 text-[11px] text-muted">{{ section.description }}</p>
        </div>

        <UBadge color="neutral" variant="soft" class="rounded-full">
          {{ section.items.length }}
        </UBadge>
      </div>

      <div class="space-y-2">
        <article
          v-for="item in section.items"
          :key="item.id"
          class="flex cursor-pointer items-center justify-between gap-2.5 rounded-[1.25rem] border border-slate-200/80 bg-white/80 px-4 py-3 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.18)] transition active:scale-[0.99] dark:border-slate-800 dark:bg-slate-950/70"
          :class="item.enabled ? '' : 'opacity-60 saturate-50'"
          draggable="true"
          @click="openCategoryManager(item)"
          @dragstart="onCategoryDragStart(section.key === 'income' ? 'income' : 'expense', item, $event)"
          @dragover.prevent
          @drop.prevent="onCategoryDrop(section.key === 'income' ? 'income' : 'expense', item)"
          @dragend="onCategoryDragEnd"
        >
          <div class="flex min-w-0 items-center gap-3">
            <div
              class="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm sm:size-11"
              :class="accentMap[item.color]"
            >
              <span class="block translate-y-px text-base leading-none sm:text-lg">{{ item.emoji }}</span>
            </div>

            <div class="min-w-0">
              <p class="truncate text-sm font-black text-default">{{ item.name }}</p>
              <div class="mt-1 flex flex-wrap items-center gap-1.5">
                <UBadge
                  color="neutral"
                  variant="soft"
                  class="rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] leading-none"
                >
                  {{ item.isDefault ? categoriesCopy.default : categoriesCopy.custom }}
                </UBadge>
                <p class="text-[10px] text-muted leading-none">{{ item.count }} {{ categoriesCopy.transactions }}</p>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <button
              type="button"
              class="inline-flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-600 transition active:scale-95 dark:bg-slate-900 dark:text-slate-300 sm:size-9"
              :aria-label="item.pinned ? categoryToggleCopy.unpin : categoryToggleCopy.pin"
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
              {{ item.enabled ? categoryToggleCopy.disable : categoryToggleCopy.enable }}
            </button>

            <div
              class="inline-flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-900 dark:text-slate-300 sm:size-9"
              :title="categoryToggleCopy.drag"
              @click.stop
            >
              <UIcon name="i-lucide-grip-vertical" class="size-3.5 sm:size-4" />
            </div>
          </div>
        </article>
      </div>
    </section>

    <USlideover
      v-model:open="manageCategoryOpen"
      side="bottom"
      :close="true"
      :ui="{
        content: 'w-full data-[state=open]:animate-[slide-in-from-bottom_220ms_ease-out] data-[state=closed]:animate-[slide-out-to-bottom_220ms_ease-in] data-[state=open]:rounded-t-[1.5rem] data-[state=closed]:rounded-t-[1.5rem] overflow-hidden border border-slate-200/80 bg-white shadow-[0_-18px_60px_-30px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950',
        body: 'p-0',
        footer: 'p-0',
        header: 'p-0',
      }"
    >
      <template #content="{ close }">
        <div class="flex max-h-[84svh] flex-col overflow-hidden">
          <div class="border-b border-slate-200/80 px-4 pb-3 pt-2 dark:border-slate-800">
            <div class="mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-300/80 dark:bg-slate-700" />

            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{{ deleteCategoryOpen ? categoryManageCopy.deleteTitle : categoryManageCopy.title }}</p>
                <h2 class="mt-1 text-lg font-black tracking-tight text-default">{{ activeCategory?.name ?? '-' }}</h2>
                <p class="mt-1 text-[11px] text-muted">{{ deleteCategoryOpen ? categoryManageCopy.confirmDelete : categoryManageCopy.description }}</p>
              </div>

              <button
                type="button"
                class="flex size-9 items-center justify-center rounded-full bg-slate-100 text-muted transition active:scale-95 dark:bg-slate-900"
                :aria-label="categoryManageCopy.close"
                @click="closeCategoryManager(); close()"
              >
                <UIcon name="i-lucide-x" class="size-4" />
              </button>
            </div>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+7rem)]">
            <div v-if="deleteCategoryOpen && activeCategory" class="space-y-4">
              <p v-if="deleteCategoryError" class="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-100">
                {{ deleteCategoryError }}
              </p>

              <div class="flex items-start gap-3 rounded-[1.25rem] border border-rose-100 bg-rose-50/70 px-4 py-4 dark:border-rose-900/40 dark:bg-rose-950/20">
                <div class="flex size-11 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-200">
                  <UIcon name="i-lucide-trash-2" class="size-5" />
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-black text-default">{{ activeCategory.name }}</p>
                  <p class="mt-1 text-[12px] text-muted">
                    {{ categoryManageCopy.deleteDescription }}
                  </p>
                </div>
              </div>
            </div>

            <template v-else-if="activeCategory">
              <div class="rounded-[1.25rem] border border-slate-200/80 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/70">
                <div class="flex items-center gap-3">
                  <div
                    class="flex size-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm"
                    :class="accentMap[activeCategory.color]"
                  >
                    <span class="block translate-y-px text-xl leading-none">{{ activeCategory.emoji }}</span>
                  </div>

                  <div class="min-w-0">
                    <p class="truncate text-sm font-black text-default">{{ activeCategory.name }}</p>
                    <div class="mt-1 flex flex-wrap items-center gap-1.5">
                      <UBadge color="neutral" variant="soft" class="rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] leading-none">
                        {{ isDefaultSelectedCategory ? categoriesCopy.default : categoriesCopy.custom }}
                      </UBadge>
                      <UBadge color="primary" variant="soft" class="rounded-full px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-[0.14em] leading-none">
                        {{ selectedCategoryTypeLabel }}
                      </UBadge>
                      <p class="text-[10px] text-muted leading-none">{{ activeCategory.count }} {{ categoriesCopy.transactions }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="activeCategory?.isDefault"
                class="mt-4 rounded-[1.25rem] border border-amber-200/80 bg-amber-50 px-4 py-3 text-[12px] font-medium text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-100"
              >
                <p class="font-bold">{{ categoryManageCopy.lockedTitle }}</p>
                <p class="mt-1">{{ categoryManageCopy.lockedDescription }}</p>
              </div>

              <div v-else class="mt-4 grid grid-cols-2 gap-3">
                <UButton
                  :class="['h-12 justify-center rounded-full font-bold text-white shadow-[0_18px_35px_-22px_rgba(14,165,233,0.55)] transition active:scale-95', activeTheme.accent]"
                  icon="i-lucide-pencil-line"
                  @click="openCategoryEditor(activeCategory)"
                >
                  {{ categoryManageCopy.edit }}
                </UButton>

                <UButton
                  color="error"
                  variant="soft"
                  class="h-12 justify-center rounded-full font-bold"
                  icon="i-lucide-trash-2"
                  @click="openDeleteCategory"
                >
                  {{ categoryManageCopy.delete }}
                </UButton>
              </div>

              <div class="mt-4 grid gap-3">
                <button
                  type="button"
                  class="flex items-center justify-between rounded-[1.15rem] border border-slate-200/80 bg-white px-4 py-3 text-left transition active:scale-[0.99] dark:border-slate-800 dark:bg-slate-950/70"
                  @click="activeCategory && togglePinned(activeCategory)"
                >
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-default">{{ activeCategory?.pinned ? categoryToggleCopy.unpin : categoryToggleCopy.pin }}</p>
                    <p class="mt-0.5 text-[11px] text-muted">{{ categoryToggleCopy.drag }}</p>
                  </div>
                  <UIcon :name="activeCategory?.pinned ? 'i-lucide-pin-off' : 'i-lucide-pin'" class="size-5 text-muted" />
                </button>

                <button
                  type="button"
                  class="flex items-center justify-between rounded-[1.15rem] border border-slate-200/80 bg-white px-4 py-3 text-left transition active:scale-[0.99] dark:border-slate-800 dark:bg-slate-950/70"
                  @click="activeCategory && toggleEnabled(activeCategory)"
                >
                  <div class="min-w-0">
                    <p class="text-sm font-bold text-default">{{ activeCategory?.enabled ? categoryToggleCopy.disable : categoryToggleCopy.enable }}</p>
                    <p class="mt-0.5 text-[11px] text-muted">{{ activeCategory?.enabled ? categoryToggleCopy.active : categoryToggleCopy.hidden }}</p>
                  </div>
                  <UIcon :name="activeCategory?.enabled ? 'i-lucide-eye-off' : 'i-lucide-eye'" class="size-5 text-muted" />
                </button>
              </div>
            </template>
          </div>

          <div v-if="deleteCategoryOpen" class="border-t border-slate-200/80 bg-white/92 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/90">
            <div class="flex w-full flex-col-reverse gap-3 sm:flex-row">
              <button
                type="button"
                class="flex h-12 min-w-0 w-full items-center justify-center gap-2 rounded-full bg-slate-100 px-4 text-center font-bold text-slate-700 transition active:scale-[0.98] sm:flex-1 dark:bg-slate-900 dark:text-slate-200"
                :disabled="deleteCategoryBusy"
                @click="deleteCategoryOpen = false"
              >
                <UIcon name="i-lucide-x" class="size-4 shrink-0" />
                {{ categoriesCopy.cancel }}
              </button>
              <button
                type="button"
                class="flex h-12 min-w-0 w-full items-center justify-center gap-2 rounded-full bg-rose-500 px-4 text-center font-bold text-white shadow-[0_16px_32px_-18px_rgba(244,63,94,0.6)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70 sm:flex-1"
                :disabled="deleteCategoryBusy"
                @click="confirmDeleteCategory"
              >
                <Loader v-if="deleteCategoryBusy" class="size-4 shrink-0" />
                <UIcon v-else name="i-lucide-trash-2" class="size-4" />
                {{ categoryManageCopy.confirmDelete }}
              </button>
            </div>
          </div>
        </div>
      </template>
    </USlideover>

    <USlideover
      v-model:open="categoryModalOpen"
      side="bottom"
      :close="true"
      :ui="{
        content: 'w-full data-[state=open]:animate-[slide-in-from-bottom_220ms_ease-out] data-[state=closed]:animate-[slide-out-to-bottom_220ms_ease-in] data-[state=open]:rounded-t-[1.5rem] data-[state=closed]:rounded-t-[1.5rem] overflow-hidden border border-slate-200/80 bg-white shadow-[0_-18px_60px_-30px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950',
        body: 'p-0',
        footer: 'p-0',
        header: 'p-0',
      }"
      @after:leave="resetSheetDrag"
    >
      <template #content="{ close }">
        <div
          class="max-h-[88svh] overflow-hidden"
          :style="{ transform: `translateY(${sheetDragY}px)`, transition: sheetDragging ? 'none' : 'transform 180ms ease-out' }"
        >
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
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{{ sheetCopy.addCategory }}</p>
                <h2 class="mt-1 text-lg font-black tracking-tight text-default">{{ sheetCopy.newCategory }}</h2>
              </div>

              <button
                type="button"
                class="flex size-9 items-center justify-center rounded-full bg-slate-100 text-muted transition active:scale-95 dark:bg-slate-900"
                :aria-label="sheetCopy.closeCategorySheet"
                @click="cancelCategorySheet(); close()"
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
                    <UIcon name="i-lucide-tag" class="size-3.5" />
                  </div>
                  <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{{ categoriesCopy.categoryName }}</span>
                </div>
                <UInput
                  v-model="form.name"
                  class="w-full rounded-2xl [&>input]:h-12 [&>input]:w-full [&>input]:rounded-2xl [&>input]:border-0 [&>input]:bg-slate-50 [&>input]:px-4 [&>input]:text-[16px] [&>input]:font-semibold [&>input]:shadow-none dark:[&>input]:bg-slate-950"
                  :placeholder="categoriesCopy.categoryPlaceholder"
                />
              </label>

              <div v-if="!editingCategoryId">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
                    <UIcon name="i-lucide-arrow-left-right" class="size-3.5" />
                  </div>
                  <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{{ categoriesCopy.type }}</span>
                </div>

                <div class="grid grid-cols-2 gap-2 rounded-full bg-slate-100 p-1.5 dark:bg-slate-900">
                  <button
                    type="button"
                    class="rounded-full px-3 py-2.5 text-sm font-bold transition active:scale-95"
                    :class="form.type === 'income' ? 'bg-white text-primary shadow-sm dark:bg-slate-800' : 'text-muted'"
                    :disabled="Boolean(editingCategoryId)"
                    @click="form.type = 'income'"
                  >
                    {{ categoriesCopy.income }}
                  </button>
                  <button
                    type="button"
                    class="rounded-full px-3 py-2.5 text-sm font-bold transition active:scale-95"
                    :class="form.type === 'expense' ? 'bg-white text-primary shadow-sm dark:bg-slate-800' : 'text-muted'"
                    :disabled="Boolean(editingCategoryId)"
                    @click="form.type = 'expense'"
                  >
                    {{ categoriesCopy.expense }}
                  </button>
                </div>
              </div>

              <label class="block">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
                    <UIcon name="i-lucide-sparkles" class="size-3.5" />
                  </div>
                  <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{{ categoriesCopy.emoji }}</span>
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
                  placeholder="🏷️"
                />
              </label>

              <div class="block">
                <div class="mb-2 flex items-center gap-2">
                  <div class="flex size-8 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600 shadow-sm dark:bg-sky-950/40 dark:text-sky-200">
                    <UIcon name="i-lucide-palette" class="size-3.5" />
                  </div>
                  <span class="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted">{{ categoriesCopy.color }}</span>
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
                    <span
                      class="flex size-8 items-center justify-center rounded-full bg-gradient-to-br text-white shadow-sm"
                      :class="item.accent"
                    >
                      <UIcon v-if="form.color === item.value" name="i-lucide-check" class="size-4" />
                    </span>
                    <span class="text-[10px] font-semibold leading-none text-default">{{ colorLabelMap[item.value] }}</span>
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
                @click="cancelCategorySheet(); close()"
              >
                {{ categoriesCopy.cancel }}
              </UButton>
              <UButton
                :class="['h-12 flex-1 justify-center rounded-full bg-gradient-to-r text-center font-bold text-white shadow-[0_18px_35px_-22px_rgba(15,23,42,0.28)] transition active:scale-95', activeTheme.accent]"
                :disabled="categoryIsSubmitting"
                @click="submitCategory"
              >
                <LoadingSpinner v-if="categoryIsSubmitting" class="size-4 shrink-0" />
                <UIcon v-else name="i-lucide-check" class="size-4" />
                {{ sheetCopy.saveCategory }}
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>
