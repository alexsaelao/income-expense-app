const sheetContentClasses = [
  'fixed',
  'inset-x-0',
  'bottom-0',
  'mx-auto',
  'w-full',
  'max-w-none',
  'rounded-t-[1.5rem]',
  'rounded-b-none',
  'border-t',
  'border-default',
  'bg-default',
  'shadow-[0_-24px_80px_-30px_rgba(15,23,42,0.45)]',
  'xl:mb-4',
  'xl:w-[min(48rem,calc(100%-2rem))]',
  'xl:rounded-[1.5rem]',
  'overflow-hidden',
  'focus:outline-none'
].join(' ')

const sheetContentAnimationClasses = [
  'data-[state=open]:animate-[slide-in-from-bottom_220ms_ease-out]',
  'data-[state=closed]:animate-[slide-out-to-bottom_180ms_ease-in]'
].join(' ')

export default defineAppConfig({
  ui: {
    colors: {
      primary: 'sky',
      secondary: 'emerald',
      success: 'emerald',
      info: 'sky',
      warning: 'amber',
      error: 'rose',
      neutral: 'slate'
    },
    icons: {
      loading: 'i-lucide-loader-circle',
      search: 'i-lucide-search',
      menu: 'i-lucide-menu',
      close: 'i-lucide-x',
      chevron: 'i-lucide-chevron-right'
    },
    modal: {
      slots: {
        overlay: 'fixed inset-0 bg-elevated/75 backdrop-blur-[2px]',
        content: `${sheetContentClasses} ${sheetContentAnimationClasses}`,
        header: 'flex items-center gap-1.5 p-4 sm:px-6 min-h-16',
        wrapper: '',
        body: 'flex-1 overflow-y-auto p-4 sm:p-6 pb-[calc(env(safe-area-inset-bottom)+1rem)]',
        footer: 'flex items-center gap-1.5 p-4 sm:px-6 pb-[calc(env(safe-area-inset-bottom)+1rem)]',
        title: 'text-highlighted font-semibold',
        description: 'mt-1 text-muted text-sm',
        close: 'absolute top-4 end-4'
      },
      variants: {
        fullscreen: {
          true: {
            content: 'inset-0 rounded-none'
          },
          false: {
            content: `${sheetContentClasses} ${sheetContentAnimationClasses}`
          }
        },
        transition: {
          true: {
            overlay: 'data-[state=open]:animate-[fade-in_200ms_ease-out] data-[state=closed]:animate-[fade-out_200ms_ease-in]'
          }
        }
      }
    },
    slideover: {
      slots: {
        overlay: 'fixed inset-0 bg-elevated/75 backdrop-blur-[2px]',
        content: `${sheetContentClasses} ${sheetContentAnimationClasses}`,
        header: 'flex items-center gap-1.5 p-4 sm:px-6 min-h-16',
        wrapper: '',
        body: 'flex-1 overflow-y-auto p-4 sm:p-6 pb-[calc(env(safe-area-inset-bottom)+1rem)]',
        footer: 'flex items-center gap-1.5 p-4 sm:px-6 pb-[calc(env(safe-area-inset-bottom)+1rem)]',
        title: 'text-highlighted font-semibold',
        description: 'mt-1 text-muted text-sm',
        close: 'absolute top-4 end-4'
      },
      variants: {
        side: {
          top: {
            content: sheetContentClasses
          },
          right: {
            content: sheetContentClasses
          },
          bottom: {
            content: sheetContentClasses
          },
          left: {
            content: sheetContentClasses
          }
        },
        transition: {
          true: {
            overlay: 'data-[state=open]:animate-[fade-in_200ms_ease-out] data-[state=closed]:animate-[fade-out_200ms_ease-in]'
          }
        }
      },
      compoundVariants: [
        {
          transition: true,
          side: 'top',
          class: {
            content: sheetContentAnimationClasses
          }
        },
        {
          transition: true,
          side: 'right',
          class: {
            content: sheetContentAnimationClasses
          }
        },
        {
          transition: true,
          side: 'bottom',
          class: {
            content: sheetContentAnimationClasses
          }
        },
        {
          transition: true,
          side: 'left',
          class: {
            content: sheetContentAnimationClasses
          }
        }
      ]
    }
  }
})
