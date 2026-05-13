'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface StandardModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
  confirmText?: string
  onConfirm?: () => void
  isConfirmLoading?: boolean
  variant?: 'default' | 'danger'
}

export function StandardModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  confirmText,
  onConfirm,
  isConfirmLoading,
  variant = 'default'
}: StandardModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn(
        "bg-white dark:bg-black border-zinc-200 dark:border-zinc-800 text-black dark:text-white p-0 overflow-hidden shadow-2xl transition-all w-full max-w-2xl",
        className
      )}>
        {/* Progress bar style top border */}
        <div className={cn(
          "h-1 w-full shrink-0 transition-colors",
          variant === 'danger' ? "bg-red-500" : "bg-black dark:bg-white"
        )} />

        <div className="px-4">
          <DialogHeader className="mb-6 mt-4">
            <DialogTitle className="text-lg font-black text-black dark:text-white select-none capitalize transition-colors">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-xs text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed transition-colors">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="space-y-4">
            {children}
          </div>

          {(footer || confirmText) && (
            <DialogFooter className="mt-5 h-fit flex gap-3">
              {footer ? footer : (
                <>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={onClose}
                    className="hover:bg-zinc-100 dark:hover:bg-zinc-900 mb-4 text-zinc-500 hover:text-black dark:hover:text-white transition-all text-xs font-bold"
                  >
                    Cancel
                  </Button>
                  {confirmText && (
                    <Button
                      onClick={onConfirm}
                      disabled={isConfirmLoading}
                      className={cn(
                        "px-5 h-10! text-xs font-semibold transition-all",
                        variant === 'danger'
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-black dark:bg-white text-white dark:text-black hover:bg-zinc-800 dark:hover:bg-zinc-200"
                      )}
                    >
                      {isConfirmLoading ? (
                        <div className="flex items-center gap-2">
                          <div className="size-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : confirmText}
                    </Button>
                  )}
                </>
              )}
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
