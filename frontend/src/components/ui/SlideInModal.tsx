"use client"

import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export interface SlideInModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
  className?: string
}

export function SlideInModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  className
}: SlideInModalProps) {
  const sizeClasses = {
    sm: "sm:max-w-sm",
    md: "sm:max-w-md",
    lg: "sm:max-w-lg",
    xl: "sm:max-w-xl",
    "2xl": "sm:max-w-2xl",
    "3xl": "sm:max-w-4xl",
    full: "sm:max-w-full w-screen"
  }

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0"
        />
        <DialogPrimitive.Popup
          className={cn(
            "fixed inset-y-0 right-0 z-50 h-full w-full border-l border-zinc-800 bg-black p-0 shadow-2xl transition-transform duration-500 ease-in-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right flex flex-col focus:outline-none",
            sizeClasses[size],
            className
          )}
        >
          {/* Header */}
          <div className="p-8 border-b border-zinc-900 space-y-2 relative">
            <DialogPrimitive.Title className="text-2xl font-black text-white">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="text-xs text-zinc-500 font-medium">
                {description}
              </DialogPrimitive.Description>
            )}

            <DialogPrimitive.Close
              render={<Button variant="ghost" size="icon" className="absolute top-8 right-8 text-zinc-500 hover:text-white hover:bg-zinc-900 rounded-none transition-all" />}
            >
              <XIcon className="size-5" />
            </DialogPrimitive.Close>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="p-8 border-t border-zinc-900 bg-zinc-950/30">
              {footer}
            </div>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
