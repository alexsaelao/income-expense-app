<script setup lang="ts">
import type { CategoryType, WalletColor } from '~/composables/useMoneyNote'
import { useMoneyNote, walletColorOptions } from '~/composables/useMoneyNote'

const { selectedLanguage } = useAppLanguage()
const {
  categoryEntriesFor,
  addCategory,
  updateCategory,
  removeCategory,
  setDefaultCategoryEnabled,
  setCategoryPinned,
  setCustomCategoryEnabled,
  moveCategory
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
  selectedCategory.value = item
  manageCategoryOpen.value = true
}

function closeCategoryManager() {
  manageCategoryOpen.value = false
  deleteCategoryOpen.value = false
  selectedCategory.value = null
}

function openCategoryEditor(item: any) {
  selectedCategory.value = item
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

function onCategoryDrop(type: CategoryType, item: any) {
  if (!dragState || dragState.type !== type) return

  const fromKey = dragState.key
  const toKey = categoryKeyForItem(item)

  if (fromKey !== toKey) {
    moveCategory(type, fromKey, toKey)
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

function togglePinned(item: any) {
  setCategoryPinned(item.type, categoryKeyForItem(item), !item.pinned)
}

function toggleEnabled(item: any) {
  const nextEnabled = !item.enabled

  if (item.isDefault) {
    setDefaultCategoryEnabled(item.type, item.name, nextEnabled)
    return
  }

  setCustomCategoryEnabled(item.id, nextEnabled)
}

function resetForm() {
  form.name = ''
  form.type = 'expense'
  form.emoji = '🏷️'
  form.color = 'sky'
  formError.value = ''
}

function submitCategory() {
  if (editingCategoryId.value && selectedCategory.value && !selectedCategory.value.isDefault) {
    const updated = updateCategory(editingCategoryId.value, {
      name: form.name,
      emoji: form.emoji,
      color: form.color
    })

    if (!updated) {
      formError.value = categoriesCopy.value.nameExists
      return
    }

    closeCategoryManager()
    categoryModalOpen.value = false
    resetEditState()
    return
  }

  const created = addCategory({
    type: form.type,
    name: form.name,
    emoji: form.emoji,
    color: form.color
  })

  if (!created) {
    formError.value = categoriesCopy.value.nameExists
    return
  }

  resetForm()
  categoryModalOpen.value = false
}

function confirmDeleteCategory() {
  if (!selectedCategory.value || selectedCategory.value.isDefault) return

  removeCategory(selectedCategory.value.id)
  closeCategoryManager()
  deleteCategoryOpen.value = false
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

      <UButton
        icon="i-lucide-plus"
        size="lg"
        class="rounded-[1.25rem] border-0 bg-primary px-4 font-bold text-white shadow-[0_18px_35px_-22px_rgba(15,23,42,0.28)] transition active:scale-95"
        @click="categoryModalOpen = true"
      >
        {{ categoriesCopy.add }}
      </UButton>
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
      :close="false"
      :ui="{
        content: 'w-full data-[state=open]:animate-[slide-in-from-bottom_220ms_ease-out] data-[state=closed]:animate-[slide-out-to-bottom_220ms_ease-in] data-[state=open]:rounded-t-[1.5rem] data-[state=closed]:rounded-t-[1.5rem] overflow-hidden border border-slate-200/80 bg-white shadow-[0_-18px_60px_-30px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950 md:mx-auto md:mb-4 md:w-[min(30rem,calc(100%-2rem))] md:rounded-[1.5rem]',
        body: 'p-0',
        footer: 'p-0',
        header: 'p-0',
      }"
    >
      <template #content="{ close }">
        <div class="max-h-[84svh] overflow-hidden">
          <div class="border-b border-slate-200/80 px-4 pb-3 pt-2 dark:border-slate-800">
            <div class="mx-auto mb-2 h-1.5 w-12 rounded-full bg-slate-300/80 dark:bg-slate-700" />

            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{{ categoryManageCopy.title }}</p>
                <h2 class="mt-1 text-lg font-black tracking-tight text-default">{{ activeCategory?.name ?? '-' }}</h2>
                <p class="mt-1 text-[11px] text-muted">{{ categoryManageCopy.description }}</p>
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

          <div class="max-h-[calc(84svh-4.5rem)] overflow-y-auto px-4 py-4 pb-[calc(env(safe-area-inset-bottom)+7rem)]">
            <div
              v-if="activeCategory"
              class="rounded-[1.25rem] border border-slate-200/80 bg-slate-50 px-4 py-4 dark:border-slate-800 dark:bg-slate-950/70"
            >
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

            <div v-else-if="activeCategory" class="mt-4 grid grid-cols-2 gap-3">
              <UButton
                class="h-12 justify-center rounded-full bg-gradient-to-r from-sky-500 to-cyan-400 font-bold text-white shadow-[0_18px_35px_-22px_rgba(14,165,233,0.55)] transition hover:from-sky-600 hover:to-cyan-500 active:scale-95"
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
                @click="manageCategoryOpen = false; deleteCategoryOpen = true"
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
          </div>
        </div>
      </template>
    </USlideover>

    <UModal v-model="deleteCategoryOpen">
      <template #body>
        <div v-if="activeCategory" class="space-y-4">
          <div class="flex items-start gap-3">
            <div class="flex size-11 shrink-0 items-center justify-center rounded-full bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-200">
              <UIcon name="i-lucide-trash-2" class="size-5" />
            </div>
            <div class="min-w-0">
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{{ categoryManageCopy.deleteTitle }}</p>
              <h3 class="mt-1 text-lg font-black tracking-tight text-default">{{ activeCategory.name }}</h3>
              <p class="mt-1 text-[12px] text-muted">{{ categoryManageCopy.deleteDescription }}</p>
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
            @click="deleteCategoryOpen = false"
          >
            {{ categoriesCopy.cancel }}
          </UButton>
          <UButton
            color="error"
            class="h-12 flex-1 justify-center rounded-full text-center font-bold text-white"
            icon="i-lucide-trash-2"
            @click="confirmDeleteCategory"
          >
            {{ categoryManageCopy.confirmDelete }}
          </UButton>
        </div>
      </template>
    </UModal>

    <USlideover
      v-model:open="categoryModalOpen"
      side="bottom"
      :close="false"
      :ui="{
        content: 'w-full data-[state=open]:animate-[slide-in-from-bottom_220ms_ease-out] data-[state=closed]:animate-[slide-out-to-bottom_220ms_ease-in] data-[state=open]:rounded-t-[1.5rem] data-[state=closed]:rounded-t-[1.5rem] overflow-hidden border border-slate-200/80 bg-white shadow-[0_-18px_60px_-30px_rgba(15,23,42,0.35)] dark:border-slate-800 dark:bg-slate-950 md:mx-auto md:mb-4 md:w-[min(30rem,calc(100%-2rem))] md:rounded-[1.5rem]',
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
                class="h-12 flex-1 justify-center rounded-full bg-primary text-center font-bold text-white shadow-[0_18px_35px_-22px_rgba(15,23,42,0.28)] transition active:scale-95"
                icon="i-lucide-check"
                @click="submitCategory"
              >
                {{ sheetCopy.saveCategory }}
              </UButton>
            </div>
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>
