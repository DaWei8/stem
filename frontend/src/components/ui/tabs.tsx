"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return (
    <TabsPrimitive.List
      className={cn("flex w-full items-center gap-1", className)}
      {...props}
    />
  )
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      className={cn(
        "flex-1 inline-flex text-nowrap items-center justify-center gap-2 px-1 py-2 text-[10px] font-black transition-all disabled:opacity-50 rounded-md cursor-pointer select-none outline-none",
        "bg-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100",
        "data-active:bg-white dark:data-active:bg-zinc-800 data-active:text-black dark:data-active:text-white data-active:shadow-sm",
        className
      )}
      {...props}
    />
  )
}

const TabsContent = TabsPrimitive.Panel

export { Tabs, TabsList, TabsTrigger, TabsContent }
