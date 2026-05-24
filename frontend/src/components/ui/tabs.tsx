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
        "flex-1 inline-flex text-nowrap items-center justify-center gap-2 px-1 py-2 text-[10px] font-black transition-all disabled:opacity-50 rounded-md",
        "bg-transparent text-white/50 hover:text-white",
        "data-[state=active]:bg-white data-[state=active]:text-black",
        className
      )}
      {...props}
    />
  )
}

const TabsContent = TabsPrimitive.Panel

export { Tabs, TabsList, TabsTrigger, TabsContent }
